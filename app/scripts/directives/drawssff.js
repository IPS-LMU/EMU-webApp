'use strict';

angular.module('emulvcApp')
  .directive('drawssff', function() {
    return {
      restrict: 'A',
      // template: '<h2>howdy</h2>',
      link: function postLink(scope, element, attrs) {
        var canvas = element[0];
        
        var transparentColor = [];
        transparentColor.r = "255";
        transparentColor.g = "0";
        transparentColor.b = "0";        

        scope.$watch('vs.curViewPort', function(newValue, oldValue) {
          if (scope.ssffData.length !== 0) {
            // get name of column to be drawn
            var colName = "fm"; //SIC hardcoded
            // find according field in scope.ssffData
            var col = findColumn(scope.ssffData, colName);
            // draw values  
            drawValues(scope.vs, canvas, scope.cps, col);
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

        function drawValues(viewState, canvas, cps, col) {
          var ctx = canvas.getContext("2d");
          // create a destination canvas. Here the altered image will be placed
          
          ctx.fillStyle="rgba("+transparentColor.r+", "+transparentColor.g+", "+transparentColor.b+", 1.0)";
          ctx.fillRect(0,0,canvas.width,canvas.height);

          // hardcode min max display for now
          var minVal = 0;
          var maxVal = 8000; //Hz in the case of formants

          var startTimeVP = viewState.getStartTime();
          var endTimeVP = viewState.getEndTime();

          var colStartSampleNr = Math.round((startTimeVP + col.startTime) * col.sampleRate); // CHECK
          var colEndSampleNr = Math.round((endTimeVP + col.startTime) * col.sampleRate); //CHECK

          var nrOfSamples = colEndSampleNr - colStartSampleNr;

          if (nrOfSamples < canvas.width) {
            console.log("over sample exact ssff drawing");
          }

          var x, y, prevX, prevY;

          col.values.forEach(function(valRep, valIdx) {
            valRep.forEach(function(val, idx) {
              if (valIdx !== 0) {
                prevX = (valIdx - 1) * canvas.width / nrOfSamples;
                prevY = canvas.height - ((col.values[valIdx - 1][idx] - minVal) / (maxVal - minVal) * canvas.height);

                x = valIdx * canvas.width / nrOfSamples;
                y = canvas.height - ((val - minVal) / (maxVal - minVal) * canvas.height);

                ctx.strokeStyle = cps.hsv2rgb(idx * (360 / valRep.length), 1, 0.8);

                ctx.fillStyle = cps.hsv2rgb(idx * (360 / valRep.length), 1, 0.8);
                // draw line
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.stroke();

                // draw dot
                ctx.beginPath();
                ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
                ctx.stroke();
                ctx.fill();
              }
            });
          });
          
              // read pixels from source
    var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // iterate through pixel data (1 pixels consists of 4 ints in the array)
    for(var i = 0, len = pixels.data.length; i < len; i += 4){
        var r = pixels.data[i];
        var g = pixels.data[i+1];
        var b = pixels.data[i+2];

        // if the pixel matches our transparent color, set alpha to 0
        if(r == transparentColor.r && g == transparentColor.g && b == transparentColor.b){
            pixels.data[i+3] = 0;
        }
    }

    // write pixel data to destination context
    ctx.putImageData(pixels,0,0);
          
        }
      }
    };
  });