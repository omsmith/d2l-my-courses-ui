/* global describe, it, beforeEach, fixture, expect */

'use strict';

describe('<d2l-image-selector-tile>', function() {
	var widget;

	beforeEach(function() {
		widget = fixture('d2l-image-selector-tile-fixture');
	});

	it('loads element', function() {
		expect(widget).to.exist;
	});

	it('fires a close-simple-overlay message when clicked', function() {
		var messageSent = false;
		widget.addEventListener('close-simple-overlay', function() {
			messageSent = true;
		});

		widget.$$('button').click();

		expect(messageSent).to.equal(true);
	});
});
