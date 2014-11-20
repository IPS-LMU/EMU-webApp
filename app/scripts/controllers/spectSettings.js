'use strict';

angular.module('emuwebApp')
	.controller('spectSettingsCtrl', function ($scope, dialogService, viewState, DataService) {

		$scope.vs = viewState;

		$scope.options = Object.keys($scope.vs.getWindowFunctions());
		$scope.selWindowInfo = {};
		$scope.selWindowInfo.name = Object.keys($scope.vs.getWindowFunctions())[$scope.vs.spectroSettings.window - 1];

		$scope.modalVals = {
			'rangeFrom': $scope.vs.spectroSettings.rangeFrom,
			'rangeTo': $scope.vs.spectroSettings.rangeTo,
			'dynamicRange': $scope.vs.spectroSettings.dynamicRange,
			'windowSizeInSecs': $scope.vs.spectroSettings.windowSizeInSecs,
			'window': $scope.vs.spectroSettings.window,
			'drawHeatMapColors': $scope.vs.spectroSettings.drawHeatMapColors,
			'preEmphasisFilterFactor': $scope.vs.spectroSettings.preEmphasisFilterFactor,
			'heatMapColorAnchors': viewState.spectroSettings.heatMapColorAnchors
		};

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.setEditing(true);
			viewState.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.setEditing(false);
			viewState.setcursorInTextField(false);
		};

		/**
		 *
		 */
		$scope.getColorOfAnchor = function (anchorNr) {

			var curStyle = {
				'background-color': 'rgb(' + $scope.modalVals.heatMapColorAnchors[anchorNr][0] + ',' + $scope.modalVals.heatMapColorAnchors[anchorNr][1] + ',' + $scope.modalVals.heatMapColorAnchors[anchorNr][2] + ')',
				'width': '10px',
				'height': '10px'
			};
			return (curStyle);
		};
		
		/**
		 *
		 */
		$scope.cancel = function () {
			dialogService.close(false);
		};

		/**
		 *
		 */
		$scope.error = function (errorMsg) {
			dialogService.close();
			dialogService.open('views/error.html', 'ModalCtrl', 'Sorry: ' + errorMsg);
		};
		
		/**
		 *
		 */
		$scope.saveSpectroSettings = function () {
			if ($scope.modalVals.dynamicRange % 1 === 0) {
				if ($scope.modalVals.rangeFrom % 1 === 0) {
					if ($scope.modalVals.rangeTo % 1 === 0) {
						if ($scope.modalVals.rangeFrom >= 0) {
							if ($scope.modalVals.rangeTo <= DataService.data.sampleRate / 2) {
								viewState.setspectroSettings($scope.modalVals.windowSizeInSecs, $scope.modalVals.rangeFrom, $scope.modalVals.rangeTo, $scope.modalVals.dynamicRange, $scope.selWindowInfo.name, $scope.modalVals.drawHeatMapColors, $scope.modalVals.preEmphasisFilterFactor, $scope.modalVals.heatMapColorAnchors);
								$scope.cancel();
							} else {
								$scope.error('View Range (Hz) upper boundary is a value bigger than ' + DataService.data.sampleRate / 2);
							}
						} else {
							$scope.error('View Range (Hz) lower boundary is a value below zero');
						}
					} else {
						$scope.error('View Range (Hz) upper boundary has to be an Integer value.');
					}
				} else {
					$scope.error('View Range (Hz) lower boundary has to be an Integer value.');
				}
			} else {
				$scope.error('Dynamic Range has to be an Integer value.');
			}
		};

	});