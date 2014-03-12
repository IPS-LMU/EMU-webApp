'use strict';

angular.module('emuwebApp')
  .directive('trackmouse', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var curMouseSample;
        var dragStartSample;
        var dragEndSample;

        element.bind('mousedown', function (event) {
          dragStartSample = Math.round(scope.dhs.getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS);
          dragEndSample = dragStartSample;
          scope.vs.select(dragStartSample, dragStartSample);
          scope.$apply();
        });

        element.bind('mousemove', function (event) {
          switch (event.which) {
          case 1:
            if (!scope.vs.getdragBarActive()) {
              setSelectDrag(event);
            }
            break;
          }
        });

        element.bind('mouseup', function (event) {
          if (!scope.vs.getdragBarActive()) {
            setSelectDrag(event);
          }
        });

        function setSelectDrag(event) {
          curMouseSample = Math.round(scope.dhs.getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS);
          if (curMouseSample > dragStartSample) {
            dragEndSample = curMouseSample;
            scope.vs.select(dragStartSample, dragEndSample);
          } else {
            dragStartSample = curMouseSample;
            scope.vs.select(dragStartSample, dragEndSample);
          }
          scope.$apply();
        }

      }
    };
  });