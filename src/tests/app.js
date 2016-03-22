import app from '../app';

describe('app', () => {
	it('should export a function', () => {
		expect(typeof app).toBe('function');
	});

	it('should write content into passed in node', () => {
		const parentNode = document.createElement('div');
		app(parentNode);
		expect(parentNode.innerHTML).toBeDefined();
		expect(parentNode.innerHTML).not.toBeNull();
		expect(parentNode.innerHTML).not.toBe('');
	});
});
