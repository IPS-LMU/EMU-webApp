'use strict';

angular.module('emuwebApp')
	.controller('HandleLevelsCtrl', function ($scope, $http, $injector, Drawhelperservice) {

		$scope.dhs = Drawhelperservice;

		/**
		 * clear levelDetails when new utt is loaded
		 */
		$scope.$on('loadingNewUtt', function () {
			$scope.tds.data = {};
		});

		$scope.$on('errorMessage', function (evt, data) {
			dialogService.open('views/error.html', 'ModalCtrl', data);
		});

		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
		};

		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};

	});