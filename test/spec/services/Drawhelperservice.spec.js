'use strict';

describe('Service: Drawhelperservice', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var scope;

  //Initialize the controller and a mock scope
  beforeEach(inject(function ($rootScope, Drawhelperservice, viewState) {
    scope = $rootScope.$new();
    scope.dhs = Drawhelperservice;
    scope.vs = viewState;
  }));

  /**
   *
   */
  it('should drawCrossHairs (trackname undefined)', inject(function (ConfigProviderService) {
    spyOn(ConfigProviderService, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.restrictions = {};
    ConfigProviderService.vals.colors = {};
    ConfigProviderService.vals.font = {};
    ConfigProviderService.vals.restrictions.drawCrossHairs = true;
    ConfigProviderService.vals.colors.crossHairsColor = '#00f';
    ConfigProviderService.vals.fontPxSize = 10;
    ConfigProviderService.vals.fontType = 'Verdana';
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
  }));
  
  /**
   *
   */
  it('should drawCrossHairs (trackname OSCI)', inject(function (ConfigProviderService) {
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.restrictions = {};
    ConfigProviderService.vals.colors = {};
    ConfigProviderService.vals.font = {};
    ConfigProviderService.vals.restrictions.drawCrossHairs = true;
    ConfigProviderService.vals.colors.crossHairsColor = '#00f';
    ConfigProviderService.vals.fontPxSize = 10;
    ConfigProviderService.vals.fontType = 'Verdana';
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
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.restrictions = {};
    ConfigProviderService.vals.colors = {};
    ConfigProviderService.vals.font = {};
    ConfigProviderService.vals.restrictions.drawCrossHairs = true;
    ConfigProviderService.vals.colors.crossHairsColor = '#00f';
    ConfigProviderService.vals.fontPxSize = 10;
    ConfigProviderService.vals.fontType = 'Verdana';
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