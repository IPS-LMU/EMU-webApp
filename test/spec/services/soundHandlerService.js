'use strict';

describe('Service: soundHandlerService', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var soundHandlerService;
  beforeEach(inject(function (_soundHandlerService_) {
    soundHandlerService = _soundHandlerService_;
  }));

  it('should do something', function () {
    expect(!!soundHandlerService).toBe(true);
  });

});
