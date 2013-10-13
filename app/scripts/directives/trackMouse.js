'use strict';

angular.module('emulvcApp')
.directive("trackmouse", function(){
  return {
    restrict: "A",
    link: function(scope, element){
    
      var elem = element[0];
      var tierId = element.parent().parent()[0].id;
      var ctx = elem.getContext('2d'); 
      var startPCM;
      var thisPCM;   
      
            
      element.bind('mousedown', function(x){
        startPCM = getX(x) * scope.vs.getPCMpp(x);
        scope.vs.select(startPCM,startPCM);
      });
      
      element.bind('mousemove', function(event){ 
        thisPCM = getX(event) * scope.vs.getPCMpp(event);
        switch (event.which) {
          case 1:
            //console.log('Left mouse button pressed');
            scope.vs.select(startPCM,thisPCM);
            break;
        case 2:
            //console.log('Middle mouse button pressed');
            break;
        case 3:
            //console.log('Right mouse button pressed');
            break;
        default:       
            break;
        }
      });  
      
      element.bind('mouseup', function(x){
        thisPCM = getX(x) * scope.vs.getPCMpp(x);
        scope.vs.select(startPCM,thisPCM);
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