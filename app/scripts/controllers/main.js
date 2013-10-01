'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope) {
	
		$scope.lastkeycode = "N/A";
		
		$scope.setlastkeycode = function(c,shift) {
		    $scope.lastkeycode = c;
			switch(c) {
			    case 9:
			        if(shift) 
			            $('#HandletiersCtrlId').scope().tabPrev();
			        else      
			            $('#HandletiersCtrlId').scope().tabNext();
			        break;
			    case 13:
			        $('#HandletiersCtrlId').scope().renameLabel();
			        break;
			    case 27:
			        $('#HandletiersCtrlId').scope().deleteEditArea();
			        break;		
			    case 90:
			        $('#HandletiersCtrlId').scope().goBackHistory();
			        break;					        	        
			    default:
			        break;
			}
		};	
		
	});