'use strict';

describe('Service: validationService', function () {

  // load the service's module
  beforeEach(module('EMUWebAppApp'));

  // instantiate service
  var validationService;
  beforeEach(inject(function (_validationService_) {
    validationService = _validationService_;
  }));

  it('should do something', function () {
    expect(!!validationService).toBe(true);
  });

});
