'use strict';

describe('Service: Validationservice', function () {

  var scope;

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  beforeEach(inject(function($rootScope, Validationservice) {
    scope = $rootScope.$new();
    scope.valid = Validationservice;
    
  }));
      
  /**
   * TODO
   */
  it('should getSchema', inject(function () {
    
  }));

});