'use strict';

angular.module('emulvcApp')
	.controller('LoginCtrl', function($scope, $http, ConfigProviderService) {
		$scope.username = '';
		console.log(ConfigProviderService)
		$scope.passcode = '';
		$scope.loginError = '';

		$scope.tryLogin = function() {
			if ($scope.passcode === ConfigProviderService.vals.userManagment.passcode) {
				$scope.loginError = 'CORRECT PASSCODE!... getting users utterance list...';
				$http.get('testdata/' + $scope.username + '.json').success(function(data) {
					$scope.loginError = 'Loading data...';
				}).error(function() {
					console.log('asdfsadfasdf');
					$scope.loginError = 'WRONG USERNAME!!!';
				});
			} else {
				$scope.loginError = 'WRONG PASSCODE!';
			}
		}
	});