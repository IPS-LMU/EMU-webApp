'use strict';

angular.module('emuwebApp')
  .directive('previewtrack', function (viewState, Soundhandlerservice) {
    return {
      restrict: 'A',
      scope: {},
      link: function (scope, element) {

        var startPCM = -1;

        ///////////////
        // bindings


        element.bind('click', function (x) {
          if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
            var width = viewState.curViewPort.eS - viewState.curViewPort.sS;
            startPCM = viewState.getX(x) * (Soundhandlerservice.wavJSO.Data.length / x.originalEvent.target.width);
            if(startPCM - (width / 2) < 0) {
              startPCM = Math.ceil(width / 2);
            }
            else if(startPCM + (width / 2) > Soundhandlerservice.wavJSO.Data.length) {
              startPCM = Math.floor(Soundhandlerservice.wavJSO.Data.length - (width / 2));
            }
            if (!viewState.isEditing()) {
              scope.$apply(function () {
                viewState.setViewPort(startPCM - (width / 2), startPCM + (width / 2));
              });
            }
          }
        });

        //
        element.bind('mousedown', function (x) {
          if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
            startPCM = viewState.getX(x) * (Soundhandlerservice.wavJSO.Data.length / x.originalEvent.target.width);
          }
        });

        //
        element.bind('mousemove', function (x) {
          var mbutton = 0;
          if (x.buttons === undefined) {
            mbutton = x.which;
          } else {
            mbutton = x.buttons;
          }
          switch (mbutton) {
          case 1:
            if (startPCM !== -1) {
              var width = viewState.curViewPort.eS - viewState.curViewPort.sS;
              startPCM = viewState.getX(x) * (Soundhandlerservice.wavJSO.Data.length / x.originalEvent.target.width);
              if (!viewState.isEditing()) {
                scope.$apply(function () {
                  viewState.setViewPort((startPCM - (width / 2)), (startPCM + (width / 2)));
                });
              }
            }
            break;
          }
        });

        //
        element.bind('mouseup', function () {
          startPCM = -1;
        });

        //
        element.bind('mouseout', function () {
          startPCM = -1;
        });
      }
    };
  });
