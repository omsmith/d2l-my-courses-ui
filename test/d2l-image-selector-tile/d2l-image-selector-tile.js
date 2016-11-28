/* global describe, it, beforeEach, fixture, expect, sinon */

'use strict';

describe('<d2l-image-selector-tile>', function() {
	var widget,
		testPath = 'http://testPath',
		testImageHref = 'http://test.com/images/10',
		testBadImageHref = 'http://test.com/MUAHAHAHA/10';

	beforeEach(function() {
		widget = fixture('d2l-image-selector-tile-fixture');
		sinon.stub(widget, '_doTelemetrySetImageRequest');
	});

	it('loads element', function() {
		expect(widget).to.exist;
	});

	it('fires a image-selector-tile-image-selected message when clicked', function() {
		var messageSent = false;
		widget.addEventListener('image-selector-tile-image-selected', function() {
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

	describe('_selectImage', function() {
		it('fires a set-course-image event with the "set" parameter', function() {
			widget._fireCourseImageMessage = sinon.stub();
			widget._selectImage();
			expect(widget._fireCourseImageMessage.calledWith('set')).to.equal(true);
		});

		it('fires a "image-selector-tile-image-selected event"', function() {
			widget.fire = sinon.stub();
			widget._selectImage();
			expect(widget.fire.calledWith('image-selector-tile-image-selected')).to.equal(true);
		});

		it('generates a setImageRequest', function() {
			widget.$ = {
				setImageRequest: {
					generateRequest: sinon.stub()
				}
			};

			widget._selectImage();
			expect(widget.$.setImageRequest.generateRequest.called).to.equal(true);
		});

		it('sends a telemetry event', function() {
			widget._selectImage();
			expect(widget._doTelemetrySetImageRequest.called).to.equal(true);
		});
	});

	describe('_onSetImageResponse', function() {
		it('fires a set-course-image event with the "success" parameter if the status is 200', function() {
			var response = {
				detail: { status: 200 }
			};
			widget._fireCourseImageMessage = sinon.stub();
			widget._onSetImageResponse(response);
			expect(widget._fireCourseImageMessage.calledWith('success')).to.equal(true);
		});

		it('fires a set-course-image event with the "failure" parameter if the status is not 200', function() {
			var response = {
				detail: { status: 500 }
			};
			widget._fireCourseImageMessage = sinon.stub();
			widget._onSetImageResponse(response);
			expect(widget._fireCourseImageMessage.calledWith('failure')).to.equal(true);
		});
	});

	describe('_onSetImageError', function() {
		it('fires a set-course-image event with the "failure" parameter', function() {
			widget._fireCourseImageMessage = sinon.stub();
			widget._onSetImageError();
			expect(widget._fireCourseImageMessage.calledWith('failure')).to.equal(true);
		});
	});

	describe('_fireCourseImageMessage', function() {
		it("fires a 'set-course-image' event with the image and passed in status", function() {
			var self = {
				fire: sinon.stub(),
				organization: { testData: 'testData' },
				image: 'Image'
			};
			widget._fireCourseImageMessage.call(self, 'status');

			expect(self.fire.firstCall.args[0]).to.equal('set-course-image');
			expect(self.fire.firstCall.args[1]).to.deep.equal({
				status: 'status',
				image: self.image,
				organization: self.organization
			});
		});
	});
});
