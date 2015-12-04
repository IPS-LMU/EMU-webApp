'use strict';

angular.module('emuwebApp')
	.directive('save', function (modalService, Espsparserservice) {
		return {
			restrict: 'A',
			link: function (scope, element, attr) {
				element.bind('click', function () {
					scope.vs.setcurClickLevelName(scope.level.name, attr.save);
					Espsparserservice.asyncParseJSO(scope.level.name).then(function (result) {
						modalService.open('views/export.html', name + '_esps.txt', result);
					});
				});
			}
		};
	});
