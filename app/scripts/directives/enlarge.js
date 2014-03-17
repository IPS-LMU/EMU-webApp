'use strict';

angular.module('emuwebApp')
  .directive('enlarge', function (viewState) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var open = true;

        element.bind('click', function () {
          if (open) {
            open = false;
            viewState.setenlarge(attrs.enlarge);
          } else {
            open = true;
            viewState.setenlarge(attrs.enlarge);
          }
          scope.refreshTimeline();
        });
      }
    };
  });