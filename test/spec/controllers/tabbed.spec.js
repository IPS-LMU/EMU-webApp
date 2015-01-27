'use strict';

describe('Controller: TabbedCtrl', function () {

  var TabbedCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, ConfigProviderService, modalService, viewState) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.modal = modalService;
       scope.vs = viewState;
       TabbedCtrl = $controller('TabbedCtrl', {
         $scope: scope
       });     
     }));  
     
   /*it('should getBlob', function () {
     expect(scope.getBlob().toString()).toBe('[object Blob]');
   }); */ 

});
