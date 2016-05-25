/* global describe, it, expect, fixture */

describe('localize behavior', function() {
	var component;

	it('should have default locale', function () {
		component = fixture('no-locale-fixture');
		expect(component.localize('allCourses')).to.equal('All Courses');
	});

	it('should use default locale if provided locale does not exist', function () {
		component = fixture('unsupported-locale-fixture');
		expect(component.localize('allCourses')).to.equal('All Courses');
	});

});
