/* global describe, it, expect, fixture, beforeEach */

'use strict';

describe('localize behavior', function() {
	var component;

	beforeEach(function() {
		document.documentElement.removeAttribute('lang');
	});

	it('should have default locale', function() {
		component = fixture('default-fixture');

		expect(component.locale).to.equal('en-us');
		expect(component.localize('allCourses')).to.equal('All Courses');
	});

	it('should use default locale if provided locale does not exist', function() {
		document.documentElement.setAttribute('lang', 'zz-ZZ');

		component = fixture('default-fixture');

		expect(component.locale).to.equal('zz-ZZ');
		expect(component.localize('allCourses')).to.equal('All Courses');
	});

});
