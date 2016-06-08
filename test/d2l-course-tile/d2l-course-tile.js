/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

describe('<d2l-course-tile>', function () {
	var courseTile,
		enrollment = {
			rel: ['enrollment'],
			properties: {
				id: 'foo',
				name: 'bar'
			},
			entities: [{
				class: ['preferences', 'pinned'],
				rel: ['preferences'],
				properties: {
					colour: '#000000',
					pinDate: '2016-01-01T00:00:00.000Z'
				},
				actions: [{
					name: 'update',
					method: 'PUT',
					href: 'http://example.com',
					fields: [{
						name: 'colour',
						type: 'text',
						value: '#000000'
					}, {
						name: 'pinned',
						type: 'checkbox',
						value: true
					}]
				}]
			}]
		};

	beforeEach(function () {
		courseTile = fixture('d2l-course-tile-fixture');
	});

	it('loads element', function () {
		expect(courseTile).to.exist;
	});

	describe('setting the enrollment attribute', function () {
		beforeEach(function () {
			courseTile.enrollment = enrollment;
		});

		it('should parse and update the internal Siren representation', function () {
			expect(courseTile._enrollmentEntity.properties).to.be.an('object');
		});

		it('should have the correct href', function () {
			var anchor = courseTile.$$('a');
			expect(anchor.href).to.contain('/d2l/home/' + enrollment.properties.id);
		});

		it('should update the course name', function () {
			var courseText = courseTile.$$('.course-text');
			expect(courseText.innerHTML).to.equal(enrollment.properties.name);
		});

		it('should set the internal pinned state correctly', function () {
			expect(courseTile._pinned).to.be.true;
		});

		it('should set the update action parameters correctly', function () {
			expect(courseTile._updatePreferencesUrl).to.equal('http://example.com');
			expect(courseTile._updatePreferencesMethod).to.equal('PUT');
			expect(courseTile._updatePreferencesFields).to.be.an.instanceof(Array).with.lengthOf(2);
		});

		it('should hide image from screen readers', function () {
			var courseImage = courseTile.$$('.course-image img');
			expect(courseImage.getAttribute('aria-hidden')).to.equal('true');
		});

		it('should have an aria-label for pin button', function () {
			var pinButton = courseTile.$$('.menu-text.pin');
			expect(pinButton.getAttribute('aria-label')).to.equal('Pin ' + enrollment.properties.name);
		});

		it('should have an aria-label for unpin button', function () {
			var pinButton = courseTile.$$('.menu-text.unpin');
			expect(pinButton.getAttribute('aria-label')).to.equal('Unpin ' + enrollment.properties.name);
		});
	});

	describe('changing the pinned state', function () {
		var event = { preventDefault: function () {} },
			server;

		beforeEach(function () {
			courseTile.enrollment = enrollment;

			server = sinon.fakeServer.create();
			server.respondImmediately = true;

			var updatePreferencesComponent = courseTile.$$('d2l-ajax');
			updatePreferencesComponent.cachedTokens['*:*:*'] = {
				access_token: 'such access wow',
				expires_at: Number.MAX_VALUE
			};
		});

		afterEach(function () {
			server.restore();
		});

		it('should update the icon', function () {
			var pinIcon = courseTile.$$('.menu-item iron-icon.menu-icon');

			courseTile._pinned = false;
			expect(pinIcon.icon).to.equal('d2l-tier1:pin-filled');
			courseTile._pinned = true;
			expect(pinIcon.icon).to.equal('d2l-tier1:pin-hollow');
		});

		it('should call the pinning API', function (done) {
			server.respondWith(
				'PUT',
				'http://example.com',
				function (req) {
					var body = JSON.parse(req.requestBody);
					expect(body.colour).to.equal('#000000');
					expect(body.pinned).to.be.false;
					done();
				});

			courseTile.pinClickHandler(event);
		});

		it('should update the local pinned state with the received pin state', function (done) {
			server.respondWith(
				'PUT',
				'http://example.com',
				[200, {}, JSON.stringify(enrollment.entities[0])]);

			expect(courseTile._pinned).to.be.true;
			courseTile.pinClickHandler(event);
			expect(courseTile._pinned).to.be.false;

			setTimeout(function () {
				// We responded with pinned = true, so it gets set back to true by the response
				expect(courseTile._pinned).to.be.true;
				done();
			}, 10);
		});

		it('should revert the local pinned state if a non-200 success occurs', function (done) {
			server.respondWith(
				'PUT',
				'http://example.com',
				[204, {}, '']);

			expect(courseTile._pinned).to.be.true;
			courseTile.pinClickHandler(event);
			expect(courseTile._pinned).to.be.false;

			setTimeout(function () {
				expect(courseTile._pinned).to.be.true;
				done();
			}, 10);
		});

		it('should revert the local pinned state if an error occurs', function (done) {
			server.respondWith(
				'PUT',
				'http://example.com',
				[404, {}, '']);

			expect(courseTile._pinned).to.be.true;
			courseTile.pinClickHandler(event);
			expect(courseTile._pinned).to.be.false;

			setTimeout(function () {
				expect(courseTile._pinned).to.be.true;
				done();
			}, 10);
		});
	});
});
