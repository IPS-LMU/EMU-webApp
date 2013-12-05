'use strict';


angular.module('emulvcApp')
  .directive('spectro', function ($q) {
    return {
      templateUrl: 'views/spectro.html',
      restrict: 'E',
      link: function postLink(scope, element) {
        // select the needed DOM elements from the template
        var canvasLength = element.find('canvas').length;
        var canvas0 = element.find('canvas')[0];
        var canvas1 = element.find('canvas')[canvasLength - 1];
        // var myid = element[0].id;
        // FFT default vars
        var alpha = 0.16; // default alpha for Window Function
        var context = canvas0.getContext('2d');
        var contextmarkup = canvas1.getContext('2d');
        var pcmperpixel = 0;
        window.URL = window.URL || window.webkitURL;
        var devicePixelRatio = window.devicePixelRatio || 1;
        var spectroWorker = 'scripts/workers/spectroWorker.js';
        var primeWorker = new Worker(spectroWorker);
        var imageCache = null;
        var imageCacheCounter = 0;
        var cache;

        // on mouse move
        element.bind('mousemove', function (event) {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              drawCrossHairs(scope.vs, canvas1, scope.config, scope.dhs, event);
            }
          }
        });

        // on mouse leave clear markup canvas
        element.bind('mouseleave', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              contextmarkup.clearRect(0, 0, canvas1.width, canvas1.height);
              drawTimeLineContext();
            }
          }
        });

        scope.$watch('vs.curViewPort', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              redraw();
            }
          }
        }, true);

        scope.$watch('tds.data', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              redraw();
            }
          }
        }, true);

        scope.$watch('vs.movingBoundary', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              redraw();
            }
          }
        }, true);


        scope.$on('newlyLoadedAudioFile', function () {
          console.log('clearing spectro image cache...');
          clearImageCache();
        });

        scope.$on('refreshTimeline', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              redraw();
            }
          }
        });

        scope.$watch('vs.spectroSettings', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              setupEvent();
              clearImageCache();
              drawOsci(scope.vs, scope.shs.wavJSO.Data);
            }
          }
        }, true);

        scope.$watch('vs.scrollOpen', function () {
          if (!$.isEmptyObject(scope.config)) {
            if (!$.isEmptyObject(scope.config.vals)) {
              var per = scope.config.vals.main.osciSpectroZoomFactor * 10;
              var perInvers = 100 - (scope.config.vals.main.osciSpectroZoomFactor * 10);
              if (scope.vs.scrollOpen === 0) {
                $('.OsciDiv').css({
                  height: '50%'
                });
                $('.OsciDiv canvas').css({
                  height: '48%'
                });
                $('.SpectroDiv').css({
                  height: '50%'
                });
                $('.SpectroDiv canvas').css({
                  height: '48%'
                });
              } else if (scope.vs.scrollOpen === 1) {
                $('.OsciDiv').css({
                  height: per + '%'
                });
                $('.OsciDiv canvas').css({
                  height: per + '%'
                });
                $('.SpectroDiv').css({
                  height: perInvers + '%'
                });
                $('.SpectroDiv canvas').css({
                  height: perInvers + '%'
                });
              } else if (scope.vs.scrollOpen === 2) {
                $('.OsciDiv').css({
                  height: perInvers + '%'
                });
                $('.OsciDiv canvas').css({
                  height: perInvers + '%'
                });
                $('.SpectroDiv').css({
                  height: per + '%'
                });
                $('.SpectroDiv canvas').css({
                  height: per + '%'
                });
              }
            }
          }
        }, true);

        function redraw() {
          pcmperpixel = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas0.width);
          cache = cacheHit(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS, pcmperpixel);
          if (cache !== null) {
            contextmarkup.clearRect(0, 0, canvas1.width, canvas1.height);
            drawTimeLine(cache);
            drawTimeLineContext();
          } else {
            drawOsci(scope.vs, scope.shs.wavJSO.Data);
          }
        }

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

        function drawTimeLineContext() {
          // draw boundary moving line
          if (scope.vs.movingBoundary) {
            contextmarkup.fillStyle = scope.config.vals.colors.selectedBoundaryColor;
            var tD = scope.vs.getcurMouseTierDetails();
            var p = Math.round(scope.vs.getPos(contextmarkup.canvas.width, tD.events[scope.vs.getcurMouseSegmentId()].startSample));
            contextmarkup.fillRect(p, 0, 1, contextmarkup.canvas.height);
          }

          contextmarkup.clearRect(0, 0, canvas0.width, canvas0.height);
          var posS = scope.vs.getPos(canvas0.width, scope.vs.curViewPort.selectS);
          var posE = scope.vs.getPos(canvas0.width, scope.vs.curViewPort.selectE);
          var sDist = scope.vs.getSampleDist(canvas0.width);
          var xOffset;
          if (scope.vs.curViewPort.selectS === scope.vs.curViewPort.selectE) {
            // calc. offset dependant on type of tier of mousemove  -> default is sample exact
            if (scope.vs.curMouseMoveTierType === 'seg') {
              xOffset = 0;
            } else {
              xOffset = (sDist / 2);
            }
            contextmarkup.fillStyle = scope.config.vals.colors.selectedBorderColor;
            contextmarkup.fillRect(posS + xOffset, 0, 1, canvas0.height);
          } else {
            contextmarkup.fillStyle = scope.config.vals.colors.selectedAreaColor;
            contextmarkup.fillRect(posS, 0, posE - posS, canvas0.height);
            contextmarkup.strokeStyle = scope.config.vals.colors.selectedBorderColor;
            contextmarkup.beginPath();
            contextmarkup.moveTo(posS, 0);
            contextmarkup.lineTo(posS, canvas0.height);
            contextmarkup.moveTo(posE, 0);
            contextmarkup.lineTo(posE, canvas0.height);
            contextmarkup.closePath();
            contextmarkup.stroke();
            contextmarkup.fillStyle = canvas0.labelColor;
          } 
        }



        function drawTimeLine(id) {
          var image = new Image();
          image.onload = function () {
            scope.$apply(function() {
              context.drawImage(image, 0, 0);
              //drawTimeLineContext(); 
            });
          };
          image.src = imageCache[id][3];
        }


        function killSpectroRenderingThread() {
          context.fillStyle = '#222';
          context.fillRect(0, 0, canvas0.width, canvas0.height);
          context.font = (scope.config.vals.font.fontPxSize + 'px' + ' ' + scope.config.vals.font.fontType);
          context.fillStyle = '#333';
          context.fillText('loading...', 10, 25);
          if (primeWorker !== null) {
            primeWorker.terminate();
            primeWorker = null;
          }
        }

        function setupEvent() {
          //var deferred = $q.defer();
          
          var myImage = new Image();
          pcmperpixel = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas0.width);
          primeWorker.addEventListener('message', function (event) {
            var workerImg = event.data.img;
            myImage.onload = function () {
              scope.$apply(function() {
                if(pcmperpixel==event.data.myStep) {
                  context.drawImage(myImage, 0, 0, canvas0.width, canvas0.height, 0, 0, canvas0.width, canvas0.height);
                  buildImageCache(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS, pcmperpixel, canvas0.toDataURL('image/png'));
                  drawTimeLineContext();
                }      
               });
            };
            myImage.src = workerImg;
          });

        }

        function drawOsci(viewState, buffer) {
          killSpectroRenderingThread();
          //contextmarkup.clearRect(0, 0, canvas1.width, canvas1.height);
          startSpectroRenderingThread(viewState, buffer);
        }

        function startSpectroRenderingThread(viewState, buffer) {
          pcmperpixel = Math.round((viewState.curViewPort.eS - viewState.curViewPort.sS) / canvas0.width);
          primeWorker = new Worker(spectroWorker);
          var x = buffer.subarray(viewState.curViewPort.sS, viewState.curViewPort.eS + (pcmperpixel * 3 * viewState.spectroSettings.windowLength));
          var parseData = new Float32Array(x);
          
          setupEvent();
          
          primeWorker.postMessage({
            'cmd': 'config',
            'N': viewState.spectroSettings.windowLength
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'alpha': alpha
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'freq': viewState.spectroSettings.rangeTo
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'freqLow': viewState.spectroSettings.rangeFrom
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'start': Math.round(viewState.curViewPort.sS)
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'end': Math.round(viewState.curViewPort.eS)
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'myStep': pcmperpixel
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'window': viewState.spectroSettings.window
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'cacheSide': 0
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
            'cacheWidth': 0
          });
          primeWorker.postMessage({
            'cmd': 'config',
            'dynRangeInDB': viewState.spectroSettings.dynamicRange
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

        function drawCrossHairs(viewState, canvas, config, dhs, mouseEvt) {
          if (config.vals.restrictions.drawCrossHairs) {
            contextmarkup.clearRect(0, 0, canvas.width, canvas.height);
            contextmarkup.strokeStyle = config.vals.colors.crossHairsColor;
            contextmarkup.fillStyle = config.vals.colors.crossHairsColor;

            // see if Chrome ->dashed line
            if (navigator.vendor === 'Google Inc.') {
              contextmarkup.setLineDash([2]);
            }

            // draw lines
            var mouseX = dhs.getX(mouseEvt);
            var mouseY = dhs.getY(mouseEvt);

            contextmarkup.beginPath();
            contextmarkup.moveTo(0, mouseY);
            contextmarkup.lineTo(5, mouseY + 5);
            contextmarkup.moveTo(0, mouseY);
            contextmarkup.lineTo(canvas.width, mouseY);
            contextmarkup.lineTo(canvas.width - 5, mouseY + 5);
            contextmarkup.moveTo(mouseX, 0);
            contextmarkup.lineTo(mouseX, canvas.height);
            contextmarkup.stroke();
            // draw frequency / sample / time
            contextmarkup.font = (config.vals.font.fontPxSize + 'px' + ' ' + config.vals.font.fontType);

            var mouseFreq = viewState.round(viewState.spectroSettings.rangeTo - mouseY / canvas.height * viewState.spectroSettings.rangeTo, 2);

            var tW = contextmarkup.measureText(mouseFreq + ' Hz').width;
            var s1 = Math.round(viewState.curViewPort.sS + mouseX / canvas.width * (viewState.curViewPort.eS - viewState.curViewPort.sS));
            var s2 = viewState.round(viewState.getViewPortStartTime() + mouseX / canvas.width * (viewState.getViewPortEndTime() - viewState.getViewPortStartTime()), 6);
            var horizontalText = scope.fontImage.getTextImage(context, mouseFreq + ' Hz', config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.crossHairsColor, true);
            var verticalText = scope.fontImage.getTextImageTwoLines(context, s1, s2, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.crossHairsColor, false);

            contextmarkup.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 5, mouseY, horizontalText.width, horizontalText.height);
            contextmarkup.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, canvas.width - 5 - tW * (context.canvas.width / context.canvas.offsetWidth), mouseY, horizontalText.width, horizontalText.height);
            contextmarkup.drawImage(verticalText, 0, 0, verticalText.width, verticalText.height, mouseX + 5, 0, verticalText.width, verticalText.height);


            if (navigator.vendor === 'Google Inc.') {
              contextmarkup.setLineDash([0]);
            }
            drawTimeLineContext();
          }
        }

        clearImageCache();

      }
    };
  });