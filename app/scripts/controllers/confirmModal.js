'use strict';

angular.module('emulvcApp')
	.controller('ConfirmmodalCtrl', function ($scope, dialogService, passedInTxt) {
		$scope.passedInTxt = passedInTxt;

		$scope.confirm = function () {
			dialogService.close(true);
		};
		$scope.cancel = function () {
			dialogService.close(false);
		};
	});