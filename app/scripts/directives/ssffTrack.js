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


        scope.$watch('vs.curViewPort', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              // scope.redraw();
              drawSpectMarkup();
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
          scope.$apply();
        };

        scope.$on('refreshTimeline', function () {
          scope.updateCSS();
        });

        function drawSpectMarkup() {

          markupCtx.clearRect(0, 0, canvas1.width, canvas1.height);
          // draw moving boundary line if moving
          scope.dhs.drawMovingBoundaryLine(markupCtx);

          // draw current viewport selected
          scope.dhs.drawCurViewPortSelected(markupCtx, false);

        }


      }
    };
  });