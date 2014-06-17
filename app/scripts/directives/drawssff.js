'use strict';

angular.module('emuwebApp')
  .directive('drawssff', function (viewState, ConfigProviderService, Ssffdataservice, HistoryService) {
    return {
      restrict: 'A',
      scope: {},
      link: function postLink(scope, element, atts) {
        var canvas = element[0];
        var trackName;
        var assTrackName = '';

        var lastDraw = Date.now();

        // add watch vars to scope
        scope.vs = viewState;
        scope.hists = HistoryService;
        scope.ssffds = Ssffdataservice;

        ////////////////////
        // observes

        // observe attribute
        atts.$observe('ssffTrackname', function (val) {
          trackName = val;
        });

        ////////////////////
        // watches

        //watch viewPort change
        scope.$watch('vs.curViewPort', function (newValue, oldValue) {
          if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
            handleUpdate(newValue, oldValue);
          }
        }, true);

        //watch perspective change
        scope.$watch('vs.curPerspectiveIdx', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        //watch vs.curCorrectionToolNr change
        scope.$watch('vs.curCorrectionToolNr', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        //watch hists.
        scope.$watch('hists.movesAwayFromLastSave', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);


        // watch ssffds.data change
        scope.$watch('ssffds.data.length', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        // watch vs.spectroSettings change
        scope.$watch('vs.spectroSettings', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        //
        //////////////////////

        /**
         *
         */
        function handleUpdate() {
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (!$.isEmptyObject(Ssffdataservice.data)) {
            if (Ssffdataservice.data.length !== 0) {
              assTrackName = '';
              // check assignments (= overlays)
              ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign.forEach(function (ass, i) {
                if (ass.signalCanvasName === trackName) {
                  assTrackName = ass.ssffTrackName;
                  var tr = ConfigProviderService.getSsffTrackConfig(ass.ssffTrackName);
                  var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
                  var sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);
                  var minMaxLims = ConfigProviderService.getLimsOfTrack(tr.name);
                  // draw values  
                  drawValues(viewState, canvas, ConfigProviderService, col, sRaSt.sampleRate, sRaSt.startTime, minMaxLims);
                }
              });
              assTrackName = '';
              // draw ssffTrack onto own canvas
              if (trackName !== 'OSCI' && trackName !== 'SPEC') {
                // console.log('#######here')
                // console.log(trackName)
                var tr = ConfigProviderService.getSsffTrackConfig(trackName);
                var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
                var sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);

                var minMaxLims = ConfigProviderService.getLimsOfTrack(tr.name);
                // draw values  
                drawValues(viewState, canvas, ConfigProviderService, col, sRaSt.sampleRate, sRaSt.startTime, minMaxLims);
              }
            }
          } else {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }

        /**
         * draw values onto canvas
         */

        function drawValues(viewState, canvas, config, col, sR, sT, minMaxLims) {

          var ctx = canvas.getContext('2d');
          // create a destination canvas. Here the altered image will be placed

          // ctx.fillStyle = "rgba(" + transparentColor.r + ", " + transparentColor.g + ", " + transparentColor.b + ", 1.0)";
          // ctx.clearRect(0, 0, canvas.width, canvas.height);

          var minVal, maxVal;

          if (trackName === 'SPEC' && assTrackName === 'FORMANTS') {
            minVal = viewState.spectroSettings.rangeFrom;
            maxVal = viewState.spectroSettings.rangeTo;
          } else {
            minVal = col._minVal;
            maxVal = col._maxVal;
          }

          var startTimeVP = viewState.getViewPortStartTime();
          var endTimeVP = viewState.getViewPortEndTime();


          var colStartSampleNr = Math.round(startTimeVP * sR + sT);
          var colEndSampleNr = Math.round(endTimeVP * sR + sT);

          var nrOfSamples = colEndSampleNr - colStartSampleNr;

          // console.log('###################################');
          // console.log(col.name);
          // console.log(startTimeVP);
          // console.log(endTimeVP);


          var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);

          if (nrOfSamples < canvas.width && nrOfSamples >= 2) {

            var x, y, prevX, prevY, prevVal, curSampleInCol, curSampleInColTime;
            
            ////////////////////////////////
            // NEW VERSION
            ////////////////////////////////

            angular.forEach(curSampleArrs[0], function (contourVal, contourNr) {
              // console.log(contourNr);
              if ($.isEmptyObject(minMaxLims) || (contourNr >= minMaxLims.min && contourNr <= minMaxLims.max)) {
                // set color
                if ($.isEmptyObject(minMaxLims)) {
                  ctx.strokeStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
                  ctx.fillStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
                } else {
                  var l = (minMaxLims.max - minMaxLims.min) + 1;
                  ctx.strokeStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
                  ctx.fillStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
                }

                // mark selected
                // console.log(viewState.curCorrectionToolNr);
                if (viewState.curCorrectionToolNr - 1 === contourNr && trackName === 'SPEC' && assTrackName === 'FORMANTS') {
                  ctx.strokeStyle = 'white';
                  ctx.fillStyle = 'white';
                }

                ctx.beginPath();
                // first line from sample not in view (left)
                if (colStartSampleNr >= 1) {
                  var leftBorder = col.values[colStartSampleNr - 1];
                  var leftVal = leftBorder[contourNr];

                  curSampleInCol = colStartSampleNr - 1;
                  curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                  x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                  y = canvas.height - ((leftVal - minVal) / (maxVal - minVal) * canvas.height);

                  ctx.moveTo(x, y);
                }

                angular.forEach(curSampleArrs, function (curArr, curArrIdx) {
                  // console.log(curArr[contourNr]);

                  curSampleInCol = colStartSampleNr + curArrIdx;
                  curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                  x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                  y = canvas.height - ((curArr[contourNr] - minVal) / (maxVal - minVal) * canvas.height);

                  ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
                  ctx.lineTo(x, y);

                });
                // last line from sample not in view (right)
                if (colEndSampleNr < col.values.length - 1) {
                  var rightBorder = col.values[colEndSampleNr + 1];
                  var rightVal = rightBorder[contourNr];

                  curSampleInCol = colEndSampleNr + 1;
                  curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                  x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                  y = canvas.height - ((rightVal - minVal) / (maxVal - minVal) * canvas.height);

                  ctx.lineTo(x, y);
                }

                ctx.stroke();
                // ctx.fill();
              }
            });


            ////////////////////////////////
            // OLD VERSION
            ////////////////////////////////

            // curSampleArrs.forEach(function (valRep, valIdx) {
            //   valRep.forEach(function (val, idx) {
            //     if ($.isEmptyObject(minMaxLims) || (idx >= minMaxLims.min && idx <= minMaxLims.max)) {
            //       curSampleInCol = colStartSampleNr + valIdx;
            //       curSampleInColTime = (1 / sR * curSampleInCol) + sT;

            //       x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
            //       y = canvas.height - ((val - minVal) / (maxVal - minVal) * canvas.height);

            //       // set color
            //       if ($.isEmptyObject(minMaxLims)) {
            //         ctx.strokeStyle = 'hsl(' + idx * (360 / valRep.length) + ',80%, 50%)';
            //         ctx.fillStyle = 'hsl(' + idx * (360 / valRep.length) + ',80%, 50%)';
            //       } else {
            //         var l = (minMaxLims.max - minMaxLims.min) + 1;
            //         ctx.strokeStyle = 'hsl(' + idx * (360 / l) + ',80%, 50%)';
            //         ctx.fillStyle = 'hsl(' + idx * (360 / l) + ',80%, 50%)';
            //       }


            //       // draw dot
            //       // if (val !== null) {
            //       //   ctx.beginPath();
            //       //   ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
            //       //   ctx.closePath();
            //       //   ctx.stroke();
            //       //   ctx.fill();
            //       // }

            //       if (valIdx !== 0) {
            //         curSampleInCol = colStartSampleNr + valIdx - 1;
            //         curSampleInColTime = (1 / sR * curSampleInCol) + sT;

            //         prevX = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
            //         prevY = canvas.height - ((curSampleArrs[valIdx - 1][idx] - minVal) / (maxVal - minVal) * canvas.height);

            //         // mark selected
            //         if (viewState.curCorrectionToolNr - 1 === idx && trackName === 'SPEC' && assTrackName === 'FORMANTS') {
            //           ctx.strokeStyle = 'white';
            //           ctx.fillStyle = 'white';
            //         }

            //         // draw line
            //         if (val !== null && prevVal !== null) {
            //           ctx.beginPath();
            //           ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
            //           ctx.moveTo(prevX, prevY);
            //           ctx.lineTo(x, y);
            //           ctx.stroke();
            //           ctx.fill();
            //         }

            //         prevVal = val;

            //         //check if last sample
            //         if (valIdx === curSampleArrs.length - 1) {
            //           if (colEndSampleNr !== col.values.length - 1) {
            //             // lines to right boarder samples not in view
            //             var rightBorder = col.values[colEndSampleNr + 1];
            //             val = rightBorder[idx];

            //             curSampleInCol = colEndSampleNr + 1;
            //             curSampleInColTime = (1 / sR * curSampleInCol) + sT;

            //             var nextX = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
            //             var nextY = canvas.height - ((val - minVal) / (maxVal - minVal) * canvas.height);

            //             // draw line
            //             ctx.beginPath();
            //             ctx.moveTo(x, y);
            //             ctx.lineTo(nextX, nextY);
            //             ctx.stroke();
            //             ctx.fill();
            //           }
            //         }
            //       } else {
            //         // lines to left boarder samples not in view
            //         if (colStartSampleNr !== 0) {
            //           var leftBorder = col.values[colStartSampleNr - 1];
            //           val = leftBorder[idx];

            //           curSampleInCol = colStartSampleNr - 1;
            //           curSampleInColTime = (1 / sR * curSampleInCol) + sT;

            //           prevX = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
            //           prevY = canvas.height - ((val - minVal) / (maxVal - minVal) * canvas.height);

            //           // mark selected
            //           if (viewState.curCorrectionToolNr - 1 === idx && trackName === 'SPEC' && assTrackName === 'FORMANTS') {
            //             ctx.strokeStyle = 'white';
            //             ctx.fillStyle = 'white';
            //           }

            //           // draw line
            //           ctx.beginPath();
            //           ctx.moveTo(prevX, prevY);
            //           ctx.lineTo(x, y);
            //           ctx.stroke();
            //           ctx.fill();
            //         }
            //       }
            //     }
            //   });
            // });

          } else {
            ctx.strokeStyle = 'red';
            var txt;
            var tW;
            if (nrOfSamples <= 2) {
              var horizontalText = scope.$parent.fontImage.getTextImageTwoLines(ctx, 'Zoom out to', 'see contour(s)', ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, 'red');
              ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, canvas.width / 2 - horizontalText.width / 2, 25, horizontalText.width, horizontalText.height);
            } else {
              txt = 'Zoom in to see contour(s)';
              var horizontalText = scope.$parent.fontImage.getTextImageTwoLines(ctx, 'Zoom in to', 'see contour(s)', ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, 'red');
              ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, canvas.width / 2 - horizontalText.width / 2, 25, horizontalText.width, horizontalText.height);
            }
          }
        } //function
      }
    };
  });