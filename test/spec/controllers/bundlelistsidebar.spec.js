'use strict';

describe('Controller: bundleListSideBarCtrl', function () {

  var $scope;

    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, viewState, loadedMetaDataService, dbObjLoadSaveService, ConfigProviderService, HistoryService) {
       $controller('bundleListSideBarCtrl', {
            $scope: $rootScope
        });
       $scope = $rootScope.$new();
       $scope.$index = 1;
       $scope.cps = ConfigProviderService;
       $scope.cps.setVals(defaultEmuwebappConfig);
       $scope.cps.curDbConfig = aeDbConfig;
       $scope.vs = viewState;
       $scope.lmds = loadedMetaDataService;
       $scope.dolss = dbObjLoadSaveService;
       $scope.history = HistoryService;
     }));

   it('should check if uttIsDisabled', function () {
       expect($scope.uttIsDisabled({name: 'test'})).toBe(true);
       $scope.lmds.setCurBndlName('test1');
       expect($scope.uttIsDisabled({name: 'test1'})).toBe(false);
   });  
   
   it('should check if isSessionDefined', function () {
       expect($scope.isSessionDefined('undefined')).toBe(false);
       expect($scope.isSessionDefined('test')).toBe(true);
   });  
     
   it('should get getBndlColor', function () {
       var res;
       expect($scope.getBndlColor({name: 'test'})).toBe(undefined);
       $scope.lmds.setCurBndlName('test1');
       res = $scope.getBndlColor({name: 'test1'});
       expect(res.color).toBe('black');
	   $scope.history.movesAwayFromLastSave = 1;
       res = $scope.getBndlColor({name: 'test1'});
       expect(res.color).toBe('white');
	   
   }); 

});
