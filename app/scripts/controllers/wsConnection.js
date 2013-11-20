'use strict';

angular.module('emulvcApp')
	.controller('WsconnectionCtrl', function($scope, ConfigProviderService, Iohandlerservice) {

		$scope.wsServerUrl = ConfigProviderService.vals.main.wsServerUrl;

		$scope.connectionError = '';

		$scope.tryConnection = function() {
			var conProm = Iohandlerservice.wsH.initConnect($scope.wsServerUrl);
			conProm.then(function(val) {
				console.log(val)
				if (val.type === 'error') {
					$scope.connectionError = 'ERROR trying to connect to ws-server';
				} else if (val.type === 'open') {
					$scope.cancel();
				}
			})
			// $scope.openModal('views/login.html', 'dialog', true);
		};

	});