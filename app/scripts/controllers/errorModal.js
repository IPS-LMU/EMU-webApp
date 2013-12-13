'use strict';

angular.module('emulvcApp')
	.controller('ErrormodalCtrl', function ($scope, dialogService) {

		$scope.cancel = function () {
			dialogService.close();
		};

	});