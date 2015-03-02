'use strict';

describe('Filter: startFromFilter', function () {

  // load the filter's module
  beforeEach(module('emuWebAppApp'));

  // initialize a new instance of the filter before each test
  var startFromFilter;
  beforeEach(inject(function ($filter) {
    startFromFilter = $filter('startFromFilter');
  }));

  it('should return the input prefixed with "startFromFilter filter:"', function () {
    var text = 'angularjs';
    expect(startFromFilter(text)).toBe('startFromFilter filter: ' + text);
  });

});
