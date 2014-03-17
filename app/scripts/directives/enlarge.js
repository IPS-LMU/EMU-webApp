'use strict';

angular.module('emuwebApp')
  .directive('enlarge', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var elem = element.parent().parent();
        var elemHeight = elem.clientHeight;
        var open = false;

        element.bind('click', function () {
          console.log(elem[0]);
          if (open) {
            elem.css({'height': '/=2'});          
            open = false;
          } else {
            elem.css({'height': '*=2'});
            open = true;
          }
          scope.refreshTimeline();
        });
      }
    };
  });