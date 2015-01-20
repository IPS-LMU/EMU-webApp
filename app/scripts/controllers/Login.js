'use strict';

angular.module('emuwebApp')
	.controller('LoginCtrl', function ($scope, $rootScope, $http, ConfigProviderService, Iohandlerservice, viewState, modalService) {

		$scope.loginData = {
			'username': '',
			'password': '',
			'errorMsg': ''
		};
		/**
		 *
		 */
		$scope.tryLogin = function () {


			Iohandlerservice.logOnUser($scope.loginData.username, $scope.loginData.password).then(function (res) {
				if (res === 'LOGGEDON') {
					modalService.confirm();
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
		$scope.cancel = function () {
			modalService.close();
		};
	});