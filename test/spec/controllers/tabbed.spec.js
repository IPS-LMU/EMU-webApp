'use strict';

describe('Controller: TabbedCtrl', function () {

  var TabbedCtrl, scope, deferred, deferred2;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($q, $controller, $rootScope, ConfigProviderService, modalService, viewState, Validationservice, Websockethandler) {
       // initiate the controller and mock the scope
       var tmpEmuwebappConfig = angular.copy(defaultEmuwebappConfig);
       var tmpaeDbConfig = angular.copy(aeDbConfig);
       scope = $rootScope.$new();
       scope.valid = Validationservice;
       spyOn(scope.valid, 'getSchema').and.returnValue({ data: { properties: { spectrogramSettings: {properties: {}}, levelDefinitions: {items: { properties: {}}}, linkDefinitions: {items: { properties: {}}}}}});
       TabbedCtrl = $controller('TabbedCtrl', {
         $scope: scope
       });
       scope.cps = ConfigProviderService;
       scope.cps.setVals(tmpEmuwebappConfig);
       scope.cps.curDbConfig = tmpaeDbConfig;
       scope.modal = modalService;
       scope.vs = viewState;
       deferred = $q.defer();
       deferred2 = $q.defer();
     }));  
     
   it('should set cursorInTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorInTextField();	
     expect(scope.vs.setEditing).toHaveBeenCalledWith(true);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(true);
   });  

   it('should set cursorOutOfTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorOutOfTextField();	
     expect(scope.vs.setEditing).toHaveBeenCalledWith(false);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(false);
   });  

   it('should set onClickTab', function () {
     scope.onClickTab({url: 'test'});	
     expect(scope.currentTab).toEqual('test');
   });  

   it('should check if isActiveTab', function () {
     scope.currentTab = 'test';
     expect(scope.isActiveTab('test')).toEqual({
		'background-color': '#FFF',
		'color': '#000'
	 });
     expect(scope.isActiveTab('nothing')).toEqual({});
   }); 

   it('should showResponse', function () {
     scope.showResponse(0, 'test');	
     expect(scope.response[0].show).toBe(true);
     expect(scope.response[0].text).toEqual('test');
   });  
   
   it('should hideResponse', function () {
     scope.showResponse(0, 'test');
     scope.hideResponse(0);	
     expect(scope.response[0].show).toBe(false);
   });  
   
   it('should saveDefinition / level', inject(function (Websockethandler) {
     spyOn(Websockethandler, 'getDoEditDBConfig').and.returnValue(deferred.promise);
     spyOn(Websockethandler, 'editDBConfig').and.returnValue(deferred2.promise);
     scope.addDefinition('level');
     var key = scope.cps.curDbConfig.levelDefinitions.length - 1;
     scope.cps.curDbConfig.levelDefinitions[key].name = 'test';
     scope.cps.curDbConfig.levelDefinitions[key].type = 'SEGMENT';
     scope.saveDefinition('level', key, 'ADDLEVELDEFINITION', scope.cps.curDbConfig.levelDefinitions[key]);	
     deferred.resolve('YES');
     scope.$digest();
     deferred2.resolve('YES');
     scope.$digest();
     expect(scope.cps.curDbConfig.levelDefinitions[key].added).toBe(undefined);
     expect(Websockethandler.getDoEditDBConfig).toHaveBeenCalled();
   }));  
   /*
   it('should saveDefinition / link', inject(function (Websockethandler) {
     spyOn(Websockethandler, 'getDoEditDBConfig').and.returnValue(deferred.promise);
     spyOn(Websockethandler, 'editDBConfig').and.returnValue(deferred2.promise);
     scope.addDefinition('link');
     var key = scope.cps.curDbConfig.linkDefinitions.length - 1;
     scope.cps.curDbConfig.linkDefinitions[key].superlevelName = 'test1';
     scope.cps.curDbConfig.linkDefinitions[key].sublevelName = 'test2';
     scope.cps.curDbConfig.linkDefinitions[key].type = 'ONE_TO_MANY';
     scope.saveDefinition('link', key, 'ADDLINKDEFINITION', scope.cps.curDbConfig.linkDefinitions[key]);	
     deferred.resolve('YES');
     scope.$digest();
     deferred2.resolve('YES');
     scope.$digest();
     expect(scope.cps.curDbConfig.linkDefinitions[key].added).toBe(undefined);
     expect(Websockethandler.getDoEditDBConfig).toHaveBeenCalled();
   }));   
   
   it('should saveDefinition / ssff', inject(function (Websockethandler) {
     spyOn(Websockethandler, 'getDoEditDBConfig').and.returnValue(deferred.promise);
     spyOn(Websockethandler, 'editDBConfig').and.returnValue(deferred2.promise);
     scope.addDefinition('ssff');
     var key = scope.cps.curDbConfig.ssffTrackDefinitions.length - 1;
     scope.cps.curDbConfig.ssffTrackDefinitions[key].name = 'test1';
     scope.cps.curDbConfig.ssffTrackDefinitions[key].columnName = 'test2';
     scope.cps.curDbConfig.ssffTrackDefinitions[key].fileExtension = 'test2';
     scope.saveDefinition('ssff', key, 'ADDSSFFDEFINITION', scope.cps.curDbConfig.ssffTrackDefinitions[key]);	
     deferred.resolve('YES');
     scope.$digest();
     deferred2.resolve('YES');
     scope.$digest();
     expect(scope.cps.curDbConfig.ssffTrackDefinitions[key].added).toBe(undefined);
     expect(Websockethandler.getDoEditDBConfig).toHaveBeenCalled();
   }));   */  
});
