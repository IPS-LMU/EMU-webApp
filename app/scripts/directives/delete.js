'use strict';

angular.module('emulvcApp')
.directive("delete", function(){
  return {
    restrict: "A",
    link: function(scope, element){
    
      var elem = element[0];
      var id = element.parent().parent().parent()[0].id;   

      element.bind('click', function(event){
        alert(id);
      });
      
    }
  };
});