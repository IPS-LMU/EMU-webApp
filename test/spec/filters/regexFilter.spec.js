'use strict';

describe("Unit Testing: regex filters", function () {
  var filt;


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

  // load the module
  beforeEach(module('emulvcApp'));

  // load filter function into variable
  beforeEach(inject(function ($filter) {
    filt = $filter('regex');
  }));

  // test regex filter
  it('should filter dummyarray with regex: ', function () {
    expect(filt).not.toEqual(null);
    expect(filt(dummyList, '01').length).toEqual(3);
    expect(filt(dummyList, 'msajc003').length).toEqual(1);
    expect(filt(dummyList, 'asdf').length).toEqual(0);
  })
});