var ModalInstanceCtrl = function($rootScope, $scope, $modalInstance,
	modalTitle, modalContent, windowLength, rangeFrom, rangeTo, dynamicRange, window, currentTier, viewState,
	keyZoomIn, keyZoomOut, keyZoomAll, keyZoomSel, shiftViewPortLeft, shiftViewPortRight) {

	$scope.modalContent = modalContent;
	$scope.modalTitle = modalTitle;
	$scope.windowLength = windowLength;
	$scope.rangeFrom = rangeFrom;
	$scope.rangeTo = rangeTo;
	$scope.dynamicRange = dynamicRange;
	$scope.window = window;
	$scope.currentTier = currentTier;
	$scope.keyZoomIn = keyZoomIn;
	$scope.keyZoomOut = keyZoomOut;
	$scope.keyZoomAll = keyZoomAll;
	$scope.keyZoomSel = keyZoomSel;
	$scope.shiftViewPortLeft = shiftViewPortLeft;
	$scope.shiftViewPortRight = shiftViewPortRight;
	// $scope.username = '';
	// $scope.passcode = '';

	$scope.ok = function() {
		viewState.setmodalOpen(false);
		$modalInstance.dismiss('cancel');
	};

	$scope.cancel = function() {
		viewState.setmodalOpen(false);
		$modalInstance.dismiss('cancel');
	};

	// $scope.login = function() {
	// 	console.log($scope.username);
	// 	console.log($scope.passcode);
	// 	// viewState.setmodalOpen(false);
	// 	// $modalInstance.dismiss('cancel');
	// };

	$scope.deleteSegment = function() {
		$('#HandletiersCtrl').scope().deleteSegments();
		$modalInstance.dismiss('ok');
	};

	$scope.selected = function(name) {
		if (name == viewState.spectroSettings.window) return true;
		return false;
	};

	$scope.deleteTier = function(id) {
		$('#HandletiersCtrl').scope().deleteTier(id);
		$modalInstance.dismiss('ok');
	};

	$scope.renameTier = function() {
		$('#HandletiersCtrl').scope().renameTier($('#newName').val());
		$modalInstance.dismiss('ok');
	};

	$scope.saveSpectroSettings = function() {
		var len = $("#windowLength").val();
		var from = $("#rangeFrom").val();
		var to = $("#rangeTo").val();
		var dyna = $("#dynamicRange").val();
		var win = $("#windowFunction").val();
		viewState.setspectroSettings(len, from, to, dyna, win);
		viewState.setmodalOpen(false);
		$modalInstance.dismiss('ok');

	};

	$scope.saveSSFF = function() {
		$rootScope.$broadcast('saveSSFFb4load');
		$modalInstance.dismiss('ok');
	};


	$scope.discardSSFF = function() {
		$rootScope.$broadcast('discardSSFFb4load');
		$modalInstance.dismiss('ok');
	};


};