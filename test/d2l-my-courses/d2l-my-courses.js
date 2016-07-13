/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('smoke test', function() {
	var server,
		widget,
		// Using relative URLs here so that d2l-ajax just uses cookies (no need to mock the token fetching this way)
		rootHref = '/enrollments',
		searchHref = '/enrollments/users/169',
		searchQuery = '?pageSize=20&embedDepth=1',
		enrollmentsRootResponse = {
			class: ['enrollments', 'root'],
			actions: [{
				name: 'search-my-enrollments',
				method: 'GET',
				href: searchHref,
				fields: [{
					name: 'search',
					type: 'search',
					value: ''
				}, {
					name: 'pageSize',
					type: 'number',
					value: 20
				}, {
					name: 'embedDepth',
					type: 'number',
					value: 0
				}]
			}],
			links: [{
				rel: ['self'],
				href: rootHref
			}]
		},
		enrollmentsSearchResponse = {
			entities: [{
				class: ['pinned', 'enrollment'],
				rel: ['https://api.brightspace.com/rels/user-enrollment'],
				actions: [{
					name: 'unpin-course',
					method: 'PUT',
					href: '/enrollments/users/169/organizations/1',
					fields: [{
						name: 'pinned',
						type: 'hidden',
						value: false
					}]
				}],
				links: [{
					rel: ['https://api.brightspace.com/rels/organization'],
					href: '/organizations/1'
				}, {
					rel: ['self'],
					href: '/enrollments/users/169/organizations/1'
				}]
			}],
			links: [{
				rel: ['self'],
				href: searchHref
			}]
		},
		noEnrollmentsResponse = {
			entities: []
		},
		noPinnedEnrollmentsResponse = {
			entities: [{
				class: ['unpinned', 'enrollment'],
				rel: ['https://api.brightspace.com/rels/user-enrollment'],
				actions: [{
					name: 'pin-course',
					method: 'PUT',
					href: '/enrollments/users/169/organizations/1',
					fields: [{
						name: 'pinned',
						type: 'hidden',
						value: true
					}]
				}],
				links: [{
					rel: ['https://api.brightspace.com/rels/organization'],
					href: '/organizations/1'
				}, {
					rel: ['self'],
					href: '/enrollments/users/169/organizations/1'
				}]
			}],
			links: [{
				rel: ['self'],
				href: searchHref
			}]
		},
		organization = {
			class: ['active', 'course-offering'],
			properties: {
				name: 'Course name',
				code: 'COURSE100'
			},
			links: [{
				rel: ['self'],
				href: '/organizations/1'
			}, {
				rel: ['https://api.brightspace.com/rels/organization-homepage'],
				href: 'http://example.com/1/home',
				type: 'text/html'
			}],
			entities: [{
				class: ['course-image'],
				propeties: {
					name: '1.jpg',
					type: 'image/jpeg'
				},
				rel: ['https://api.brightspace.com/rels/organization-image'],
				links: [{
					rel: ['self'],
					href: '/organizations/1/image'
				}, {
					rel: ['alternate'],
					href: ''
				}]
			}]
		};

	beforeEach(function() {
		server = sinon.fakeServer.create();
		server.respondImmediately = true;

		widget = fixture('d2l-my-courses-fixture');
	});

	afterEach(function() {
		server.restore();
	});

	it('should load', function() {
		expect(widget).to.exist;
	});

	describe('Enrollments requests', function() {
		it('should not send a search request if the root request fails', function(done) {
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(404, {}, '');
				});

			var enrollmentsSearchSpy = sinon.spy(widget.$.enrollmentsSearchRequest, 'generateRequest');

			widget.$.enrollmentsRootRequest.generateRequest();

			widget.$.enrollmentsRootRequest.addEventListener('error', function() {
				expect(enrollmentsSearchSpy.callCount === 0);
				widget.$.enrollmentsSearchRequest.generateRequest.restore();
				done();
			});
		});

		it('should send a search request for enrollments', function(done) {
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, {}, JSON.stringify(enrollmentsRootResponse));
				});

			server.respondWith(
				'GET',
				searchHref + searchQuery,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, {}, JSON.stringify(enrollmentsSearchResponse));
				});

			var enrollmentsSearchSpy = sinon.spy(widget, 'onEnrollmentsSearchResponse');

			widget.$.enrollmentsRootRequest.generateRequest();

			widget.$.enrollmentsSearchRequest.addEventListener('response', function() {
				expect(enrollmentsSearchSpy.called);
				widget.onEnrollmentsSearchResponse.restore();
				done();
			});
		});
	});

	describe('Empty states', function() {
		it('should display appropriate message when no enrolled courses', function(done) {
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					req.respond(200, {}, JSON.stringify(enrollmentsRootResponse));
				});

			server.respondWith(
				'GET',
				searchHref + searchQuery,
				function(req) {
					req.respond(200, {}, JSON.stringify(noEnrollmentsResponse));
				});

			widget.$.enrollmentsRootRequest.generateRequest();

			widget.$.enrollmentsSearchRequest.addEventListener('response', function() {
				expect(widget._hasCourses).to.equal(false);
				expect(widget._alertMessage).to.equal('Your courses aren\'t quite ready. Please check back soon.');
				done();
			});
		});

		it('should display appropriate message when no pinned courses', function(done) {
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					req.respond(200, {}, JSON.stringify(enrollmentsRootResponse));
				});

			server.respondWith(
				'GET',
				searchHref + searchQuery,
				function(req) {
					req.respond(200, {}, JSON.stringify(noPinnedEnrollmentsResponse));
				});

			widget.$.enrollmentsRootRequest.generateRequest();

			widget.$.enrollmentsSearchRequest.addEventListener('response', function() {
				expect(widget._hasCourses).to.equal(true);
				expect(widget._alertMessage).to.equal('You don\'t have any pinned courses. Pin your favorite courses to make them easier to find.');
				done();
			});
		});
	});

	describe('A11Y', function() {
		it('should announce when enrollment is pinned', function() {
			var event = new CustomEvent('course-pinned', {
				detail: {
					organization: organization
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(organization.properties.name + ' has been pinned');
		});

		it('should announce when enrollment is unpinned', function() {
			var event = new CustomEvent('course-unpinned', {
				detail: {
					organization: organization
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(organization.properties.name + ' has been unpinned');
		});
	});

	describe('layout', function() {
		describe('column calculations', function() {
			it('should be correct according to the crazy design', function() {
				[{
					width: 767,
					itemCount: 0,
					expectedColumns: 1
				}, {
					width: 767,
					itemCount: 3,
					expectedColumns: 1
				}, {
					width: 767,
					itemCount: 4,
					expectedColumns: 2
				}, {
					width: 991,
					itemCount: 0,
					expectedColumns: 3
				}, {
					width: 991,
					itemCount: 1,
					expectedColumns: 2
				}, {
					width: 991,
					itemCount: 2,
					expectedColumns: 2
				}, {
					width: 991,
					itemCount: 3,
					expectedColumns: 3
				}, {
					width: 991,
					itemCount: 4,
					expectedColumns: 2
				}, {
					width: 991,
					itemCount: 5,
					expectedColumns: 3
				}, {
					width: 992,
					itemCount: 0,
					expectedColumns: 4
				}, {
					width: 992,
					itemCount: 1,
					expectedColumns: 2
				}, {
					width: 992,
					itemCount: 2,
					expectedColumns: 2
				}, {
					width: 992,
					itemCount: 3,
					expectedColumns: 3
				}, {
					width: 992,
					itemCount: 4,
					expectedColumns: 4
				}, {
					width: 992,
					itemCount: 5,
					expectedColumns: 3
				}, {
					width: 992,
					itemCount: 6,
					expectedColumns: 3
				}, {
					width: 992,
					itemCount: 7,
					expectedColumns: 4
				}]
				.forEach(function(scenario) {
					var description = 'width: ' + scenario.width + '; itemCount: ' + scenario.itemCount;
					var numberOfColumns = widget._calcNumColumns(scenario.width, scenario.itemCount);
					expect(numberOfColumns, description).to.equal(scenario.expectedColumns);
				});
			});
		});
	});
});
