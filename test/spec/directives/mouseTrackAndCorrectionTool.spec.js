'use strict';

describe('Directive: mouseTrackAndCorrectionTool', function () {

  // load the directive's module
  beforeEach(module('emuwebApp'));

  var elm, scope;

   beforeEach(inject(function ($rootScope, Ssffdataservice, ConfigProviderService) {
     scope = $rootScope.$new();
     scope.ssff = Ssffdataservice;
     scope.ssff.data = [1, 2, 3];
     spyOn(ConfigProviderService, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
   }));

   function compile(track) {
     var tpl = '<canvas bundle-name="test" ssff-trackname="'+track+'" mouse-track-and-correction-tool width="10" height="10"></canvas>';
     inject(function ($compile) {
        elm = $compile(tpl)(scope);
     });
     scope.$digest();
   }

   it('should react to mousedown', inject(function ($compile, viewState) {
     compile('test');
     spyOn(viewState, 'select');
     spyOn(viewState, 'getSamplesPerPixelVal').and.returnValue(5);
     spyOn(viewState, 'getX').and.returnValue(5);
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mousedown');
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
   }));

/*
   it('should react to mouseup', inject(function ($compile) {
     compile('test');
     spyOn(elm.isolateScope(), 'setSelectDrag');
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mouseup');
     $(elm).trigger(e);
     expect(elm.isolateScope().setSelectDrag).toHaveBeenCalled();
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
   }));
  */

   it('should react to mouseleave', inject(function ($compile, Soundhandlerservice, viewState) {
     compile('test');
     spyOn(viewState, 'getPermission').and.returnValue(true);
     Soundhandlerservice.audioBuffer.length = 3;
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mouseleave');
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
     expect(viewState.getPermission).toHaveBeenCalledWith('labelAction');
   }));

   it('should react to mousemove (button 1)', inject(function ($compile, Soundhandlerservice, viewState) {
     compile('test');
     spyOn(elm.isolateScope(), 'setSelectDrag');
     spyOn(viewState, 'getX').and.returnValue(500);
     var e = jQuery.Event('mousemove');
     e.buttons = 1;
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().setSelectDrag).toHaveBeenCalled();
   }));

   it('should react to mousemove (button 0) -> early return', inject(function ($compile, Ssffdataservice, ConfigProviderService, Soundhandlerservice, viewState) {
     compile('test');
     viewState.curPreselColumnSample = 0;
     viewState.curCorrectionToolNr = 1;
     spyOn(viewState, 'getPermission').and.returnValue(true);
     spyOn(viewState, 'getX').and.returnValue(1);
     spyOn(viewState, 'getViewPortStartTime').and.returnValue(1);
     spyOn(viewState, 'getViewPortEndTime').and.returnValue(-3);
     spyOn(ConfigProviderService, 'getAssignment').and.returnValue({ data: [1, 2]});
     spyOn(Ssffdataservice, 'getColumnOfTrack').and.returnValue({ values: [[1, 2, 3], [1, 2, 3], [1, 2, 3]] });
     spyOn(Ssffdataservice, 'getSampleRateAndStartTimeOfTrack').and.returnValue({ sampleRate: 1, startTime: 0 });
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mousemove');
     e.buttons = 0;
     e.originalEvent = {};
     e.originalEvent.target = {};
     e.originalEvent.target.width = 1000;
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
     expect(viewState.getPermission).toHaveBeenCalledWith('labelAction');
   }));

   it('should react to mousemove (button 0)', inject(function ($compile, HistoryService, Ssffdataservice, ConfigProviderService, Soundhandlerservice, viewState) {
     compile('test');
     viewState.curPreselColumnSample = 0;
     viewState.curCorrectionToolNr = 1;
     spyOn(HistoryService, 'updateCurChangeObj').and.returnValue([{sampleBlockIdx: 0, newValue: 10}]);
     spyOn(viewState, 'getPermission').and.returnValue(true);
     spyOn(viewState, 'getX').and.returnValue(1);
     spyOn(viewState, 'getViewPortStartTime').and.returnValue(0);
     spyOn(viewState, 'getViewPortEndTime').and.returnValue(2);
     spyOn(ConfigProviderService, 'getAssignment').and.returnValue({ data: [1, 2]});
     spyOn(Ssffdataservice, 'getColumnOfTrack').and.returnValue({ values: [[1, 2, 3], [1, 2, 3], [1, 2, 3]] });
     spyOn(Ssffdataservice, 'getSampleRateAndStartTimeOfTrack').and.returnValue({ sampleRate: 100, startTime: 0 });
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mousemove');
     e.buttons = 0;
     e.shiftKey = true;
     e.originalEvent = {};
     e.originalEvent.target = {};
     e.originalEvent.target.width = 100;
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
     expect(viewState.getPermission).toHaveBeenCalledWith('labelAction');
     expect(HistoryService.updateCurChangeObj).toHaveBeenCalled();
   }));

   it('should setSelectDrag', inject(function ($compile, viewState) {
     compile('test');
     spyOn(viewState, 'select');
     spyOn(viewState, 'getSamplesPerPixelVal').and.returnValue(5);
     spyOn(viewState, 'getX').and.returnValue(5);
     elm.isolateScope().setSelectDrag();
     expect(viewState.select).toHaveBeenCalled();
   }));

   it('should switchMarkupContext (OSCI)', inject(function ($compile, ConfigProviderService, viewState, Drawhelperservice) {
     compile('OSCI');
     ConfigProviderService.setVals(defaultEmuwebappConfig);
     ConfigProviderService.curDbConfig = aeDbConfig;
     spyOn(Drawhelperservice, 'drawMovingBoundaryLine');
     spyOn(Drawhelperservice, 'drawViewPortTimes');
     spyOn(Drawhelperservice, 'drawCurViewPortSelected');
     spyOn(Drawhelperservice, 'drawCrossHairs');
     elm.isolateScope().switchMarkupContext();
     expect(Drawhelperservice.drawMovingBoundaryLine).toHaveBeenCalled();
     expect(Drawhelperservice.drawViewPortTimes).toHaveBeenCalled();
     expect(Drawhelperservice.drawCurViewPortSelected).toHaveBeenCalled();
     expect(Drawhelperservice.drawCrossHairs).toHaveBeenCalled();
   }));

   it('should switchMarkupContext (SPEC)', inject(function ($compile, ConfigProviderService, viewState, Drawhelperservice) {
     compile('SPEC');
     ConfigProviderService.setVals(defaultEmuwebappConfig);
     ConfigProviderService.curDbConfig = aeDbConfig;
     spyOn(Drawhelperservice, 'drawMovingBoundaryLine');
     spyOn(Drawhelperservice, 'drawCurViewPortSelected');
     spyOn(Drawhelperservice, 'drawMinMaxAndName');
     spyOn(Drawhelperservice, 'drawCrossHairs');
     elm.isolateScope().switchMarkupContext();
     expect(Drawhelperservice.drawMovingBoundaryLine).toHaveBeenCalled();
     expect(Drawhelperservice.drawCurViewPortSelected).toHaveBeenCalled();
     expect(Drawhelperservice.drawMinMaxAndName).toHaveBeenCalled();
     expect(Drawhelperservice.drawCrossHairs).toHaveBeenCalled();
   }));

   it('should switchMarkupContext (other)', inject(function ($compile, Ssffdataservice, ConfigProviderService, viewState, Drawhelperservice) {
     compile('other');
     ConfigProviderService.setVals(defaultEmuwebappConfig);
     ConfigProviderService.curDbConfig = aeDbConfig;
     spyOn(Drawhelperservice, 'drawMovingBoundaryLine');
     spyOn(Drawhelperservice, 'drawCurViewPortSelected');
     spyOn(Drawhelperservice, 'drawMinMaxAndName');
     spyOn(Drawhelperservice, 'drawCrossHairs');
     spyOn(Ssffdataservice, 'getColumnOfTrack').and.returnValue({_minVal: 1, _maxVal: 2});
     elm.isolateScope().switchMarkupContext();
     expect(Drawhelperservice.drawMovingBoundaryLine).toHaveBeenCalled();
     expect(Drawhelperservice.drawCurViewPortSelected).toHaveBeenCalled();
     expect(Drawhelperservice.drawMinMaxAndName).toHaveBeenCalled();
     expect(Drawhelperservice.drawCrossHairs).toHaveBeenCalled();
     expect(ConfigProviderService.getSsffTrackConfig).toHaveBeenCalled();
     expect(Ssffdataservice.getColumnOfTrack).toHaveBeenCalled();
   }));

});
