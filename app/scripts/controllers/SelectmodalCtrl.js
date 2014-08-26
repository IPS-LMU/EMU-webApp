'use strict';

angular.module('emuwebApp')
	.controller('SelectmodalCtrl', function ($scope, dialogService, passedInOpts, ArrayHelperService) {
		$scope.passedInOpts = passedInOpts;

		$scope.myData = ArrayHelperService.convertArrayToXYjsoArray(passedInOpts.y);
		console.log($scope.myData);

		$scope.select = function (idx) {
			dialogService.close(idx);
		};

	});