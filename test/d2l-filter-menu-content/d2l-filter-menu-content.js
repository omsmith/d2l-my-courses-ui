/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('d2l-filter-menu-content', function() {
	var widget,
		myEnrollmentsEntity,
		parser;

	beforeEach(function() {
		parser = document.createElement('d2l-siren-parser');
		myEnrollmentsEntity = parser.parse({
			actions: [{
				name: 'add-semester-filter',
				href: '/enrollments/semesters'
			}, {
				name: 'add-department-filter',
				href: '/enrollments/departments'
			}]
		});
		widget = fixture('d2l-filter-menu-content-fixture');
	});

	it('should observe changes to myEnrollmentsEntity', function() {
		var sandbox = sinon.sandbox.create();
		var spy = sandbox.spy(widget, '_myEnrollmentsEntityChanged');

		widget.myEnrollmentsEntity = myEnrollmentsEntity;

		expect(spy.called).to.be.true;
		expect(widget._departmentsUrl).to.equal('/enrollments/departments');
		expect(widget._semestersUrl).to.equal('/enrollments/semesters');

		sandbox.restore();
	});

	describe('Visibility', function() {
		var enrollment,
			response,
			server;

		beforeEach(function() {
			server = sinon.fakeServer.create();
			server.respondImmediately = true;
			server.respondWith(
				'GET',
				/\/enrollments\/departments/,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, {}, JSON.stringify(response));
				});

			enrollment = {
				rel: ['enrollment'],
				links: [{
					rel: ['self'],
					href: '/enrollments'
				}, {
					rel: ['/organization'],
					href: '/organizations/1'
				}]
			};
		});

		afterEach(function() {
			server.restore();
		});

		it('should signal that it should be hidden if user does not have enough departments/semesters', function(done) {
			var handler = function(e) {
				expect(e.detail.hide).to.be.true;
				document.removeEventListener('d2l-filter-menu-content-hide', handler);
				done();
			};
			document.addEventListener('d2l-filter-menu-content-hide', handler);

			response = {
				entities: [enrollment]
			};

			widget.myEnrollmentsEntity = myEnrollmentsEntity;
			widget.load();
		});

		it('should signal that it should be shown if user has enough departments/semesters', function(done) {
			var handler = function(e) {
				expect(e.detail.hide).to.be.false;
				document.removeEventListener('d2l-filter-menu-content-hide', handler);
				done();
			};
			document.addEventListener('d2l-filter-menu-content-hide', handler);

			response = {
				entities: [enrollment, enrollment]
			};

			widget.myEnrollmentsEntity = myEnrollmentsEntity;
			widget.load();
		});
	});

	describe('Clear button', function() {
		it('should be hidden when there are no filters selected', function() {
			widget._clearFilters();

			expect(widget._showClearButton).to.be.false;
			expect(widget.$$('.clear-button')).to.be.null;
		});

		it('should appear when at least one filter is selected', function(done) {
			widget.$$('d2l-filter-menu-content-tabbed').fire('d2l-filter-menu-content-filters-changed', {
				filters: [1]
			});

			setTimeout(function() {
				expect(widget._showClearButton).to.be.true;
				expect(widget.$$('.clear-button')).to.not.be.null;
				done();
			});
		});

		it('should clear filters when clicked', function(done) {
			widget.$$('d2l-filter-menu-content-tabbed').fire('d2l-filter-menu-content-filters-changed', {
				filters: [1]
			});

			setTimeout(function() {
				widget.$$('.clear-button').click();
				expect(widget._showClearButton).to.be.false;
				done();
			});
		});
	});

	describe('Filter text', function() {
		it('should read "Filter" when no filters are selected', function() {
			widget._clearFilters();

			expect(widget.filterText).to.equal('Filter');
		});

		it('should read "Filter: 1 filter" when any 1 filter is selected', function(done) {
			widget.$$('d2l-filter-menu-content-tabbed').fire('d2l-filter-menu-content-filters-changed', {
				filters: [1]
			});

			setTimeout(function() {
				expect(widget.filterText).to.equal('Filter: 1 Filter');
				done();
			});
		});

		it('should read "Filter: 2 filters" when any 2 filters are selected', function(done) {
			widget.$$('d2l-filter-menu-content-tabbed').fire('d2l-filter-menu-content-filters-changed', {
				filters: [1, 1]
			});

			setTimeout(function() {
				expect(widget.filterText).to.equal('Filter: 2 Filters');
				done();
			});
		});
	});
});
