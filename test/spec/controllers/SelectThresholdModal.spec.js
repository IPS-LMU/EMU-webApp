'use strict';

describe('Controller: SelectThresholdModalCtrl', function () {

  var SelectThresholdModalCtrl, scope;
  
  var array = {y: [1, 2, 3]};
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, dialogService, ArrayHelperService) {
       scope = $rootScope.$new();
       scope.dialog = dialogService;
       scope.array = ArrayHelperService;
       SelectThresholdModalCtrl = $controller('SelectThresholdModalCtrl', {
         $scope: scope,
         passedInOpts: array
       });     
     }));  
     
   it('should set passedInOpts', function () {
     expect(scope.passedInOpts).toBe(array);
   });   
   
   it('should select', function () {
     spyOn(scope.dialog, 'close');
     scope.select(1);
     expect(scope.dialog.close).toHaveBeenCalledWith(1);
   });    
});
