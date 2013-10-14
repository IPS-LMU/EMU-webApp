'use strict';

angular.module('emulvcApp')
  .directive('drawssff', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        // console.log("sdfaafasdfasdfasdf")
        // console.log(element[0])
        var canvas = element.find("canvas")[0];
        console.log(canvas)

      }
    };
  });
