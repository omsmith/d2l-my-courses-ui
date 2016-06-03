/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */


describe('smoke test', function() {
	var ajaxElement;
	var ajaxElements;
	var server;
	var widget;

	var pinnedCoursesEntities = [{
				entities: [{
					rel: ['preferences'],
					class: [
						"preferences",
						"pinned"
					]
				}],
				properties: {
					name: 'Course 2',
					id: 2
				},
				links: []
			}, {
				entities: [{
					rel: ['preferences'],
					class: [
						"preferences",
						"pinned"
					]
				}],
				properties: {
					name: 'Course 4',
					id: 4
				},
				links: []
			}];

	var allEnrollmentsResponse = {
			headers: {
				Authorization: 'Bearer PlaceholderToken'
			},
			body: {
				entities: [{
					entities: [{
						rel: ['preferences'],
						class: []
					}],
					properties: {
						name: 'Course 1',
						id: 1
					},
					links: []
				}, {
					entities: [{
						rel: ['preferences'],
						class: [
							"preferences",
							"pinned"
						]
					}],
					properties: {
						name: 'Course 2',
						id: 2
					},
					links: []
				}, {
					entities: [{
						rel: ['preferences'],
						class: []
					}],
					properties: {
						name: 'Course 3',
						id: 3
					},
					links: []
				}, {
					entities: [{
						rel: ['preferences'],
						class: [
							"preferences",
							"pinned"
						]
					}],
					properties: {
						name: 'Course 4',
						id: 4
					},
					links: []
				}]
			}
		};

	var unpinnedCoursesEntities =
		[{
			entities: [{
				rel: ['preferences'],
				class: []
			}],
			properties: {
				name: 'Course 1',
				id: 1
			},
			links: []
		}, {
			entities: [{
				rel: ['preferences'],
				class: []
			}],
			properties: {
				name: 'Course 3',
				id: 3
			},
			links: []
		}];

	beforeEach(function () {
		server = sinon.fakeServer.create();

		widget = fixture('d2l-all-courses-fixture');
		ajaxElements = widget.getElementsByTagName('d2l-ajax');
	});

	afterEach(function () {
		server.restore();
	});

	it('should load', function () {
		expect(widget).to.exist;
	});

	describe('All enrollments request', function () {
		beforeEach(function () {
			ajaxElement = ajaxElements[0];
			server.respondImmediately = true;
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function (req) {
					expect(req.requestHeaders['authorization']).to.match(/Bearer/);
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, allEnrollmentsResponse.headers, JSON.stringify(allEnrollmentsResponse.body));
				});
		});

		it('Should send a request to retrieve all enrollments', function (done) {
			ajaxElement.authToken = 'PlaceholderToken';
			ajaxElement.generateRequest();

			ajaxElement.addEventListener('response', function () {
				expect(Array.isArray(ajaxElement.lastResponse.entities)).to.be.true;
				done();
			});
		});

		it('Should have a read-only response object', function() {
			widget._setAllEnrollmentsEntities(['foo']);

			widget.allEnrollmentsEntities = ['bar'];

			expect(widget.allEnrollmentsEntities[0]).to.equal('foo');
		});
	});

	describe('filter', function () {
		describe('filter calculations', function () {
			it('Should result in only unpinned courses being returned', function () {

				var allEnrollmentsEntities = allEnrollmentsResponse.body.entities;

				widget._filterUnpinnedCourses(pinnedCoursesEntities, allEnrollmentsEntities);

				expect(widget.unpinnedCoursesEntities).to.deep.equal(unpinnedCoursesEntities);
			});
		});
	});
});
