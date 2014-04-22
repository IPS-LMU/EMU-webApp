'use strict';


angular.module('emuwebApp')
  .directive('spectro', function () {
    return {
      templateUrl: 'views/spectro.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.order = attrs.order;
        scope.enlargeCanvas = {
          'height': 100 / scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].signalCanvases.order.length + '%'
        };
        // select the needed DOM elements from the template
        var canvasLength = element.find('canvas').length;
        var canvas0 = element.find('canvas')[0];
        var canvas1 = element.find('canvas')[canvasLength - 1];
        // var myid = element[0].id;
        // FFT default vars
        var alpha = 0.16; // default alpha for Window Function
        var context = canvas0.getContext('2d');
        var markupCtx = canvas1.getContext('2d');
        var pcmperpixel = 0;
        window.URL = window.URL || window.webkitURL;
        var devicePixelRatio = window.devicePixelRatio || 1;
        var spectroWorker = 'scripts/workers/spectroWorker.js';
        var primeWorker = new Worker(spectroWorker);
        var imageCache = null;
        var imageCacheCounter = 0;
        var cache;


        scope.updateCSS = function () {
          var parts = scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].signalCanvases.order.length;
          if (scope.vs.getenlarge() == -1) {
            scope.enlargeCanvas = {
              'height': 100 / parts + '%'
            };
          } else {
            if (scope.vs.getenlarge() == scope.order) {
              scope.enlargeCanvas = {
                'height': 3 * 100 / (parts + 2) + '%'
              };
            } else {
              scope.enlargeCanvas = {
                'height': 100 / (parts + 2) + '%'
              };
            }
          }
        };

        // on mouse move
        element.bind('mousemove', function (event) {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              // markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
              // drawSpectMarkup();
              // if (!scope.vs.getdragBarActive()) {
              //   drawCrossHairs(canvas0, scope.cps, scope.dhs, event);
              // }
            }
          }
        });

        // on mouse leave clear markup canvas
        element.bind('mouseleave', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
              drawSpectMarkup();
            }
          }
        });

        scope.$watch('vs.curPerspectiveIdx', function () {
          scope.updateCSS();
        }, true);

        scope.$watch('vs.curViewPort', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              scope.redraw();
              scope.updateCSS();
            }
          }
        }, true);

        // do we need this?
        // scope.$watch('tds.data', function () {
        //   if (!$.isEmptyObject(scope.shs)) {
        //     if (!$.isEmptyObject(scope.shs.wavJSO)) {
        //       scope.redraw();
        //     }
        //   }
        // }, true);

        scope.$watch('vs.movingBoundary', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              scope.redraw();
            }
          }
        }, true);


        scope.$on('newlyLoadedAudioFile', function () {
          console.log('clearing spectro image cache...');
          clearImageCache();
        });

        scope.$watch('vs.spectroSettings', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              setupEvent();
              clearImageCache();
              drawSpectro(scope.vs, scope.shs.wavJSO.Data);
            }
          }
        }, true);

        scope.redraw = function () {
          pcmperpixel = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas0.width);
          cache = cacheHit(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS, pcmperpixel);
          if (cache !== null) {
            markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
            drawTimeLine(cache);
            drawSpectMarkup();
          } else {
            drawSpectro(scope.shs.wavJSO.Data);
          }
        };

        function clearImageCache() {
          imageCache = null;
          imageCacheCounter = 0;
          imageCache = [];
        }

        function buildImageCache(cstart, cend, ppp, imgData) {
          imageCache[imageCacheCounter] = [];
          imageCache[imageCacheCounter][0] = cstart;
          imageCache[imageCacheCounter][1] = cend;
          imageCache[imageCacheCounter][2] = ppp;
          imageCache[imageCacheCounter][3] = imgData;
          ++imageCacheCounter;
        }

        function cacheHit(cstart, cend, ppp) {
          for (var i = 0; i < imageCache.length; ++i) {
            if (imageCache[i][0] === cstart &&
              imageCache[i][1] === cend &&
              imageCache[i][2] === ppp) {
              return i;
            }
          }
          return null;
        }

        function drawSpectMarkup() {

          // draw moving boundary line if moving
          scope.dhs.drawMovingBoundaryLine(markupCtx);

          // draw current viewport selected
          scope.dhs.drawCurViewPortSelected(markupCtx, false);

        }


        function drawTimeLine(id) {
          var imageData = context.createImageData(canvas0.width, canvas0.height);
          imageData.data.set(imageCache[id][3]);
          context.putImageData(imageData, 0, 0);
        }


        function killSpectroRenderingThread() {
          context.fillStyle = '#222';
          context.fillRect(0, 0, canvas0.width, canvas0.height);
          context.font = (scope.cps.vals.font.fontPxSize + 'px' + ' ' + scope.cps.vals.font.fontType);
          context.fillStyle = '#333';
          context.fillText('loading...', 10, 25);
          if (primeWorker !== null) {
            primeWorker.terminate();
            primeWorker = null;
          }
        }

        function setupEvent() {
          pcmperpixel = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas0.width);
          var imageData = context.createImageData(canvas0.width, canvas0.height);
          primeWorker.addEventListener('message', function (event) {
            if (pcmperpixel === event.data.myStep) {
              imageData.data.set(event.data.img);
              context.putImageData(imageData, 0, 0);
              buildImageCache(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS, pcmperpixel, event.data.img);
              drawSpectMarkup();
            }
          });

        }

        function drawSpectro(buffer) {
          killSpectroRenderingThread();
          //markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
          startSpectroRenderingThread(buffer);
        }

        function startSpectroRenderingThread(buffer) {
          pcmperpixel = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas0.width);
          primeWorker = new Worker(spectroWorker);
          var x = buffer.subarray(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS + (pcmperpixel * 3 * scope.vs.spectroSettings.windowLength));
          var parseData = new Float32Array(x);

          setupEvent();

          primeWorker.postMessage({
            'cmd': 'config',
            'N': scope.vs.spectroSettings.windowLength
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'alpha': alpha
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'freq': scope.vs.spectroSettings.rangeTo
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'freqLow': scope.vs.spectroSettings.rangeFrom
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'start': Math.round(scope.vs.curViewPort.sS)
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'end': Math.round(scope.vs.curViewPort.eS)
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'myStep': pcmperpixel
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'window': scope.vs.spectroSettings.window
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'width': canvas0.width
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'height': canvas0.height
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'dynRangeInDB': scope.vs.spectroSettings.dynamicRange
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'pixelRatio': devicePixelRatio
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'sampleRate': scope.shs.wavJSO.SampleRate
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'streamChannels': scope.shs.wavJSO.NumChannels
          });
          primeWorker.postMessage({
            'cmd': 'pcm',
            'stream': parseData
          });

          primeWorker.postMessage({
            'cmd': 'render'
          });
        }

        function drawCrossHairs(canvas, config, dhs, mouseEvt) {
          if (config.vals.restrictions.drawCrossHairs) {
            markupCtx.clearRect(0, 0, canvas.width, canvas.height);
            markupCtx.strokeStyle = config.vals.colors.crossHairsColor;
            markupCtx.fillStyle = config.vals.colors.crossHairsColor;

            // see if Chrome ->dashed line
            if (navigator.vendor === 'Google Inc.') {
              markupCtx.setLineDash([2]);
            }

            // draw lines
            var mouseX = dhs.getX(mouseEvt);
            var mouseY = dhs.getY(mouseEvt);

            markupCtx.beginPath();
            markupCtx.moveTo(0, mouseY);
            markupCtx.lineTo(5, mouseY + 5);
            markupCtx.moveTo(0, mouseY);
            markupCtx.lineTo(canvas.width, mouseY);
            markupCtx.lineTo(canvas.width - 5, mouseY + 5);
            markupCtx.moveTo(mouseX, 0);
            markupCtx.lineTo(mouseX, canvas.height);
            markupCtx.stroke();
            // draw frequency / sample / time
            markupCtx.font = (config.vals.font.fontPxSize + 'px' + ' ' + config.vals.font.fontType);

            var mouseFreq = scope.vs.round(scope.vs.spectroSettings.rangeTo - mouseY / canvas.height * scope.vs.spectroSettings.rangeTo, 2);

            var tW = markupCtx.measureText(mouseFreq + ' Hz').width;
            var s1 = Math.round(scope.vs.curViewPort.sS + mouseX / canvas.width * (scope.vs.curViewPort.eS - scope.vs.curViewPort.sS));
            var s2 = scope.vs.round(scope.vs.getViewPortStartTime() + mouseX / canvas.width * (scope.vs.getViewPortEndTime() - scope.vs.getViewPortStartTime()), 6);
            var horizontalText = scope.fontImage.getTextImage(context, mouseFreq + ' Hz', config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.crossHairsColor, true);
            var verticalText = scope.fontImage.getTextImageTwoLines(context, s1, s2, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.crossHairsColor, true);

            markupCtx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 5, mouseY, horizontalText.width, horizontalText.height);
            markupCtx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, canvas.width - 5 - tW * (context.canvas.width / context.canvas.offsetWidth), mouseY, horizontalText.width, horizontalText.height);
            markupCtx.drawImage(verticalText, 0, 0, verticalText.width, verticalText.height, mouseX + 5, 0, verticalText.width, verticalText.height);


            if (navigator.vendor === 'Google Inc.') {
              markupCtx.setLineDash([0]);
            }
            drawSpectMarkup();
          }
        }

        clearImageCache();

      }
    };
  });