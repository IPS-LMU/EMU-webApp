'use strict';

angular.module('emuwebApp')
	.controller('LoginCtrl', function ($scope, $rootScope, $http, ConfigProviderService, Iohandlerservice, viewState, dialogService) {

		$scope.loginData = {
			'username': 'nikola',
			'password': 'nikola',
			'errorMsg': ''
		};
		/**
		 *
		 */
		$scope.tryLogin = function () {


			Iohandlerservice.logOnUser($scope.loginData.username, $scope.loginData.password).then(function (res) {
				if (res === 'LOGGEDON') {
					dialogService.close(true);
				} else {
					$scope.loginData.errorMsg = 'ERROR: ' + res;
				}
			});
		};
		// FOR DEVELOPMENT
		// $scope.tryLogin(); // for autologin uncomment and set username + password

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
			// console.log("CURSOR");
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};

		/**
		 *
		 */
		$scope.cancel = function () {
			dialogService.close(false);
		};
	});