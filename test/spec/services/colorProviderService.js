'use strict';

describe('Service: colorProviderService', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var colorProviderService;
  beforeEach(inject(function (_colorProviderService_) {
    colorProviderService = _colorProviderService_;
  }));

  it('should do something', function () {
    expect(!!colorProviderService).toBe(true);
  });

});
