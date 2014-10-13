'use strict';

describe('Controller: WsconnectionCtrl', function () {

  var WsconnectionCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, ConfigProviderService, dialogService, viewState) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.dialog = dialogService;
       scope.vs = viewState;
       WsconnectionCtrl = $controller('WsconnectionCtrl', {
         $scope: scope
       });     
     }));  
     
   it('should set serverInfos.Url', function () {
     expect(scope.serverInfos.Url).toEqual(scope.cps.vals.main.serverUrl);
   });

   it('should cancel dialog', function () {
     spyOn(scope.dialog, 'close');
     scope.cancel();
     expect(scope.dialog.close).toHaveBeenCalledWith(false);
   });  

   it('should tryConnection', function () {
     spyOn(scope.dialog, 'close');
     scope.tryConnection();
     expect(scope.dialog.close).toHaveBeenCalledWith(scope.cps.vals.main.serverUrl);
   });  

   it('should set cursorOutOfTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorOutOfTextField();
     expect(scope.vs.setEditing).toHaveBeenCalledWith(false);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(false);
   });  

   it('should set cursorInTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorInTextField();
     expect(scope.vs.setEditing).toHaveBeenCalledWith(true);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(true);
   });   
});
