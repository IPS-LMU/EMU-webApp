'use strict';

angular.module('emuwebApp')
  .directive('delete', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        var name = scope.level.name;
        element.bind('click', function () {
          scope.vs.setcurClickLevelName(name, attr.delete);
          scope.dials.open('views/deleteLevel.html', 'ModalCtrl', name);
        });

      }
    };
  });