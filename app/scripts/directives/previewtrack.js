'use strict';

angular.module('emulvcApp')
  .directive("previewtrack", function() {
    return {
      restrict: "A",
      link: function(scope, element) {

        var startPCM = -1;

        element.bind('click', function(x) {
          var width = scope.vs.curViewPort.eS - scope.vs.curViewPort.sS;
          startPCM = getX(x) * (scope.vs.curViewPort.bufferLength/x.originalEvent.srcElement.width);
          scope.vs.setViewPort((startPCM-(width/2)),(startPCM+(width/2)));
          scope.$apply();
        });


        element.bind('mousedown', function(x) {
          startPCM = getX(x) * (scope.vs.curViewPort.bufferLength/x.originalEvent.srcElement.width);
        });

        element.bind('mousemove', function(x) {
          switch (event.which) {
            case 1:
              if(startPCM!=-1) {
                  var width = scope.vs.curViewPort.eS - scope.vs.curViewPort.sS;
                  startPCM = getX(x) * (scope.vs.curViewPort.bufferLength/x.originalEvent.srcElement.width);
                  scope.vs.setViewPort((startPCM-(width/2)),(startPCM+(width/2)));
                  scope.$apply();
              }
              break;
          }        
        });

        element.bind('mouseup', function(x) {
          startPCM = -1;
        });
        
        element.bind('mouseout', function(x) {
          startPCM = -1;
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