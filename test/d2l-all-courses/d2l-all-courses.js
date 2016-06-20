/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('smoke test', function() {
	var server;
	var widget;

	var pinnedCoursesEntities = {
		class: ['enrollments'],
		rel: ['enrollments'],
		links: [],
		actions: [],
		properties: {},
		entities: [{
			class: ['course-offering', 'active'],
			rel: ['enrollment'],
			entities: [{
				rel: ['preferences'],
				class: [
					'preferences',
					'pinned'
				],
				properties: {
					'pinDate': '2016-06-18T16:36:05Z'
				}
			}],
			properties: {
				name: 'Course 2',
				id: 2
			},
			links: []
		}, {
			class: ['course-offering', 'active'],
			rel: ['enrollment'],
			entities: [{
				rel: ['preferences'],
				class: [
					'preferences',
					'pinned'
				],
				properties: {
					'pinDate': '2016-06-18T16:35:05Z'
				}
			}],
			properties: {
				name: 'Course 4',
				id: 4
			},
			links: []
		}]
	};

	var unpinnedCoursesEntities = {
		class: ['enrollments'],
		rel: ['enrollments'],
		links: [],
		actions: [],
		properties: {},
		entities: [{
			class: ['course-offering', 'active'],
			rel: ['enrollment'],
			entities: [{
				rel: ['preferences'],
				class: [],
				properties: { }
			}],
			properties: {
				name: 'Course 1',
				id: 1
			},
			links: []
		}, {
			class: ['course-offering', 'active'],
			rel: ['enrollment'],
			entities: [{
				rel: ['preferences'],
				class: [],
				properties: { }
			}],
			properties: {
				name: 'Course 3',
				id: 3
			},
			links: []
		}]
	};

	var allEnrollmentsResponse = {
		headers: { },
		body: {
			class: ['enrollments'],
			rel: ['enrollments'],
			links: [],
			actions: [],
			properties: {},
			entities: [{
				class: ['course-offering', 'active'],
				rel: ['enrollment'],
				entities: [{
					rel: ['preferences'],
					class: [],
					properties: { }
				}],
				properties: {
					name: 'Course 1',
					id: 1
				},
				links: []
			}, {
				class: ['course-offering', 'active'],
				rel: ['enrollment'],
				entities: [{
					rel: ['preferences'],
					class: [
						'preferences',
						'pinned'
					],
					properties: {
						'pinDate': '2016-06-18T16:36:05Z'
					}
				}],
				properties: {
					name: 'Course 2',
					id: 2
				},
				links: []
			}, {
				class: ['course-offering', 'active'],
				rel: ['enrollment'],
				entities: [{
					rel: ['preferences'],
					class: [],
					properties: { }
				}],
				properties: {
					name: 'Course 3',
					id: 3
				},
				links: []
			}, {
				class: ['course-offering', 'active'],
				rel: ['enrollment'],
				entities: [{
					rel: ['preferences'],
					class: [
						'preferences',
						'pinned'
					],
					properties: {
						'pinDate': '2016-06-18T16:35:05Z'
					}
				}],
				properties: {
					name: 'Course 4',
					id: 4
				},
				links: []
			}, {
				class: ['course-offering', 'inactive'],
				rel: ['enrollment'],
				properties: {
					name: 'Inactive Course',
					id: 5
				},
				links: [],
				actions: [],
				entities: [{
					rel: ['preferences'],
					actions: []
				}]
			}]
		}
	};

	var courseEntity = {
		properties: {
			name: 'Test Name'
		}
	};

	beforeEach(function() {
		server = sinon.fakeServer.create();

		widget = fixture('d2l-all-courses-fixture');
	});

	afterEach(function() {
		server.restore();
	});

	it('should load', function() {
		expect(widget).to.exist;
	});

	describe('All enrollments request', function() {
		beforeEach(function() {
			server.respondImmediately = true;
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, allEnrollmentsResponse.headers, JSON.stringify(allEnrollmentsResponse.body));
				});
		});

		it('Should send a request to retrieve all enrollments', function(done) {
			widget.$.allEnrollmentsRequest.generateRequest();

			var allEnrollmentsResponseSpy =  sinon.spy(widget, 'allEnrollmentsOnResponse');

			widget.$.allEnrollmentsRequest.addEventListener('response', function() {
				expect(allEnrollmentsResponseSpy.called);
				widget.allEnrollmentsOnResponse.restore();
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

	describe('Course entity management', function() {
		beforeEach(function() {
			server.respondImmediately = true;
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, allEnrollmentsResponse.headers, JSON.stringify(allEnrollmentsResponse.body));
				});
		});

		it('should move an unpinned course to the pinned list when pinned', function(done) {
			widget.$.allEnrollmentsRequest.generateRequest();

			widget.$.allEnrollmentsRequest.addEventListener('response', function() {
				var course = {
					properties: {
						id: 1
					}
				};

				widget._moveCourseToPinnedList(course);
				expect(widget.pinnedCoursesEntities.length).to.equal(3);
				expect(widget.unpinnedCoursesEntities.length).to.equal(1);
				expect(widget.pinnedCoursesEntities[0].properties.id).to.equal(1);
				done();
			});
		});

		it('should move a pinned course to the unpinned list when unpinned', function(done) {
			widget.$.allEnrollmentsRequest.generateRequest();

			widget.$.allEnrollmentsRequest.addEventListener('response', function() {
				var course = {
					properties: {
						id: 2
					}
				};

				widget._moveCourseToUnpinnedList(course);
				expect(widget.pinnedCoursesEntities.length).to.equal(1);
				expect(widget.unpinnedCoursesEntities.length).to.equal(3);
				expect(widget.unpinnedCoursesEntities[0].properties.id).to.equal(2);
				done();
			});
		});

		it('should pin a course whose removal animation has completed, and add it to the beginning of the pinned courses list', function(done) {
			widget.$.allEnrollmentsRequest.generateRequest();

			widget._tilesInPinStateTransition.push(1);

			widget.$.allEnrollmentsRequest.addEventListener('response', function() {
				var pinAnimationEvent = new CustomEvent('tile-remove-complete', {
					detail: {
						course: widget.unpinnedCoursesEntities[0],
						pinned: true
					}
				});

				widget.dispatchEvent(pinAnimationEvent);
				expect(widget.pinnedCoursesEntities.length).to.equal(3);
				expect(widget.unpinnedCoursesEntities.length).to.equal(1);
				expect(widget.pinnedCoursesEntities[0].properties.id).to.equal(1);
				done();
			});
		});

		it('should unpin a course whose removal animation has completed, and add it to the beginning of the unpinned courses list', function(done) {
			widget.$.allEnrollmentsRequest.generateRequest();

			widget._tilesInPinStateTransition.push(2);

			widget.$.allEnrollmentsRequest.addEventListener('response', function() {
				var pinAnimationEvent = new CustomEvent('tile-remove-complete', {
					detail: {
						course: widget.pinnedCoursesEntities[0],
						pinned: false
					}
				});

				widget.dispatchEvent(pinAnimationEvent);
				expect(widget.pinnedCoursesEntities.length).to.equal(1);
				expect(widget.unpinnedCoursesEntities.length).to.equal(3);
				expect(widget.unpinnedCoursesEntities[0].properties.id).to.equal(2);
				done();
			});
		});
	});

	describe('filter', function() {
		beforeEach(function() {
			server.respondImmediately = true;
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function(req) {
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, allEnrollmentsResponse.headers, JSON.stringify(allEnrollmentsResponse.body));
				});
		});

		describe('filter calculations', function() {
			it('Should result in pinned and unpinned entity lists being populated with active courses only', function(done) {
				widget.$.allEnrollmentsRequest.generateRequest();

				widget.$.allEnrollmentsRequest.addEventListener('response', function() {
					var parser = document.createElement('d2l-siren-parser');
					var pinnedCoursesEntitiesParsed = [];
					var unpinnedCoursesEntitiesParsed = [];

					// Parse entities to match result of actual responses without having to explicitly define generated properties
					pinnedCoursesEntities.entities.forEach(function(item) {
						pinnedCoursesEntitiesParsed.push(parser.parse(item));
					});

					unpinnedCoursesEntities.entities.forEach(function(item) {
						unpinnedCoursesEntitiesParsed.push(parser.parse(item));
					});

					expect(widget.pinnedCoursesEntities).to.deep.equal(pinnedCoursesEntitiesParsed);
					expect(widget.unpinnedCoursesEntities).to.deep.equal(unpinnedCoursesEntitiesParsed);
					done();
				});
			});
		});
	});
});
