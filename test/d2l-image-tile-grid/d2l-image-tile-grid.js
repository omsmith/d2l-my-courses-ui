/* global describe, it, beforeEach, fixture, expect */

'use strict';

describe('<d2l-image-tile-grid>', function() {
	var widget;

	beforeEach(function() {
		widget = fixture('d2l-image-tile-grid-fixture');
	});

	it('loads element', function() {
		expect(widget).to.exist;
	});

	// TODO: Replace this test when the actual functionality is implemented
	it('Draws 12 image tiles to the screen', function() {
		var template = widget.$$('#enrollmentsTemplate');
		template.render();

		var courseTiles = widget.querySelectorAll('d2l-image-selector-tile');

		expect(courseTiles.length).to.equal(12);
	});
});
