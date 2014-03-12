'use strict';

angular.module('emuwebApp')
	.controller('WsconnectionCtrl', function ($scope, ConfigProviderService, Iohandlerservice, viewState, dialogService) {

		$scope.wsServerUrl = ConfigProviderService.vals.main.wsServerUrl;

		$scope.connectionError = '';
		viewState.focusInTextField = true;

		$scope.tryConnection = function () {
			dialogService.close($scope.wsServerUrl);
		};

		$scope.cancel = function () {
			dialogService.close(false);
		};

	});