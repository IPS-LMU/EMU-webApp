'use strict';

describe('Service: TierDataService', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var TierDataService;
  beforeEach(inject(function (_TierDataService_) {
    TierDataService = _TierDataService_;
  }));

  it('should do something', function () {
    expect(!!TierDataService).toBe(true);
  });

});
