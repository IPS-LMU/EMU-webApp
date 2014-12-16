'use strict';

describe('Controller: spectSettingsCtrl', function () {

  var spectSettingsCtrl, scope;

  // load the controller's module
  beforeEach(module('emuwebApp'));


  //Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, DataService, ConfigProviderService, modalService, viewState, LevelService) {
    scope = $rootScope.$new();
    scope.cps = ConfigProviderService;
    scope.cps.setVals(defaultEmuwebappConfig);
    scope.cps.curDbConfig = aeDbConfig;
    scope.modal = modalService;
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
      'windowSizeInSecs': 4.0,
      'window': 5,
      'drawHeatMapColors': 6,
      'preEmphasisFilterFactor': 7,
      'heatMapColorAnchors': [
        ['0', '0', '0'],
        ['1', '2', '3']
      ]
    };
  }));

  it('should saveSpectroSettings correctly (dynamicRange error)', function () {
    scope.modalVals.dynamicRange = 'string';
    scope.data.data.sampleRate = 1000;
    spyOn(scope.modal, 'close');
    spyOn(scope.modal, 'open');
    spyOn(scope, 'error');
    scope.saveSpectroSettings();
    expect(scope.cssErrorID).toEqual(3);
  });

  it('should saveSpectroSettings correctly (dynamicRange error)', function () {
    scope.modalVals.rangeTo = 2100;
    scope.data.data.sampleRate = 1000;
    spyOn(scope.modal, 'close');
    spyOn(scope.modal, 'open');
    spyOn(scope, 'error');
    scope.saveSpectroSettings();
    expect(scope.cssErrorID).toEqual(3);
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