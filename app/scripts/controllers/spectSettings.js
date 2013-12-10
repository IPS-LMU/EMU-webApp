'use strict';

angular.module('emulvcApp')
	.controller('SpectsettingsCtrl', function ($scope, dialogService, viewState) {

		$scope.vs = viewState;

		$scope.modalVals = {
			'rangeFrom': $scope.vs.spectroSettings.rangeFrom,
			'rangeTo': $scope.vs.spectroSettings.rangeTo,
			'windowLength':$scope.vs.spectroSettings.windowLength
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
		};

		//
		$scope.cancel = function () {
			dialogService.close();
		};
	});