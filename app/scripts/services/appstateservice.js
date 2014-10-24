'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.appStateService
 * @description
 * # appStateService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('appStateService', function appStateService($log, Iohandlerservice, loadedMetaDataService, Soundhandlerservice, LevelService, Ssffdataservice, HistoryService) {
		// shared service object
		var sServObj = {};
		/**
		 *
		 */
		sServObj.resetToInitState = function () {
			if (Iohandlerservice.wsH.isConnected()) {
				Iohandlerservice.wsH.disconnectWarning().then(function (resp) {
					$log.info('Closing websocket connection to server');
					Iohandlerservice.wsH.closeConnect();
				});
			}
			// $scope.curBndl = {};
			loadedMetaDataService.resetToInitState()
			Soundhandlerservice.wavJSO = {};
			LevelService.data = {};
			Ssffdataservice.data = [];
			HistoryService.resetToInitState();
			viewState.setState('noDBorFilesloaded');
			$scope.$broadcast('resetToInitState');

			viewState.somethingInProgress = false;
			viewState.resetToInitState();

			viewState.showDropZone = true;
			$scope.loadDefaultConfig();


		};

		return sServObj;
	});