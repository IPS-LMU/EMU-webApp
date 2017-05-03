'use strict';

describe('Controller: spectSettingsCtrl', function () {

  var spectSettingsCtrl, scope;

  // load the controller's module
  beforeEach(module('emuwebApp'));


  //Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, mathHelperService, Soundhandlerservice, DataService, ConfigProviderService, modalService, viewState, LevelService) {
    scope = $rootScope.$new();
    scope.cps = ConfigProviderService;
    scope.cps.setVals(defaultEmuwebappConfig);
    scope.cps.curDbConfig = aeDbConfig;
    scope.modal = modalService;
    scope.vs = viewState;
    scope.lvl = LevelService;
    scope.data = DataService;
    scope.math = mathHelperService;
    scope.shs = Soundhandlerservice;

    spectSettingsCtrl = $controller('spectSettingsCtrl', {
      $scope: scope
    });
    scope.modalVals = {
      'rangeFrom': 2,
      'rangeTo': 4,
      'dynamicRange': 2,
      'windowSizeInSecs': 4.0,
      'window': 5,
      'drawHeatMapColors': 6,
      'preEmphasisFilterFactor': 7,
      'heatMapColorAnchors': [
        ['0', '0', '0'],
        ['1', '2', '3'],
        ['4', '5', '6']
      ]
    };
  }));

  it('should saveSpectroSettings correctly (dynamicRange error)', function () {
    scope.modalVals.dynamicRange = 'string';
    scope.data.data.sampleRate = 1000;
    scope.checkSpectroSettings();
    expect(scope.errorID[5]).toEqual(true);
  });

  it('should saveSpectroSettings correctly (dynamicRange error)', function () {
    scope.modalVals.rangeTo = 2100;
    scope.data.data.sampleRate = 1000;
    scope.checkSpectroSettings();
    expect(scope.errorID[1]).toEqual(true);
  });
  
  it('should calcWindowSizeVals', function () {
    spyOn(scope, 'calcWindowSizeInSamples');
    spyOn(scope, 'calcFftN');
    scope.calcWindowSizeVals();
    expect(scope.calcWindowSizeInSamples).toHaveBeenCalled();
    expect(scope.calcFftN).toHaveBeenCalled();
  }); 
  
  it('should calcWindowSizeInSamples', function () {
    scope.shs.audioBuffer.sampleRate = 2;
    scope.modalVals.windowSizeInSecs = 0.5;
    scope.calcWindowSizeInSamples();
    expect(scope.modalVals._windowSizeInSamples).toEqual(1);
  }); 
  
  it('should calcFftN', function () {
    scope.modalVals._windowSizeInSamples = 20;
    scope.calcFftN();
    expect(scope.modalVals._fftN).toEqual(512);
  }); 
  
  it('should get htmlError', function () {
    scope.errorID[1] = true;
    scope.errorID[2] = false;
    expect(scope.htmlError(1)).toEqual(true);
    expect(scope.htmlError(2)).toEqual(false);
  }); 
     
  it('should get cssError', function () {
    scope.errorID[1] = true;
    scope.errorID[2] = false;
    scope.errorID[3] = false;
    expect(scope.cssError(1,2)).toEqual({'background': '#f00'});
    expect(scope.cssError(3)).toEqual(undefined);
    expect(scope.cssError(3,1)).toEqual({'background': '#f00'});
  }); 
     
  it('should saveSettings', function () {
    scope.errorID[1] = true;
    scope.errorID[2] = false;
    scope.errorID[3] = false;
    spyOn(scope.vs, 'setspectroSettings');
    spyOn(scope, 'reset');
    scope.saveSettings();
    expect(scope.vs.setspectroSettings).not.toHaveBeenCalled();
    expect(scope.reset).not.toHaveBeenCalled();
    scope.errorID[1] = false;
    scope.saveSettings();
    expect(scope.vs.setspectroSettings).toHaveBeenCalled();
    expect(scope.reset).toHaveBeenCalled();
  });   


  it('should getColorOfAnchor', function () {
    var curStyle0 = {
      'background-color': 'rgb(0,0,0)',
      'width': '10px',
      'height': '10px'
    };
    var ret = scope.vs.getColorOfAnchor(scope.modalVals.heatMapColorAnchors, 0);
    expect(ret).toEqual(curStyle0);
    var curStyle1 = {
      'background-color': 'rgb(1,2,3)',
      'width': '10px',
      'height': '10px'
    };
    var ret = scope.vs.getColorOfAnchor(scope.modalVals.heatMapColorAnchors, 1);
    expect(ret).toEqual(curStyle1);
  });
  

  it('should set cursorOutOfTextField', function () {
    scope.shs.audioBuffer.sampleRate = 2;
    scope.shs.audioBuffer.numberOfChannels = 1;
    spyOn(scope.vs, 'setEditing');
    spyOn(scope.vs, 'setcursorInTextField');
    scope.cursorOutOfTextField();
    expect(scope.vs.setEditing).toHaveBeenCalledWith(false);
    expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(false);
  });

  it('should set cursorInTextField', function () {
    scope.shs.audioBuffer.numberOfChannels = 1;
    spyOn(scope.vs, 'setEditing');
    spyOn(scope.vs, 'setcursorInTextField');
    scope.cursorInTextField();
    expect(scope.vs.setEditing).toHaveBeenCalledWith(true);
    expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(true);
  });
});