/* global describe, it, beforeEach, fixture, expect, sinon */

'use strict';

describe('<d2l-image-selector-tile>', function() {
	var widget,
		testPath = 'http://testPath',
		testImageHref = 'http://test.com/images/10',
		testBadImageHref = 'http://test.com/MUAHAHAHA/10';

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

	describe('_getSetImageUrl', function() {
		it('returns an empty string if the image self href has the wrong format', function() {
			var self = {
				organization : {
					getActionByName: sinon.stub().returns({ href: testPath })
				},
				image : {
					getLinkByRel: sinon.stub().returns({ href: testBadImageHref })
				}
			};

			var result = widget._getSetImageUrl.call(self);
			expect(result).to.equal('');
		});

		it('returns an the correct image url', function() {
			var self = {
				organization : {
					getActionByName: sinon.stub().returns({ href: testPath })
				},
				image : {
					getLinkByRel: sinon.stub().returns({ href: testImageHref })
				}
			};

			var result = widget._getSetImageUrl.call(self);
			expect(result).to.equal(testPath + '?imagePath=/images/10');
		});
	});
});
