'use strict';

describe('Controller: TabbedCtrl', function () {

  var TabbedCtrl, scope, deferred, deferred2;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, ConfigProviderService, modalService, viewState, Validationservice, Websockethandler) {
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

   it('should return classDefinition', function () {
     expect(scope.classDefinition('level',0)).toEqual('emuwebapp-roundedBorderFrame');
     expect(scope.classDefinition('ssff',0)).toEqual('emuwebapp-roundedBorderFrame');
     expect(scope.classDefinition('link',0)).toEqual('emuwebapp-roundedBorderFrame');
     scope.cps.curDbConfig.levelDefinitions[0].added = true;
     scope.cps.curDbConfig.ssffTrackDefinitions[0].added = true;
     scope.cps.curDbConfig.linkDefinitions[0].added = true;
     expect(scope.classDefinition('level',0)).toEqual('emuwebapp-roundedBorderFrame-new');
     expect(scope.classDefinition('ssff',0)).toEqual('emuwebapp-roundedBorderFrame-new');
     expect(scope.classDefinition('link',0)).toEqual('emuwebapp-roundedBorderFrame-new');     
     delete scope.cps.curDbConfig.levelDefinitions[0].added;
     delete scope.cps.curDbConfig.ssffTrackDefinitions[0].added;
     delete scope.cps.curDbConfig.linkDefinitions[0].added;
   });  

   it('should return classBorderDefinition', function () {
     expect(scope.classBorderDefinition('level',0)).toEqual('emuwebapp-borderTitle');
     expect(scope.classBorderDefinition('ssff',0)).toEqual('emuwebapp-borderTitle');
     expect(scope.classBorderDefinition('link',0)).toEqual('emuwebapp-borderTitle');
     scope.cps.curDbConfig.levelDefinitions[0].added = true;
     scope.cps.curDbConfig.ssffTrackDefinitions[0].added = true;
     scope.cps.curDbConfig.linkDefinitions[0].added = true;
     expect(scope.classBorderDefinition('level',0)).toEqual('emuwebapp-borderTitle-new');
     expect(scope.classBorderDefinition('ssff',0)).toEqual('emuwebapp-borderTitle-new');
     expect(scope.classBorderDefinition('link',0)).toEqual('emuwebapp-borderTitle-new'); 
     delete scope.cps.curDbConfig.levelDefinitions[0].added;
     delete scope.cps.curDbConfig.ssffTrackDefinitions[0].added;
     delete scope.cps.curDbConfig.linkDefinitions[0].added;         
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
});
