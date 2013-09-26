'use strict';

angular.module('emulvcApp')
	.controller('MainCtrl', function($scope) {

		$scope.lastkeycode = "N/A";
		var editAreaName = "label_edit_textarea";
		
		$scope.setlastkeycode = function(c) {
			$scope.lastkeycode = c;
			switch(c) {
			    case 13:
			        var content = $("#"+scope.viewState.getEditAreaName()).val();
			        alert(content);
			        break;
			    default:
			        break;
			}
		};

	});