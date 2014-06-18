'use strict';

angular.module('emuwebApp')
	.controller('WsconnectionCtrl', function ($scope, ConfigProviderService, Iohandlerservice, viewState, dialogService) {
		$scope.serverInfos = {};
		$scope.serverInfos.Url = ConfigProviderService.vals.main.serverUrl;

		$scope.connectionError = '';
		viewState.focusInTextField = true;

		$scope.tryConnection = function () {
			dialogService.close($scope.serverInfos.Url);
		};

		$scope.cancel = function () {
			dialogService.close(false);
		};

	});