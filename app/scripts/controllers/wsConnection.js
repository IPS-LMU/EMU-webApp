'use strict';

angular.module('emuwebApp')
	.controller('WsconnectionCtrl', function ($scope, ConfigProviderService, Iohandlerservice, viewState, dialogService) {
		$scope.serverInfos = {};
		$scope.serverInfos.Url = ConfigProviderService.vals.main.serverUrl;

		$scope.connectionError = '';

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.setEditing(true);
			viewState.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.setEditing(false);
			viewState.setcursorInTextField(false);
		};
		
		$scope.tryConnection = function () {
			dialogService.close($scope.serverInfos.Url);
		};

		$scope.cancel = function () {
			dialogService.close(false);
		};

	});