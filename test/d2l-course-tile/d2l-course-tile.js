/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('<d2l-course-tile>', function() {
	var server,
		widget,
		enrollment = {
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
		};

	beforeEach(function() {
		server = sinon.fakeServer.create();
		server.respondImmediately = true;

		widget = fixture('d2l-course-tile-fixture');
	});

	afterEach(function() {
		server.restore();
	});

	it('loads element', function() {
		expect(widget).to.exist;
	});

	it('should fetch the organization', function(done) {
		server.respondWith(
			'GET',
			'/organizations/1?embedDepth=1',
			[200, {}, JSON.stringify(organization)]);

		var organizationSpy = sinon.spy(widget.$.organizationRequest, 'generateRequest');

		widget.$.organizationRequest.addEventListener('response', function() {
			expect(organizationSpy.called);
			done();
		});

		widget.enrollment = enrollment;
	});

	describe('setting the enrollment attribute', function() {
		beforeEach(function(done) {
			server.respondWith(
				'GET',
				'/organizations/1?embedDepth=1',
				[200, {}, JSON.stringify(organization)]);

			widget.$.organizationRequest.addEventListener('response', function() {
				// Ensure organization has been received before doing tests
				done();
			});

			widget.enrollment = enrollment;
		});

		it('should parse and update the internal Siren representation', function() {
			expect(widget._organization.properties).to.be.an('object');
		});

		it('should have the correct href', function() {
			var anchor = widget.$$('a');
			expect(anchor.href).to.equal(organization.links[1].href);
		});

		it('should update the course name', function() {
			var courseText = widget.$$('.course-text');
			expect(courseText.innerHTML).to.equal(organization.properties.name);
		});

		it('should set the internal pinned state correctly', function() {
			expect(widget._pinned).to.be.true;
		});

		it('should hide image from screen readers', function() {
			var courseImage = widget.$$('.course-image img');
			expect(courseImage.getAttribute('aria-hidden')).to.equal('true');
		});

		it('should have an aria-label for pin button', function() {
			var pinButton = widget.$$('.menu-text.pin');
			expect(pinButton.getAttribute('aria-label')).to.equal('Pin ' + organization.properties.name);
		});

		it('should have an aria-label for unpin button', function() {
			var pinButton = widget.$$('.menu-text.unpin');
			expect(pinButton.getAttribute('aria-label')).to.equal('Unpin ' + organization.properties.name);
		});
	});

	describe('changing the pinned state', function() {
		var event = { preventDefault: function() {} };

		beforeEach(function(done) {
			server.respondWith(
				'GET',
				'/organizations/1?embedDepth=1',
				[200, {}, JSON.stringify(organization)]);

			widget.$.organizationRequest.addEventListener('response', function() {
				// Ensure organization has been received before doing tests
				done();
			});

			widget.enrollment = enrollment;
		});

		afterEach(function() {
			server.restore();
		});

		it('should set the update action parameters correctly', function() {
			widget.hoverPinClickHandler(event);

			expect(widget._enrollmentPinUrl).to.equal('/enrollments/users/169/organizations/1');
			expect(widget._enrollmentPinMethod).to.equal('PUT');
		});

		it('should update the icon', function() {
			var pinIcon = widget.$$('.menu-item iron-icon.menu-icon');

			widget._pinned = false;
			expect(pinIcon.icon).to.equal('d2l-tier1:pin-filled');
			widget._pinned = true;
			expect(pinIcon.icon).to.equal('d2l-tier1:pin-hollow');
		});

		it('should call the pinning API', function(done) {
			server.respondWith(
				'PUT',
				'/enrollments/users/169/organizations/1',
				function(req) {
					expect(req.requestBody).to.contain('pinned=false');
					done();
				});

			widget.hoverPinClickHandler(event);
		});

		it('should update the local pinned state with the received pin state', function(done) {
			server.respondWith(
				'PUT',
				'/enrollments/users/169/organizations/1',
				[200, {}, JSON.stringify(enrollment)]);

			expect(widget._pinned).to.be.true;
			widget.hoverPinClickHandler(event);
			expect(widget._pinned).to.be.false;

			setTimeout(function() {
				// We responded with pinned = true, so it gets set back to true by the response
				expect(widget._pinned).to.be.true;
				done();
			}, 10);
		});
	});
});
