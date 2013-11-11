'use strict';

describe('Service: SsffDataService', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var SsffDataService;
  beforeEach(inject(function (_SsffDataService_) {
    SsffDataService = _SsffDataService_;
  }));

  it('should do something', function () {
    expect(!!SsffDataService).toBe(true);
  });

});
