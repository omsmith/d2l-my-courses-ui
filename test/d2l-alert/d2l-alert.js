/* global describe, it, beforeEach, fixture, expect */

'use strict';

describe('d2l-alert', function() {
	var component;

	beforeEach(function() {
		component = fixture('d2l-alert-fixture');
	});

	it('should contain the demo text', function() {
		expect(component.innerHTML).to.contain('Alert text');
	});

	it('should hide content when visible=false', function() {
		component.visible = false;

		expect(component.$$('.message-wrapper').hasAttribute('hidden')).to.be.true;
	});

	it('should show content when visible=true', function() {
		component.visible = true;

		expect(component.$$('.message-wrapper').hasAttribute('hidden')).to.be.false;
	});
});
