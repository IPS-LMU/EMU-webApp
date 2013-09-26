'use strict';

angular.module('emulvcApp')
	.controller('MainCtrl', function($scope) {

		$scope.lastkeycode = "N/A";
		$scope.lasteditArea = "N/A";	
		
		$scope.setlastkeycode = function(c) {
			$scope.lastkeycode = c;
			switch(c) {
			    case 13:
			        console.log($("#"+$scope.lasteditArea).val());
			        //var content = $("#"+viewState.getEditAreaName()).val();
			        //alert(content);
			        break;
			    default:
			        break;
			}
		};
		
		$scope.setlasteditArea = function(name) {
		    $scope.lasteditArea = name;
		}
		
		$scope.getlasteditArea = function() {
		    return $scope.lasteditArea;
		}			
		

	});