/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */


describe('smoke test', function() {
	var ajaxElement;
	var ajaxElements;
	var server;
	var widget;
	
	var pinnedCoursesEntities = [{
				properties: {
					name: 'Course 2',
					id: 2
				}
			},
			{
				properties: {
					name: 'Course 4',
					id: 4
				}
			}];
			
	var allEnrollmentsResponse = {
			headers: { 
				Authorization: 'Bearer PlaceholderToken' 
			},
			body: {
				entities: [{
					properties: {
						name: 'Course 1',
						id: 1
					}
				},
				{
					properties: {
						name: 'Course 2',
						id: 2
					}
				},
				{
					properties: {
						name: 'Course 3',
						id: 3
					}
				},
				{
					properties: {
						name: 'Course 4',
						id: 4
					}
				}]
			}
		};
	
	var unpinnedCoursesEntities = [{
				properties: {
					name: 'Course 1',
					id: 1
				}
			},
			{
				properties: {
					name: 'Course 3',
					id: 3
				}
		}];

	beforeEach(function () {
		server = sinon.fakeServer.create();

		widget = fixture('d2l-all-courses-view-fixture');
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

			ajaxElement.addEventListener('response', function (response) {
				expect(Array.isArray(response.detail.xhr.response.entities)).to.be.true;
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
