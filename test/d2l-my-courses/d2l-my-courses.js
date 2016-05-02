/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

describe('smoke test', function() {
	var ajaxElement,
		ajaxElements,
		server,
		widget,
		enrollmentsResponse = {
			headers: { Authorization: 'Bearer such access wow' },
			body: {
				entities: [{
					properties: {
						name: 'Test Name',
						id: 'TestName'
					}
				}]
			}
		};

	beforeEach(function () {
		server = sinon.fakeServer.create();

		widget = fixture('d2l-my-courses-fixture');
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

	describe('Enrollments request', function () {
		beforeEach(function () {
			ajaxElement = ajaxElements[0];
			server.respondImmediately = true;
			server.respondWith(
				'GET',
				widget.enrollmentsUrl,
				function (req) {
					expect(req.requestHeaders['authorization']).to.match(/Bearer/);
					expect(req.requestHeaders['accept']).to.equal('application/vnd.siren+json');
					req.respond(200, enrollmentsResponse.headers, JSON.stringify(enrollmentsResponse.body));
				});
		});

		it('should send a correct enrollments request', function (done) {
			ajaxElement.authToken = 'such access wow';
			ajaxElement.generateRequest();

			ajaxElement.addEventListener('response', function (response) {
				expect(Array.isArray(response.detail.xhr.response.entities)).to.be.true;
				done();
			});
		});

		it('should have a read-only response object', function() {
			widget._setEnrollmentsResponse('foo');

			widget.enrollmentsResponse = 'bar';

			expect(widget.enrollmentsResponse).to.equal('foo');
		});
	});
});
