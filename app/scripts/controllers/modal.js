var ModalInstanceCtrl = function($scope, $modalInstance, modalTitle, modalContent, viewState) {

	$scope.modalContent = modalContent;
	$scope.modalTitle = modalTitle;

	$scope.ok = function() {
		//$modalInstance.close($scope.selected.item);
		$modalInstance.dismiss('cancel');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.deleteSegment = function() {
	    $('#HandletiersCtrl').scope().deleteSegments();
	    $modalInstance.dismiss('ok');
	};

	$scope.deleteTier = function(tierName) {
		$('#HandletiersCtrl').scope().deleteTier(tierName);
		$('#HandletiersCtrl').scope().history();
		$modalInstance.dismiss('ok');
	};
};