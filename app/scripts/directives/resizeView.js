'use strict';

angular.module('emulvcApp')
.directive("resizeview", function(){
  return {
    restrict: "A",
    link: function(scope, element){
    
      var start = 0;
      var clicked = false;
      
      element.bind('mousedown', function(event){
        start = event.offsetY;
        clicked = true;
      });
      
      element.bind('mouseup', function(event){
        start = event.offsetY;
        clicked = false;
      });      
       
      element.bind('mousemove', function(event){
        if(clicked) {
          var diff = event.offsetY - start;
          var newHeight = parseInt($("#osci canvas").css("height"),10) + (diff/2);
          $("#osci canvas").css("height", newHeight + "px");
          $("#spectro canvas").css("height", newHeight + "px");
        }
      });
              
    }
  };
});