import * as angular from 'angular';

angular.module('emuwebApp')
	.controller('LoginCtrl', ['$scope', '$rootScope', '$http', 'ConfigProviderService', 'IoHandlerService', 'ViewStateService', 'ModalService',
		function ($scope, $rootScope, $http, ConfigProviderService, IoHandlerService, ViewStateService, ModalService) {

		$scope.loginData = {
			'username': '',
			'password': '',
			'errorMsg': ''
		};
		/**
		 *
		 */
		$scope.tryLogin = function () {
			IoHandlerService.logOnUser($scope.loginData.username, $scope.loginData.password).then((res) => {
				if (res === 'LOGGEDON') {
					ModalService.confirm();
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
			ViewStateService.setEditing(true);
			ViewStateService.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			ViewStateService.setEditing(false);
			ViewStateService.setcursorInTextField(false);
		};

		/**
		 *
		 */
		$scope.cancel = function () {
			ModalService.close();
		};
	}]);