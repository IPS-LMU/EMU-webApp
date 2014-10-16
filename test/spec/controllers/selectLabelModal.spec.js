'use strict';

describe('Controller: SelectLabelModalCtrl', function () {

  var SelectLabelModalCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, dialogService, ArrayHelperService) {
       scope = $rootScope.$new();
       scope.dialog = dialogService;
       scope.array = ArrayHelperService;
       SelectLabelModalCtrl = $controller('SelectLabelModalCtrl', {
         $scope: scope,
         passedInOpts: 'test'
       });     
     }));  
     
   it('should set passedInOpts', function () {
     expect(scope.passedInOpts).toBe('test');
   });  
   
   it('should select', function () {
     spyOn(scope.dialog, 'close');
     scope.select(1);
     expect(scope.dialog.close).toHaveBeenCalledWith(1);
   });    
});
