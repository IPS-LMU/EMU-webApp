'use strict';

describe("Unit Testing: regex filters", function () {

  var filt;

  var dummyList = [{
    'name': 'Phonetic',
    'type': 'SEGMENT'
  }, {
    'name': 'Tone',
    'type': 'EVENT'
  }, {
    'name': 'Word',
    'type': 'SEGMENT'
  }, {
    'name': 'Syllable',
    'type': 'ITEM'
  }];

  // load the module
  beforeEach(module('emuwebApp'));

  // load filter function into variable
  beforeEach(inject(function ($filter) {
    filt = $filter('levelsFilter');
  }));

  it('should have a levelsFilter filter: ', function () {
    expect(filt).not.toEqual(null);
  })

  // test regex filter
  it('should filter dummyarray with levelsFilter properly: ', inject(function (ConfigProviderService, viewState) {
    ConfigProviderService.setVals(defaultEmuwebappConfig);
    viewState.curPerspectiveIdx = 0;    
    ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order.push(dummyList[0].name);
    ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order.push(dummyList[1].name);
    ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order.push(dummyList[2].name);
    ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order.push(dummyList[3].name);
    expect(filt(dummyList).length).toEqual(3);
  }));
});