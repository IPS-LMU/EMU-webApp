'use strict';

angular.module('emulvcApp')
	.controller('ModalInstanceCtrl', function ($rootScope, $scope, $modalInstance, ConfigProviderService,
		modalTitle, modalContent, windowLength, rangeFrom, rangeTo, dynamicRange, window, currentTier, viewState, snapBoundary,
		keyZoomIn, keyZoomOut, keyZoomAll, keyZoomSel, shiftViewPortLeft, shiftViewPortRight, keyTab, keyShift, keyEnter,
		playAllInView, playSelected, playEntireFile, keyBackspace, tierUp, tierDown, snapBelow, snapAbove, snapZero, plus, minus,
		selectFirstContourCorrectionTool, selectSecondContourCorrectionTool, keyopenSubmenu, history, selectSegmentsInSelection,
		selectThirdContourCorrectionTool, selectFourthContourCorrectionTool, selectNoContourCorrectionTool, keyAlt) {

		$scope.cps = ConfigProviderService;

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
		$scope.keyTab = keyTab;
		$scope.keyShift = keyShift;
		$scope.keyEnter = keyEnter;
		$scope.snapBoundary = snapBoundary;
		$scope.playAllInView = playAllInView;
		$scope.playEntireFile = playEntireFile;
		$scope.keyBackspace = keyBackspace;
		$scope.playSelected = playSelected;
		$scope.tierUp = tierUp;
		$scope.plus = plus;
		$scope.keyAlt = keyAlt;
		$scope.minus = minus;
		$scope.history = history;
		$scope.snapBelow = snapBelow;
		$scope.snapAbove = snapAbove;
		$scope.snapZero = snapZero;
		$scope.tierDown = tierDown;
		$scope.selectSegmentsInSelection = selectSegmentsInSelection;
		$scope.openSubmenu = keyopenSubmenu;
		$scope.selectFirstContourCorrectionTool = selectFirstContourCorrectionTool;
		$scope.selectSecondContourCorrectionTool = selectSecondContourCorrectionTool;
		$scope.selectThirdContourCorrectionTool = selectThirdContourCorrectionTool;
		$scope.selectFourthContourCorrectionTool = selectFourthContourCorrectionTool;
		$scope.selectNoContourCorrectionTool = selectNoContourCorrectionTool;
		$scope.shiftViewPortLeft = shiftViewPortLeft;
		$scope.shiftViewPortRight = shiftViewPortRight;
		// $scope.username = '';
		// $scope.passcode = '';

		$scope.ok = function () {
			viewState.setmodalOpen(false);
			$modalInstance.dismiss('cancel');
		};

		$scope.cancel = function () {
			viewState.setmodalOpen(false);
			$modalInstance.dismiss('cancel');
		};

		$scope.deleteSegment = function () {
			$('#HandletiersCtrl').scope().deleteSegments();
			$modalInstance.dismiss('ok');
		};

		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
		};

		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};

		$scope.selected = function (name) {
			if (name === viewState.spectroSettings.window) {
				return true;
			}
			return false;
		};

		$scope.test = function () {
			alert('hier');
		};

		$scope.deleteTier = function (id) {
			$('#HandletiersCtrl').scope().deleteTier(id);
			$modalInstance.dismiss('ok');
		};

		$scope.renameTier = function () {
			$('#HandletiersCtrl').scope().renameTier($('#newName').val());
			$modalInstance.dismiss('ok');
		};

		$scope.deleteBoundary = function () {
			$('#HandletiersCtrl').scope().deleteBoundary();
			$modalInstance.dismiss('ok');
		};


		$scope.saveSpectroSettings = function () {
			var len = $('#windowLength').val();
			var from = $('#rangeFrom').val();
			var to = $('#rangeTo').val();
			var dyna = $('#dynamicRange').val();
			var win = $('#windowFunction').val();
			viewState.setspectroSettings(len, from, to, dyna, win);
			viewState.setmodalOpen(false);
			$modalInstance.dismiss('ok');

		};

		$scope.saveSSFF = function () {
			$rootScope.$broadcast('saveSSFFb4load');
			viewState.setmodalOpen(false);
			$modalInstance.dismiss('ok');
		};


		$scope.discardSSFF = function () {
			$rootScope.$broadcast('discardSSFFb4load');
			viewState.setmodalOpen(false);
			$modalInstance.dismiss('ok');
		};
	});