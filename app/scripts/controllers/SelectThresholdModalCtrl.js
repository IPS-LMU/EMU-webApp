'use strict';

angular.module('emuwebApp')
	.controller('SelectThresholdModalCtrl', function ($scope, dialogService, passedInOpts, ArrayHelperService) {
		$scope.passedInOpts = passedInOpts;

		$scope.myData = ArrayHelperService.convertArrayToXYjsoArray(passedInOpts.y);

		$scope.select = function (idx) {
			dialogService.close(idx);
		};

	});