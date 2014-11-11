'use strict';

angular.module('emuwebApp')
  .directive('save', function (dialogService, Espsparserservice) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        var name = scope.level.name;

        element.bind('click', function () {
          scope.vs.setcurClickLevelName(name, attr.save);
          Espsparserservice.asyncParseJSO(name).then(function (result) {
		    dialogService.openExport('views/export.html', 'ExportCtrl', result, name + '_esps.txt');
		  });
        });
      }
    };
  });