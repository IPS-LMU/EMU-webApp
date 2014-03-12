'use strict';

angular.module('emuwebApp')
  .directive('delete', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        var id = scope.this.level.LevelName;

        element.bind('click', function () {
          scope.vs.setcurClickLevelName(id);
          scope.dials.open('views/deleteLevel.html', 'ModalCtrl', id);
        });

      }
    };
  });