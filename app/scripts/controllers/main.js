'use strict';

angular.module('emulvcApp')
	.controller('MainCtrl', function($scope) {
		$scope.lastkeycode = "N/A";

		$scope.setlastkeycode = function(c) {
			$scope.lastkeycode = c;
		};

	});