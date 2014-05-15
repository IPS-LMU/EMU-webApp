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



        ///////////////
        // watches

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

        scope.$watch('vs.movingBoundarySample', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
              drawSpectMarkup();
            }
          }
        }, true);

        scope.$watch('vs.movingBoundary', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              scope.redraw();
            }
          }
        }, true);



        scope.$watch('vs.spectroSettings', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              setupEvent();
              clearImageCache();
              scope.redraw();
              //console.log(scope.shs.wavJSO);
              //drawSpectro(scope.vs, scope.shs.wavJSO.Data);
            }
          }
        }, true);

        ///////////////
        // bindings

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

        scope.redraw = function () {
          pcmperpixel = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas0.width);
          cache = cacheHit(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS, pcmperpixel);
          if (cache !== null) {
            markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
            drawTimeLine(cache);
            drawSpectMarkup();
          } else {
            markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
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

          // draw min max vals and name of track
          scope.dhs.drawMinMaxAndName(markupCtx, '', scope.vs.spectroSettings.rangeFrom, scope.vs.spectroSettings.rangeTo, 2);
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

        clearImageCache();

      }
    };
  });