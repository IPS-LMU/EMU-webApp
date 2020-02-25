'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.appStateService
 * @description
 * # appStateService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('appStateService', function appStateService($log, $rootScope, $location, DragnDropService, DragnDropDataService, viewState, Iohandlerservice, loadedMetaDataService, Soundhandlerservice, DataService, Ssffdataservice, HistoryService) {

		// shared service object
		var sServObj = {};
		/**
		 *
		 */
		sServObj.resetToInitState = function () {
			if (Iohandlerservice.wsH.isConnected()) {
				Iohandlerservice.wsH.disconnectWarning().then(function () {
					$log.info('Closing websocket connection to server');
					Iohandlerservice.wsH.closeConnect();
				});
			}
			// $scope.curBndl = {};
			loadedMetaDataService.resetToInitState();
			Soundhandlerservice.audioBuffer = {};
			DataService.setData({});
			DragnDropDataService.resetToInitState();
			DragnDropService.resetToInitState();
			Ssffdataservice.data = [];
			HistoryService.resetToInitState();
			viewState.setState('noDBorFilesloaded');
			viewState.somethingInProgress = false;
			viewState.resetToInitState();
			HistoryService.resetToInitState();
			viewState.showDropZone = true;
			$location.url($location.path()); // reset URL without get values
			$rootScope.$broadcast('resetToInitState');
			//$scope.loadDefaultConfig();
		};
		
		sServObj.reloadToInitState = function (session) {
			Iohandlerservice.wsH.closeConnect();
			// $scope.curBndl = {};
			var url = viewState.url;
			loadedMetaDataService.resetToInitState();
			Soundhandlerservice.audioBuffer = {};
			DataService.setData({});
			DragnDropDataService.resetToInitState();
			DragnDropService.resetToInitState();
			Ssffdataservice.data = [];
			HistoryService.resetToInitState();
			viewState.setState('noDBorFilesloaded');
			viewState.somethingInProgress = false;
			HistoryService.resetToInitState();
			viewState.resetToInitState();
			$rootScope.$broadcast('reloadToInitState', {url:url, session:session, reload:true });
		};

		return sServObj;
	});
