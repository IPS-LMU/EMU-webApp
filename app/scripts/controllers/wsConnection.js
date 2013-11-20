'use strict';

angular.module('emulvcApp')
	.controller('WsconnectionCtrl', function($scope, ConfigProviderService, Iohandlerservice) {

		$scope.wsServerUrl = ConfigProviderService.vals.main.wsServerUrl;

		$scope.tryConnection = function() {
			Iohandlerservice.wsH.initConnect($scope.wsServerUrl);
			$scope.cancel();
			$scope.openModal('views/login.html', 'dialog', true);
		};

	});