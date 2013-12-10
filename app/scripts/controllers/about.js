'use strict';

angular.module('emulvcApp')
	.controller('AboutCtrl', function ($scope, ConfigProviderService, dialogService) {
		$scope.cps = ConfigProviderService;

		$scope.cancel = function () {
			dialogService.close();
		};

	});