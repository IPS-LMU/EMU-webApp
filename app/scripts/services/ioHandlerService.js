'use strict';

angular.module('emuwebApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, $location, $q, HistoryService, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice, ConfigProviderService, Espsparserservice, Ssffdataservice, Websockethandler, Httphandler) {
		// shared service object
		var sServObj = {};

		sServObj.wsH = Websockethandler;

		/**
		 * default config is always loaded from same origin
		 */
		sServObj.httpGetDefaultConfig = function () {
			var prom = $http.get('configFiles/defaultConfig.json');
			return prom;
		};


		////////////////////////////
		// EMU-webApp protocol begins here
		//

		/**
		 *
		 */
		sServObj.getProtocol = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getProtocol not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getProtocol();
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getDoUserManagement = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getDoUserManagement not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getDoUserManagement();
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getDBconfigFile = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getDBconfigFile not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getDBconfigFile();
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				getProm = $http.get('testData/newAE/ae_DBconfig.json');
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getBundleList = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getBundleList not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getBundleList();
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				getProm = $http.get('testData/demoUttList.json');
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getBundle = function (name) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getBundle not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getBundle(name);
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				// getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
				getProm = $http.get('testData/testAeBundle.json'); // SIC SIC SIC HARDCODED -> name is ignored
			}

			return getProm;
		};


		/**
		 *
		 */
		sServObj.saveBundle = function (bundleData) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of saveBundle not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.saveBundle(bundleData);
			} 
			// else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				// getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
			// 	getProm = $http.get('testData/testAeBundle.json'); // SIC SIC SIC HARDCODED -> name is ignored
			// }

			return getProm;
		};

		//
		// EMU-webApp protocol ends here
		////////////////////////////

		/**
		 * pass through to Textgridparserservice
		 */
		sServObj.toTextGrid = function (labelJSO) {
			return (Textgridparserservice.toTextGrid(labelJSO));
		};


		return sServObj;
	});