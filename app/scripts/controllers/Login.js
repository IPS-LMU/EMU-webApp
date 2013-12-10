'use strict';

angular.module('emulvcApp')
	.controller('LoginCtrl', function ($scope, $rootScope, $http, ConfigProviderService, Iohandlerservice, viewState, dialogService) {

		$scope.loginData = {
			'username': '',
			'accesscode': '',
			'errorMsg': ''
		};

		$scope.tryLogin = function () {
			// bit strange to check pwd be4 username... but anyway
			Iohandlerservice.wsH.checkAccessCode($scope.loginData.accesscode).then(function (codeRes) {
				if (codeRes === 'CORRECT') {
					console.log('u are the champion');
					Iohandlerservice.wsH.getUsrUttList($scope.loginData.username).then(function (usrRes) {
						if (usrRes === 'USER NOT FOUND') {
							$scope.loginData.errorMsg = usrRes;
						} else {
							$scope.loginData.errorMsg = 'USER FOUND';
							$rootScope.$broadcast('newUserLoggedOn', $scope.loginData.username);
							$scope.cancel();
						}
					});
				} else {
					$scope.loginData.errorMsg = 'Error wrong access code!!';
				}
			});
		};

		//
		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
			// console.log("CURSOR");
		};

		//
		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};

		//
		$scope.cancel = function () {
			dialogService.close();
		};
	});