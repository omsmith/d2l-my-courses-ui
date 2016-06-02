/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

describe('smoke test', function() {
	var ajaxElement,
		ajaxElements,
		server,
		widget,
		emptyResponse = {
			headers: { },
			body: {
				class: ["enrollments"],
				rel: ["enrollments"],
				links: [],
				actions: [],
				properties: {},
				entities: []
			}
		},
		enrollmentsResponse = {
			headers: { },
			body: {
				entities: [{
					properties: {
						name: 'Test Name',
						id: 'TestName'
					},
					links: [{
						rel: ['course-image'],
						href: 'http://example.com'
					}],
					entities: [{
						rel: ['preferences'],
						class: ['pinned'],
						actions: [{
							name: 'update',
							method: 'GET',
							href: 'http://example.com'
						}]
					}]
				}]
			}
		},
		courseEntity = {
			properties: {
				name: 'Test Name'
			}
		};

	beforeEach(function () {
		server = sinon.fakeServer.create();

		widget = fixture('d2l-my-courses-fixture');
		ajaxElements = widget.getElementsByTagName('d2l-ajax');
	});

	afterEach(function () {
		server.restore();
	});

	it('should load', function () {
		expect(widget).to.exist;
	});

	describe('Enrollments requests', function () {
		beforeEach(function () {
			ajaxElement = ajaxElements[0];
			server.respondImmediately = true;
		});

		it('should send a request for pinned courses', function (done) {
			server.respondWith(
				'GET',
				widget.pinnedCoursesUrl,
				function (req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, enrollmentsResponse.headers, JSON.stringify(enrollmentsResponse.body));
				});

			ajaxElement.generateRequest();

			setTimeout(function() {
				expect(widget.pinnedCoursesResponse).to.not.be.undefined;
				expect(Array.isArray(widget.pinnedCoursesResponse.entities)).to.be.true;
				done();
			});
		});

		it('should send a request for all courses if there are no pinned courses', function (done) {
			server.respondWith(
				'GET',
				widget.pinnedCoursesUrl,
				function (req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, emptyResponse.headers, JSON.stringify(emptyResponse.body));
				});

			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function (req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, emptyResponse.headers, JSON.stringify(emptyResponse.body));
				});

			ajaxElement.generateRequest();

			setTimeout(function() {
				expect(widget.pinnedCoursesResponse).to.not.be.undefined;
				expect(Array.isArray(widget.pinnedCoursesResponse.entities)).to.be.true;
				expect(widget.allCoursesResponse).to.not.be.undefined;
				expect(Array.isArray(widget.allCoursesResponse.entities)).to.be.true;
				expect(widget.hasCourses).to.equal(false);
				expect(widget.alertMessage).to.not.be.undefined;
				done();
			});
		});
	});

	describe('A11Y', function () {
		it('should announce when course is pinned', function () {
			var event = new CustomEvent('course-pinned', {
				detail: {
					course: courseEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(courseEntity.properties.name + ' has been pinned');
		});

		it('should announce when course is unpinned', function () {
			var event = new CustomEvent('course-unpinned', {
				detail: {
					course: courseEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(courseEntity.properties.name + ' has been unpinned');
		});
	});

	describe('layout', function () {
		describe('column calculations', function () {
			it('should be correct according to the crazy design', function () {
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
					expectedColumns: 2
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
				.forEach(function (scenario) {
					var description = 'width: ' + scenario.width + '; itemCount: ' + scenario.itemCount;
					var numberOfColumns = widget._calcNumColumns(scenario.width, scenario.itemCount);
					expect(numberOfColumns, description).to.equal(scenario.expectedColumns);
				});
			});
		});
	});
});
