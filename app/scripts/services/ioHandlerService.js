'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, $location, $q, HistoryService, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice, ConfigProviderService, Espsparserservice, Ssffdataservice, Websockethandler, Httphandler, Appcachehandler) {
		// shared service object
		var sServObj = {};

		sServObj.wsH = Websockethandler;


		Appcachehandler.checkForNewVersion();


		/**
		 *
		 */
		sServObj.httpGetDefaultConfig = function () {
			var prom = $http.get('configFiles/defaultConfig.json');
			return prom;
		};

		/**
		 *
		 */
		sServObj.getUttList = function (filePath) {
			var getProm;
			if (ConfigProviderService.vals.main.comMode === 'http:GET') {
				getProm = Httphandler.getUttList(filePath);
			} else if (ConfigProviderService.vals.main.comMode === 'ws') {
				alert('handle ws case for get utt list');
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getUsrUttList = function (name) {
			var getProm;
			if (ConfigProviderService.vals.main.comMode === 'http:GET') {
				alert('handle ws case for get utt list');
			} else if (ConfigProviderService.vals.main.comMode === 'ws') {
				getProm = Websockethandler.getUsrUttList(name);
			}

			return getProm;
		};


		/**
		 *
		 */
		sServObj.getUtt = function (utt) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'http:GET') {
				getProm = Httphandler.getUtt(utt);
			} else if (ConfigProviderService.vals.main.comMode === 'ws') {
				getProm = Websockethandler.getUtt(utt);
			}

			return getProm;
		};

    ////////////////////////////
    // new protocol begins here
    //

		//
		sServObj.getProtocol = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'http:GET') {
				alert('http:GET version of getProtocol not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'ws') {
				getProm = Websockethandler.getProtocol();
			}

			return getProm;
		};

		//
		sServObj.getDBconfigFile = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'http:GET') {
				alert('http:GET version of getProtocol not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'ws') {
				getProm = Websockethandler.getDBconfigFile();
			}

			return getProm;
		};

		//
		sServObj.getBundleList = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'http:GET') {
				alert('http:GET version of getProtocol not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'ws') {
				getProm = Websockethandler.getBundleList();
			}

			return getProm;
		};

    //
    sServObj.getBundle = function (name, perspectiveIdx) {
      var getProm;

      if (ConfigProviderService.vals.main.comMode === 'http:GET') {
        alert('http:GET version of getBundle not implemented');
      } else if (ConfigProviderService.vals.main.comMode === 'ws') {
        getProm = Websockethandler.getBundle(name, perspectiveIdx);
      }

      return getProm;
    };


    //
    // new protocol ends here
    ////////////////////////////

		//
		sServObj.getDoUserManagement = function () {
			var getProm;
			if (ConfigProviderService.vals.main.comMode === 'http:GET') {
				alert('http:GET version of getProtocol not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'ws') {
				getProm = Websockethandler.getDoUserManagement();
			}

			return getProm;
		};

		//
		sServObj.saveUtt = function (utt) {
			var getProm;
			if (ConfigProviderService.vals.main.comMode === 'http:GET') {
				alert('http:GET version of saveUtt not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'ws') {
				getProm = Websockethandler.saveUtt(utt);
			}

			return getProm;
		};


		/**
		 * pass through to Textgridparserservice
		 */
		sServObj.toTextGrid = function (labelJSO) {
			return (Textgridparserservice.toTextGrid(labelJSO));
		};


		return sServObj;
	});