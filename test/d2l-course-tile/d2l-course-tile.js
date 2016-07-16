/* global describe, it, before, beforeEach, afterEach, fixture, expect, sinon */

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
		},
		enrollmentEntity,
		organizationEntity;

	before(function() {
		var parser = document.createElement('d2l-siren-parser');
		enrollmentEntity = parser.parse(enrollment);
		organizationEntity = parser.parse(organization);
	});

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

		widget.enrollment = enrollmentEntity;
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

			widget.enrollment = enrollmentEntity;
		});

		it('should parse and update the internal Siren representation', function() {
			expect(widget._organization.properties).to.be.an('object');
		});

		it('should have the correct href', function() {
			var anchor = widget.$$('a');
			var homepageLink = organizationEntity.getLinkByRel('https://api.brightspace.com/rels/organization-homepage');
			expect(anchor.href).to.equal(homepageLink.href);
		});

		it('should update the course name', function() {
			var courseText = widget.$$('.course-text');
			expect(courseText.innerHTML).to.equal(organizationEntity.properties.name);
		});

		it('should set the internal pinned state correctly', function() {
			expect(widget.pinned).to.be.true;
		});

		it('should hide image from screen readers', function() {
			var courseImage = widget.$$('.course-image img');
			expect(courseImage.getAttribute('aria-hidden')).to.equal('true');
		});

		it('should have an aria-label for pin button', function() {
			var pinButton = widget.$$('.menu-text.pin');
			expect(pinButton.getAttribute('aria-label')).to.equal('Pin ' + organizationEntity.properties.name);
		});

		it('should have an aria-label for unpin button', function() {
			var pinButton = widget.$$('.menu-text.unpin');
			expect(pinButton.getAttribute('aria-label')).to.equal('Unpin ' + organizationEntity.properties.name);
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

			widget.enrollment = enrollmentEntity;
		});

		afterEach(function() {
			server.restore();
		});

		it('should set the update action parameters correctly', function() {
			widget._hoverPinClickHandler(event);

			expect(widget._enrollmentPinUrl).to.equal('/enrollments/users/169/organizations/1');
			expect(widget._enrollmentPinMethod).to.equal('PUT');
		});

		it('should update the icon', function() {
			var pinIcon = widget.$$('.menu-item iron-icon.menu-icon');

			widget.pinned = false;
			expect(pinIcon.icon).to.equal('d2l-tier1:pin-filled');
			widget.pinned = true;
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

			widget._hoverPinClickHandler(event);
		});

		it('should update the local pinned state with the received pin state', function(done) {
			server.respondWith(
				'PUT',
				'/enrollments/users/169/organizations/1',
				[200, {}, JSON.stringify(enrollment)]);

			expect(widget.pinned).to.be.true;
			widget._hoverPinClickHandler(event);
			expect(widget.pinned).to.be.false;

			setTimeout(function() {
				// We responded with pinned = true, so it gets set back to true by the response
				expect(widget.pinned).to.be.true;
				done();
			}, 10);
		});
	});
});
