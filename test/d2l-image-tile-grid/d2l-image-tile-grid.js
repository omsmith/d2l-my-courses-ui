/* global describe, it, beforeEach, afterEach fixture, expect, sinon */

'use strict';

describe('<d2l-image-tile-grid>', function() {
	var widget,
		server,
		sampleImages = {'class':['course-image', 'collection', 'paged'], 'properties':{'pagingInfo':{'total':9, 'page':1, 'pageSize':{'DEFAULT':20}}}, 'entities':[{'class':['course-image'], 'properties':{'name':'ab_0003'}, 'links':[{'rel':['via'], 'href':'http://testhref.com'}, {'rel':['self'], 'href':'http://testhref.com'}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}], 'rel':['item']}, {'class':['course-image'], 'properties':{'name':'ab_0001'}, 'links':[{'rel':['via'], 'href':'http://testhref.com'}, {'rel':['self'], 'href':'http://testhref.com'}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}], 'rel':['item']}, {'class':['course-image'], 'properties':{'name':'ab_0025'}, 'links':[{'rel':['via'], 'href':'http://testhref.com'}, {'rel':['self'], 'href':'http://testhref.com'}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['tile']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}, {'rel':['alternate'], 'href':'http://testhref.com', 'class':['']}], 'rel':['item']}], 'links':[{'rel':['self'], 'href':'http://testhref.com'}], 'actions':[{'name':'search-course-images', 'method':'GET', 'href':'http://testhref.com', 'fields':[{'name':'searchString', 'type':'text', 'value':'fabric'}, {'name':'pageNum', 'type':'number', 'value':1}, {'name':'pageSize', 'type':'number', 'value':{'DEFAULT':20}}]}]};

	beforeEach(function() {
		server = sinon.fakeServer.create();
		server.respondImmediately = true;
		server.respondWith(
			'GET',
			/\/images\//,
			[200, {}, JSON.stringify(sampleImages)]);

		widget = fixture('d2l-image-tile-grid-fixture');
	});

	afterEach(function() {
		server.restore();
	});

	it('loads element', function() {
		expect(widget).to.exist;
	});

	it('Draws an image tile to the screen for each course image returned', function() {
		var template = widget.$$('#enrollmentsTemplate');
		template.render();

		var courseTiles = widget.querySelectorAll('d2l-image-selector-tile');

		expect(courseTiles.length).to.equal(3);
	});
});
