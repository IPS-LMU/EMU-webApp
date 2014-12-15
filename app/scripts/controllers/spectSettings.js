'use strict';

angular.module('emuwebApp')
	.controller('spectSettingsCtrl', function ($scope, modalService, viewState, DataService, mathHelperService, Soundhandlerservice) {

		$scope.vs = viewState;

		$scope.options = Object.keys($scope.vs.getWindowFunctions());
		$scope.selWindowInfo = {};
		$scope.selWindowInfo.name = Object.keys($scope.vs.getWindowFunctions())[$scope.vs.spectroSettings.window - 1];
		$scope.error = '';
		$scope.cssErrorID = 0;

		$scope.modalVals = {
			'rangeFrom': $scope.vs.spectroSettings.rangeFrom,
			'rangeTo': $scope.vs.spectroSettings.rangeTo,
			'dynamicRange': $scope.vs.spectroSettings.dynamicRange,
			'windowSizeInSecs': $scope.vs.spectroSettings.windowSizeInSecs,
			'window': $scope.vs.spectroSettings.window,
			'drawHeatMapColors': $scope.vs.spectroSettings.drawHeatMapColors,
			'preEmphasisFilterFactor': $scope.vs.spectroSettings.preEmphasisFilterFactor,
			'heatMapColorAnchors': viewState.spectroSettings.heatMapColorAnchors,
			'_fftN': 512,
			'_windowSizeInSamples': Soundhandlerservice.wavJSO.SampleRate * $scope.vs.spectroSettings.windowSizeInSecs
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

		//////////////////////////
		// window size functions

		/**
		 *
		 */
		$scope.calcWindowSizeInSamples = function () {
			$scope.modalVals._windowSizeInSamples = Soundhandlerservice.wavJSO.SampleRate * $scope.modalVals.windowSizeInSecs;
		};

		/**
		 *
		 */
		$scope.calcFftN = function () {
			var fftN = mathHelperService.calcClosestPowerOf2Gt($scope.modalVals._windowSizeInSamples);
			// fftN must be greater than 512 (leads to better resolution of spectrogram)
			if (fftN < 512) {
				fftN = 512;
			}
			$scope.modalVals._fftN = fftN;
		};

		/**
		 *
		 */
		$scope.calcWindowSizeVals = function () {
			$scope.calcWindowSizeInSamples();
			$scope.calcFftN();
		};

		//
		////////////////////

		/**
		 *
		 */
		$scope.reset = function () {
		    $scope.error = '';
		    $scope.cssErrorID = 0;
			$scope.modalVals = {
				'rangeFrom': $scope.vs.spectroSettings.rangeFrom,
				'rangeTo': $scope.vs.spectroSettings.rangeTo,
				'dynamicRange': $scope.vs.spectroSettings.dynamicRange,
				'windowSizeInSecs': $scope.vs.spectroSettings.windowSizeInSecs,
				'window': $scope.vs.spectroSettings.window,
				'drawHeatMapColors': $scope.vs.spectroSettings.drawHeatMapColors,
				'preEmphasisFilterFactor': $scope.vs.spectroSettings.preEmphasisFilterFactor,
				'heatMapColorAnchors': viewState.spectroSettings.heatMapColorAnchors,
				'_fftN': 512,
				'_windowSizeInSamples': Soundhandlerservice.wavJSO.SampleRate * $scope.vs.spectroSettings.windowSizeInSecs
			};		    
			modalService.close();
		};

		/**
		 *
		 */
		$scope.cssError = function (id) {
		    if(id===$scope.cssErrorID) {
		        return {'background': '#f00'}
		    }
		};
		
		$scope.isFloat = function (mixed_var) {
		    return +mixed_var === mixed_var && (!isFinite(mixed_var) || !! (mixed_var % 1));
		}

		/**
		 *
		 */
		$scope.saveSpectroSettings = function () {
		    if($scope.isFloat($scope.modalVals.windowSizeInSecs)) {
				if ($scope.modalVals.dynamicRange % 1 === 0) {
					if ($scope.modalVals.rangeFrom % 1 === 0) {
						if ($scope.modalVals.rangeTo % 1 === 0) {
							if ($scope.modalVals.rangeFrom >= 0) {
								if ($scope.modalVals.rangeTo <= DataService.data.sampleRate / 2) {
									viewState.setspectroSettings($scope.modalVals.windowSizeInSecs, $scope.modalVals.rangeFrom, $scope.modalVals.rangeTo, $scope.modalVals.dynamicRange, $scope.selWindowInfo.name, $scope.modalVals.drawHeatMapColors, $scope.modalVals.preEmphasisFilterFactor, $scope.modalVals.heatMapColorAnchors);
									$scope.reset();
								} else {
									$scope.cssErrorID = 2;
									$scope.modalVals.rangeTo = '"' + $scope.modalVals.rangeTo + '" is bigger than ' + DataService.data.sampleRate / 2;
								}
							} else {
								$scope.cssErrorID = 1;
								$scope.modalVals.rangeFrom = '"' + $scope.modalVals.rangeFrom + '" is below zero.';
							}
						} else {
							$scope.cssErrorID = 2;
							$scope.modalVals.rangeTo = '"' + $scope.modalVals.rangeTo + '" is not an Integer.';
						}
					} else {
						$scope.cssErrorID = 1;
						$scope.modalVals.rangeFrom = '"' + $scope.modalVals.rangeFrom + '" is not an Integer.';
					}
				} else {
					$scope.cssErrorID = 4;
					$scope.modalVals.dynamicRange = '"' + $scope.modalVals.dynamicRange + '" is not an Integer.';
				}
			} else {
				$scope.cssErrorID = 3;
				$scope.modalVals.windowSizeInSecs = '"' + $scope.modalVals.windowSizeInSecs + '" is not an Float.';
			}
		};

	});