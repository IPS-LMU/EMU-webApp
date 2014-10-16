'use strict';

describe('Controller: ConfirmmodalCtrl', function () {

  var ConfirmmodalCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, ConfigProviderService, dialogService) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.dialog = dialogService;
       ConfirmmodalCtrl = $controller('ConfirmmodalCtrl', {
         $scope: scope,
         passedInTxt: 'test'
       });     
     }));  
     
   it('should set correct passedInTxt', function () {
     expect(scope.passedInTxt).toBe('test');
   });    

   it('should confirm', function () {
     spyOn(scope.dialog, 'close');
     scope.confirm();
     expect(scope.dialog.close).toHaveBeenCalledWith(true);
   });   

   it('should cancel', function () {
     spyOn(scope.dialog, 'close');
     scope.cancel();
     expect(scope.dialog.close).toHaveBeenCalledWith(false);
   });    
         
});
