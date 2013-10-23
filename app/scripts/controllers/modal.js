var ModalInstanceCtrl = function($scope, $modalInstance, modalTitle, modalContent, windowLength, rangeFrom, rangeTo, dynamicRange, window, viewState) {

	$scope.modalContent = modalContent;
	$scope.modalTitle = modalTitle;
	$scope.windowLength = windowLength;
	$scope.rangeFrom = rangeFrom;
	$scope.rangeTo = rangeTo;
	$scope.dynamicRange = dynamicRange;
	$scope.window = window;

	$scope.ok = function() {
		//$modalInstance.close($scope.selected.item);
		$modalInstance.dismiss('cancel');
	};

	$scope.cancel = function() {
	    viewState.setmodalOpen(false);
		$modalInstance.dismiss('cancel');
	};

	$scope.deleteSegment = function() {
	    $('#HandletiersCtrl').scope().deleteSegments();
	    $modalInstance.dismiss('ok');
	};
	
	$scope.selected = function(name) {
	    if(name==viewState.spectroSettings.window) return true;
	    return false;
	};	

	$scope.deleteTier = function(id) {
		$('#HandletiersCtrl').scope().deleteTier(id);
		$('#HandletiersCtrl').scope().history();
		$modalInstance.dismiss('ok');
	};
	
	$scope.saveSpectroSettings = function() {
	    var len = $("#windowLength").val();
	    var from = $("#range_from").val();
	    var to = $("#range_to").val();
	    var dyna = $("#dynamicRange").val();
	    var win = $("#windowFunction").val();
	    viewState.setspectroSettings(len, from, to, dyna, win);
	    viewState.setmodalOpen(false);
		$modalInstance.dismiss('ok');
	    
	}
};