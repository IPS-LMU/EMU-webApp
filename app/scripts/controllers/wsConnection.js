'use strict';

angular.module('emulvcApp')
	.controller('WsconnectionCtrl', function ($scope, ConfigProviderService, Iohandlerservice, viewState, dialogService) {

		$scope.wsServerUrl = ConfigProviderService.vals.main.wsServerUrl;

		$scope.connectionError = '';
		viewState.focusInTextField = true;

		$scope.tryConnection = function () {
			console.log($scope.wsServerUrl);
			var conProm = Iohandlerservice.wsH.initConnect($scope.wsServerUrl); // SIC don't use wsH directly
			conProm.then(function (val) {
				// console.log(val)
				if (val.type === 'error') {
					$scope.connectionError = 'ERROR trying to connect to ws-server';
				} else if (val.type === 'open') {
					viewState.focusInTextField = false;
					dialogService.close();
				}
			});
			// $scope.openModal('views/login.html', 'dialog', true);
		};

	});