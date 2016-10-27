/* global describe, it, before, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('smoke test', function() {
	var server,
		widget,
		pinnedEnrollment = {
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
		},
		unpinnedEnrollment = {
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
		},
		organizations = {
			class: ['paged', 'organization', 'collection'],
			entities: [{
				rel: ['https://api.brightspace.com/rels/organization'],
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
				}]
			}],
			links: [{
				rel: ['self'],
				href: '/organizations'
			}, {
				rel: ['next'],
				href: '/organizations?page=2'
			}]
		},
		pinnedEnrollmentEntity,
		unpinnedEnrollmentEntity,
		organizationsEntity;

	before(function() {
		var parser = document.createElement('d2l-siren-parser');
		pinnedEnrollmentEntity = parser.parse(pinnedEnrollment);
		unpinnedEnrollmentEntity = parser.parse(unpinnedEnrollment);
		organizationsEntity = parser.parse(organizations);
	});

	beforeEach(function() {
		// Not actually required, but avoids a bunch of errors in the test output
		server = sinon.fakeServer.create();
		server.respondImmediately = true;
		server.respondWith(
			'GET',
			/\/organizations\/1\?embedDepth=1/,
			[200, {}, JSON.stringify(organization)]);

		widget = fixture('d2l-all-courses-fixture');
	});

	afterEach(function() {
		server.restore();
	});

	it('should load', function() {
		expect(widget).to.exist;
	});

	it('should return the correct value from getCourseTileItemCount (should be maximum of pinned or unpinned course count)', function() {
		widget.pinnedEnrollments = [pinnedEnrollmentEntity];
		widget.unpinnedEnrollments = [unpinnedEnrollmentEntity];

		expect(widget.getCourseTileItemCount()).to.equal(1);
	});

	it('should set getCourseTileItemCount on its child course-tile-grids', function() {
		widget.pinnedEnrollments = [pinnedEnrollmentEntity];
		widget.unpinnedEnrollments = [unpinnedEnrollmentEntity];

		var courseTileGrids = widget.querySelectorAll('d2l-course-tile-grid');
		expect(courseTileGrids.length).to.equal(2);

		for (var i = 0; i < courseTileGrids.length; i++) {
			expect(courseTileGrids[i].getCourseTileItemCount()).to.equal(1);
		}
	});

	describe('Filter list content', function() {
		it('should parse and update initial departments from search widget', function() {
			var sandbox = sinon.sandbox.create();

			var checkEntitySpy = sandbox.spy(widget, '_checkFilterEntities');
			var updateMoreParametersSpy = sandbox.spy(widget, '_updateMoreParameters');
			var event = {
				detail: organizationsEntity
			};

			widget._onDepartmentSearchResults(event);

			sinon.assert.called(checkEntitySpy);
			sinon.assert.calledWith(updateMoreParametersSpy, sinon.match.object, '_moreDepartmentsUrl', '_hasMoreDepartments');

			sandbox.restore();
		});

		it('should parse and update initial semesters from search widget', function() {
			var sandbox = sinon.sandbox.create();

			var checkEntitySpy = sandbox.spy(widget, '_checkFilterEntities');
			var updateMoreParametersSpy = sandbox.spy(widget, '_updateMoreParameters');
			var event = {
				detail: organizationsEntity
			};

			widget._onSemesterSearchResults(event);

			sinon.assert.called(checkEntitySpy);
			sinon.assert.calledWith(updateMoreParametersSpy, sinon.match.object, '_moreSemestersUrl', '_hasMoreSemesters');

			sandbox.restore();
		});

		it('should parse and update lazily-loaded semesters', function() {
			var sandbox = sinon.sandbox.create();

			var checkEntitySpy = sandbox.spy(widget, '_checkFilterEntities');
			var updateMoreParametersSpy = sandbox.spy(widget, '_updateMoreParameters');
			var onMoreResponseSpy = sandbox.spy(widget, '_onMoreResponse');
			var response = {
				detail: {
					status: 200,
					xhr: {
						response: organizations
					}
				}
			};

			widget._onMoreDepartmentsResponse(response);

			sinon.assert.called(checkEntitySpy);
			sinon.assert.calledWith(updateMoreParametersSpy, sinon.match.object, '_moreDepartmentsUrl', '_hasMoreDepartments');
			sinon.assert.calledWith(onMoreResponseSpy, sinon.match.object, '_departmentOrganizations', '_moreDepartmentsUrl', '_hasMoreDepartments');

			sandbox.restore();
		});

		it('should parse and update lazily-loaded departments', function() {
			var sandbox = sinon.sandbox.create();

			var checkEntitySpy = sandbox.spy(widget, '_checkFilterEntities');
			var updateMoreParametersSpy = sandbox.spy(widget, '_updateMoreParameters');
			var onMoreResponseSpy = sandbox.spy(widget, '_onMoreResponse');
			var response = {
				detail: {
					status: 200,
					xhr: {
						response: organizations
					}
				}
			};

			widget._onMoreSemestersResponse(response);

			sinon.assert.called(checkEntitySpy);
			sinon.assert.calledWith(updateMoreParametersSpy, sinon.match.object, '_moreSemestersUrl', '_hasMoreSemesters');
			sinon.assert.calledWith(onMoreResponseSpy, sinon.match.object, '_semesterOrganizations', '_moreSemestersUrl', '_hasMoreSemesters');

			sandbox.restore();
		});
	});
});
