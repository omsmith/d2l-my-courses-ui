/* global describe, it, beforeEach, fixture, expect, sinon */

'use strict';

describe('<d2l-course-tile>', function() {
	var widget,
		self,
		searchWidget;

	beforeEach(function() {
		searchWidget = {
			clear: sinon.stub()
		};

		self = {
			_showGrid: true,
			_nextSearchResultPage: null,
			_nextDefaultResultPage: null,
			_loadingSpinnerClass: '',
			_noResultsTextStart: null,
			_noResultsTextMid: null,
			_noResultsTextEnd: null,
			_defaultImages: [],
			_searchImages: [],
			_searchPath: 'searchPath',
			_displayDefaultResults: sinon.stub(),
			_sirenParser: {
				parse: sinon.stub().returns({})
			},
			_setNextPage: sinon.stub(),
			_updateImages: sinon.stub(),
			_getSearchAction: sinon.stub(),
			_getSearchStringValue: sinon.stub(),
			localize: sinon.stub(),
			fire: sinon.stub(),
			_getChangeCourseImageLink: sinon.stub(),
			organization: {
				properties: {
					name: 'testOrg'
				}
			},
			$$: sinon.stub().withArgs('d2l-search-widget').returns(searchWidget),
			$: {
				imagesRequest: { generateRequest: sinon.stub() },
				moreSearchImagesRequest: { generateRequest: sinon.stub() },
				moreDefaultImagesRequest: { generateRequest: sinon.stub() },
				lazyLoadSpinner: { scrollIntoView: sinon.stub() }
			},
			_displaySearchResults: sinon.stub(),
			_images: []
		};
	});

	beforeEach(function() {
		widget = fixture('d2l-basic-image-selector-fixture');
	});

	it('loads element', function() {
		expect(widget).to.exist;
	});

	describe('loadMore', function() {
		it('generates a moreSearchImagesRequest when a nextSearchResults page exists', function() {
			self._nextSearchResultPage = 'http://test.com';
			widget.loadMore.call(self);
			expect(self.$.moreSearchImagesRequest.generateRequest.called).to.equal(true);
		});

		it('does not generate a moreSearchImagesRequest when showGrid is false', function() {
			self._nextSearchResultPage = 'http://test.com';
			self._showGrid = false;
			widget.loadMore.call(self);
			expect(self.$.moreSearchImagesRequest.generateRequest.called).to.equal(false);
		});

		it('does not generate a moreSearchImagesRequest when there is no next search page', function() {
			self._nextSearchResultPage = null;
			widget.loadMore.call(self);
			expect(self.$.moreSearchImagesRequest.generateRequest.called).to.equal(false);
		});

		it('shows the spinner when generating a moreSearchImagesRequest', function() {
			self._nextSearchResultPage = 'http://test.com';
			widget.loadMore.call(self);
			expect(self._loadingSpinnerClass).to.equal('');
			expect(self.$.lazyLoadSpinner.scrollIntoView.called).to.equal(true);
		});

		it('generates a moreDefaultImagesRequest when a nextSearchResults page does not exist, there are no search images, and the no results message is not showing', function() {
			self._nextSearchResultPage = null;
			self._nextDefaultResultPage = 'http://test.com';
			self.searchImages = [];

			widget.loadMore.call(self);
			expect(self.$.moreDefaultImagesRequest.generateRequest.called).to.equal(true);
		});

		it('does not generate a moreDefaultImagesRequest when there are search images', function() {
			self._nextSearchResultPage = null;
			self._nextDefaultResultPage = 'http://test.com';
			self._searchImages = ['this is a search image!'];

			widget.loadMore.call(self);
			expect(self.$.moreDefaultImagesRequest.generateRequest.called).to.equal(false);
		});

		it('does not generate a moreDefaultImagesRequest when there is no next default page', function() {
			self._nextSearchResultPage = null;
			self._searchImages = [];

			widget.loadMore.call(self);
			expect(self.$.moreDefaultImagesRequest.generateRequest.called).to.equal(false);
		});

		it('does not generate a moreDefaultImagesRequest when showGrid is false', function() {
			self._nextSearchResultPage = null;
			self._nextDefaultResultPage = 'http://test.com';
			self._searchImages = [];
			self._showGrid = false;

			widget.loadMore.call(self);
			expect(self.$.moreDefaultImagesRequest.generateRequest.called).to.equal(false);
		});

		it('shows the spinner when generating a moreDefaultImagesRequest', function() {
			self._nextSearchResultPage = null;
			self._nextDefaultResultPage = 'http://test.com';
			self._searchImages = [];

			widget.loadMore.call(self);
			expect(self._loadingSpinnerClass).to.equal('');
			expect(self.$.lazyLoadSpinner.scrollIntoView.called).to.equal(true);
		});

		it('hides the spinner when showGrid is false', function() {
			self._showGrid = false;
			self._nextSearchResultPage = 'http://test.com';
			widget.loadMore.call(self);
			expect(self._loadingSpinnerClass).to.equal('hidden');
		});

		it('hides the spinner when no response is generated', function() {
			widget.loadMore.call(self);
			expect(self._loadingSpinnerClass).to.equal('hidden');
			expect(self.$.moreSearchImagesRequest.generateRequest.called).to.equal(false);
			expect(self.$.moreDefaultImagesRequest.generateRequest.called).to.equal(false);
		});
	});

	describe('_getSearchStringValue', function() {
		it('creates the proper searchString', function() {
			var search = 'test';
			var searchString = widget._getSearchStringValue.call(self, search, false);
			expect(searchString).to.equal(self._searchPath + '?search=' + search);
		});

		it('adds on the appendMore querystring if appendMore is true', function() {
			var search = 'test';
			var searchString = widget._getSearchStringValue.call(self, search, true);
			expect(searchString).to.equal(self._searchPath + '?search=' + search + '&appendMore=1');
		});
	});

	describe('_initialize', function() {
		beforeEach(function() {
			self._getSearchAction.returns('{}');
		});

		it('clears the search widget', function() {
			widget._initialize.call(self);
			expect(self.$$('d2l-search-widget').clear.called).to.equal(true);
		});

		it('shows the grid', function() {
			widget._initialize.call(self);
			expect(self._showGrid).to.equal(true);
		});

		it("generates a request using the passed in organization's name", function() {
			widget._initialize.call(self);
			expect(self._getSearchStringValue.calledWith(self.organization.properties.name)).to.equal(true);
		});

		it('generates a request even if no oraganization was passed in', function() {
			widget._initialize.call(self);
			expect(self._getSearchStringValue.called).to.equal(true);
		});
	});

	describe('_onImagesRequestResponse', function() {
		var response;

		beforeEach(function() {
			response = {
				detail: {
					status: 200,
					xhr: { response: {} }
				}
			};

			self._sirenParser.parse.returns({
				entities: [4, 5, 6]
			});
		});

		describe('when status is 200', function() {
			it('hides the loading spinner', function() {
				var badResponse = {
					detail: { status: 500 }
				};
				widget._onImagesRequestResponse.call(self, badResponse, false, false);
				expect(self._loadingSpinnerClass).to.equal('hidden');
			});
		});

		it('hides the loading spinner', function() {
			widget._onImagesRequestResponse.call(self, response, false, false);
			expect(self._loadingSpinnerClass).to.equal('hidden');
		});

		describe('and loadMore is true', function() {
			it('adds to the default images if isDefault is true', function() {
				self._defaultImages = [1, 2, 3];
				self._searchImages = [1, 2, 3];
				widget._onImagesRequestResponse.call(self, response, true, true);

				expect(self._defaultImages).to.deep.equal([1, 2, 3, 4, 5, 6]);
				expect(self._searchImages).to.deep.equal([1, 2, 3]);
			});

			it('adds to the search images if isDefault is false', function() {
				self._defaultImages = [1, 2, 3];
				self._searchImages = [1, 2, 3];
				widget._onImagesRequestResponse.call(self, response, true, false);

				expect(self._searchImages).to.deep.equal([1, 2, 3, 4, 5, 6]);
				expect(self._defaultImages).to.deep.equal([1, 2, 3]);
			});
		});

		describe('and loadMore is false', function() {
			it('sets the default images if isDefault is true', function() {
				self._defaultImages = [1, 2, 3];
				self._searchImages = [1, 2, 3];
				widget._onImagesRequestResponse.call(self, response, false, true);

				expect(self._defaultImages).to.deep.equal([4, 5, 6]);
				expect(self._searchImages).to.deep.equal([1, 2, 3]);
			});

			it('sets the search images if isDefault is false', function() {
				self._defaultImages = [1, 2, 3];
				self._searchImages = [1, 2, 3];
				widget._onImagesRequestResponse.call(self, response, false, false);

				expect(self._searchImages).to.deep.equal([4, 5, 6]);
				expect(self._defaultImages).to.deep.equal([1, 2, 3]);
			});
		});

		it('calls setNextPage with the parsedResponse and isDefault', function() {
			widget._onImagesRequestResponse.call(self, response, false, false);
			expect(self._setNextPage.firstCall.args[0]).to.deep.equal({
				entities: [4, 5, 6]
			});
		});
	});

	describe('clear', function() {
		beforeEach(function() {
			self._searchImages = [1, 2, 3];
			self._showGrid = false;
			self._nextSearchResultPage = 'asdf';
			self._nextDefaultResultPage = 'asdf';
			self._searchString = 'asdf';
			self._images = [1];
			self._searchImages = [1];
			self._defaultImages = [1];

			widget._clear.call(self);
		});

		it('clears stuff', function() {
			expect(self._searchImages).to.deep.equal([]);
			expect(self._showGrid).to.equal(true);
			expect(self._nextSearchResultPage).to.equal(null);
			expect(self._nextDefaultResultPage).to.equal(null);
			expect(self._images).to.deep.equal([]);
			expect(self._searchImages).to.deep.equal([]);
			expect(self._defaultImages).to.deep.equal([]);
			expect(self._searchString).to.equal('');
		});
	});

	describe('_displayDefaultResults', function() {
		beforeEach(function() {
			self._searchImages = [1, 2, 3];
			self._showGrid = false;
			self._nextSearchResultPage = 'asdf';

			widget._displayDefaultResults.call(self);
		});

		it('sets searchImages to an empty array', function() {
			expect(self._searchImages).to.deep.equal([]);
		});

		it('sets showGrid to true', function() {
			expect(self._showGrid).to.equal(true);
		});

		it('sets the nextSearchResultsPage to null', function() {
			expect(self._nextSearchResultPage).to.equal(null);
		});
	});

	describe('_setNextPage', function() {
		var response,
			next;

		beforeEach(function() {
			next = {
				href: 'next'
			};

			response = {
				getLinkByRel: sinon.stub().returns(next)
			};
		});

		it('sets the nextDefaultResultPage if isDefault is true', function() {
			widget._setNextPage.call(self, response, true);
			expect(self._nextDefaultResultPage).to.equal(next.href);
			expect(self._nextSearchResultPage).to.equal(null);
		});

		it('sets the nextSearchResultsPage if isDefault is false', function() {
			widget._setNextPage.call(self, response, false);
			expect(self._nextDefaultResultPage).to.equal(null);
			expect(self._nextSearchResultPage).to.equal(next.href);
		});

		it('fires a clear-image-scroll-threshold event', function() {
			widget._setNextPage.call(self, response, false);
			expect(self.fire.calledWith('clear-image-scroll-threshold')).to.equal(true);
		});

		it("doesn't throw an error if the next link is null", function() {
			next = null;
			widget._setNextPage.call(self, response, false);
		});
	});

	describe('_displaySearchResults', function() {
		var start,
			delimiter,
			end,
			localizeString,
			userSearchText;

		beforeEach(function() {
			start = 'asdf ';
			end = 'hjkl ';
			delimiter = '$$$DELIMITER???';
			localizeString = start + delimiter + end;
			self.localize.returns(localizeString);
			searchWidget.searchResults = {
				entities: [1, 2, 3]
			};
			userSearchText = 'SEARCH';
		});

		it('sets _noResultsTextStart to the first half of the langTerm', function() {
			widget._displaySearchResults.call(self, userSearchText);
			expect(self._noResultsTextStart).to.equal(start);
		});

		it('sets _noResultsTextMid to the search term', function() {
			widget._displaySearchResults.call(self, userSearchText);
			expect(self._noResultsTextMid).to.equal(userSearchText);
		});

		it('sets _noResultsTextEnd to the second half of the langTerm', function() {
			widget._displaySearchResults.call(self, userSearchText);
			expect(self._noResultsTextEnd).to.equal(end);
		});

		it('sets _searchImages to the result from the search widget', function() {
			widget._displaySearchResults.call(self, userSearchText);
			expect(self._searchImages).to.deep.equal(searchWidget.searchResults.entities);
		});

		it('sets _showGrid to true if there was search results', function() {
			widget._displaySearchResults.call(self, userSearchText);
			expect(self._showGrid).to.equal(true);
		});

		it('sets _showGrid to false if there was no search results', function() {
			searchWidget.searchResults = {
				entities: null
			};
			widget._displaySearchResults.call(self, userSearchText);
			expect(self._showGrid).to.equal(false);
		});
	});

	describe('search-results-changed', function() {
		var response,
			emptyResponse,
			href,
			searchHref;

		beforeEach(function() {
			href = 'asdfasdf?search=',
			searchHref = 'asdfasdf?search=TREE';

			emptyResponse = {
				detail: {
					getLinkByRel: sinon.stub().returns({
						href: href
					})
				}
			};

			response = {
				detail: {
					getLinkByRel: sinon.stub().returns({
						href: searchHref
					})
				}
			};
		});

		describe('empty search', function() {
			it('displays the default results', function() {
				widget._searchResultsChanged.call(self, emptyResponse);
				expect(self._displayDefaultResults.called).to.equal(true);
			});
		});

		describe('not empty search', function() {
			it('displays the results', function() {
				widget._searchResultsChanged.call(self, response);
				expect(self._displaySearchResults.calledWith('TREE')).to.equal(true);
				expect(self._displayDefaultResults.called).to.equal(false);
			});

			it('sets the next page', function() {
				widget._searchResultsChanged.call(self, response);
				expect(self._setNextPage.calledWith(response.detail)).to.equal(true);
				expect(self._displayDefaultResults.called).to.equal(false);
			});
		});
	});
});
