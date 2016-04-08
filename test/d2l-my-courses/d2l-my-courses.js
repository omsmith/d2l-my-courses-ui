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

		widget = fixture('d2l-my-courses-fixture');
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
			request = ajaxElement.generateRequest();
			server.respond();

			ajaxElement.addEventListener('response', function () {
				expect(request.response).to.be.an('object');
				expect(request.response.referrerToken).to.equal(xsrfResponse.body.referrerToken);
				done();
			});
		});

		it('should have a read-only response object', function() {
			widget._setXsrfResponse('foo');

			widget.xsrfResponse = 'bar';

			expect(widget.xsrfResponse).to.equal('foo');
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
			widget._setXsrfResponse(xsrfResponse.body);

			request = ajaxElement.generateRequest();
			server.respond();

			ajaxElement.addEventListener('response', function () {
				expect(request.response).to.be.an('object');
				expect(request.response.access_token).to.equal(tokenResponse.body.access_token);
				done();
			});
		});

		it('should have a read-only response object', function() {
			widget._setTokenResponse('foo');

			widget.tokenResponse = 'bar';

			expect(widget.tokenResponse).to.equal('foo');
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
			widget._setXsrfResponse(xsrfResponse.body);
			widget._setTokenResponse(tokenResponse.body);

			request = ajaxElement.generateRequest();
			server.respond();

			ajaxElement.addEventListener('response', function () {
				expect(request.response).to.be.an('object');
				expect(Array.isArray(request.response.entities)).to.be.true;
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
