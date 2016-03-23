
export default (parentNode) => {
	const node = document.createElement('h2');
	const textNode = document.createTextNode('My Courses');
	node.appendChild(textNode);
	parentNode.appendChild(node);
};
