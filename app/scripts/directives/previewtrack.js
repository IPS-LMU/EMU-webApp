'use strict';

angular.module('emuwebApp')
  .directive('previewtrack', function (viewState, Soundhandlerservice) {
    return {
      restrict: 'A',
      scope: {},
      link: function (scope, element) {

        var startPCM = -1;

        element.bind('click', function (x) {
          if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
            var width = viewState.curViewPort.eS - viewState.curViewPort.sS;
            startPCM = getX(x) * (Soundhandlerservice.wavJSO.Data.length / x.originalEvent.srcElement.width);
            scope.$apply(function () {
              viewState.setViewPort((startPCM - (width / 2)), (startPCM + (width / 2)));
            });
          }
        });


        element.bind('mousedown', function (x) {
          if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
            startPCM = getX(x) * (Soundhandlerservice.wavJSO.Data.length / x.originalEvent.srcElement.width);
          }
        });

        element.bind('mousemove', function (x) {
          switch (event.which) {
          case 1:
            if (startPCM !== -1) {
              var width = viewState.curViewPort.eS - viewState.curViewPort.sS;
              startPCM = getX(x) * (Soundhandlerservice.wavJSO.Data.length / x.originalEvent.srcElement.width);
              scope.$apply(function () {
                viewState.setViewPort((startPCM - (width / 2)), (startPCM + (width / 2)));
              });
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