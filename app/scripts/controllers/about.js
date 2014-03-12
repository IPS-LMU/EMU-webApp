'use strict';

angular.module('emuwebApp')
	.controller('AboutCtrl', function ($scope, ConfigProviderService, dialogService) {
		$scope.cps = ConfigProviderService;

		$scope.getStrRep = function (code) {
			var str;
			switch (code) {
			case 8:
				str = 'BACKSPACE';
				break;
			case 9:
				str = 'TAB';
				break;
			case 13:
				str = 'ENTER';
				break;
			case 16:
				str = 'SHIFT';
				break;
			case 18:
				str = 'ALT';
				break;
			case 32:
				str = 'SPACE';
				break;
			case 38:
				str = '↑';
				break;
			case 40:
				str = '↓';
				break;
			case 187:
				str = '+';
				break;
			case 189:
				str = '-';
				break;
			default:
				str = String.fromCharCode(code);
			}
			return str;
		};

		$scope.cancel = function () {
			dialogService.close();
		};

	});