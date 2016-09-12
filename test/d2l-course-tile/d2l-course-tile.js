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

	it('should fetch the organization on ready', function(done) {
		server.respondWith(
			'GET',
			'/organizations/1?embedDepth=1',
			[200, {}, JSON.stringify(organization)]);

		widget.$.organizationRequest.addEventListener('iron-ajax-response', function() {
			expect(widget._organization.properties).to.be.an('object');
			done();
		});

		widget.enrollment = enrollmentEntity;
		// The widget will generate a ready signal before we've set the
		// enrollment, so manually call it again after we have
		widget.ready();
	});

	describe('setting the enrollment attribute', function() {
		beforeEach(function(done) {
			server.respondWith(
				'GET',
				'/organizations/1?embedDepth=1',
				[200, {}, JSON.stringify(organization)]);

			widget.$.organizationRequest.addEventListener('iron-ajax-response', function() {
				// Ensure organization has been received before doing tests
				done();
			});

			widget.enrollment = enrollmentEntity;
			// Setting the enrollment post-ready, so call it again once it's set
			widget.ready();
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

		it('should have an unpin button if the course is pinned', function() {
			var pinButton = widget.$$('#pin-button');
			expect(pinButton.text).to.equal('Unpin');
		});
	});

	describe('delay-load attribute', function() {
		it('should not fetch the organization if delay-load=true', function() {
			var delayedWidget = fixture('d2l-course-tile-fixture-delayed');

			server.respondWith(
				'GET',
				'/organizations/1?embedDepth=1',
				[200, {}, JSON.stringify(organization)]);

			var organizationSpy = sinon.spy(delayedWidget.$.organizationRequest, 'generateRequest');

			delayedWidget.enrollment = enrollmentEntity;
			delayedWidget.ready();

			expect(organizationSpy.called).to.be.false;
		});

		it('should fetch the organization if delay-load is set to false', function(done) {
			var delayedWidget = fixture('d2l-course-tile-fixture-delayed');

			server.respondWith(
				'GET',
				'/organizations/1?embedDepth=1',
				[200, {}, JSON.stringify(organization)]);

			var organizationSpy = sinon.spy(delayedWidget.$.organizationRequest, 'generateRequest');

			delayedWidget.$.organizationRequest.addEventListener('iron-ajax-response', function() {
				expect(delayedWidget._organization.properties).to.be.an('object');
				done();
			});

			delayedWidget.enrollment = enrollmentEntity;
			delayedWidget.ready();

			expect(organizationSpy.called).to.be.false;

			delayedWidget.delayLoad = false;
		});
	});

	describe('changing the pinned state', function() {
		var event = { preventDefault: function() {} };

		beforeEach(function(done) {
			server.respondWith(
				'GET',
				'/organizations/1?embedDepth=1',
				[200, {}, JSON.stringify(organization)]);

			server.respondWith(
				'GET',
				'/d2l/lp/auth/xsrf-tokens',
				[200, {}, JSON.stringify({
					referrerToken: 'foo'
				})]);

			widget.$.organizationRequest.addEventListener('iron-ajax-response', function() {
				// Ensure organization has been received before doing tests
				done();
			});

			widget.enrollment = enrollmentEntity;
			widget.ready();
		});

		afterEach(function() {
			server.restore();
		});

		it('should set the update action parameters correctly', function() {
			widget._hoverPinClickHandler(event);

			expect(widget._enrollmentPinUrl).to.equal('/enrollments/users/169/organizations/1');
			expect(widget._enrollmentPinMethod).to.equal('PUT');
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

		it('should update the overflow menu button with the new pinned state', function() {
			server.respondWith(
				'PUT',
				'/enrollments/users/169/organizations/1',
				[200, {}, JSON.stringify(enrollment)]);

			widget._hoverPinClickHandler(event);

			var pinButton = widget.$$('#pin-button');
			expect(pinButton.text).to.equal('Pin');
		});
	});
});
