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
       $scope.cps.curDbConfig = aeDbConfig;
       FileCtrl = $controller('FileCtrl', {
         $scope: $scope
       }); 
     }));  
     
   it('should handleLocalFiles', inject(function ($q, Iohandlerservice) {
     var deferred = $q.defer();
     spyOn(Iohandlerservice, 'httpGetPath').and.returnValue(deferred.promise);
     deferred.resolve({data: defaultEmuwebappConfig});
     var sessionDefault = 0;
     var bundles = [{
         mediaFile: {
             data: []
         },
         annotation: {}
     }]
     $scope.handleLocalFiles(bundles, sessionDefault);
     expect(Iohandlerservice.httpGetPath).toHaveBeenCalled();
     
   })); 

});
