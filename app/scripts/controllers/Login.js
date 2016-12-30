'use strict';

angular.module('emuwebApp')
	.controller('LoginCtrl', function ($scope, $rootScope, $http, ConfigProviderService, Iohandlerservice, viewState, modalService) {

		modalService.dataOut = {
			username: '',
			password: ''
		};

		/**
		 *
		 */
		$scope.tryLogin = function () {
			modalService.confirmContent();
		};
		// FOR DEVELOPMENT
		// $scope.tryLogin(); // for autologin uncomment and set username + password

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.setcursorInTextField(false);
		};

		/**
		 *
		 */
		$scope.cancel = function () {
			modalService.close();
		};
	});
