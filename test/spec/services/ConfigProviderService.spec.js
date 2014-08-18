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
      'colors': {
        'labelColor': 'mintGreen'
      }
    };
    ConfigProviderService.setVals(newVals);
    expect(ConfigProviderService.vals.colors.labelColor).toBe('mintGreen');
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


});