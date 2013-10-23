var ModalInstanceCtrl = function($scope, $modalInstance, modalTitle, modalContent, viewState) {

	$scope.modalContent = modalContent;
	$scope.modalTitle = modalTitle;

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

	$scope.deleteTier = function(id) {
		$('#HandletiersCtrl').scope().deleteTier(id);
		$('#HandletiersCtrl').scope().history();
		$modalInstance.dismiss('ok');
	};
	
	$scope.saveSpectroSettings = function() {
	    var len = $("#windowLength").val();
	    var from = $("#viewrange_from").val();
	    var to = $("#viewrange_to").val();
	    var dyna = $("#dynamicRange").val();
	    var win = $("#windowFunction").val();
	    console.log(dyna);
	    viewState.setspectroSettings(len, from, to, dyna, win);
	    viewState.setmodalOpen(false);
		$modalInstance.dismiss('ok');
	    
	}
};