'use strict';

describe('Service: Espsparserservice', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var Espsparserservice;
  beforeEach(inject(function (_Espsparserservice_) {
    Espsparserservice = _Espsparserservice_;
  }));

  it('should do something', function () {
    expect(!!Espsparserservice).toBe(true);
  });

});
