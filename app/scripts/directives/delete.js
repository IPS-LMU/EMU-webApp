'use strict';

angular.module('emuwebApp')
  .directive('delete', function (modalService) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        var name = scope.level.name;
        element.bind('click', function () {
          scope.vs.setcurClickLevelName(name, attr.delete);
          modalService.open('views/deleteLevel.html',  name);
        });

      }
    };
  });