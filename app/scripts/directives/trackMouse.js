'use strict';

angular.module('emulvcApp')
  .directive("trackmouse", function() {
    return {
      restrict: "A",
      link: function(scope, element) {

        var startPCM;
        var thisPCM;

        element.bind('mousedown', function(x) {
          startPCM = getX(x) * scope.vs.getPCMpp(x) + scope.vs.curViewPort.sS;
          scope.vs.select(startPCM, startPCM);
          scope.$apply();
        });

        element.bind('mousemove', function(event) {
          switch (event.which) {
            case 1:
              //console.log('Left mouse button pressed');
              thisPCM = getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS;
              scope.vs.select(startPCM, thisPCM);
              scope.$apply();
              break;
          }
        });

        element.bind('mouseup', function(x) {
          thisPCM = getX(x) * scope.vs.getPCMpp(x) + scope.vs.curViewPort.sS;
          scope.vs.select(startPCM, thisPCM);
          scope.$apply();
        });

        function getX(e) {
          return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
        }

        function getY(e) {
          return e.offsetY * (e.originalEvent.srcElement.height / e.originalEvent.srcElement.clientHeight);
        }

      }
    };
  });