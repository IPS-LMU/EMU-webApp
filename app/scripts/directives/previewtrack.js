'use strict';

angular.module('emuwebApp')
  .directive('previewtrack', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var startPCM = -1;

        element.bind('click', function (x) {
          if (!$.isEmptyObject(scope.shs.wavJSO)) {
            var width = scope.vs.curViewPort.eS - scope.vs.curViewPort.sS;
            startPCM = getX(x) * (scope.shs.wavJSO.Data.length / x.originalEvent.srcElement.width);
            scope.vs.setViewPort((startPCM - (width / 2)), (startPCM + (width / 2)));
            scope.$apply();
          }
        });


        element.bind('mousedown', function (x) {
          if (!$.isEmptyObject(scope.shs.wavJSO)) {
            startPCM = getX(x) * (scope.shs.wavJSO.Data.length / x.originalEvent.srcElement.width);
          }
        });

        element.bind('mousemove', function (x) {
          switch (event.which) {
          case 1:
            if (startPCM !== -1) {
              var width = scope.vs.curViewPort.eS - scope.vs.curViewPort.sS;
              startPCM = getX(x) * (scope.shs.wavJSO.Data.length / x.originalEvent.srcElement.width);
              scope.vs.setViewPort((startPCM - (width / 2)), (startPCM + (width / 2)));
              scope.$apply();
            }
            break;
          }
        });

        element.bind('mouseup', function () {
          startPCM = -1;
        });

        element.bind('mouseout', function () {
          startPCM = -1;
        });

        function getX(e) {
          return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
        }

      }
    };
  });