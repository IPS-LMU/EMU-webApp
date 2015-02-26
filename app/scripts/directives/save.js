'use strict';

angular.module('emuwebApp')
  .directive('save', function (modalService, Espsparserservice) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        var name = scope.level.name;

        element.bind('click', function () {
          scope.vs.setcurClickLevelName(name, attr.save);
          Espsparserservice.asyncParseJSO(name).then(function (result) {
		    modalService.open('views/export.html', name + '_esps.txt', result);
		  });
        });
      }
    };
  });