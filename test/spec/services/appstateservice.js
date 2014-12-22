'use strict';

describe('Service: appStateService', function () {

  beforeEach(module('emuwebApp'));
  
  var scope;
  
  beforeEach(inject(function ($rootScope, Iohandlerservice, viewState) {
    scope = $rootScope.$new();
    scope.io = Iohandlerservice;
    scope.vs = viewState;
  }));


   it('should resetToInitState (connected)', function (appStateService) {
     spyOn(scope.io.wsH, 'disconnectWarning').and.returnValue(deferred.promise);
     spyOn(scope.io.wsH, 'isConnected').and.returnValue(true);
     spyOn(scope.io.wsH, 'closeConnect');
     appStateService.resetToInitState();
     deferred.resolve();
     scope.$apply();
     expect(scope.io.wsH.isConnected).toHaveBeenCalled();
     expect(scope.io.wsH.closeConnect).toHaveBeenCalled();
   });

});
