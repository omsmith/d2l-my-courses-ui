/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('<d2l-search-widget-custom>', function() {
	var sandbox,
		server,
		widget,
		clock,
		searchAction = {
			name: 'search-my-enrollments',
			method: 'GET',
			href: '/enrollments/users/169',
			fields: [{
				name: 'search',
				type: 'search',
				value: ''
			}, {
				name: 'pageSize',
				type: 'number',
				value: 20
			}, {
				name: 'embedDepth',
				type: 'number',
				value: 0
			}, {
				name: 'sort',
				type: 'text',
				value: 'OrgUnitName,OrgUnitId'
			}, {
				name: 'parentOrganizations',
				type: 'hidden',
				value: ''
			}]
		},
		searchFieldName = 'search';

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		server = sinon.fakeServer.create();
		server.respondImmediately = true;
		server.respondWith(
			'GET',
			/\/enrollments\/users\/169*/,
			[200, {}, '{}']);

		clock = sinon.useFakeTimers();

		widget = fixture('d2l-search-widget-custom-fixture');
		widget._searchResultsCache = {};
		widget.searchAction = searchAction;
		widget.searchFieldName = searchFieldName;
	});

	afterEach(function() {
		sandbox.restore();
		server.restore();
		clock.restore();
	});

	it('should perform a search when sort changes', function() {
		var spy = sandbox.spy(widget, 'search');
		widget.set('sort', '-PinDate,OrgUnitName,OrgUnitId');
		clock.tick(501);
		expect(spy.called).to.be.true;
	});

	it('should perform a search when filter changes', function() {
		var spy = sandbox.spy(widget, 'search');
		widget.set('parentOrganizations', [1, 2, 3]);
		clock.tick(501);
		expect(spy.called).to.be.true;
	});

	it('only performs one search per debounce period', function() {
		var spy = sandbox.spy(widget, 'search');

		for (var i = 0; i < 20; i++) {
			widget.set('sort', 'sort' + i);
			clock.tick(200);
		}

		clock.tick(501);

		expect(spy.callCount).to.equal(1);
	});
});
