'use strict';

angular.module('emulvcApp')
  .directive("correctiontool", function() {
    return {
      restrict: "A",
      link: function(scope, element) {

        var elem = element[0];

        element.bind('mousemove', function(event) {
          //console.log(event);
          //scope.$apply();
        });

      }
    };
  });