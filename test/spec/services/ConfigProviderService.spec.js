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


  var mockValsJso = {
    'main': {
      'osciSpectroZoomFactor': 2
    },
    'keyMappings': {
      'toggleSideBars': 79
    },
    'colors': {
      'labelColor': '#000'
    },
    'font': {
      'fontType': 'HelveticaNeue'
    },
    'spectrogramSettings': {
      'N': 256
    },
    'perspectives': [{
      'name': 'default',
      'signalCanvases': {
        'order': []
      },
      'levelCanvases': {
        'order': []
      },
      'twoDimCanvases': {
        'order': []
      }
    }],
    'labelCanvasConfig': {
      'addTimeMode': 'absolute'
    },
    'restrictions': {
      'playback': true
    },
    'activeButtons': {
      'addLevelSeg': false
    },
    'demoDBs': ['ae', 'ema', 'epgdorsal']
  };

  /**
   *
   */
  it('check if initial set of vals works', inject(function (ConfigProviderService) {
    ConfigProviderService.setVals(mockValsJso);
    expect($.isEmptyObject(ConfigProviderService.vals)).toBe(false);
    expect(JSON.stringify(ConfigProviderService.vals, undefined, 0)).toEqual(JSON.stringify(mockValsJso, undefined, 0));

  }));

  /**
   *
   */
  it('check if vals overwrite works', inject(function (ConfigProviderService) {
    ConfigProviderService.setVals(mockValsJso);
    // single value
    var newVals = {
      'colors': {
        'labelColor': 'mintGreen'
      }
    };
    ConfigProviderService.setVals(newVals);
    expect(ConfigProviderService.vals.colors.labelColor).toBe('mintGreen');
    // array
    newVals = {
      'perspectives': ['a', 'b', 'c']
    };
    ConfigProviderService.setVals(newVals);
    expect(ConfigProviderService.vals.perspectives.join('')).toBe('abc');
    //wrong val
    // newVals = {
    //   'colors': {
    //     'asdf': 'asdf'
    //   }
    // };
    // ConfigProviderService.setVals(newVals);
    // console.log(console.error);
    // expect(console.error).toMatch('BAD ENTRY');

  }));

  var mockCurDbConfig = {
    'name': 'ae',
    'UUID': 'cd45b08a-3a13-4e42-b566-585844efabd4',
    'mediafileExtension': 'wav',
    'ssffTracks': [{
      'name': 'FORMANTS',
      'columnName': 'fm',
      'fileExtension': 'fms'
    }],
    'levelDefinitions': [{
      'name': 'Utterance',
      'type': 'ITEM',
      'attributeDefinitions': [{
        'name': 'Utterance',
        'type': 'string'
      }]
    }],
    'linkDefinitions': [{
      'type': 'ONE_TO_MANY',
      'superlevelName': 'Utterance',
      'sublevelName': 'Intonational'
    }]
  }

  /**
   *
   */
  it('check if getSsffTrackConfig', inject(function (ConfigProviderService) {
    ConfigProviderService.curDbConfig = mockCurDbConfig;
    expect(ConfigProviderService.getSsffTrackConfig('FORMANTS').name).toBe('FORMANTS');
    expect(ConfigProviderService.getSsffTrackConfig('FORMANTS').columnName).toBe('fm');
    expect(ConfigProviderService.getSsffTrackConfig('FORMANTS').fileExtension).toBe('fms');

    expect($.isEmptyObject(ConfigProviderService.getSsffTrackConfig('asdf'))).toBe(true);

  }));


});