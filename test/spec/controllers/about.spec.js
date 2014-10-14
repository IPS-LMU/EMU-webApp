'use strict';

describe('Controller: AboutCtrl', function () {

  var AboutCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, ConfigProviderService, dialogService) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.dialog = dialogService;
       AboutCtrl = $controller('AboutCtrl', {
         $scope: scope
       });     
     }));  
     
   it('should cancel', function () {
     spyOn(scope.dialog, 'close');
     scope.cancel();
     expect(scope.dialog.close).toHaveBeenCalled();
   });    
     
   it('should getStrRep', function () {
     expect(scope.getStrRep("\b".charCodeAt(0))).toEqual('BACKSPACE');
     expect(scope.getStrRep("\t".charCodeAt(0))).toEqual('TAB');
     expect(scope.getStrRep("\r\n".charCodeAt(0))).toEqual('ENTER');
     expect(scope.getStrRep(16)).toEqual('SHIFT');
     expect(scope.getStrRep(18)).toEqual('ALT');
     expect(scope.getStrRep(" ".charCodeAt(0))).toEqual('SPACE');
     expect(scope.getStrRep(37)).toEqual('←');
     expect(scope.getStrRep(39)).toEqual('→');
     expect(scope.getStrRep(38)).toEqual('↑');
     expect(scope.getStrRep(40)).toEqual('↓');
     expect(scope.getStrRep(42)).toEqual('+');
     expect(scope.getStrRep("+".charCodeAt(0))).toEqual('+');
     expect(scope.getStrRep(95)).toEqual('-');
     expect(scope.getStrRep("-".charCodeAt(0))).toEqual('-');
     expect(scope.getStrRep("a".charCodeAt(0))).toEqual('a');
     expect(scope.getStrRep("b".charCodeAt(0))).toEqual('b');
     expect(scope.getStrRep("c".charCodeAt(0))).toEqual('c');
     expect(scope.getStrRep("A".charCodeAt(0))).toEqual('A');
     expect(scope.getStrRep("B".charCodeAt(0))).toEqual('B');
     expect(scope.getStrRep("C".charCodeAt(0))).toEqual('C');
   });     
});
