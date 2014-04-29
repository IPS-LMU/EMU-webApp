'use strict';

angular.module('emuwebApp')
  .directive('ssffTrack', function (ConfigProviderService, viewState) {
    return {
      templateUrl: 'views/ssffTrack.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        // select the needed DOM elements from the template
        var canvasLength = element.find('canvas').length;
        var ssffCanvas = element.find('canvas')[1];
        var markupCanvas = element.find('canvas')[canvasLength - 1];
        // var context = canvas0.getContext('2d');
        var markupCtx = markupCanvas.getContext('2d');

        var trackName;

        attrs.$observe('trackName', function (val) {
          if (val) {
            trackName = val;
          }
        });


        scope.order = attrs.order;

        scope.enlargeCanvas = {
          'height': 100 / ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length + '%'
        };

        scope.$watch('vs.curPerspectiveIdx', function () {
          scope.updateCSS();
        }, true);
        
        
        scope.redraw = function () {
          drawSsffTrackMarkup(true);
          scope.updateCSS();
        };
        

        scope.$watch('vs.curViewPort', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              drawSsffTrackMarkup(true);
              scope.updateCSS();
            }
          }
        }, true);

        scope.$watch('ssffds.data.length', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              drawSsffTrackMarkup(true);
              scope.updateCSS();
            }
          }
        }, true);

        /**
         *
         */
        scope.updateCSS = function () {
          var parts = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length;
          if (viewState.getenlarge() === -1) {
            scope.enlargeCanvas = {
              'height': 100 / parts + '%'
            };
          } else {
            if (viewState.getenlarge() === scope.order) {
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

        /**
         *
         */
        function drawSsffTrackMarkup() {
          if (!$.isEmptyObject(scope.ssffds.data)) {
            if (scope.ssffds.data.length !== 0) {

              markupCtx.clearRect(0, 0, markupCtx.canvas.width, markupCtx.canvas.height);

              // draw moving boundary line if moving
              scope.dhs.drawMovingBoundaryLine(markupCtx);

              // draw current viewport selected
              scope.dhs.drawCurViewPortSelected(markupCtx, false);

              // draw min max an name of track
              var tr = scope.cps.getSsffTrackConfig(trackName);
              var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
              scope.dhs.drawMinMaxAndName(markupCtx, trackName, col._minVal, col._maxVal, 2);
            }
          }

          //   markupCtx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
          //   // draw moving boundary line if moving
          //   scope.dhs.drawMovingBoundaryLine(markupCtx);

          //   // draw current viewport selected
          //   scope.dhs.drawCurViewPortSelected(markupCtx, false);

          //   // var scaleX = markupCtx.canvas.width / markupCtx.canvas.offsetWidth;
          //   var scaleY = markupCtx.canvas.height / markupCtx.canvas.offsetHeight;

          //   var smallFontSize = scope.cps.vals.font.fontPxSize * 3 / 4;
          //   var th = smallFontSize * scaleY;

          //   // draw corner pointers
          //   markupCtx.beginPath();
          //   markupCtx.moveTo(0, 0);
          //   markupCtx.lineTo(5, 5);
          //   markupCtx.moveTo(0, markupCanvas.height);
          //   markupCtx.lineTo(5, markupCanvas.height - 5);
          //   markupCtx.stroke();
          //   markupCtx.closePath();


          //   // draw ssffTrackName
          //   if (drawName) {
          //     markupCtx.font = (scope.cps.vals.font.fontPxSize + 'px' + ' ' + scope.cps.vals.font.fontType);
          //     var trackNameImg = scope.fontImage.getTextImage(markupCtx, trackName, scope.cps.vals.font.fontPxSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor, true);
          //     markupCtx.drawImage(trackNameImg, 0, markupCanvas.height / 2 - scope.cps.vals.font.fontPxSize * scaleY / 2);
          //   }

          //   if (!$.isEmptyObject(scope.ssffds.data)) {
          //     if (scope.ssffds.data.length !== 0) {

          //       var tr = scope.cps.getSsffTrackConfig(trackName);
          //       var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);

          //       // draw min/max vals
          //       var labelTxtImg = scope.fontImage.getTextImage(markupCtx, 'max: ' + viewState.round(col._maxVal, 6), smallFontSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
          //       markupCtx.drawImage(labelTxtImg, 5, 5, labelTxtImg.width, labelTxtImg.height);

          //       // draw min/max vals
          //       labelTxtImg = scope.fontImage.getTextImage(markupCtx, 'min: ' + viewState.round(col._minVal, 6), smallFontSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
          //       markupCtx.drawImage(labelTxtImg, 5, markupCanvas.height - th - 5, labelTxtImg.width, labelTxtImg.height);
          //     }
          //   }

        }


      }
    };
  });