'use strict';

angular.module('emuwebApp')
	.controller('SelectmodalCtrl', function ($scope, dialogService, passedInOpts) {
		$scope.passedInOpts = passedInOpts;

		$scope.select = function () {
			dialogService.close(true);
		};
	});