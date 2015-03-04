'use strict';

describe('Controller: TabbedCtrl', function () {

  var TabbedCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, ConfigProviderService, modalService, viewState, Validationservice) {
       // initiate the controller and mock the scope
       scope = $rootScope.$new();
       scope.valid = Validationservice;
       spyOn(scope.valid, 'getSchema').and.returnValue({ data: { properties: { spectrogramSettings: {properties: {}}, levelDefinitions: {items: { properties: {}}}, linkDefinitions: {items: { properties: {}}}}}});
       TabbedCtrl = $controller('TabbedCtrl', {
         $scope: scope
       });
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
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
   
   
   /*
   it('should addDefinition (level)', function () {
     var origLength = scope.cps.curDbConfig.levelDefinitions.length;
     scope.addDefinition('level');
     expect(scope.cps.curDbConfig.levelDefinitions.length).toEqual(origLength + 1);
   });  
   
   it('should addDefinition (levelattribute)', function () {
     scope.addDefinition('level');
     var key = 0;
     var origLength = scope.cps.curDbConfig.levelDefinitions[key].attributeDefinitions.length;
     scope.addDefinition('levelattribute', key);
     expect(scope.cps.curDbConfig.levelDefinitions[key].attributeDefinitions.length).toEqual(origLength + 1);
   });  
   
   it('should addDefinition (link)', function () {
     var origLength = scope.cps.curDbConfig.linkDefinitions.length;
     scope.addDefinition('link');
     expect(scope.cps.curDbConfig.linkDefinitions.length).toEqual(origLength + 1);
   });  
   
   it('should addDefinition (ssff)', function () {
     var origLength = scope.cps.curDbConfig.ssffTrackDefinitions.length;
     scope.addDefinition('ssff');
     expect(scope.cps.curDbConfig.ssffTrackDefinitions.length).toEqual(origLength + 1);
   });   
   
   it('should addDefinition (perspective)', function () {
     var origLength = scope.cps.vals.perspectives.length;
     scope.addDefinition('perspective');
     expect(scope.cps.vals.perspectives.length).toEqual(origLength + 1);
   });   
   
   it('should addDefinition (perspectiveAssign)', function () {
     scope.addDefinition('perspective');
     var key = 0;
     var origLength = scope.cps.vals.perspectives[key].signalCanvases.assign.length;
     scope.addDefinition('perspectiveAssign', key);
     expect(scope.cps.vals.perspectives[key].signalCanvases.assign.length).toEqual(origLength + 1);
   });   
   
   it('should addDefinition (perspectiveContourColor)', function () {
     var key = 1;
     var origLength = scope.cps.vals.perspectives[key].signalCanvases.contourColors.length;
     scope.addDefinition('perspectiveContourColor', key);
     expect(scope.cps.vals.perspectives[key].signalCanvases.contourColors.length).toEqual(origLength + 1);
   });   
   
   it('should addDefinition (perspectiveContourColorColor)', function () {
     var key = 1;
     var keyAttribute = 0;
     var origLength = scope.cps.vals.perspectives[key].signalCanvases.contourColors[keyAttribute].colors.length;
     scope.addDefinition('perspectiveContourColorColor', key, keyAttribute);
     expect(scope.cps.vals.perspectives[key].signalCanvases.contourColors[keyAttribute].colors.length).toEqual(origLength + 1);
   });  
   
   it('should addDefinition (perspectiveContourLims)', function () {
     scope.addDefinition('perspective');
     var key = 0;
     var origLength = scope.cps.vals.perspectives[key].signalCanvases.contourLims.length;
     scope.addDefinition('perspectiveContourLims', key);
     expect(scope.cps.vals.perspectives[key].signalCanvases.contourLims.length).toEqual(origLength + 1);
   });  
   
   it('should addDefinition (perspectiveOrderSignal)', function () {
     scope.addDefinition('perspective');
     var key = 0;
     var origLength = scope.cps.vals.perspectives[key].signalCanvases.order.length;
     scope.addDefinition('perspectiveOrderSignal', key);
     expect(scope.cps.vals.perspectives[key].signalCanvases.order.length).toEqual(origLength + 1);
   }); 
   
   it('should addDefinition (perspectiveOrderLevel)', function () {
     scope.addDefinition('perspective');
     var key = 0;
     var origLength = scope.cps.vals.perspectives[key].levelCanvases.order.length;
     scope.addDefinition('perspectiveOrderLevel', key);
     expect(scope.cps.vals.perspectives[key].levelCanvases.order.length).toEqual(origLength + 1);
   });
   
   it('should addDefinition (perspectiveOrderTwoDim)', function () {
     scope.addDefinition('perspective');
     var key = 0;
     var origLength = scope.cps.vals.perspectives[key].twoDimCanvases.order.length;
     scope.addDefinition('perspectiveOrderTwoDim', key);
     expect(scope.cps.vals.perspectives[key].twoDimCanvases.order.length).toEqual(origLength + 1);
   });   
   
   it('should deleteDefinition (level)', function () {
     scope.addDefinition('level');
     var origLength = scope.cps.curDbConfig.levelDefinitions.length;
     scope.deleteDefinition('level', 0);
     expect(scope.cps.curDbConfig.levelDefinitions.length).toEqual(origLength - 1);
   });   
   
   it('should deleteDefinition (levelattribute)', function () {
     var key = 0;
     scope.addDefinition('level');
     scope.addDefinition('levelattribute', key);
     var origLength = scope.cps.curDbConfig.levelDefinitions[key].attributeDefinitions.length;
     scope.deleteDefinition('levelattribute', key,  key);
     expect(scope.cps.curDbConfig.levelDefinitions[key].attributeDefinitions.length).toEqual(origLength - 1);
   });   
   
   it('should deleteDefinition (link)', function () {
     scope.addDefinition('link');
     var origLength = scope.cps.curDbConfig.linkDefinitions.length;
     scope.deleteDefinition('link', 0);
     expect(scope.cps.curDbConfig.linkDefinitions.length).toEqual(origLength - 1);
   });    

   it('should deleteDefinition (perspective)', function () {
     scope.addDefinition('perspective');
     var origLength = scope.cps.vals.perspectives.length;
     scope.deleteDefinition('perspective', 0);
     expect(scope.cps.vals.perspectives.length).toEqual(origLength - 1);
   });   
   // deleteDefinition all other : todo !
   */      
});
