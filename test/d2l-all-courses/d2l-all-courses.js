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
		pinnedEnrollmentEntity,
		unpinnedEnrollmentEntity,
		organizationEntity;

	before(function() {
		var parser = document.createElement('d2l-siren-parser');
		pinnedEnrollmentEntity = parser.parse(pinnedEnrollment);
		unpinnedEnrollmentEntity = parser.parse(unpinnedEnrollment);
		organizationEntity = parser.parse(organization);
	});

	beforeEach(function() {
		server = sinon.fakeServer.create();
		server.respondImmediately = true;
		server.respondWith(
			'GET',
			/\/organizations\/1\?embedDepth=1/,
			[200, {}, JSON.stringify(organization)]);

		widget = fixture('d2l-all-courses-fixture');

		widget.pinnedCoursesEntities = [pinnedEnrollmentEntity];
		widget.unpinnedCoursesEntities = [unpinnedEnrollmentEntity];
	});

	afterEach(function() {
		server.restore();
	});

	it('should load', function() {
		expect(widget).to.exist;
	});

	describe('A11Y', function() {
		it('should announce when enrollment is pinned', function() {
			var event = new CustomEvent('course-pinned', {
				detail: {
					organization: organizationEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(organizationEntity.properties.name + ' has been pinned');
		});

		it('should announce when enrollment is unpinned', function() {
			var event = new CustomEvent('course-unpinned', {
				detail: {
					organization: organizationEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(organizationEntity.properties.name + ' has been unpinned');
		});
	});
});
