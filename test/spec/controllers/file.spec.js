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

});
