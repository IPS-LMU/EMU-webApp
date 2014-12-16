'use strict';

angular.module('emuwebApp')
	.controller('SelectThresholdModalCtrl', function ($scope, modalService, passedInOpts, ArrayHelperService) {
		$scope.passedInOpts = passedInOpts;

		$scope.myData = ArrayHelperService.convertArrayToXYjsoArray(passedInOpts.y);

		$scope.select = function (idx) {
			modalService.close(idx);
		};

	});