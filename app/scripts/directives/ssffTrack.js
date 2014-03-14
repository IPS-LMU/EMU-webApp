'use strict';

angular.module('emuwebApp')
  .directive('ssffTrack', function () {
    return {
      templateUrl: 'views/ssffTrack.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        // element.text('this is the ssffTrack directive');
        // alert("duuude");
      }
    };
  });
