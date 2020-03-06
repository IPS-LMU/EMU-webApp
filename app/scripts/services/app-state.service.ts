import * as angular from 'angular';

/**
 * @ngdoc service
 * @name emuwebApp.appStateService
 * @description
 * # AppStateService
 * Service in the emuwebApp.
 */
class AppStateService{

	private $log;
	private $rootScope;
	private $location;
	private DragnDropService;
	private DragnDropDataService;
	private viewState;
	private Iohandlerservice;
	private loadedMetaDataService;
	private Soundhandlerservice;
	private DataService;
	private Ssffdataservice;
	private HistoryService;

	constructor($log, $rootScope, $location, DragnDropService, DragnDropDataService, viewState, Iohandlerservice, loadedMetaDataService, Soundhandlerservice, DataService, Ssffdataservice, HistoryService){
		this.$log = $log;
		this.$rootScope = $rootScope;
		this.$location = $location;
		this.DragnDropService = DragnDropService;
		this.DragnDropDataService = DragnDropDataService;
		this.viewState = viewState;
		this.Iohandlerservice = Iohandlerservice;
		this.loadedMetaDataService = loadedMetaDataService;
		this.Soundhandlerservice = Soundhandlerservice;
		this.DataService = DataService;
		this.Ssffdataservice = Ssffdataservice;
		this.HistoryService = HistoryService;

	}

			/**
		 *
		 */
		public resetToInitState() {
			if(this.Iohandlerservice.wsH.isConnected()) {
				this.Iohandlerservice.wsH.disconnectWarning().then(function () {
					this.$log.info('Closing websocket connection to server');
					this.Iohandlerservice.wsH.closeConnect();
				});
			}
			// $scope.curBndl = {};
			this.loadedMetaDataService.resetToInitState();
			this.Soundhandlerservice.audioBuffer = {};
			this.DataService.setData({});
			this.DragnDropDataService.resetToInitState();
			this.DragnDropService.resetToInitState();
			this.Ssffdataservice.data = [];
			this.HistoryService.resetToInitState();
			this.viewState.setState('noDBorFilesloaded');
			this.viewState.somethingInProgress = false;
			this.viewState.resetToInitState();
			this.HistoryService.resetToInitState();
			this.viewState.showDropZone = true;
			this.$location.url(this.$location.path()); // reset URL without get values
			this.$rootScope.$broadcast('resetToInitState');
			//$scope.loadDefaultConfig();
		};
		
		public reloadToInitState = function (session) {
			this.Iohandlerservice.wsH.closeConnect();
			// $scope.curBndl = {};
			var url = this.viewState.url;
			this.loadedMetaDataService.resetToInitState();
			this.Soundhandlerservice.audioBuffer = {};
			this.DataService.setData({});
			this.DragnDropDataService.resetToInitState();
			this.DragnDropService.resetToInitState();
			this.Ssffdataservice.data = [];
			this.HistoryService.resetToInitState();
			this.viewState.setState('noDBorFilesloaded');
			this.viewState.somethingInProgress = false;
			this.HistoryService.resetToInitState();
			this.viewState.resetToInitState();
			this.$rootScope.$broadcast('reloadToInitState', {url:url, session:session, reload:true });
		};

}


angular.module('emuwebApp')
	.service('appStateService', AppStateService);
