'use strict';

angular.module('emuwebApp')
  .directive('delete', function (modalService) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.bind('click', function () {
          scope.vs.setcurClickLevelName(scope.level.name, attr.delete);
          modalService.open('views/deleteLevel.html',  name);
        });
      }
    };
  });
