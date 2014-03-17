'use strict';

angular.module('emuwebApp')
  .directive('enlarge', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        var elem = element.parent().parent().children();
        var elemHeight = elem.height();
        var open = true;

        element.bind('click', function () {
          if (open) {
            elem.css({'height': '70%'});          
            open = false;
          } else {
            elem.css({'height': '100%'});
            open = true;
          }
          scope.refreshTimeline();
        });
      }
    };
  });