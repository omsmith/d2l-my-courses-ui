/* global describe, it, beforeEach, fixture, expect */

describe('<course-tile>', function () {
	var courseTile;

	beforeEach(function () {
		courseTile = fixture('course-tile-fixture');
	});

	it('loading element', function () {
		expect(courseTile).to.exist;
	});

	describe('defaults', function () {
		it('has an undefined name', function () {
			expect(courseTile.name).to.be.undefined;
		});

		it('has an undefined target', function () {
			expect(courseTile.target).to.be.undefined;
		});
	});

	describe('setting the name attribute', function () {
		beforeEach(function () {
			courseTile.name = 'foo';
		});

		it('should have the name attribute value that was set', function () {
			expect(courseTile.name).to.equal('foo');
		});
	});

	describe('setting the target attribute', function() {
		beforeEach(function () {
			courseTile.target = 'http://foo.bar';
		});

		it('should have the target attribute value that was set', function() {
			expect(courseTile.target).to.equal('http://foo.bar');
		});
	});
});
