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
  }, {
    'name': 'Word',
    'type': 'ITEM'
  }, {
    'name': 'Foot',
    'type': 'ITEM'
  }, {
    'name': 'Intermediate',
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
  //it('should filter dummyarray with levelsFilter properly: ', function () {
  //  console.log("################################");
  //  console.log(filt(dummyList,''));
      // expect(filt(dummyList).length).toEqual(2);
    //   expect(filt(dummyList, '01').length).toEqual(3);
    //   expect(filt(dummyList, 'msajc003').length).toEqual(1);
    //   expect(filt(dummyList, 'asdf').length).toEqual(0);
  //});
});