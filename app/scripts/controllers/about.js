'use strict';

angular.module('emulvcApp')
	.controller('AboutCtrl', function ($scope, ConfigProviderService, dialogService) {
		$scope.cps = ConfigProviderService;

		$scope.getStrRep = function (code) {
			return String.fromCharCode(code);
		};

		$scope.cancel = function () {
			dialogService.close();
		};

	});