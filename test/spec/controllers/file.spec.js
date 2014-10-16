'use strict';

describe('Controller: FileCtrl', function () {

  var FileCtrl, $scope;
  var emptyArr = [];
  var emptyObj = {};
  
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, viewState, Binarydatamaniphelper, Textgridparserservice, ConfigProviderService, Validationservice) {
       $controller('MainCtrl', {
            $scope: $rootScope,
            viewState: viewState
        });
       $scope = $rootScope.$new();
       $scope.$index = 1;
       $scope.cps = ConfigProviderService;
       $scope.cps.setVals(defaultEmuwebappConfig);
       $scope.cps.curDbConfig = aeDbConfig;
       FileCtrl = $controller('FileCtrl', {
         $scope: $scope
       });     
     }));  
     
   it('should resetToInitState', function () {
     $scope.resetToInitState();
     expect($scope.newfiles).toEqual(emptyArr);
     expect($scope.wav).toEqual(emptyObj);
     expect($scope.grid).toEqual(emptyObj);
     expect($scope.curBndl).toEqual(emptyObj);
     expect($scope.dropText).toEqual($scope.dropDefault);
   }); 
   
   it('should react to $broadcast resetToInitState', inject(function($rootScope) {
     spyOn($scope, 'resetToInitState');
     $rootScope.$broadcast('resetToInitState');
     expect($scope.resetToInitState).toHaveBeenCalled();
   })); 
   
   /*it('should handleLocalFiles', function () { TODO
     $scope.handleLocalFiles();
     expect($scope.$parent.vs.showDropZone).toBe(false);
     expect($scope.$parent.cps.vals.main.comMode).toBe('FileAPI');
   });    */

});
