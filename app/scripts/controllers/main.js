'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope) {
	
		$scope.lastkeycode = "N/A";
		
		$scope.setlastkeycode = function(c,shift) {
		    $scope.lastkeycode = c;
			switch(c) {
			    case 9:
			        if(shift) 
			            $('#HandletiersCtrl').scope().tabPrev();
			        else      
			            $('#HandletiersCtrl').scope().tabNext();
			        break;
			    case 13:
			        $('#HandletiersCtrl').scope().renameLabel();
			        break;
			    case 27:
			        $('#HandletiersCtrl').scope().deleteEditArea();
			        break;		
			    case 90:
			        $('#HandletiersCtrl').scope().goBackHistory();
			        break;					        	        
			    default:
			        break;
			}
		};	
		
	});