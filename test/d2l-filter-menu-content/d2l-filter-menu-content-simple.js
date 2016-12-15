/* global describe, it, beforeEach, fixture */

'use strict';

describe('d2l-filter-menu-content-simple', function() {
	var component;

	beforeEach(function() {
		component = fixture('d2l-filter-menu-content-fixture');
	});

	describe('d2l-filter-menu-content-filters-changed', function() {
		it('should emit an event when a filter is added', function(done) {
			var handler = function() {
				document.removeEventListener('d2l-filter-menu-content-filters-changed', handler);
				done();
			};
			document.addEventListener('d2l-filter-menu-content-filters-changed', handler);

			component.$$('d2l-menu').fire('d2l-menu-item-change', {
				selected: true,
				value: 'foo'
			});
		});

		it('should emit an event when a filter is removed', function(done) {
			var handler = function() {
				document.removeEventListener('d2l-filter-menu-content-filters-changed', handler);
				done();
			};
			document.addEventListener('d2l-filter-menu-content-filters-changed', handler);

			component.$$('d2l-menu').fire('d2l-menu-item-change', {
				selected: false,
				value: 'foo'
			});
		});
	});
});
