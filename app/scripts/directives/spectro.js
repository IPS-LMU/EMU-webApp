'use strict';


angular.module('emuwebApp')
  .directive('spectro', function ($timeout, viewState, ConfigProviderService, Drawhelperservice, fontScaleService, Soundhandlerservice) {
    return {
      templateUrl: 'views/spectro.html',
      restrict: 'E',
      replace: true,
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.shs = Soundhandlerservice;
        scope.order = attrs.order;
        scope.vs = viewState;
        scope.cps = ConfigProviderService;
        scope.dhs = Drawhelperservice;
        scope.trackName = attrs.trackName;
        // select the needed DOM elements from the template
        scope.canvas0 = element.find('canvas')[0];
        scope.canvas1 = element.find('canvas')[element.find('canvas').length - 1];
        scope.context = scope.canvas0.getContext('2d');
        scope.markupCtx = scope.canvas1.getContext('2d');

        // FFT default vars
        // default alpha for Window Function
        scope.alpha = 0.16; 
        scope.devicePixelRatio = window.devicePixelRatio || 1;
        
        // Spectro Worker 
        scope.primeWorker = new spectroDrawingWorker();


        ///////////////
        // watches

        //
        scope.$watch('vs.timelineSize', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              $timeout(scope.redraw, 5);
            }
          }
        });


        scope.$watch('vs.curViewPort', function (newValue, oldValue) {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              // check for changed zoom
              if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
                scope.redraw();
              }
              scope.drawSpectMarkup(true);
            }
          }
        }, true);

        scope.$watch('vs.movingBoundarySample', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              scope.markupCtx.clearRect(0, 0, scope.canvas1.width, scope.canvas1.height);
              scope.drawSpectMarkup();
            }
          }
        }, true);

        scope.$watch('vs.movingBoundary', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              // scope.redraw();
              scope.drawSpectMarkup(true);
            }
          }
        }, true);



        scope.$watch('vs.spectroSettings', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              scope.setupEvent();
              scope.redraw();
            }
          }
        }, true);

        ///////////////
        // bindings

        scope.redraw = function () {
          scope.markupCtx.clearRect(0, 0, scope.canvas1.width, scope.canvas1.height);
          scope.drawSpectro(scope.shs.wavJSO.Data);
        };
        
        scope.drawSpectro = function(buffer) {
          scope.killSpectroRenderingThread();
          scope.startSpectroRenderingThread(buffer);
        }        

        scope.pcmpp = function() {
          return (scope.vs.curViewPort.eS + 1 - scope.vs.curViewPort.sS) / scope.canvas0.width;
          
        }

        scope.drawSpectMarkup = function (reset) {
          if (reset) {
            scope.markupCtx.clearRect(0, 0, scope.canvas1.width, scope.canvas1.height);
          }
          // draw moving boundary line if moving
          scope.dhs.drawMovingBoundaryLine(scope.markupCtx);
          // draw current viewport selected
          scope.dhs.drawCurViewPortSelected(scope.markupCtx, false);
          // draw min max vals and name of track
          scope.dhs.drawMinMaxAndName(scope.markupCtx, '', scope.vs.spectroSettings.rangeFrom, scope.vs.spectroSettings.rangeTo, 2);
        }

        scope.killSpectroRenderingThread = function() {
          scope.context.fillStyle = scope.cps.vals.colors.levelColor;
          scope.context.fillRect(0, 0, scope.canvas0.width, scope.canvas0.height);
          // draw current viewport selected
          scope.dhs.drawCurViewPortSelected(scope.markupCtx, false);
          var horizontalText = fontScaleService.getTextImage(scope.context, 'rendering...', scope.cps.vals.font.fontPxSize * 0.75, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor, true);
          scope.context.drawImage(horizontalText, 10, 50);

          if (scope.primeWorker !== null) {
            scope.primeWorker.kill();
            scope.primeWorker = null;
          }
        }

        scope.setupEvent = function() {
          var imageData = scope.context.createImageData(scope.canvas0.width, scope.canvas0.height);
          scope.primeWorker.says(function(event) {
            if (scope.pcmpp() === event.pcmpp) {
              var tmp = new Uint8ClampedArray(event.img);
              imageData.data.set(tmp);
              scope.context.putImageData(imageData, 0, 0);
              scope.drawSpectMarkup();
            }
          });
        };

        scope.startSpectroRenderingThread = function(buffer) {
          if(buffer.length>0) {
			  scope.primeWorker = new spectroDrawingWorker();
			  var parseData;
			  if (scope.vs.curViewPort.sS >= scope.vs.spectroSettings.windowLength / 2) {
				// pass in half a window extra at the front and a full window extra at the back so everything can be drawn/calculated this also fixes alignment issue
				parseData = new Float32Array(buffer.subarray(scope.vs.curViewPort.sS - scope.vs.spectroSettings.windowLength / 2, scope.vs.curViewPort.eS + scope.vs.spectroSettings.windowLength)); 
				
			  } else {
			    // tolerate window/2 alignment issue if at beginning of file
				parseData = new Float32Array(buffer.subarray(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS + scope.vs.spectroSettings.windowLength)); 
			  }
			  scope.setupEvent();
			  scope.primeWorker.tell({
				'N': scope.vs.spectroSettings.windowLength,
				'alpha': scope.alpha,
				'freq': scope.vs.spectroSettings.rangeTo,
				'freqLow': scope.vs.spectroSettings.rangeFrom,
				'pcmpp': scope.pcmpp(),
				'window': scope.vs.spectroSettings.window,
				'width': scope.canvas0.width,
				'height': scope.canvas0.height,
				'dynRangeInDB': scope.vs.spectroSettings.dynamicRange,
				'pixelRatio': scope.devicePixelRatio,
				'sampleRate': scope.shs.wavJSO.SampleRate,
				'streamChannels': scope.shs.wavJSO.NumChannels,
				'transparency': scope.cps.vals.spectrogramSettings.transparency,
				'stream': parseData.buffer,
				'drawHeatMapColors': scope.vs.spectroSettings.drawHeatMapColors,
				'preEmphasisFilterFactor': scope.vs.spectroSettings.preEmphasisFilterFactor,
				'heatMapColorAnchors': scope.vs.spectroSettings.heatMapColorAnchors
			  }, [parseData.buffer]);
          }
        }
      }
    };
  });