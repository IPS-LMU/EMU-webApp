'use strict';

describe('Service: ioHandlerService', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var ioHandlerService;
  beforeEach(inject(function (_ioHandlerService_) {
    ioHandlerService = _ioHandlerService_;
  }));

  it('should do something', function () {
    expect(!!ioHandlerService).toBe(true);
  });

});
