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
    ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases = aeDbConfig.EMUwebAppConfig.perspectives[0].levelCanvases;
    expect(filt(dummyList).length).toEqual(2);
  }));
});