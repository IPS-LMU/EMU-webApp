'use strict';

describe('Filter: startFromFilter', function () {

  var dummyList = [{
    'name': 'msajc003'
  }, {
    'name': 'msajc010'
  }, {
    'name': 'msajc012'
  }, {
    'name': 'msajc015'
  }, {
    'name': 'msajc022'
  }, {
    'name': 'msajc023'
  }, {
    'name': 'msajc057'
  }];

  // load the filter's module
  beforeEach(module('emuwebApp'));

  // initialize a new instance of the filter before each test
  var startFromFilter;
  beforeEach(inject(function ($filter) {
    startFromFilter = $filter('startFrom');
  }));

  describe('startFromFilter', function () {
    it('should have a startFromFilter filter: ', function () {
      expect(startFromFilter).not.toEqual(null);
    })
  });

  it('should return the truncated dummyList', function () {
    expect(startFromFilter(dummyList, 2).length).toEqual(5);
    expect(startFromFilter(dummyList, 3).length).toEqual(4);
    expect(startFromFilter(dummyList, 4).length).toEqual(3);
    expect(startFromFilter(dummyList, 5).length).toEqual(2);
    expect(startFromFilter(dummyList, 6).length).toEqual(1);
  });

});
