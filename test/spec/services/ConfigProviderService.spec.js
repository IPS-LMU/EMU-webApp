'use strict';

describe('Service: ConfigProviderService', function () {

  // load the controller's module
  beforeEach(function () {
    module('emuwebApp');
  });

  /**
   *
   */
  it('check default vals are set correctly', inject(function (ConfigProviderService) {
    // vals
    expect($.isEmptyObject(ConfigProviderService.vals)).toBe(true);
    // curDbConfig
    expect($.isEmptyObject(ConfigProviderService.curDbConfig)).toBe(true);
    // embedded vals
    expect(ConfigProviderService.embeddedVals.audioGetUrl).toBe('');
    expect(ConfigProviderService.embeddedVals.labelGetUrl).toBe('');
    expect(ConfigProviderService.embeddedVals.labelType).toBe('');
    expect(ConfigProviderService.embeddedVals.fromUrlParams).toBe(false);
  }));

  /**
   *
   */
  it('check if initial set of vals works', inject(function (ConfigProviderService) {
    ConfigProviderService.setVals(defaultEmuwebappConfig);
    expect($.isEmptyObject(ConfigProviderService.vals)).toBe(false);
    expect(JSON.stringify(ConfigProviderService.vals, undefined, 0)).toEqual(JSON.stringify(defaultEmuwebappConfig, undefined, 0));
  }));

  /**
   *
   */
  it('check if vals overwrite works', inject(function (ConfigProviderService) {
    ConfigProviderService.setVals(defaultEmuwebappConfig);
    // single value
    var newVals = {
      'labelCanvasConfig': {
        'addTimeValue': 700
      }
    };
    ConfigProviderService.setVals(newVals);
    expect(ConfigProviderService.vals.labelCanvasConfig.addTimeValue).toBe(700);
  }));

  /**
   *
   */
  it('check if getSsffTrackConfig', inject(function (ConfigProviderService) {
    ConfigProviderService.curDbConfig = aeDbConfig;
    expect(ConfigProviderService.getSsffTrackConfig('FORMANTS').name).toBe('FORMANTS');
    expect(ConfigProviderService.getSsffTrackConfig('FORMANTS').columnName).toBe('fm');
    expect(ConfigProviderService.getSsffTrackConfig('FORMANTS').fileExtension).toBe('fms');
    expect($.isEmptyObject(ConfigProviderService.getSsffTrackConfig('asdf'))).toBe(true);
  }));
  
  /**
   *
   */
  it('should getLimsOfTrack', inject(function (viewState, ConfigProviderService) {
    ConfigProviderService.setVals(defaultEmuwebappConfig);
    viewState.curPerspectiveIdx = 0;
    ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases = aeDbConfig.EMUwebAppConfig.perspectives[0].levelCanvases;
    expect(ConfigProviderService.getLimsOfTrack('SPEC')).toEqual({ });
  }));
  
  /**
   *
   */
  it('should getAssignment', inject(function (viewState, ConfigProviderService) {
    ConfigProviderService.setVals(defaultEmuwebappConfig);
    viewState.curPerspectiveIdx = 0;
    // set
    ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign = [{signalCanvasName: 'SPEC', ssffTrackName: 'FORMANTS'}];
    expect(ConfigProviderService.getAssignment('SPEC')).toEqual({
        signalCanvasName : 'SPEC', 
        ssffTrackName : 'FORMANTS'
    });
  }));
  
   it('should getStrRep', inject(function (ConfigProviderService) {
     expect(ConfigProviderService.getStrRep("\b".charCodeAt(0))).toEqual('BACKSPACE');
     expect(ConfigProviderService.getStrRep("\t".charCodeAt(0))).toEqual('TAB');
     expect(ConfigProviderService.getStrRep("\r\n".charCodeAt(0))).toEqual('ENTER');
     expect(ConfigProviderService.getStrRep(16)).toEqual('SHIFT');
     expect(ConfigProviderService.getStrRep(18)).toEqual('ALT');
     expect(ConfigProviderService.getStrRep(" ".charCodeAt(0))).toEqual('SPACE');
     expect(ConfigProviderService.getStrRep(37)).toEqual('←');
     expect(ConfigProviderService.getStrRep(39)).toEqual('→');
     expect(ConfigProviderService.getStrRep(38)).toEqual('↑');
     expect(ConfigProviderService.getStrRep(40)).toEqual('↓');
     expect(ConfigProviderService.getStrRep(42)).toEqual('+');
     expect(ConfigProviderService.getStrRep("+".charCodeAt(0))).toEqual('+');
     expect(ConfigProviderService.getStrRep(95)).toEqual('-');
     expect(ConfigProviderService.getStrRep("-".charCodeAt(0))).toEqual('-');
     expect(ConfigProviderService.getStrRep("a".charCodeAt(0))).toEqual('a');
     expect(ConfigProviderService.getStrRep("b".charCodeAt(0))).toEqual('b');
     expect(ConfigProviderService.getStrRep("c".charCodeAt(0))).toEqual('c');
     expect(ConfigProviderService.getStrRep("A".charCodeAt(0))).toEqual('A');
     expect(ConfigProviderService.getStrRep("B".charCodeAt(0))).toEqual('B');
     expect(ConfigProviderService.getStrRep("C".charCodeAt(0))).toEqual('C');
   }));     


});
