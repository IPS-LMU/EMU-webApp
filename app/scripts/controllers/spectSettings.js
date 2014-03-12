'use strict';

angular.module('emuwebApp')
	.controller('SpectsettingsCtrl', function ($scope, dialogService, viewState) {

		$scope.vs = viewState;

		$scope.options = Object.keys($scope.vs.getWindowFunctions());
		$scope.selWindowInfo = {};
		$scope.selWindowInfo.name = Object.keys($scope.vs.getWindowFunctions())[$scope.vs.spectroSettings.window - 1];
		
		console.log(Object.keys($scope.vs.getWindowFunctions())[$scope.vs.spectroSettings.window - 1]);

		$scope.modalVals = {
			'rangeFrom': $scope.vs.spectroSettings.rangeFrom,
			'rangeTo': $scope.vs.spectroSettings.rangeTo,
			'dynamicRange': $scope.vs.spectroSettings.dynamicRange,
			'windowLength': $scope.vs.spectroSettings.windowLength,
			'window': $scope.vs.spectroSettings.window
		};

		//
		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
		};

		//
		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};

		//
		$scope.saveSpectroSettings = function () {
			console.log($scope.modalVals);
			console.log($scope.selWindowInfo.name);
			viewState.setspectroSettings($scope.modalVals.windowLength, $scope.modalVals.rangeFrom, $scope.modalVals.rangeTo, $scope.modalVals.dynamicRange, $scope.selWindowInfo.name);
			$scope.cancel();
		};

		//
		$scope.cancel = function () {
			dialogService.close();
		};
	});