/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

describe('smoke test', function() {
	var ajaxElement,
		ajaxElements,
		server,
		widget,
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
		};

	beforeEach(function () {
		server = sinon.fakeServer.create();

		widget = fixture('d2l-my-courses-fixture');
		ajaxElements = widget.getElementsByTagName('d2l-ajax');
		for (var i = 0; i < ajaxElements.length; ++i) {
			// Disable automatic triggering of requests by default
			ajaxElements[i].auto = false;
		}
	});

	afterEach(function () {
		server.restore();
	});

	it('should load', function () {
		expect(widget).to.exist;
	});

	describe('Enrollments request', function () {
		beforeEach(function () {
			ajaxElement = ajaxElements[0];
			server.respondImmediately = true;
			server.respondWith(
				'GET',
				widget.pinnedCoursesUrl,
				function (req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, enrollmentsResponse.headers, JSON.stringify(enrollmentsResponse.body));
				});
		});

		it('should send an enrollments request for pinned courses', function (done) {
			ajaxElement.generateRequest();

			setTimeout(function() {
				expect(widget.enrollmentsResponse).to.be.defined;
				expect(Array.isArray(widget.enrollmentsResponse.entities)).to.be.true;
				done();
			});
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
