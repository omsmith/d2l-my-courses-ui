/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

describe('smoke test', function() {
	var ajaxElement,
		ajaxElements,
		request,
		server,
		widget,
		xsrfResponse = {
			body: { referrerToken: 'foo' }
		},
		tokenResponse = {
			headers: { 'x-csrf-token': xsrfResponse.body.referrerToken },
			body: { access_token: 'such access wow' }
		},
		enrollmentsResponse = {
			headers: { Authorization: 'Bearer ' + tokenResponse.body.access_token },
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

		widget = fixture('my-courses-widget-fixture');
		ajaxElements = widget.getElementsByTagName('iron-ajax');
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

	describe('XSRF request', function () {
		beforeEach(function () {
			ajaxElement = ajaxElements[0];
			server.respondWith(
				'GET',
				/\/d2l\/lp\/auth\/xsrf-tokens/,
				function (req) {
					req.respond(200, xsrfResponse.headers, JSON.stringify(xsrfResponse.body))
				});
		});

		it('should send a correct XSRF request', function (done) {
			ajaxElement.addEventListener('response', function () {
				expect(request.response).to.be.an('object');
				expect(request.response.referrerToken).to.equal(xsrfResponse.body.referrerToken);
				done();
			});

			request = ajaxElement.generateRequest();
			server.respond();
		});
	});

	describe('Token request', function () {
		beforeEach(function () {
			ajaxElement = ajaxElements[1];
			server.respondWith(
				'POST',
				/\/d2l\/lp\/auth\/oauth2\/token/,
				function (req) {
					expect(req.requestHeaders['x-csrf-token']).to.equal(xsrfResponse.body.referrerToken);
					expect(req.requestBody).to.equal('scope=*:*:*');
					req.respond(200, tokenResponse.headers, JSON.stringify(tokenResponse.body));
				});
		});

		it('should send a correct token request', function (done) {
			ajaxElement.addEventListener('response', function () {
				expect(request.response).to.be.an('object');
				expect(request.response.access_token).to.equal(tokenResponse.body.access_token);
				done();
			});

			widget._setXsrfResponse(xsrfResponse.body);

			request = ajaxElement.generateRequest();
			server.respond();
		});
	});

	describe('Enrollments request', function () {
		beforeEach(function () {
			ajaxElement = ajaxElements[2];
			server.respondWith(
				'GET',
				/\/enrollments/,
				function (req) {
					expect(req.requestHeaders['authorization']).to.match(/Bearer/);
					req.respond(200, enrollmentsResponse.headers, JSON.stringify(enrollmentsResponse.body));
				});
		});

		it('should send a correct enrollments request', function (done) {
			ajaxElement.addEventListener('response', function () {
				expect(request.response).to.be.an('object');
				expect(Array.isArray(request.response.entities)).to.be.true;
				done();
			});

			widget._setXsrfResponse(xsrfResponse.body);
			widget._setTokenResponse(tokenResponse.body);

			request = ajaxElement.generateRequest();
			server.respond();
		});
	});
});
