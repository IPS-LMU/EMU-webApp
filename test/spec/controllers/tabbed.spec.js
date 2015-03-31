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
     expect(scope.currentTabUrl).toEqual('test');
   });  

   it('should check if isActiveTab', function () {
     scope.currentTabUrl = 'test';
     expect(scope.isActiveTab('test')).toEqual({ 'background-color' : '#FFF', color : '#000' });
     expect(scope.isActiveTab('nothing')).toEqual({ 'background-color' : '#0DC5FF', color : '#FFF' });
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
   
   it('should deleteDefinition', function () {
     // level
     var x = scope.cps.curDbConfig.levelDefinitions.length;
     scope.deleteDefinition('level', 0, 0, 0);
     expect(scope.cps.curDbConfig.levelDefinitions.length).toBe(x-1);

     // levelattribute
     x = scope.cps.curDbConfig.levelDefinitions[1].attributeDefinitions.length;
     scope.deleteDefinition('levelattribute', 1, 0, 0);
     expect(scope.cps.curDbConfig.levelDefinitions[1].attributeDefinitions.length).toBe(x-1);

     // link
     x = scope.cps.curDbConfig.linkDefinitions.length;
     scope.deleteDefinition('link', 0, 0, 0);
     expect(scope.cps.curDbConfig.linkDefinitions.length).toBe(x-1);
     
     // ssff
     x = scope.cps.curDbConfig.ssffTrackDefinitions.length;
     scope.deleteDefinition('ssff', 0, 0, 0);
     expect(scope.cps.curDbConfig.ssffTrackDefinitions.length).toBe(x-1);     

     // perspective
     x = scope.cps.vals.perspectives.length;
     scope.deleteDefinition('perspective', 0, 0, 0);
     expect(scope.cps.vals.perspectives.length).toBe(x-1);     

     // push some value into perspectives
     scope.cps.vals.perspectives.push({ signalCanvases: {assign: [1], contourColors: [],contourLims: [1],order: [1]}, levelCanvases: {order: [1]}, twoDimCanvases: {order: [1]}});
     
     // perspectiveAssign
     x = scope.cps.vals.perspectives[0].signalCanvases.assign.length;
     scope.deleteDefinition('perspectiveAssign', 0, 0, 0);
     expect(scope.cps.vals.perspectives[0].signalCanvases.assign.length).toBe(x-1);      

     // perspectiveContourColor
     x = scope.cps.vals.perspectives[0].signalCanvases.contourColors.length;
     scope.deleteDefinition('perspectiveContourColor', 0, 0, 0);
     expect(scope.cps.vals.perspectives[0].signalCanvases.contourColors.length).toBe(0);      

     // perspectiveContourColorColor
     var color = ['#f00', '#0f0', '#00f'];
     scope.cps.vals.perspectives[0].signalCanvases.contourColors.push({colors: color});
     x = scope.cps.vals.perspectives[0].signalCanvases.contourColors[0].colors.length;
     scope.deleteDefinition('perspectiveContourColorColor', 0, 0, 0);
     expect(scope.cps.vals.perspectives[0].signalCanvases.contourColors[0].colors.length).toBe(x-1);      

     // perspectiveContourLims
     x = scope.cps.vals.perspectives[0].signalCanvases.contourLims.length;
     scope.deleteDefinition('perspectiveContourLims', 0, 0, 0);
     expect(scope.cps.vals.perspectives[0].signalCanvases.contourLims.length).toBe(0);      

     // perspectiveOrderSignal
     x = scope.cps.vals.perspectives[0].signalCanvases.order.length;
     scope.deleteDefinition('perspectiveOrderSignal', 0, 0, 0);
     expect(scope.cps.vals.perspectives[0].signalCanvases.order.length).toBe(0);      

     // perspectiveOrderLevel
     x = scope.cps.vals.perspectives[0].levelCanvases.order.length;
     scope.deleteDefinition('perspectiveOrderLevel', 0, 0, 0);
     expect(scope.cps.vals.perspectives[0].levelCanvases.order.length).toBe(0);  

     // perspectiveOrderTwoDim
     x = scope.cps.vals.perspectives[0].twoDimCanvases.order.length;
     scope.deleteDefinition('perspectiveOrderTwoDim', 0, 0, 0);
     expect(scope.cps.vals.perspectives[0].twoDimCanvases.order.length).toBe(0);          
   });
});
