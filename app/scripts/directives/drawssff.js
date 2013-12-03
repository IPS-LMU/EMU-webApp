'use strict';

angular.module('emulvcApp')
  .directive('drawssff', function() {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var canvas = element[0];

        //watch viewPort change
        scope.$watch('vs.curViewPort', function(newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        //watch vs.curPreselColumnSample change
        scope.$watch('vs.curPreselColumnSample', function(newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        //watch vs.curCorrectionToolNr change
        scope.$watch('vs.curCorrectionToolNr', function(newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        // watch ssffds.data change
        scope.$watch('ssffds.data', function(newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        // watch viewState.spectroSettings change
        scope.$watch('viewState.spectroSettings', function(newValue, oldValue) {
          handleUpdate(newValue, oldValue);
        }, true);

        /**
         *
         */
        function handleUpdate(newValue, oldValue) {
          if (!$.isEmptyObject(scope.ssffds.data)) {
            if (scope.ssffds.data.length !== 0) {
              var extAndCol = scope.config.vals.signalsCanvasConfig.assign.spec.split(':');
              //TODO get file:

              // get name of column to be drawn
              var colName = extAndCol[1]; // find according field in scope.ssffds.data
              var col = findColumn(scope.ssffds.data, colName);
              // draw values  
              drawValues(scope.vs, canvas, scope.config, col);
              // console.log(scope.config);
            }
          }
        };

        /**
         * find a certain column in ssffds.data array
         * and append meta data of file to that col
         * for drawing
         */
        function findColumn(data, colName) {
          // console.log(scope.ssffds.data);
          var col;
          data.forEach(function(fileRep, fileRepIdx) {
            fileRep.Columns.forEach(function(colRep, colIdx) {
              if (colRep.name == colName) {
                col = colRep;
                col.sampleRate = fileRep.sampleRate;
                col.startTime = fileRep.startTime;
              }
            });
          });
          return col;
        }

        /**
         * draw values onto canvas
         */

        function drawValues(viewState, canvas, config, col) {
          var ctx = canvas.getContext('2d');
          // create a destination canvas. Here the altered image will be placed

          // ctx.fillStyle = "rgba(" + transparentColor.r + ", " + transparentColor.g + ", " + transparentColor.b + ", 1.0)";
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // hardcode min max display for now
          var minVal = viewState.spectroSettings.rangeFrom;
          var maxVal = viewState.spectroSettings.rangeTo; //Hz in the case of formants

          var startTimeVP = viewState.getViewPortStartTime();
          var endTimeVP = viewState.getViewPortEndTime();


          var colStartSampleNr = Math.round(startTimeVP * col.sampleRate + col.startTime);
          var colEndSampleNr = Math.round(endTimeVP * col.sampleRate + col.startTime);

          var nrOfSamples = colEndSampleNr - colStartSampleNr;


          var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);

          if (nrOfSamples < canvas.width && nrOfSamples >= 2) {

            var x, y, prevX, prevY, curSampleInCol, curSampleInColTime;

            curSampleArrs.forEach(function(valRep, valIdx) {
              valRep.forEach(function(val, idx) {
                if (idx >= scope.config.vals.signalsCanvasConfig.contourLims.fm.min && idx <= scope.config.vals.signalsCanvasConfig.contourLims.fm.max) { // SIC fm hardcoded
                  curSampleInCol = colStartSampleNr + valIdx;
                  curSampleInColTime = (1 / col.sampleRate * curSampleInCol) + col.startTime;

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
                    curSampleInColTime = (1 / col.sampleRate * curSampleInCol) + col.startTime;

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
                        curSampleInColTime = (1 / col.sampleRate * curSampleInCol) + col.startTime;

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
                      curSampleInColTime = (1 / col.sampleRate * curSampleInCol) + col.startTime;

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