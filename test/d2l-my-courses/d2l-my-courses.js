/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('smoke test', function() {
	var server,
		widget,
		emptyResponse = {
			headers: { },
			body: {
				class: ['enrollments'],
				rel: ['enrollments'],
				links: [],
				actions: [],
				properties: {},
				entities: []
			}
		},
		enrollmentsResponseInactiveCourse = {
			headers: { },
			body: {
				class: ['enrollments'],
				rel: ['enrollments'],
				links: [],
				actions: [],
				properties: {},
				entities: [{
					class: ['course-offering', 'inactive'],
					rel: ['enrollment'],
					properties: {
						name: 'Test Name',
						id: 'TestName'
					},
					links: [],
					actions: [],
					entities: [{
						rel: ['preferences'],
						actions: []
					}]
				}]
			}
		},
		enrollmentsResponseWithOrgOnly = {
			headers: { },
			body: {
				class: ['enrollments'],
				rel: ['enrollments'],
				links: [],
				actions: [],
				properties: {},
				entities: [{
					class: ['organization'],
					rel: ['enrollment'],
					properties: {
						name: 'Test Name',
						id: 'TestName'
					},
					links: [],
					actions: [],
					entities: [{
						rel: ['preferences'],
						actions: []
					}]
				}]
			}
		},
		enrollmentsResponseWithCourse = {
			headers: { },
			body: {
				class: ['enrollments'],
				rel: ['enrollments'],
				links: [],
				actions: [],
				properties: {},
				entities: [{
					class: ['organization'],
					rel: ['enrollment'],
					properties: {
						name: 'Test Name',
						id: 'TestName'
					},
					links: [],
					actions: [],
					entities: [{
						rel: ['preferences'],
						actions: []
					}]
				}, {
					class: ['course-offering', 'active'],
					rel: ['enrollment'],
					properties: {
						name: 'Test Name',
						id: 'TestName'
					},
					links: [],
					actions: [],
					entities: [{
						rel: ['preferences'],
						actions: []
					}]
				}]
			}
		},
		courseEntity = {
			properties: {
				name: 'Test Name'
			}
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

	describe('Inactive courses', function() {
		it('should not display inactive courses', function(done) {
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					req.respond(200, enrollmentsResponseInactiveCourse.headers, JSON.stringify(enrollmentsResponseInactiveCourse.body));
				});

			widget.$.enrollmentsRequest.generateRequest();

			widget.$.enrollmentsRequest.addEventListener('response', function() {
				expect(widget.courseTileItemCount).to.equal(0);
				done();
			});
		});
	});

	describe('Enrollments requests', function() {
		it('should send a request for all courses', function(done) {
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, emptyResponse.headers, JSON.stringify(emptyResponse.body));
				});

			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, emptyResponse.headers, JSON.stringify(emptyResponse.body));
				});

			var allCoursesResponseSpy =  sinon.spy(widget, 'onEnrollmentsResponse');

			widget.$.enrollmentsRequest.generateRequest();

			widget.$.enrollmentsRequest.addEventListener('response', function() {
				expect(allCoursesResponseSpy.called);
				widget.onEnrollmentsResponse.restore();
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
					req.respond(200, emptyResponse.headers, JSON.stringify(emptyResponse.body));
				});

			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					req.respond(200, enrollmentsResponseWithOrgOnly.headers, JSON.stringify(enrollmentsResponseWithOrgOnly.body));
				});

			widget.$.enrollmentsRequest.generateRequest();

			widget.$.enrollmentsRequest.addEventListener('response', function() {
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
					req.respond(200, emptyResponse.headers, JSON.stringify(emptyResponse.body));
				});

			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					req.respond(200, enrollmentsResponseWithCourse.headers, JSON.stringify(enrollmentsResponseWithCourse.body));
				});

			widget.$.enrollmentsRequest.generateRequest();

			widget.$.enrollmentsRequest.addEventListener('response', function() {
				expect(widget._hasCourses).to.equal(true);
				expect(widget._alertMessage).to.equal('You don\'t have any pinned courses. Pin your favorite courses to make them easier to find.');
				done();
			});
		});
	});

	describe('A11Y', function() {
		it('should announce when course is pinned', function() {
			var event = new CustomEvent('course-pinned', {
				detail: {
					course: courseEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(courseEntity.properties.name + ' has been pinned');
		});

		it('should announce when course is unpinned', function() {
			var event = new CustomEvent('course-unpinned', {
				detail: {
					course: courseEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(courseEntity.properties.name + ' has been unpinned');
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
