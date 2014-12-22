'use strict';

describe('Service: appStateService', function () {

  beforeEach(module('emuwebApp'));
  
  var scope;
  var deferred;
  
  beforeEach(inject(function ($q, $rootScope, appStateService, Iohandlerservice, viewState) {
    scope = $rootScope.$new();
    scope.io = Iohandlerservice;
    scope.vs = viewState;
    scope.app = appStateService;
    deferred =  $q.defer();
  }));


   it('should resetToInitState (connected)', function () {
     spyOn(scope.io.wsH, 'disconnectWarning').and.returnValue(deferred.promise);
     spyOn(scope.io.wsH, 'isConnected').and.returnValue(true);
     spyOn(scope.io.wsH, 'closeConnect');
     scope.app.resetToInitState();
     deferred.resolve();
     scope.$apply();
     expect(scope.io.wsH.isConnected).toHaveBeenCalled();
     expect(scope.io.wsH.closeConnect).toHaveBeenCalled();
   });

});
