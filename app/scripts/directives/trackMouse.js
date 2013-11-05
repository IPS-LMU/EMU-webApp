'use strict';

angular.module('emulvcApp')
  .directive("trackmouse", function() {
    return {
      restrict: "A",
      link: function(scope, element) {

        var dragStartSample;
        var dragEndSample;

        element.bind('mousedown', function(x) {
          dragStartSample = Math.round(scope.dhs.getX(x) * scope.vs.getPCMpp(x) + scope.vs.curViewPort.sS);
          scope.vs.select(dragStartSample, dragStartSample);
          scope.$apply();
        });

        element.bind('mousemove', function(event) {
          switch (event.which) {
            case 1:
              //console.log('Left mouse button pressed');
              dragEndSample = Math.round(scope.dhs.getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS);
              scope.vs.select(dragStartSample, dragEndSample);
              scope.$apply();
              break;
          }
        });

        element.bind('mouseup', function(x) {
          dragEndSample = Math.round(scope.dhs.getX(x) * scope.vs.getPCMpp(x) + scope.vs.curViewPort.sS);
          scope.vs.select(dragStartSample, dragEndSample);
          scope.$apply();
        });

      }
    };
  });