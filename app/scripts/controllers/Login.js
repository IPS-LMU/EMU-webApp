'use strict';

angular.module('emulvcApp')
	.controller('LoginCtrl', function ($scope, $rootScope, $http, ConfigProviderService, Iohandlerservice, viewState) {
		$scope.username = '';
		$scope.passcode = '';
		$scope.loginError = '';

		$scope.tryLogin = function () {
			console.log(ConfigProviderService.vals.userManagment.passcode);
			console.log($scope.passcode);
			if ($scope.passcode === ConfigProviderService.vals.userManagment.passcode) {
				$scope.loginError = 'CORRECT PASSCODE!... getting users utterance list...';
				// var filePath = 'testData/' + $scope.username + '.json';

				Iohandlerservice.wsH.getUsrUttList($scope.username).then(function (usrRes) {
					if (usrRes === 'USER NOT FOUND') {

						$scope.loginError = usrRes;
					} else {
						$scope.loginError = 'USER FOUND';
						$rootScope.$broadcast('newUserLoggedOn', $scope.username);
						$scope.cancel();
					}
				});
			} else {
				$scope.loginError = 'WRONG PASSCODE!';
			}
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
	});