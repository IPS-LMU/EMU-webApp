'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, dialogService) {
	
		$scope.lastkeycode = "N/A";
		
		$scope.items = ['item1', 'item2', 'item3'];
		
		$scope.openAbout = function () {
		    var modalInstance = $modal.open({
		        templateUrl: 'modal.html',
		        controller: ModalInstanceCtrl,
		        resolve: {
		            items: function () {
		                return $scope.items;
    		        }
	    	    }
		    });
		
    		modalInstance.result.then(function (selectedItem) {
	    	    $scope.selected = selectedItem;
		    }, function () {
		        $log.info('Modal dismissed at: ' + new Date());
    		});
    	};
		
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
	
	
var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
	
	