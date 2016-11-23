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

	it('should apply the call-to-action alert type by default', function() {
		expect(component.attributes.getNamedItem('type').value).to.equal('call-to-action');
	});

	it('should apply the alert type property value as an attribute', function() {
		component['type'] = 'reinforcement';
		expect(component.attributes.getNamedItem('type').value).to.equal('reinforcement');
	});
});
