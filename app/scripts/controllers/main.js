'use strict';

angular.module('emulvcApp')
	.controller('MainCtrl', function($scope) {

		$scope.lastkeycode = "N/A";
		
		$scope.setlastkeycode = function(c) {
		    $scope.lastkeycode = c;
			switch(c) {
			    case 13:
			        $scope.$broadcast('renameLabel');
			        break;
			    default:
			        break;
			}
		};	
		
	});