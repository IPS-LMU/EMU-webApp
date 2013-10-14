'use strict';

describe('Service: ssffparserservice', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var ssffparserservice;
  beforeEach(inject(function (_ssffparserservice_) {
    ssffparserservice = _ssffparserservice_;
  }));

  it('should do something', function () {
    expect(!!ssffparserservice).toBe(true);
  });

});
