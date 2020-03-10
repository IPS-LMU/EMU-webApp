import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('save', function (ModalService, EspsParserService) {
		return {
			restrict: 'A',
			link: function (scope, element, attr) {
				element.bind('click', function () {
					scope.vs.setcurClickLevelName(scope.level.name, attr.save);
					EspsParserService.asyncParseJSO(scope.level.name).then((result) => {
						ModalService.open('views/export.html', name + '_esps.txt', result);
					});
				});
			}
		};
	});
