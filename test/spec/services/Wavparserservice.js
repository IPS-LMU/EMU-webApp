'use strict';

describe('Service: Wavparserservice', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var Wavparserservice;
  beforeEach(inject(function (_Wavparserservice_) {
    Wavparserservice = _Wavparserservice_;
  }));

  it('should do something', function () {
    expect(!!Wavparserservice).toBe(true);
  });

});
