/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('smoke test', function() {
	var server,
		widget,
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
});
