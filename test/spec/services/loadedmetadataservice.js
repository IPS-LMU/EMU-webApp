'use strict';

describe('Service: loadedMetaDataService', function () {

  // load the service's module
  beforeEach(module('emuWebAppApp'));

  // instantiate service
  var loadedMetaDataService;
  beforeEach(inject(function (_loadedMetaDataService_) {
    loadedMetaDataService = _loadedMetaDataService_;
  }));

  it('should do something', function () {
    expect(!!loadedMetaDataService).toBe(true);
  });

});
