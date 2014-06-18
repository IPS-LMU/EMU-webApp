'use strict';

describe('Service: validationService', function () {

  // load the service's module
  beforeEach(module('emuwebApp'));



 it('should have a defined Validationservice service', inject(['Validationservice',
    function(Validationservice) {
      expect(Validationservice).toBeDefined();
    }])
  );

});
