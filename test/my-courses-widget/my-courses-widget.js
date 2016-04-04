describe('smoke test', function() {
	var request,
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
		server.respondWith(
			'GET',
			/\/d2l\/lp\/auth\/xsrf-tokens/,
			function (req) {
				req.respond(200, xsrfResponse.headers, JSON.stringify(xsrfResponse.body))
			});
		server.respondWith(
			'POST',
			/\/d2l\/lp\/auth\/oauth2\/token/,
			function (req) {
				expect(req.requestHeaders['x-csrf-token']).to.equal(xsrfResponse.body.referrerToken);
				expect(req.requestBody).to.equal('scope=*:*:*');
				req.respond(200, tokenResponse.headers, JSON.stringify(tokenResponse.body));
			});
		server.respondWith(
			'GET',
			/\/enrollments/,
			function (req) {
				expect(req.requestHeaders['authorization']).to.match(/Bearer/);
				req.respond(200, enrollmentsResponse.headers, JSON.stringify(enrollmentsResponse.body));
			});

		widget = fixture('my-courses-widget-fixture');
		var autoAjax = widget.getElementsByTagName('iron-ajax')[0];
		// Turn off auto on the first (XSRF) request, as it makes testing a pain
		autoAjax.auto = false;
	});

	afterEach(function () {
		server.restore();
	});

	it('should load', function () {
		expect(widget).to.exist;
	});

	it('should send a correct XSRF request', function () {
		var ajax = widget.getElementsByTagName('iron-ajax')[0];
		// Don't want to trigger token request
		ajax.onResponse = "";
		request = ajax.generateRequest();
		server.respond();

		ajax.addEventListener('response', function () {
			expect(request.response).to.be.an('object');
			expect(request.response.referrerToken).to.equal(xsrfResponse.body.referrerToken);
		});
	});

	it('should send a correct token request', function () {
		widget.xsrfResponse = xsrfResponse.body;

		var ajax = widget.getElementsByTagName('iron-ajax')[1];
		// Don't want to trigger enrollments request
		ajax.onResponse = "";
		request = ajax.generateRequest();
		server.respond();

		request.addEventListener('response', function () {
			expect(request.response).to.be.an('object');
			expect(request.response.access_token).to.equal(tokenResponse.body.access_token);
		});
	});

	it('should send a correct enrollments request', function () {
		widget.xsrfResponse = xsrfResponse.body;
		widget.tokenResponse = tokenResponse.body;

		var ajax = widget.getElementsByTagName('iron-ajax')[2];
		request = ajax.generateRequest();
		server.respond();

		request.addEventListener('response', function () {
			expect(request.response).to.be.an('object');
			expect(Array.isArray(request.response.entities)).to.be.true;
		});
	});
});
