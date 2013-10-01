'use strict';

angular.module('emulvcApp')
.directive("trackmouse", function(){
  return {
    restrict: "A",
    link: function(scope, element){
    
      var elem = element[0];
      var tierId = element.parent().parent()[0].id;
      var ctx = elem.getContext('2d');    
      
    }
  };
});