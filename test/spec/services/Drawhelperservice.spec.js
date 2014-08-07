'use strict';

describe('Service: Drawhelperservice', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

 /**
   *
   */
  it('should calculatePeaks', inject(function (Drawhelperservice, viewState, $compile, $rootScope) {
      var canvas = $compile('<canvas class="emuwebapp-timelineCanvasMain" width="2048"></canvas>')($rootScope);
      Drawhelperservice.calculatePeaks(viewState, canvas, Wavdata);
  }));
});