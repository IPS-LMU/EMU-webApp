'use strict';

angular.module('emulvcApp')
.directive("delete", function(){
  return {
    restrict: "A",
    link: function(scope, element){
    
      var elem = element[0];
      var id = scope.this.tier.TierName;   

      element.bind('click', function(event){
        scope.openModal('views/deleteTier.html','deleteTier',id,id);
      });
      
    }
  };
});