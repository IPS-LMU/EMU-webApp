'use strict';

angular.module('emuwebApp')
  .directive('drawssff', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, atts) {
        var canvas = element[0];
        var trackName;

        // observe attribute
        atts.$observe('ssffTrackname', function (val) {
          trackName = val;
        });

        //watch viewPort change
        scope.$watch('vs.curViewPort', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        //watch perspective change
        scope.$watch('vs.curPerspectiveIdx', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        //watch vs.curPreselColumnSample change
        scope.$watch('vs.curPreselColumnSample', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        //watch vs.curCorrectionToolNr change
        scope.$watch('vs.curCorrectionToolNr', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        // watch ssffds.data change
        scope.$watch('ssffds.data', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        // watch viewState.spectroSettings change
        scope.$watch('viewState.spectroSettings', function (newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        /**
         *
         */
        function handleUpdate() {
          if (!$.isEmptyObject(scope.ssffds.data)) {
            if (scope.ssffds.data.length !== 0) {

              scope.config.vals.perspectives[scope.vs.curPerspectiveIdx].signalCanvases.assign.forEach(function (ass) {
                if (Object.keys(ass)[0] === trackName) {
                  var tr = scope.config.getSsffTrackConfig(ass[Object.keys(ass)[0]]);
                  var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
                  var sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);
                  
                  var minMaxLims = scope.config.getLimsOfTrack(tr.name);
                  
                  // draw values  
                  drawValues(scope.vs, canvas, scope.config, col, sRaSt.sampleRate, sRaSt.startTime, minMaxLims);
                }
              });
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
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // hardcode min max display for now
          var minVal = viewState.spectroSettings.rangeFrom;
          var maxVal = viewState.spectroSettings.rangeTo; //Hz in the case of formants

          var startTimeVP = viewState.getViewPortStartTime();
          var endTimeVP = viewState.getViewPortEndTime();


          var colStartSampleNr = Math.round(startTimeVP * sR + sT);
          var colEndSampleNr = Math.round(endTimeVP * sR + sT);

          var nrOfSamples = colEndSampleNr - colStartSampleNr;


          var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);

          if (nrOfSamples < canvas.width && nrOfSamples >= 2) {

            var x, y, prevX, prevY, curSampleInCol, curSampleInColTime;

            curSampleArrs.forEach(function (valRep, valIdx) {
              valRep.forEach(function (val, idx) {
                if ($.isEmptyObject(minMaxLims) || (idx >= minMaxLims.min && idx <= minMaxLims.max)) {
                  curSampleInCol = colStartSampleNr + valIdx;
                  curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                  x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                  y = canvas.height - ((val - minVal) / (maxVal - minVal) * canvas.height);

                  // mark selected
                  if (valIdx === viewState.curPreselColumnSample && viewState.curCorrectionToolNr - 1 === idx) {
                    ctx.strokeStyle = 'white';
                    ctx.fillStyle = 'white';
                  } else {
                    ctx.strokeStyle = 'hsl(' + idx * (360 / valRep.length) + ',80%, 50%)';
                    ctx.fillStyle = 'hsl(' + idx * (360 / valRep.length) + ',80%, 50%)';
                  }


                  // draw dot
                  ctx.beginPath();
                  ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
                  ctx.closePath();
                  ctx.stroke();
                  ctx.fill();

                  if (valIdx !== 0) {
                    curSampleInCol = colStartSampleNr + valIdx - 1;
                    curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                    prevX = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                    prevY = canvas.height - ((curSampleArrs[valIdx - 1][idx] - minVal) / (maxVal - minVal) * canvas.height);


                    // mark selected
                    if (viewState.curCorrectionToolNr - 1 === idx) {
                      ctx.strokeStyle = 'white';
                      ctx.fillStyle = 'white';
                    }

                    // draw line
                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.fill();

                    //check if last sample
                    if (valIdx === curSampleArrs.length - 1) {
                      if (colEndSampleNr !== col.values.length - 1) {
                        // lines to right boarder samples not in view
                        var rightBorder = col.values[colEndSampleNr + 1];
                        val = rightBorder[idx];

                        curSampleInCol = colEndSampleNr + 1;
                        curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                        var nextX = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                        var nextY = canvas.height - ((val - minVal) / (maxVal - minVal) * canvas.height);

                        // draw line
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(nextX, nextY);
                        ctx.stroke();
                        ctx.fill();
                      }
                    }
                  } else {
                    // lines to left boarder samples not in view
                    if (colStartSampleNr !== 0) {
                      var leftBorder = col.values[colStartSampleNr - 1];
                      val = leftBorder[idx];

                      curSampleInCol = colStartSampleNr - 1;
                      curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                      prevX = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                      prevY = canvas.height - ((val - minVal) / (maxVal - minVal) * canvas.height);

                      // mark selected
                      if (viewState.curCorrectionToolNr - 1 === idx) {
                        ctx.strokeStyle = 'white';
                        ctx.fillStyle = 'white';
                      }

                      // draw line
                      ctx.beginPath();
                      ctx.moveTo(prevX, prevY);
                      ctx.lineTo(x, y);
                      ctx.stroke();
                      ctx.fill();
                    }
                  }
                }
              });


            });

          } else {
            ctx.strokeStyle = 'red';
            var txt;
            var tW;
            if (nrOfSamples <= 2) {
              txt = 'Zoom out to see contour(s)';
              tW = ctx.measureText(txt).width;
              ctx.strokeText(txt, canvas.width / 2 - tW / 2, canvas.height / 2);
            } else {
              txt = 'Zoom in to see contour(s)';
              tW = ctx.measureText(txt).width;
              ctx.strokeText(txt, canvas.width / 2 - tW / 2, canvas.height / 2);

            }
          }
        } //function
      }
    };
  });