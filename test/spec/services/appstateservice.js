'use strict';

describe('Service: appStateService', function () {

  // load the service's module
  beforeEach(module('emuWebAppApp'));

  // instantiate service
  var appStateService;
  beforeEach(inject(function (_appStateService_) {
    appStateService = _appStateService_;
  }));

  it('should do something', function () {
    expect(!!appStateService).toBe(true);
  });

});
