suite('smoke test', function() {
	var component;

	setup(function() {
		component = fixture('course-tile-fixture');
	});

	test('should load', function() {
		expect(component).to.exist;
	});
});
