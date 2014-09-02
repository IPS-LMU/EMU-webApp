'use strict';

angular.module('emuwebApp')
	.controller('SelectLabelModalCtrl', function ($scope, dialogService, passedInOpts, ArrayHelperService) {

		$scope.passedInOpts = passedInOpts;

		$scope.select = function (idx) {
			dialogService.close(idx);
		};

	});