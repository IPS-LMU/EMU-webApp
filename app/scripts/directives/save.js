'use strict';

angular.module('emuwebApp')
  .directive('save', function (dialogService, Espsparserservice) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        var name = scope.this.level.name;

        element.bind('click', function () {
          scope.vs.setcurClickLevelName(name, attr.save);
          dialogService.openExport('views/export.html', 'ExportCtrl', Espsparserservice.toESPS(scope.this.level),'level.txt');
        });

      }
    };
  });