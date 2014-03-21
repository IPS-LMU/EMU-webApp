'use strict';

angular.module('emuwebApp')
  .directive('progressThing', function () {
    return {
      template: '<div class=progressThing></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        // element.text('this is the progressThing directive');
      }
    };
  });
