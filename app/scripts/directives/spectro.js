'use strict';


angular.module('emuwebApp')
  .directive('spectro', function ($timeout, viewState, ConfigProviderService, Drawhelperservice, fontScaleService, Soundhandlerservice, mathHelperService, loadedMetaDataService) {
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
        scope.lmds = loadedMetaDataService;
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
              $timeout(scope.clearAndDrawSpectMarkup, scope.cps.vals.colors.transitionTime);
            }
          }
        });

        //
        scope.$watch('vs.submenuOpen', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              $timeout(scope.clearAndDrawSpectMarkup, scope.cps.vals.colors.transitionTime);
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
              scope.clearAndDrawSpectMarkup();
            }
          }
        }, true);

        scope.$watch('vs.movingBoundarySample', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              scope.clearAndDrawSpectMarkup();
            }
          }
        }, true);

        scope.$watch('vs.movingBoundary', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              // scope.redraw();
              scope.clearAndDrawSpectMarkup();
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

        //
        scope.$watch('lmds.getCurBndl()', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
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

        scope.drawSpectro = function (buffer) {
          scope.killSpectroRenderingThread();
          scope.startSpectroRenderingThread(buffer);
        }

        scope.calcSamplesPerPxl = function () {
          return (scope.vs.curViewPort.eS + 1 - scope.vs.curViewPort.sS) / scope.canvas0.width;
        }

        scope.clearAndDrawSpectMarkup = function () {
          scope.markupCtx.clearRect(0, 0, scope.canvas1.width, scope.canvas1.height);
          scope.drawSpectMarkup();
        }

        scope.drawSpectMarkup = function () {
          // draw moving boundary line if moving
          scope.dhs.drawMovingBoundaryLine(scope.markupCtx);
          // draw current viewport selected
          scope.dhs.drawCurViewPortSelected(scope.markupCtx, false);
          // draw min max vals and name of track
          scope.dhs.drawMinMaxAndName(scope.markupCtx, '', scope.vs.spectroSettings.rangeFrom, scope.vs.spectroSettings.rangeTo, 2);
        }

        scope.killSpectroRenderingThread = function () {
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

        scope.setupEvent = function () {
          var imageData = scope.context.createImageData(scope.canvas0.width, scope.canvas0.height);
          scope.primeWorker.says(function (event) {
            if (event.status === undefined) {
              if (scope.calcSamplesPerPxl() === event.samplesPerPxl) {
                var tmp = new Uint8ClampedArray(event.img);
                imageData.data.set(tmp);
                scope.context.putImageData(imageData, 0, 0);
                scope.drawSpectMarkup();
              }
            } else {
              console.error('Error rendering spectrogram:', event.status.message);
            }
          });
        };

        scope.startSpectroRenderingThread = function (buffer) {
          if (buffer.length > 0) {
            scope.primeWorker = new spectroDrawingWorker();
            var parseData;
            var fftN = mathHelperService.calcClosestPowerOf2Gt(scope.shs.wavJSO.SampleRate * scope.vs.spectroSettings.windowSizeInSecs);
            // fftN must be greater than 512 (leads to better resolution of spectrogram)
            if (fftN < 512) {
              fftN = 512;
            }

            if (scope.vs.curViewPort.sS >= fftN / 2) {
              // pass in half a window extra at the front and a full window extra at the back so everything can be drawn/calculated this also fixes alignment issue
              parseData = new Float32Array(buffer.subarray(scope.vs.curViewPort.sS - fftN / 2, scope.vs.curViewPort.eS + fftN));
            } else {
              // tolerate window/2 alignment issue if at beginning of file
              parseData = new Float32Array(buffer.subarray(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS + fftN));
            }

            scope.setupEvent();

            scope.primeWorker.tell({
              'windowSizeInSecs': scope.vs.spectroSettings.windowSizeInSecs,
              'fftN': fftN,
              'alpha': scope.alpha,
              'upperFreq': scope.vs.spectroSettings.rangeTo,
              'lowerFreq': scope.vs.spectroSettings.rangeFrom,
              'samplesPerPxl': scope.calcSamplesPerPxl(),
              'window': scope.vs.spectroSettings.window,
              'imgWidth': scope.canvas0.width,
              'imgHeight': scope.canvas0.height,
              'dynRangeInDB': scope.vs.spectroSettings.dynamicRange,
              'pixelRatio': scope.devicePixelRatio,
              'sampleRate': scope.shs.wavJSO.SampleRate,
              'transparency': scope.cps.vals.spectrogramSettings.transparency,
              'audioBuffer': parseData.buffer,
              'audioBufferChannels': scope.shs.wavJSO.NumChannels,
              'drawHeatMapColors': scope.vs.spectroSettings.drawHeatMapColors,
              'preEmphasisFilterFactor': scope.vs.spectroSettings.preEmphasisFilterFactor,
              'heatMapColorAnchors': scope.vs.spectroSettings.heatMapColorAnchors
            }, [parseData.buffer]);
          }
        }
      }
    };
  });