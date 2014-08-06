'use strict';

describe('Factory: viewState', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
 /**
   *
   */
  it('should initialize viewState correctly', inject(function (viewState) {
    viewState.initialize()
    expect(viewState.curViewPort).toEqual({"sS":0,"eS":0,"selectS":-1,"selectE":-1,"dragBarActive":false,"dragBarHeight":-1}); 
    expect(viewState.spectroSettings).toEqual({"windowLength":-1,"rangeFrom":-1,"rangeTo":-1,"dynamicRange":-1,"window":-1,"drawHeatMapColors":-1,"preEmphasisPerOctaveInDb":-1}); 
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
    expect(viewState.spectroSettings.preEmphasisPerOctaveInDb).toBe(1); 
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
  }));  


});