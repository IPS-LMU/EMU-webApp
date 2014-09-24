'use strict';

describe('Factory: viewState', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

  /**
   *
   */
  it('should initialize viewState correctly', inject(function (viewState) {
    viewState.initialize();

    expect(viewState.curViewPort.sS).toEqual(0);
    expect(viewState.curViewPort.eS).toEqual(0);
    expect(viewState.curViewPort.selectS).toEqual(-1);
    expect(viewState.curViewPort.selectE).toEqual(-1);
    expect(viewState.curViewPort.dragBarActive).toEqual(false);
    expect(viewState.curViewPort.dragBarHeight).toEqual(-1);

    expect(viewState.spectroSettings.windowLength).toBe(-1);
    expect(viewState.spectroSettings.rangeFrom).toBe(-1);
    expect(viewState.spectroSettings.rangeTo).toBe(-1);
    expect(viewState.spectroSettings.dynamicRange).toBe(-1);
    expect(viewState.spectroSettings.window).toBe(-1);
    expect(viewState.spectroSettings.drawHeatMapColors).toBe(-1);
    expect(viewState.spectroSettings.preEmphasisFilterFactor).toBe(-1);

    expect(viewState.playHeadAnimationInfos.sS).toEqual(-1);
    expect(viewState.playHeadAnimationInfos.eS).toEqual(-1);
    expect(viewState.playHeadAnimationInfos.curS).toEqual(null);
    expect(viewState.playHeadAnimationInfos.endFreezeSample).toEqual(-1);
  }));

  /**
   *
   */
  it('should resetToInitState', inject(function (viewState) {
    viewState.resetToInitState();

    expect(viewState.curViewPort.sS).toEqual(0);
    expect(viewState.curViewPort.eS).toEqual(0);
    expect(viewState.curViewPort.selectS).toEqual(-1);
    expect(viewState.curViewPort.selectE).toEqual(-1);
    expect(viewState.curViewPort.dragBarActive).toEqual(false);
    expect(viewState.curViewPort.dragBarHeight).toEqual(-1);

    expect(viewState.spectroSettings.windowLength).toBe(-1);
    expect(viewState.spectroSettings.rangeFrom).toBe(-1);
    expect(viewState.spectroSettings.rangeTo).toBe(-1);
    expect(viewState.spectroSettings.dynamicRange).toBe(-1);
    expect(viewState.spectroSettings.window).toBe(-1);
    expect(viewState.spectroSettings.drawHeatMapColors).toBe(-1);
    expect(viewState.spectroSettings.preEmphasisFilterFactor).toBe(-1);

    expect(viewState.playHeadAnimationInfos.sS).toEqual(-1);
    expect(viewState.playHeadAnimationInfos.eS).toEqual(-1);
    expect(viewState.playHeadAnimationInfos.curS).toEqual(null);
    expect(viewState.playHeadAnimationInfos.endFreezeSample).toEqual(-1);
  }));

  /**
   *
   */
  it('should select viewPort', inject(function (viewState) {
    viewState.select(10, 100);
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
    expect(viewState.spectroSettings.window).toBe(7); // 7 equals HANN
    expect(viewState.spectroSettings.drawHeatMapColors).toBe(true);
    expect(viewState.spectroSettings.preEmphasisFilterFactor).toBe(1);
  }));

  /**
   *
   */
  it('should getSelect as array', inject(function (viewState) {
    viewState.select(10, 100);
    expect(viewState.getSelect()).toEqual([10, 100]);
  }));

  /**
   *
   */
  it('should selectDependent', inject(function (viewState) {
    viewState.select(10, 100);
    viewState.selectDependent(50, 100);
    expect(viewState.getSelect()).toEqual([10, 100]);
    viewState.selectDependent(5, 50);
    expect(viewState.getSelect()).toEqual([5, 100]);
    viewState.selectDependent(5, 200);
    expect(viewState.getSelect()).toEqual([5, 200]);
  }));

  /**
   *
   */
  it('should selectLevel', inject(function (viewState, LevelService) {
    LevelService.setData(msajc003_bndl.annotation);
    viewState.selectLevel(true, ["Phonetic", "Tone"], LevelService);
    expect(viewState.curClickLevelName).toEqual('Tone');
    expect(viewState.curClickLevelType).toEqual('EVENT');
    viewState.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    expect(viewState.curClickLevelName).toEqual('Phonetic');
    expect(viewState.curClickLevelType).toEqual('SEGMENT');
    viewState.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    viewState.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    viewState.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    expect(viewState.curClickLevelName).toEqual('Phonetic');
    expect(viewState.curClickLevelType).toEqual('SEGMENT');
  }));

  /**
   *
   */
  it('should selectSegmentsInSelection', inject(function (viewState, LevelService) {
    LevelService.setData(msajc003_bndl.annotation);
    viewState.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    viewState.select(3300, 7000);
    viewState.selectSegmentsInSelection(LevelService.data.levels);
    expect(viewState.curClickSegments.length).toEqual(2);
    expect(viewState.curClickSegments[0].labels[0].value).toEqual('V');
    expect(viewState.curClickSegments[1].labels[0].value).toEqual('m');
  }));


  /**
   *
   */
  it('should getselectedRange', inject(function (viewState, LevelService) {
    var range = viewState.getselectedRange();
    expect(range.start).toEqual(-1);
    expect(range.end).toEqual(-1);
    LevelService.setData(msajc003_bndl.annotation);
    viewState.selectLevel(false, ['Phonetic', 'Tone'], LevelService);
    viewState.select(10, 9700);
    viewState.selectSegmentsInSelection(LevelService.data.levels);
    range = viewState.getselectedRange();
    expect(range.start).toEqual(3750);
    expect(range.end).toEqual(9669);
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
    LevelService.setData(msajc003_bndl.annotation);
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
    LevelService.setData(msajc003_bndl.annotation);
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

  /**
   *
   */
  it('should calculate correct samplesPerPxl value', inject(function (viewState) {
    viewState.initialize();
    viewState.curViewPort.eS = 100;
    // mock event:
    var evt = {};
    evt.originalEvent = {};
    evt.originalEvent.target = {};
    evt.originalEvent.target.width = 50;
    expect(viewState.getSamplesPerPixelVal(evt)).toEqual(2);
    evt.originalEvent.target.width = 200;
    expect(viewState.getSamplesPerPixelVal(evt)).toEqual(0.5);
  }));


});