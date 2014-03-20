'use strict';

angular.module('emuwebApp')
  .directive('enlarge', function ($rootScope, viewState) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var open = false;
        element.bind('click', function () {
          if (open) {
            open = false;
            viewState.setenlarge(-1);
          } else {
            open = true;
            viewState.setenlarge(attrs.enlarge);
          } 
          $rootScope.$broadcast("refreshTimeline");     
        });
      }
    };
  });