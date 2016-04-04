suite('smoke test', function() {
	var component;

	setup(function() {
		component = fixture('my-courses-widget-fixture');
	});

	test('should load', function() {
		expect(component).to.exist;
	});
});
