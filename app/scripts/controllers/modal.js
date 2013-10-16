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
		//$scope.
	};

	$scope.deleteTier = function() {
		alert(modalTitle);
	};
};