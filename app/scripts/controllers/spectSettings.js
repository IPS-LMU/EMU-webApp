'use strict';

angular.module('emuwebApp')
	.controller('spectSettingsCtrl', function ($scope, modalService, viewState, DataService, mathHelperService, Soundhandlerservice) {

		$scope.vs = viewState;

		$scope.options = Object.keys($scope.vs.getWindowFunctions());
		$scope.selWindowInfo = {};
		$scope.selWindowInfo.name = Object.keys($scope.vs.getWindowFunctions())[$scope.vs.spectroSettings.window - 1];
		$scope.errorID = [];
		$scope.upperBoundary = '';

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
		    $scope.errorID = [];
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
		$scope.cssError = function (id, id2) {
		    if($scope.errorID[id]) {
		        return {'background': '#f00'}
		    }
		    if(id2!==undefined) {
		        if($scope.errorID[id2]) {
		            return {'background': '#f00'}
		        }		        
		    }
		};

		/**
		 *
		 */
		$scope.htmlError = function (id) {
		    return $scope.errorID[id];
		};
		

		/**
		 *
		 */
		$scope.saveSpectroSettings = function () {
		    var error = false;
		    $scope.errorID.forEach(function(entry) {
		        if(entry===true) {
		            error = true;
		        }
		    });
			if(!error) {
				viewState.setspectroSettings($scope.modalVals.windowSizeInSecs, $scope.modalVals.rangeFrom, $scope.modalVals.rangeTo, $scope.modalVals.dynamicRange, $scope.selWindowInfo.name, $scope.modalVals.drawHeatMapColors, $scope.modalVals.preEmphasisFilterFactor, $scope.modalVals.heatMapColorAnchors);
				$scope.reset();
			} 		
		};
		
		/**
		 *
		 */
		$scope.checkSpectroSettings = function () {
		    if ($scope.modalVals.heatMapColorAnchors[0][0] % 1 !== 0 || 
		        $scope.modalVals.heatMapColorAnchors[0][1] % 1 !== 0 || 
		        $scope.modalVals.heatMapColorAnchors[0][2] % 1 !== 0 || 
		        $scope.modalVals.heatMapColorAnchors[1][0] % 1 !== 0 || 
		        $scope.modalVals.heatMapColorAnchors[1][1] % 1 !== 0 || 
		        $scope.modalVals.heatMapColorAnchors[1][2] % 1 !== 0 || 
		        $scope.modalVals.heatMapColorAnchors[2][0] % 1 !== 0 || 
		        $scope.modalVals.heatMapColorAnchors[2][1] % 1 !== 0 ||
		        $scope.modalVals.heatMapColorAnchors[2][2] % 1 !== 0 ) {
		            $scope.errorID[8] = true;
		    }
		    else {
		        $scope.errorID[8] = false;
		    }
			if(isNaN($scope.modalVals.preEmphasisFilterFactor * Soundhandlerservice.wavJSO.SampleRate)) {
			    $scope.errorID[7] = true;
			}
		    else {
		        $scope.errorID[7] = false;
		    }
			if(isNaN(Soundhandlerservice.wavJSO.SampleRate * $scope.modalVals.windowSizeInSecs)) {
			    $scope.errorID[6] = true;		
			}
		    else {
		        $scope.errorID[6] = false;
		    }
			if ($scope.modalVals.dynamicRange % 1 !== 0) {
			    $scope.errorID[5] = true;
			}
		    else {
		        $scope.errorID[5] = false;
		    }
			if ($scope.modalVals.rangeFrom % 1 !== 0) {
			    $scope.errorID[4] = true;
			}
		    else {
		        $scope.errorID[4] = false;
		    }
			if ($scope.modalVals.rangeTo % 1 !== 0) {
			    $scope.errorID[3] = true;
			}
		    else {
		        $scope.errorID[3] = false;
		    }
			if ($scope.modalVals.rangeFrom < 0) {
			    $scope.errorID[2] = true;
			}
		    else {
		        $scope.errorID[2] = false;
		    }
		    $scope.upperBoundary = DataService.data.sampleRate / 2;
			if ($scope.modalVals.rangeTo > $scope.upperBoundary) {
			    $scope.errorID[1] = true;			
			}
		    else {
		        $scope.errorID[1] = false;
		    }
		};

	});