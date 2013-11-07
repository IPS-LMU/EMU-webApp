'use strict';

angular.module('emulvcApp')
  .directive('drawssff', function() {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var canvas = element[0];

        // var transparentColor = [];
        // transparentColor.r = '0';
        // transparentColor.g = '0';
        // transparentColor.b = '0';

        //watch viewPort change
        scope.$watch('vs.curViewPort', function(newValue, oldValue) {
          if (scope.ssffData.length !== 0 && !scope.vs.loadingUtt) {
            if (oldValue.sS != newValue.sS || oldValue.eS != newValue.eS) {
              // get name of column to be drawn
              var colName = 'fm'; //SIC hardcoded
              // find according field in scope.ssffData
              var col = findColumn(scope.ssffData, colName);
              // draw values  
              drawValues(scope.vs, canvas, scope.config, col);
            }
          }
        }, true);

        scope.$watch('vs.curPreselColumnSample', function(newValue, oldValue) {
          if (scope.ssffData.length !== 0) {
            // get name of column to be drawn
            var colName = 'fm'; //SIC hardcoded
            // find according field in scope.ssffData
            var col = findColumn(scope.ssffData, colName);
            // draw values  
            drawValues(scope.vs, canvas, scope.config, col);
          }
        }, true);

        scope.$watch('vs.curCorrectionToolNr', function(newValue, oldValue) {
          if (scope.ssffData.length !== 0) {
            // get name of column to be drawn
            var colName = 'fm'; //SIC hardcoded
            // find according field in scope.ssffData
            var col = findColumn(scope.ssffData, colName);
            // draw values  
            drawValues(scope.vs, canvas, scope.config, col);
          }
        }, true);


        scope.$watch('ssffData', function(newValue, oldValue) {
          if (scope.ssffData.length !== 0) {
            // get name of column to be drawn
            var colName = 'fm'; //SIC hardcoded
            // find according field in scope.ssffData
            var col = findColumn(scope.ssffData, colName);
            // draw values  
            drawValues(scope.vs, canvas, scope.config, col);
            console.log(scope.config);
          }
        }, true);

        /**
         * find a certain column in ssffData array
         * and append meta data of file to that col
         * for drawing
         */

        function findColumn(ssffData, colName) {
          // console.log(scope.ssffData);
          var col;
          ssffData.forEach(function(fileRep, fileRepIdx) {
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
          
          console.log(config.vals.spectrogramSettings);
          // hardcode min max display for now
          var minVal = config.vals.spectrogramSettings.rangeFrom;
          var maxVal = config.vals.spectrogramSettings.rangeTo; //Hz in the case of formants

          var startTimeVP = viewState.getViewPortStartTime();
          var endTimeVP = viewState.getViewPortEndTime();
          
          

          var colStartSampleNr = Math.round((startTimeVP + col.startTime) * col.sampleRate);
          var colEndSampleNr = Math.round((endTimeVP + col.startTime) * col.sampleRate);

          var nrOfSamples = colEndSampleNr - colStartSampleNr;
          

          var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);

          if (nrOfSamples < canvas.width) {
            //console.log("over sample exact ssff drawing");
            // }//if

            var x, y, prevX, prevY, curSampleInCol, curSampleInColTime;

            curSampleArrs.forEach(function(valRep, valIdx) {
              valRep.forEach(function(val, idx) {

                curSampleInCol = colStartSampleNr + valIdx;
                curSampleInColTime = (1 / col.sampleRate * curSampleInCol) + col.startTime;

                x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                y = canvas.height - ((val - minVal) / (maxVal - minVal) * canvas.height);



                // mark selected11
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
                }
              });


            });
          } else {
            ctx.strokeStyle = 'white';
            ctx.strokeText('Zoom in to see contour', 10, 10);
          }
        } //function
      }
    };
  });