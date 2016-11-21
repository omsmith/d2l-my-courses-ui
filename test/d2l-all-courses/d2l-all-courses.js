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
		enrollments = {
			class: ['enrollments', 'collection'],
			entities: [pinnedEnrollment, unpinnedEnrollment],
			links: [{
				rel: ['self'],
				href: '/enrollments'
			}]
		},
		pinnedEnrollmentEntity,
		unpinnedEnrollmentEntity;

	before(function() {
		var parser = document.createElement('d2l-siren-parser');
		pinnedEnrollmentEntity = parser.parse(pinnedEnrollment);
		unpinnedEnrollmentEntity = parser.parse(unpinnedEnrollment);
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

			var updateMoreParametersStub = sandbox.stub(widget, '_updateMoreParameters');
			var event = {
				detail: pinnedEnrollmentEntity
			};

			widget._onDepartmentSearchResults(event);

			sinon.assert.calledWith(updateMoreParametersStub, sinon.match.object, '_moreDepartmentsUrl', '_hasMoreDepartments');

			sandbox.restore();
		});

		it('should parse and update initial semesters from search widget', function() {
			var sandbox = sinon.sandbox.create();

			var updateMoreParametersStub = sandbox.stub(widget, '_updateMoreParameters');
			var event = {
				detail: pinnedEnrollmentEntity
			};

			widget._onSemesterSearchResults(event);

			sinon.assert.calledWith(updateMoreParametersStub, sinon.match.object, '_moreSemestersUrl', '_hasMoreSemesters');

			sandbox.restore();
		});

		it('should parse and update lazily-loaded departments', function() {
			var sandbox = sinon.sandbox.create();

			var updateMoreParametersStub = sandbox.stub(widget, '_updateMoreParameters');
			var onMoreResponseSpy = sandbox.spy(widget, '_onMoreResponse');
			var response = {
				detail: {
					status: 200,
					xhr: {
						response: enrollments
					}
				}
			};

			widget._onMoreDepartmentsResponse(response);

			sinon.assert.calledWith(updateMoreParametersStub, sinon.match.object, '_moreDepartmentsUrl', '_hasMoreDepartments');
			sinon.assert.calledWith(onMoreResponseSpy, sinon.match.object, '_departments', '_moreDepartmentsUrl', '_hasMoreDepartments');

			sandbox.restore();
		});

		it('should parse and update lazily-loaded semesters', function() {
			var sandbox = sinon.sandbox.create();

			var updateMoreParametersStub = sandbox.stub(widget, '_updateMoreParameters');
			var onMoreResponseSpy = sandbox.spy(widget, '_onMoreResponse');
			var response = {
				detail: {
					status: 200,
					xhr: {
						response: enrollments
					}
				}
			};

			widget._onMoreSemestersResponse(response);

			sinon.assert.calledWith(updateMoreParametersStub, sinon.match.object, '_moreSemestersUrl', '_hasMoreSemesters');
			sinon.assert.calledWith(onMoreResponseSpy, sinon.match.object, '_semesters', '_moreSemestersUrl', '_hasMoreSemesters');

			sandbox.restore();
		});
	});

	describe('Alerts', function() {

		it('should display appropriate message when there are no pinned enrollments', function() {
			widget.pinnedEnrollments = [];
			widget.unpinnedEnrollments = [unpinnedEnrollmentEntity];

			expect(widget._alerts).to.include({ alertName: 'noPinnedCourses', alertType: 'call-to-action', alertMessage: 'You don\'t have any pinned courses. Pin your favorite courses to make them easier to find.' });
		});

		it('should update enrollment alerts when an enrollment is pinned', function() {
			var sandbox = sinon.sandbox.create();

			widget.pinnedEnrollments = [];
			widget.unpinnedEnrollments = [unpinnedEnrollmentEntity];
			expect(widget._hasPinnedEnrollments).to.equal(false);
			expect(widget._alerts).to.include({ alertName: 'noPinnedCourses', alertType: 'call-to-action', alertMessage: 'You don\'t have any pinned courses. Pin your favorite courses to make them easier to find.' });
			var updateEnrollmentAlertsSpy = sandbox.spy(widget, '_updateEnrollmentAlerts');
			widget._hasPinnedEnrollments = true;
			expect(updateEnrollmentAlertsSpy.called);

			sandbox.restore();
		});

		it('should remove all existing alerts when enrollment alerts are updated', function() {
			widget._addAlert('error', 'testError', 'this is a test');
			widget._addAlert('warning', 'testWarning', 'this is another test');
			expect(widget._alerts).to.include({ alertName: 'testError', alertType: 'error', alertMessage: 'this is a test'});
			widget._updateEnrollmentAlerts(true);
			expect(widget._alerts).to.not.include({ alertName: 'testError', alertType: 'error', alertMessage: 'this is a test'});
		});

		it('should add a setCourseImageFailure warning alert when a request to set the image fails', function() {
			var setCourseImageEvent = { detail: { status: 'failure'} };
			widget.setCourseImage(setCourseImageEvent);
			expect(widget._alerts).to.include({ alertName: 'setCourseImageFailure', alertType: 'warning', alertMessage: 'Sorry, we\'re unable to change your image right now. Please try again later.' });
		});

		it('should not add a setCourseImageFailure warning alert when a request to set the image succeeds', function() {
			var setCourseImageEvent = { detail: { status: 'success'} };
			widget.setCourseImage(setCourseImageEvent);
			expect(widget._alerts).not.to.include({ alertName: 'setCourseImageFailure', alertType: 'warning', alertMessage: 'Sorry, we\'re unable to change your image right now. Please try again later.' });
		});

		it('should remove a setCourseImageFailure warning alert when a request to set the image is made', function() {
			var setCourseImageEvent = { detail: { status: 'failure'} };
			widget.setCourseImage(setCourseImageEvent);
			expect(widget._alerts).to.include({ alertName: 'setCourseImageFailure', alertType: 'warning', alertMessage: 'Sorry, we\'re unable to change your image right now. Please try again later.' });
			setCourseImageEvent = { detail: { status: 'set'} };
			widget.setCourseImage(setCourseImageEvent);
			expect(widget._alerts).not.to.include({ alertName: 'setCourseImageFailure', alertType: 'warning', alertMessage: 'Sorry, we\'re unable to change your image right now. Please try again later.' });
		});

		it('should remove a setCourseImageFailure alert when the overlay is opened', function() {
			widget._addAlert('warning', 'setCourseImageFailure', 'failed to do that thing it should do');
			expect(widget._alerts).to.include({ alertName: 'setCourseImageFailure', alertType: 'warning', alertMessage: 'failed to do that thing it should do' });
			widget._onSimpleOverlayOpening();
			expect(widget._alerts).to.not.include({ alertName: 'setCourseImageFailure', alertType: 'warning', alertMessage: 'failed to do that thing it should do' });
		});
	});
});
