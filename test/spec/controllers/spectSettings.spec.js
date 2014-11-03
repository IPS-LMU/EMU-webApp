'use strict';

describe('Controller: spectSettingsCtrl', function () {

  var spectSettingsCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, DataService, ConfigProviderService, dialogService, viewState, LevelService) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.dialog = dialogService;
       scope.vs = viewState;
       scope.lvl = LevelService;
       scope.data = DataService;
       spectSettingsCtrl = $controller('spectSettingsCtrl', {
         $scope: scope
       });
       scope.modalVals = {
			'rangeFrom': 2,
			'rangeTo': 4,
			'dynamicRange': 2,
			'windowLength': 4,
			'window': 5,
			'drawHeatMapColors': 6,
			'preEmphasisFilterFactor': 7,
			'heatMapColorAnchors': [['0','0','0'],['1','2','3']]
		};             
     }));  
     
   it('should saveSpectroSettings correctly', function () {
     scope.data.data.sampleRate = 1000;
     spyOn(scope.dialog, 'close');
     spyOn(scope.dialog, 'open');
     spyOn(scope.vs, 'setspectroSettings');
     scope.saveSpectroSettings();
     expect(scope.vs.setspectroSettings).toHaveBeenCalledWith(scope.modalVals.windowLength, scope.modalVals.rangeFrom, scope.modalVals.rangeTo, scope.modalVals.dynamicRange, scope.selWindowInfo.name, scope.modalVals.drawHeatMapColors, scope.modalVals.preEmphasisFilterFactor, scope.modalVals.heatMapColorAnchors);
   });    
     
   it('should saveSpectroSettings correctly (dynamicRange error)', function () {
     scope.modalVals.dynamicRange = 'string';
     scope.data.data.sampleRate = 1000;
     spyOn(scope.dialog, 'close');
     spyOn(scope.dialog, 'open');     
     spyOn(scope, 'error');
     scope.saveSpectroSettings();
     expect(scope.error).toHaveBeenCalledWith('Dynamic Range has to be an Integer value.');
   });    
     
   it('should saveSpectroSettings correctly (dynamicRange error)', function () {
     scope.modalVals.rangeFrom = 'string';
     scope.data.data.sampleRate = 1000;
     spyOn(scope.dialog, 'close');
     spyOn(scope.dialog, 'open');     
     spyOn(scope, 'error');
     scope.saveSpectroSettings();
     expect(scope.error).toHaveBeenCalledWith('View Range (Hz) lower boundary has to be an Integer value.');
   });    
     
   it('should saveSpectroSettings correctly (dynamicRange error)', function () {
     scope.modalVals.rangeTo = 'string';
     scope.data.data.sampleRate = 1000;
     spyOn(scope.dialog, 'close');
     spyOn(scope.dialog, 'open');     
     spyOn(scope, 'error');
     scope.saveSpectroSettings();
     expect(scope.error).toHaveBeenCalledWith('View Range (Hz) upper boundary has to be an Integer value.');
   });  
     
   it('should saveSpectroSettings correctly (dynamicRange error)', function () {
     scope.modalVals.rangeFrom = -100;
     scope.data.data.sampleRate = 1000;
     spyOn(scope.dialog, 'close');
     spyOn(scope.dialog, 'open');     
     spyOn(scope, 'error');
     scope.saveSpectroSettings();
     expect(scope.error).toHaveBeenCalledWith('View Range (Hz) lower boundary is a value below zero');
   });    
     
   it('should saveSpectroSettings correctly (dynamicRange error)', function () {
     scope.modalVals.rangeTo = 2000;
     scope.data.data.sampleRate = 1000;
     spyOn(scope.dialog, 'close');
     spyOn(scope.dialog, 'open');     
     spyOn(scope, 'error');
     scope.saveSpectroSettings();
     expect(scope.error).toHaveBeenCalledWith('View Range (Hz) upper boundary is a value bigger than ' + scope.data.data.sampleRate / 2);
   });    
          
     
   it('should getColorOfAnchor', function () {
     var curStyle0 = {
		'background-color': 'rgb(0,0,0)',
		'width': '10px',
		'height': '10px'
	 };
     var ret = scope.getColorOfAnchor(0);
     expect(ret).toEqual(curStyle0);	 
     var curStyle1 = {
		'background-color': 'rgb(1,2,3)',
		'width': '10px',
		'height': '10px'
	 };
     var ret = scope.getColorOfAnchor(1);
     expect(ret).toEqual(curStyle1);
   });    
     
   it('should show error', function () {
     spyOn(scope.dialog, 'close');
     spyOn(scope.dialog, 'open');
     scope.error('msg');
     expect(scope.dialog.close).toHaveBeenCalled();
     expect(scope.dialog.open).toHaveBeenCalledWith('views/error.html', 'ModalCtrl', 'Sorry: msg');
   });       

   it('should cancel dialog', function () {
     spyOn(scope.dialog, 'close');
     scope.cancel();
     expect(scope.dialog.close).toHaveBeenCalledWith(false);
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
