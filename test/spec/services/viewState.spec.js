'use strict';

describe('Factory: viewState', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
 /**
   *
   */
  it('should initialize viewState correctly', inject(function (viewState) {
    viewState.initialize();
    expect(viewState.curViewPort).toEqual({"sS":0,"eS":0,"selectS":-1,"selectE":-1,"dragBarActive":false,"dragBarHeight":-1}); 
    expect(viewState.spectroSettings.windowLength).toBe(-1);
    expect(viewState.spectroSettings.rangeFrom).toBe(-1);
    expect(viewState.spectroSettings.rangeTo).toBe(-1);
    expect(viewState.spectroSettings.dynamicRange).toBe(-1);
    expect(viewState.spectroSettings.window).toBe(-1);
    expect(viewState.spectroSettings.drawHeatMapColors).toBe(-1);
    expect(viewState.spectroSettings.preEmphasisFilterFactor).toBe(-1);
    expect(viewState.playHeadAnimationInfos).toEqual({"sS":-1,"eS":-1,"curS":null,"endFreezeSample":-1});     
  }));    
  
 /**
   *
   */
  it('should resetToInitState', inject(function (viewState) {
    viewState.resetToInitState();
    expect(viewState.curViewPort).toEqual({"sS":0,"eS":0,"selectS":-1,"selectE":-1,"dragBarActive":false,"dragBarHeight":-1}); 
    expect(viewState.spectroSettings.windowLength).toBe(-1);
    expect(viewState.spectroSettings.rangeFrom).toBe(-1);
    expect(viewState.spectroSettings.rangeTo).toBe(-1);
    expect(viewState.spectroSettings.dynamicRange).toBe(-1);
    expect(viewState.spectroSettings.window).toBe(-1);
    expect(viewState.spectroSettings.drawHeatMapColors).toBe(-1);
    expect(viewState.spectroSettings.preEmphasisFilterFactor).toBe(-1);
    expect(viewState.playHeadAnimationInfos).toEqual({"sS":-1,"eS":-1,"curS":null,"endFreezeSample":-1});     
  }));  
    
 /**
   *
   */
  it('should select viewPort', inject(function (viewState) {
    viewState.select(10,100);
    expect(viewState.curViewPort.selectS).toEqual(10); 
    expect(viewState.curViewPort.selectE).toEqual(100); 
  }));  
    
 /**
   *
   */
  it('should resetSelect viewPort', inject(function (viewState) {
    viewState.resetSelect()
    expect(viewState.curViewPort.selectS).toEqual(-1); 
    expect(viewState.curViewPort.selectE).toEqual(-1); 
  })); 
  
 /**
   *
   */
  it('should getViewPort', inject(function (viewState) {
    var vp = viewState.getViewPort()
    expect(viewState.curViewPort.selectS).toBeDefined(); 
    expect(viewState.curViewPort.selectE).toBeDefined(); 
  }));  
  
 /**
   *
   */
  it('should setspectroSettings', inject(function (viewState) {
    var vp = viewState.setspectroSettings('10', '10', '100', '10', 'HANN', true, 1)
    expect(viewState.spectroSettings.windowLength).toBe(10); 
    expect(viewState.spectroSettings.rangeFrom).toBe(10); 
    expect(viewState.spectroSettings.rangeTo).toBe(100); 
    expect(viewState.spectroSettings.dynamicRange).toBe(10); 
    expect(viewState.spectroSettings.window).toBe(myWindow.HANN); 
    expect(viewState.spectroSettings.drawHeatMapColors).toBe(true); 
    expect(viewState.spectroSettings.preEmphasisFilterFactor).toBe(1); 
  })); 
  
 /**
   *
   */
  it('should getSelect as array', inject(function (viewState) {
    viewState.select(10,100);
    expect(viewState.getSelect()).toEqual([10,100]); 
  })); 
  
 /**
   *
   */
  it('should selectDependent', inject(function (viewState) {
    viewState.select(10,100);
    viewState.selectDependent(50,100);
    expect(viewState.getSelect()).toEqual([10,100]); 
    viewState.selectDependent(5,50);
    expect(viewState.getSelect()).toEqual([5,100]); 
    viewState.selectDependent(5,200);
    expect(viewState.getSelect()).toEqual([5,200]);         
  }));  
  
 /**
   *
   */
  it('should selectLevel', inject(function (viewState, LevelService) {
    LevelService.setData(mockaeMsajc003);
    viewState.selectLevel(true,["Phonetic", "Tone"], LevelService);
    expect(viewState.curClickLevelName).toEqual('Tone');         
    expect(viewState.curClickLevelType).toEqual('EVENT');         
    viewState.selectLevel(false,["Phonetic", "Tone"], LevelService);
    expect(viewState.curClickLevelName).toEqual('Phonetic');         
    expect(viewState.curClickLevelType).toEqual('SEGMENT'); 
    viewState.selectLevel(false,["Phonetic", "Tone"], LevelService);
    viewState.selectLevel(false,["Phonetic", "Tone"], LevelService);
    viewState.selectLevel(false,["Phonetic", "Tone"], LevelService);     
    expect(viewState.curClickLevelName).toEqual('Phonetic');         
    expect(viewState.curClickLevelType).toEqual('SEGMENT');     
  }));  
 
  
 /**
   *
   */
  it('should selectSegmentsInSelection', inject(function (viewState, LevelService) {
    LevelService.setData(mockaeMsajc003);
    viewState.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    viewState.select(10,9700);
    viewState.selectSegmentsInSelection(LevelService.data.levels);
    expect(viewState.curClickSegments.length).toEqual(4);  
    expect(viewState.curClickSegments[0].labels[0].value).toEqual('V');
    expect(viewState.curClickSegments[1].labels[0].value).toEqual('m');
    expect(viewState.curClickSegments[2].labels[0].value).toEqual('V');
    expect(viewState.curClickSegments[3].labels[0].value).toEqual('N');
  }));  
  
 /**
   *
   */
  it('should selectSegmentsInSelection', inject(function (viewState, LevelService) {
    LevelService.setData(mockaeMsajc003);
    viewState.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    viewState.select(10,9700);
    viewState.selectSegmentsInSelection(LevelService.data.levels);
    expect(viewState.curClickSegments.length).toEqual(4);  
    expect(viewState.curClickSegments[0].labels[0].value).toEqual('V');
    expect(viewState.curClickSegments[1].labels[0].value).toEqual('m');
    expect(viewState.curClickSegments[2].labels[0].value).toEqual('V');
    expect(viewState.curClickSegments[3].labels[0].value).toEqual('N');
  }));  
   
  
 /**
   *
   */
  it('should getselectedRange', inject(function (viewState, LevelService) {
    var range = viewState.getselectedRange();
    expect(range.start).toEqual(-1);
    expect(range.end).toEqual(-1);
    LevelService.setData(mockaeMsajc003);
    viewState.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    viewState.select(9700,15000);
    viewState.selectSegmentsInSelection(LevelService.data.levels);
    range = viewState.getselectedRange();
    expect(range.start).toEqual(11340);
    expect(range.end).toEqual(14800);
  }));  
  
 /**
   *
   */
  it('should setViewPort', inject(function (viewState, LevelService, Soundhandlerservice) {
    Soundhandlerservice.wavJSO.Data = new Array(58089); 
    viewState.setViewPort(20156, 34679);
    expect(viewState.curViewPort.sS).toEqual(20156); 
    expect(viewState.curViewPort.eS).toEqual(34679);
    // too small
    viewState.setViewPort(20156, 20158); 
    expect(viewState.curViewPort.sS).toEqual(20156); 
    expect(viewState.curViewPort.eS).toEqual(34679);
    // out of rang
    viewState.setViewPort(-100000000000, 100000000000); 
    expect(viewState.curViewPort.sS).toEqual(0); 
    expect(viewState.curViewPort.eS).toEqual(58089);    
  })); 
  
 /**
   *
   */
  it('should zoomViewPort', inject(function (viewState, LevelService, Soundhandlerservice) {
    LevelService.setData(mockaeMsajc003);
    Soundhandlerservice.wavJSO.Data = new Array(58089); 
    viewState.setViewPort(0, 58089);
    viewState.zoomViewPort(true, LevelService);
    viewState.zoomViewPort(true, LevelService);
    expect(viewState.curViewPort.sS).toEqual(21783); 
    expect(viewState.curViewPort.eS).toEqual(36306);
    viewState.zoomViewPort(false, LevelService);
    viewState.zoomViewPort(false, LevelService);
    viewState.zoomViewPort(false, LevelService);
    viewState.zoomViewPort(false, LevelService);
    expect(viewState.curViewPort.sS).toEqual(0); 
    expect(viewState.curViewPort.eS).toEqual(58089);    
  })); 
  
 /**
   *
   */
  it('should shiftViewPort', inject(function (viewState, LevelService, Soundhandlerservice) {
    LevelService.setData(mockaeMsajc003);
    Soundhandlerservice.wavJSO.Data = new Array(58089); 
    viewState.setViewPort(0, 58089);
    viewState.zoomViewPort(true, LevelService);
    viewState.zoomViewPort(true, LevelService);
    expect(viewState.curViewPort.sS).toEqual(21783); 
    expect(viewState.curViewPort.eS).toEqual(36306);
    viewState.shiftViewPort(true);
    expect(viewState.curViewPort.sS).toEqual(25413); 
    expect(viewState.curViewPort.eS).toEqual(39936);
    viewState.shiftViewPort(false);    
    expect(viewState.curViewPort.sS).toEqual(21783); 
    expect(viewState.curViewPort.eS).toEqual(36306);    
  }));  


});