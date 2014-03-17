'use strict';

angular.module('emuwebApp')
  .directive('enlarge', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var elem = element.parent().parent();
        var elemHeight = elem[0].clientHeight;
        var open = false;

        element.bind('click', function () {
          if (open) {
            elem.css({'height': elemHeight*2+'px'});          
            open = false;
          } else {
            elem.css({'height': elemHeight+'px'});
            open = true;
          }
          scope.refreshTimeline();
        });
      }
    };
  });