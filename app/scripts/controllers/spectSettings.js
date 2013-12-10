'use strict';

angular.module('emulvcApp')
	.controller('SpectsettingsCtrl', function ($scope, dialogService) {
		$scope.cancel = function () {
			dialogService.close();
		};

	});