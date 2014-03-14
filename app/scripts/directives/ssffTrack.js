'use strict';

angular.module('emuwebApp')
  .directive('ssffTrack', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the ssffTrack directive');
      }
    };
  });
