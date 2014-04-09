'use strict';

angular.module('emuwebApp')
  .directive('ssffTrack', function (ConfigProviderService, viewState) {
    return {
      templateUrl: 'views/ssffTrack.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        // select the needed DOM elements from the template
        var canvasLength = element.find('canvas').length;
        var canvas0 = element.find('canvas')[0];
        var canvas1 = element.find('canvas')[canvasLength - 1];
        var context = canvas0.getContext('2d');
        var markupCtx = canvas1.getContext('2d');


        scope.order = attrs.order;
        scope.enlargeCanvas = {
          'height': 100 / ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length + '%'
        };

        scope.$watch('vs.curPerspectiveIdx', function () {
          scope.updateCSS();
        }, true);

        scope.$watch('vs.curViewPort', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              drawSsffTrackMarkup();
              scope.updateCSS();
            }
          }
        }, true);

        scope.updateCSS = function () {
          var parts = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length;
          if (viewState.getenlarge() == -1) {
            scope.enlargeCanvas = {
              'height': 100 / parts + '%'
            };
          } else {
            if (viewState.getenlarge() == scope.order) {
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

        function drawSsffTrackMarkup() {

          markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
          // draw moving boundary line if moving
          scope.dhs.drawMovingBoundaryLine(markupCtx);

          // draw current viewport selected
          scope.dhs.drawCurViewPortSelected(markupCtx, false);

          // draw corner pointers
          markupCtx.beginPath();
          markupCtx.moveTo(0, 0);
          markupCtx.lineTo(5, 5);
          markupCtx.moveTo(0, canvas1.height);
          markupCtx.lineTo(5, canvas1.height - 5);
          markupCtx.stroke();
          markupCtx.closePath();

          // draw min/max vals
          var labelTxtImg = scope.fontImage.getTextImage(markupCtx, 'max: ' + '???', scope.cps.vals.font.fontPxSize * 3 / 4, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor);
          markupCtx.drawImage(labelTxtImg, 5, 5, labelTxtImg.width, labelTxtImg.height);

          // draw min/max vals
          labelTxtImg = scope.fontImage.getTextImage(markupCtx, 'min: ' + '???', scope.cps.vals.font.fontPxSize * 3 / 4, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor);
          markupCtx.drawImage(labelTxtImg, 5, canvas1.height - 50, labelTxtImg.width, labelTxtImg.height);

          // draw ssffTrackName
          markupCtx.font = (scope.cps.vals.font.fontPxSize + 'px' + ' ' + scope.cps.vals.font.fontType);
          var trackNameImg = scope.fontImage.getTextImage(markupCtx, 'NAME', scope.cps.vals.font.fontPxSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor, true);
          markupCtx.drawImage(trackNameImg, 0, canvas1.height / 2 - trackNameImg.height / 2, trackNameImg.width, trackNameImg.height);


        }


      }
    };
  });