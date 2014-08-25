'use strict';

angular.module('emuwebApp')
	.controller('SelectmodalCtrl', function ($scope, dialogService, passedInOpts) {
		$scope.passedInOpts = passedInOpts;

		$scope.select = function (idx) {
			dialogService.close(idx);
		};
	});