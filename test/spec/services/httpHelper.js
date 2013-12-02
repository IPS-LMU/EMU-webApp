'use strict';

describe('Service: httpHelper', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var httpHelper;
  beforeEach(inject(function (_httpHelper_) {
    httpHelper = _httpHelper_;
  }));

  it('should do something', function () {
    expect(!!httpHelper).toBe(true);
  });

});
