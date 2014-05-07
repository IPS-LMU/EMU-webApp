'use strict';

angular.module('emuwebApp')
	.controller('WsconnectionCtrl', function ($scope, ConfigProviderService, Iohandlerservice, viewState, dialogService) {

		$scope.serverUrl = ConfigProviderService.vals.main.serverUrl;

		$scope.connectionError = '';
		viewState.focusInTextField = true;

		$scope.tryConnection = function () {
			dialogService.close($scope.serverUrl);
		};

		$scope.cancel = function () {
			dialogService.close(false);
		};

	});