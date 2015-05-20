'use strict';

describe('Service: Drawhelperservice', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var scope;

  //Initialize the controller and a mock scope
  beforeEach(inject(function ($rootScope, Drawhelperservice, viewState, ConfigProviderService) {
    scope = $rootScope.$new();
    scope.dhs = Drawhelperservice;
    scope.vs = viewState;
    scope.cps = ConfigProviderService;
    scope.cps.design = defaultEmuwebappDesign;    
    scope.cps.vals = {};
    scope.cps.vals.restrictions = {};
    scope.cps.vals.colors = {};
    scope.cps.vals.font = {};
    scope.cps.vals.restrictions.drawCrossHairs = true;
    scope.cps.vals.colors.crossHairsColor = '#00f';
    scope.cps.vals.fontPxSize = 10;
    scope.cps.vals.fontType = 'Verdana';
  }));

  /**
   *
   */
  it('should drawCrossHairs (trackname undefined)', inject(function (ConfigProviderService, Ssffdataservice) {
    // add mock track definition
    scope.cps.curDbConfig.ssffTrackDefinitions = [{
      'name': 'test',
      'columnName': 'test',
      'fileExtension': 'testFileExt'
    }];
    spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
    spyOn(Ssffdataservice, 'getColumnOfTrack').and.returnValue({_maxVal: 0, _minVal: 0});
    spyOn(scope.vs, 'getX').and.returnValue(512);
    spyOn(scope.vs, 'getY').and.returnValue(128);
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    scope.dhs.drawCrossHairs(ctx, {}, 0, 1, 1, 'test');
    expect(scope.vs.getX).toHaveBeenCalled();
    expect(scope.vs.getY).toHaveBeenCalled();
    expect(ConfigProviderService.getSsffTrackConfig).toHaveBeenCalled();
    expect(Ssffdataservice.getColumnOfTrack).toHaveBeenCalled();
  }));
  
  /**
   *
   */
  it('should drawCrossHairs (trackname OSCI)', inject(function (ConfigProviderService) {
    spyOn(scope.vs, 'getX').and.returnValue(512);
    spyOn(scope.vs, 'getY').and.returnValue(128);
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    scope.dhs.drawCrossHairs(ctx, {}, 0, 1, 1, 'OSCI');
    expect(scope.vs.getX).toHaveBeenCalled();
    expect(scope.vs.getY).toHaveBeenCalled();
  }));
  
  /**
   *
   */
  it('should drawCrossHairs (trackname SPEC)', inject(function (ConfigProviderService) {
    spyOn(scope.vs, 'getX').and.returnValue(512);
    spyOn(scope.vs, 'getY').and.returnValue(128);
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    scope.dhs.drawCrossHairs(ctx, {}, 0, 1, 1, 'SPEC');
    expect(scope.vs.getX).toHaveBeenCalled();
    expect(scope.vs.getY).toHaveBeenCalled();
  }));
  
});
