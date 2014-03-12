'use strict';

angular.module('emuwebApp')
  .directive('save', function (dialogService, Espsparserservice) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        var id = scope.this.level.LevelName;

        element.bind('click', function () {
          scope.vs.setcurClickLevelName(id);
          dialogService.openExport('views/export.html', 'ExportCtrl', Espsparserservice.toESPS(scope.this.level),'level.txt');
        });

      }
    };
  });