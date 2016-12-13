/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('d2l-filter-menu-content', function() {
	var widget,
		sandbox,
		myEnrollmentsEntity,
		parser;

	beforeEach(function() {
		parser = document.createElement('d2l-siren-parser');
		myEnrollmentsEntity = parser.parse({
			actions: [{
				name: 'add-semester-filter',
				href: '/enrollments'
			}, {
				name: 'add-department-filter',
				href: '/enrollments'
			}]
		});
		sandbox = sinon.sandbox.create();
		widget = fixture('d2l-filter-menu-content-fixture');
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('should observe changes to myEnrollmentsEntity', function() {
		var spy = sandbox.spy(widget, '_myEnrollmentsEntityChanged');

		widget.myEnrollmentsEntity = myEnrollmentsEntity;

		expect(spy.called).to.be.true;
		expect(widget._searchDepartmentsAction.name).to.equal('add-department-filter');
		expect(widget._searchDepartmentsAction.href).to.equal('/enrollments');
		expect(widget._searchSemestersAction.name).to.equal('add-semester-filter');
		expect(widget._searchSemestersAction.href).to.equal('/enrollments');
	});

	describe('d2l-filter-menu-content-filters-changed', function() {
		it('should emit an event when a filter is added', function(done) {
			var handler = function() {
				document.removeEventListener('d2l-filter-menu-content-filters-changed', handler);
				done();
			};
			document.addEventListener('d2l-filter-menu-content-filters-changed', handler);

			widget.$$('#departmentList d2l-menu').fire('d2l-menu-item-change', {
				selected: true,
				value: 'foo'
			});
		});

		it('should emit an event when a filter is removed', function(done) {
			var handler = function() {
				document.removeEventListener('d2l-filter-menu-content-filters-changed', handler);
				done();
			};
			document.addEventListener('d2l-filter-menu-content-filters-changed', handler);

			widget.$$('#departmentList d2l-menu').fire('d2l-menu-item-change', {
				selected: false,
				value: 'foo'
			});
		});
	});

	describe('Lazy loading', function() {
		it('should set internal values appropriately when there are not any more departments', function(done) {
			widget.$.departmentSearchWidget.fire('d2l-search-widget-results-changed', {
				links: [{
					rel: ['self'],
					href: '/enrollments'
				}]
			});

			setTimeout(function() {
				expect(widget._hasMoreDepartments).to.be.false;
				expect(widget._moreDepartmentsUrl).to.equal('');
				done();
			});
		});

		it('should set internal values appropriately when there are more departments', function(done) {
			widget.$.departmentSearchWidget.fire('d2l-search-widget-results-changed', {
				links: [{
					rel: ['self'],
					href: '/enrollments'
				}, {
					rel: ['next'],
					href: '/enrollments?page=2'
				}]
			});

			setTimeout(function() {
				expect(widget._hasMoreDepartments).to.be.true;
				expect(widget._moreDepartmentsUrl).to.equal('/enrollments?page=2');
				done();
			});
		});

		it('should set internal values appropriately when there are not any more semesters', function(done) {
			widget.$.semesterSearchWidget.fire('d2l-search-widget-results-changed', {
				links: [{
					rel: ['self'],
					href: '/enrollments'
				}]
			});

			setTimeout(function() {
				expect(widget._hasMoreSemesters).to.be.false;
				expect(widget._moreSemestersUrl).to.equal('');
				done();
			});
		});

		it('should set internal values appropriately when there are more semesters', function(done) {
			widget.$.semesterSearchWidget.fire('d2l-search-widget-results-changed', {
				links: [{
					rel: ['self'],
					href: '/enrollments'
				}, {
					rel: ['next'],
					href: '/enrollments?page=2'
				}]
			});

			setTimeout(function() {
				expect(widget._hasMoreSemesters).to.be.true;
				expect(widget._moreSemestersUrl).to.equal('/enrollments?page=2');
				done();
			});
		});

		it('should trigger a request for more departments when the departments tab is selected', function() {
			var departmentStub = sandbox.stub(widget.$.moreDepartmentsRequest, 'generateRequest');
			var semesterStub = sandbox.stub(widget.$.moreSemestersRequest, 'generateRequest');
			widget._selectDepartmentList();

			widget.loadMore();

			expect(departmentStub.called).to.be.false;
			expect(semesterStub.called).to.be.false;

			widget.set('_hasMoreDepartments', true);

			widget.loadMore();

			expect(departmentStub.called).to.be.true;
			expect(semesterStub.called).to.be.false;
		});

		it('should trigger a request for more semesters when the semesters tab is selected', function() {
			var departmentStub = sandbox.stub(widget.$.moreDepartmentsRequest, 'generateRequest');
			var semesterStub = sandbox.stub(widget.$.moreSemestersRequest, 'generateRequest');
			widget._selectSemesterList();

			widget.loadMore();

			expect(departmentStub.called).to.be.false;
			expect(semesterStub.called).to.be.false;

			widget.set('_hasMoreSemesters', true);

			widget.loadMore();

			expect(departmentStub.called).to.be.false;
			expect(semesterStub.called).to.be.true;
		});
	});
});
