'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.appStateService
 * @description
 * # appStateService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('appStateService', function appStateService($log, $rootScope, viewState, Iohandlerservice, loadedMetaDataService, Soundhandlerservice, DataService, Ssffdataservice, HistoryService) {

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
			DataService.setData({});
			Ssffdataservice.data = [];
			HistoryService.resetToInitState();
			viewState.setState('noDBorFilesloaded');
			viewState.somethingInProgress = false;
			viewState.resetToInitState();
			HistoryService.resetToInitState();
			viewState.showDropZone = true;
			$rootScope.$broadcast('resetToInitState');
			//$scope.loadDefaultConfig();


		};

		return sServObj;
	});