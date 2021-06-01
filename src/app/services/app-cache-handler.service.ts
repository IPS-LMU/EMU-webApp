import * as angular from 'angular';

class AppcacheHandlerService{

	private $http;
	private ModalService;
	private appCache;

	constructor($http, ModalService){
		this.$http = $http;
		this.ModalService = ModalService;
		// this.appCache = window.applicationCache;

		// // bind evts
		// if(typeof this.appCache !== 'undefined') {
			// appCache.addEventListener('progress', handleProgressEvent, false);

			// appCache.addEventListener('checking', handleCheckingEvent, false);
			// appCache.addEventListener('noupdate', handleNoupdateEvent, false);
			// appCache.addEventListener('downloading', handleDownloadingEvent, false);
			// appCache.addEventListener('progress', handleProgressEvent, false);
			// appCache.addEventListener('cached', handleCachedEvent, false);
			// this.appCache.addEventListener('updateready', this.handleUpdatereadyEvent, false);

			// appCache.addEventListener('obsolete', handleObsoleteEvent, false);
			// appCache.addEventListener('error', handleErrorEvent, false);
		// }
	}

		/**
		 *
		 */
		private handleUpdatereadyEvent() {
            // if(typeof this.appCache !== 'undefined') {
            //     this.ModalService.open('views/confirmModal.html', 'A new version of the EMU-WebApp is available and has already been downloaded and cached in your browser. Would you like to use it? CAUTION: A reload will delete all current changes... TIP: the next time you use the EMU-webApp you will automatically use the updated version)').then((res) => {
            //         if (res) {
            //             localStorage.removeItem('haveShownWelcomeModal');
            //             this.appCache.swapCache();
            //             window.location.reload();
            //         } else {
            //             localStorage.removeItem('haveShownWelcomeModal');
            //         }
            //     });
            // }
		};



		/////////////////////////////////////////////////
		// public api

		public checkForNewVersion(){
			// console.log('check for new version');
            // if(typeof this.appCache !== 'undefined') {
			// 	if ((this.appCache.status !== 0 && this.appCache.status !== 3)) { // uncached == 0 & downloading == 3
			// 		console.log('INFO: appCache.status: ' + this.appCache.status);
			// 		this.appCache.update();
			// 	}
            // }

            if ('serviceWorker' in navigator) {
				// console.log("service worker available")
                // navigator.serviceWorker.register('/sw-test/sw.js', {scope: '/sw-test/'})
                //     .then((reg) => {
                //         // registration worked
                //         console.log('Registration succeeded. Scope is ' + reg.scope);
                //     }).catch(function(error) {
                //     // registration failed
                //     console.log('Registration failed with ' + error);
                // });
            }
		};


}

angular.module('emuwebApp')
	.service('AppcacheHandlerService', ['$http', 'ModalService', AppcacheHandlerService]);
