import * as angular from 'angular';

/**
 * @ngdoc service
 * @name emuwebApp.AppStateService
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
	private ViewStateService;
	private IoHandlerService;
	private LoadedMetaDataService;
	private SoundHandlerService;
	private DataService;
	private SsffDataService;
	private HistoryService;

	constructor($log, $rootScope, $location, DragnDropService, DragnDropDataService, ViewStateService, IoHandlerService, LoadedMetaDataService, SoundHandlerService, DataService, SsffDataService, HistoryService){
		this.$log = $log;
		this.$rootScope = $rootScope;
		this.$location = $location;
		this.DragnDropService = DragnDropService;
		this.DragnDropDataService = DragnDropDataService;
		this.ViewStateService = ViewStateService;
		this.IoHandlerService = IoHandlerService;
		this.LoadedMetaDataService = LoadedMetaDataService;
		this.SoundHandlerService = SoundHandlerService;
		this.DataService = DataService;
		this.SsffDataService = SsffDataService;
		this.HistoryService = HistoryService;

	}

			/**
		 *
		 */
		public resetToInitState() {
			// SIC IoHandlerService.WebSocketHandlerService is private
			if(this.IoHandlerService.WebSocketHandlerService.isConnected()) {
				this.IoHandlerService.WebSocketHandlerService.disconnectWarning().then(() => {
					this.$log.info('Closing websocket connection to server');
					this.IoHandlerService.WebSocketHandlerService.closeConnect();
				});
			}
			// $scope.curBndl = {};
			this.LoadedMetaDataService.resetToInitState();
			this.SoundHandlerService.audioBuffer = {};
			this.DataService.setData({});
			this.DragnDropDataService.resetToInitState();
			this.DragnDropService.resetToInitState();
			this.SsffDataService.data = [];
			this.HistoryService.resetToInitState();
			this.ViewStateService.setState('noDBorFilesloaded');
			this.ViewStateService.somethingInProgress = false;
			this.ViewStateService.resetToInitState();
			this.HistoryService.resetToInitState();
			this.ViewStateService.showDropZone = true;
			this.$location.url(this.$location.path()); // reset URL without get values
			this.$rootScope.$broadcast('resetToInitState');
			//$scope.loadDefaultConfig();
		};
		
		public reloadToInitState (session) {
			// SIC IoHandlerService.WebSocketHandlerService is private
			this.IoHandlerService.WebSocketHandlerService.closeConnect();
			// $scope.curBndl = {};
			var url = this.ViewStateService.url;
			this.LoadedMetaDataService.resetToInitState();
			this.SoundHandlerService.audioBuffer = {};
			this.DataService.setData({});
			this.DragnDropDataService.resetToInitState();
			this.DragnDropService.resetToInitState();
			this.SsffDataService.data = [];
			this.HistoryService.resetToInitState();
			this.ViewStateService.setState('noDBorFilesloaded');
			this.ViewStateService.somethingInProgress = false;
			this.HistoryService.resetToInitState();
			this.ViewStateService.resetToInitState();
			this.$rootScope.$broadcast('reloadToInitState', {url:url, session:session, reload:true });
		};

}


angular.module('emuwebApp')
	.service('AppStateService', ['$log', '$rootScope', '$location', 'DragnDropService', 'DragnDropDataService', 'ViewStateService', 'IoHandlerService', 'LoadedMetaDataService', 'SoundHandlerService', 'DataService', 'SsffDataService', 'HistoryService', AppStateService]);
