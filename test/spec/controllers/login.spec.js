'use strict';

describe('Controller: LoginCtrl', function () {

  var LoginCtrl, scope, deferred1, deferred2;
  
  var errorStr = 'ERR1';
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, $q, ConfigProviderService, dialogService, viewState, Iohandlerservice) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.dialog = dialogService;
       scope.vs = viewState;
       scope.io = Iohandlerservice;
       deferred1 = $q.defer();
       deferred1.resolve('LOGGEDON'); 
       deferred2 = $q.defer();
       deferred2.resolve(errorStr);                   
       LoginCtrl = $controller('LoginCtrl', {
         $scope: scope
       });     
     }));  
     
   it('should set correct loginData', function () {
     expect(scope.loginData.username).toBe('');
     expect(scope.loginData.password).toBe('');
     expect(scope.loginData.errorMsg).toBe('');
   });   
     
   it('should tryLogin successfully', function () {
     spyOn(scope.dialog, 'close');
     spyOn(scope.io, 'logOnUser').and.returnValue(deferred1.promise);
     scope.tryLogin();
     expect(scope.io.logOnUser).toHaveBeenCalledWith('','');
     deferred1.resolve();
     scope.$digest();     
     expect(scope.dialog.close).toHaveBeenCalledWith(true);
   });      
     
     
   it('should tryLogin not successfully', function () {
     spyOn(scope.dialog, 'close');
     spyOn(scope.io, 'logOnUser').and.returnValue(deferred2.promise);
     scope.tryLogin();
     expect(scope.io.logOnUser).toHaveBeenCalledWith('','');
     deferred2.resolve();
     scope.$digest();     
     expect(scope.loginData.errorMsg).toBe('ERROR: '+errorStr);
   });      
   
   it('should cancel', function () {
     spyOn(scope.dialog, 'close');
     scope.cancel();
     expect(scope.dialog.close).toHaveBeenCalledWith(false);
   });     

   it('should cursorInTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorInTextField();
     expect(scope.vs.setEditing).toHaveBeenCalledWith(true);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(true);
   }); 

   it('should cursorOutOfTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorOutOfTextField();
     expect(scope.vs.setEditing).toHaveBeenCalledWith(false);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(false);
   }); 
       
});
