/* global describe, it, beforeEach, fixture, expect */

'use strict';

describe('smoke test', function() {
	var widget,
		courseEntity = {
			properties: {
				name: 'Test Name'
			}
		};

	beforeEach(function() {
		widget = fixture('d2l-all-courses-fixture');
	});

	it('should load', function() {
		expect(widget).to.exist;
	});

	describe('A11Y', function() {
		it('should announce when course is pinned', function() {
			var event = new CustomEvent('course-pinned', {
				detail: {
					course: courseEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(courseEntity.properties.name + ' has been pinned');
		});

		it('should announce when course is unpinned', function() {
			var event = new CustomEvent('course-unpinned', {
				detail: {
					course: courseEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(courseEntity.properties.name + ' has been unpinned');
		});
	});
});
