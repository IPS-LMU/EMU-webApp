'use strict';

angular.module('emulvcApp')
	.controller('AboutCtrl', function ($scope, ConfigProviderService, dialogService) {
		$scope.cps = ConfigProviderService;

		$scope.getStrRep = function (code) {
			var str;
			switch (code) {
			case 9:
				str = 'TAB';
				break;
			case 16:
				str = 'SHIFT';
				break;
			case 18:
				str = 'ALT';
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