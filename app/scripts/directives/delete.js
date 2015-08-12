'use strict';

angular.module('emuwebApp')
  .directive('delete', function (modalService) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.bind('click', function () {
          scope.vs.setcurClickLevelName(scope.level.name, attr.delete);
          scope.vs.setcurClickLevel(scope.level.name, scope.level.type, scope.order);
          modalService.open('views/deleteLevel.html',  scope.level.name);
        });
      }
    };
  });
