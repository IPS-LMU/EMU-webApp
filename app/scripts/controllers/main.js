'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope) {

		$scope.lastkeycode = "N/A";
		
		$scope.setlastkeycode = function(c,shift) {
		    $scope.lastkeycode = c;
			switch(c) {
			    case 9:
			        if(shift) angular.element(document.getElementById('HandletiersCtrlId')).scope().tabPrev();
			        else      angular.element(document.getElementById('HandletiersCtrlId')).scope().tabNext();
			        break;
			    case 13:
			                  angular.element(document.getElementById('HandletiersCtrlId')).scope().renameLabel();
			        break;
			    case 27:
			                  angular.element(document.getElementById('HandletiersCtrlId')).scope().deleteEditArea();
			        break;		
			    case 90:
			                  angular.element(document.getElementById('HandletiersCtrlId')).scope().goBackHistory();
			        break;					        	        
			    default:
			        break;
			}
		};	
		
	});