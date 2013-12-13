'use strict';

angular.module('emulvcApp')
	.controller('ErrormodalCtrl', function ($scope, dialogService, passedInTxt) {
		$scope.passedInTxt = passedInTxt;
		$scope.cancel = function () {
			dialogService.close();
		};

	});