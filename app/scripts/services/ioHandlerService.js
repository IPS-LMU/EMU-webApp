'use strict';

angular.module('emuwebApp')
	.service('Iohandlerservice', function Iohandlerservice(
		$rootScope, 
		$http, 
		$location, 
		$q, 
		HistoryService, 
		viewState, 
		Soundhandlerservice, 
		Ssffparserservice, 
		Wavparserservice, 
		Textgridparserservice, 
		ConfigProviderService, 
		Espsparserservice, 
		Ssffdataservice, 
		Websockethandler, 
		DragnDropDataService,
		loadedMetaDataService) {
		// shared service object
		var sServObj = {};

		// $http.defaults.useXDomain = true;

		sServObj.wsH = Websockethandler;

		/**
		 * default config is always loaded from same origin
		 */
		sServObj.httpGetDefaultConfig = function () {
			var prom = $http.get('configFiles/default_emuwebappConfig.json');
			return prom;
		};

		/**
		 * default design is always loaded from same origin
		 */
		sServObj.httpGetDefaultDesign = function () {
			var prom = $http.get('configFiles/default_emuwebappDesign.json');
			return prom;
		};

		/**
		 * default config is always loaded from same origin
		 */
		sServObj.httpGetPath = function (path, respType) {
			if(ConfigProviderService.vals.main.comMode !== "GITLAB"){
				var prom = $http.get(path, {
					responseType: respType
				});
			} else {
				var searchObject = $location.search();
				prom = fetch(path, {
					method: 'GET',
					headers: {
						'PRIVATE-TOKEN': searchObject.privateToken
					}
				}).then(function(resp) {
					if(respType === 'json'){
						return(resp.json());
					} else if(respType === 'arraybuffer'){
						return(resp.arrayBuffer());
					}
				});

			}
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
				// console.error('CORS version of getProtocol not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getProtocol();
			} else if (ConfigProviderService.vals.main.comMode === 'GITLAB'){
				// return mock values
				var defer = $q.defer();
				defer.resolve({
					protocol: 'EMU-webApp-websocket-protocol',
					version: '0.0.2'
				});

				getProm = defer.promise;
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getDoUserManagement = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
                // console.error('CORS version of getDoUserManagement not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getDoUserManagement();
			} else if (ConfigProviderService.vals.main.comMode === 'GITLAB'){
				// return mock values
				var defer = $q.defer();
				defer.resolve('NO');

				getProm = defer.promise;
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.logOnUser = function (name, pwd) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
                // console.error('CORS version of logOnUser not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.logOnUser(name, pwd);
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getDBconfigFile = function (nameOfDB) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
                // console.error('CORS version of getDBconfigFile not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getDBconfigFile();
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				getProm = $http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_DBconfig.json');
			} else if (ConfigProviderService.vals.main.comMode === 'GITLAB'){
				var searchObject = $location.search();
				getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + searchObject.emuDBname + '_DBconfig.json/raw?ref=master', {
					method: 'GET',
					headers: {
						'PRIVATE-TOKEN': searchObject.privateToken
					}
				}).then(function (resp) { resp.json() });

			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getBundleList = function (nameOfDB) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
                // console.error('CORS version of getBundleList not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getBundleList();
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				getProm = $http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_bundleList.json');
			} else if (ConfigProviderService.vals.main.comMode === 'GITLAB') {
				var searchObject = $location.search();
				getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/bundleLists%2F' + searchObject.bundleListName + '_bundleList.json/raw?ref=master', {
					method: 'GET',
					headers: {
						'PRIVATE-TOKEN': searchObject.privateToken
					}
				}).then(function (resp) {resp.json()});
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getBundle = function (name, session, nameOfDB) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
                // console.error('CORS version of getBundle not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'EMBEDDED') {
				getProm = DragnDropDataService.getBundle(name, session);
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getBundle(name, session);
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				// getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
				getProm = $http.get('demoDBs/' + nameOfDB + '/' + name + '_bndl.json');
			} else if (ConfigProviderService.vals.main.comMode === 'GITLAB') {
				var searchObject = $location.search();
				var bndlURL = searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + session + '_ses%2F' + name + '_bndl%2F';
				var neededTracks = ConfigProviderService.findAllTracksInDBconfigNeededByEMUwebApp();
				var ssffFiles = [];

				neededTracks.forEach(function (tr) {
					ssffFiles.push({ 
						encoding: "GETURL", 
						data: bndlURL + name + "." + tr.fileExtension + '/raw?ref=master',
						fileExtension: tr.fileExtension // this is redundant when doing the GETUR hack but has to be set to satisfy the validator
					});
				});
				getProm = Promise.all([
					fetch(bndlURL + name + '_annot.json/raw?ref=master', {
						method: 'GET',
						headers: {
							'PRIVATE-TOKEN': searchObject.privateToken
						}
					}).then(function (resp) { resp.json() })
				]).then(function(allResponses) {
					return {
						mediaFile: {
							encoding: "GETURL",
							data: bndlURL + name + '.wav/raw?ref=master'
						},
						annotation: allResponses[0],
						ssffFiles: ssffFiles
					};
				})

			}


			return getProm;
		};


		/**
		 *
		 */
		sServObj.saveBundle = function (bundleData) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
                // console.error('CORS version of saveBundle not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.saveBundle(bundleData);
			} else if (ConfigProviderService.vals.main.comMode === 'GITLAB') {
				console.log(bundleData);
				var searchObject = $location.search();
				var bndlPath = bundleData.session + '_ses/' + bundleData.annotation.name + '_bndl/';
				// var bndlURL = searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + bndlPath;
				var actions = [{ 
					action: "update", // _annot.json
					file_path: bndlPath + bundleData.annotation.name + "_annot.json",
					content: JSON.stringify(bundleData.annotation, null, 4)
				  },
				  { 
					action: "update", // _bundleList.json
					file_path: 'bundleLists/' + searchObject.bundleListName + "_bundleList.json",
					content: JSON.stringify(loadedMetaDataService.getBundleList(), null, 4)
				  },
				  { 
					action: "update", // SSFF file (only FORMANTS 4 now)
					file_path: bndlPath + bundleData.annotation.name + "." + "fms",
					content: bundleData.ssffFiles[0].data,
					encoding: "base64"
				  }
				]
				var payload = {
					branch: "master",
					commit_message: "EMU-webApp save by user: " + searchObject.bundleListName + "; session: " + bundleData.session + "; bundle: " + bundleData.annotation.name + ";",
					actions: actions
				};

				getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/commits', {
					method: 'POST',
					headers: {
						'PRIVATE-TOKEN': searchObject.privateToken,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				})

			}
			// else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
			// getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
			// 	getProm = $http.get('testData/testAeBundle.json'); // SIC SIC SIC HARDCODED -> name is ignored
			// }

			return getProm;
		};


		/**
		 *
		 */
		sServObj.saveConfiguration = function (configData) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
                console.error('CORS version of saveBundle not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.saveConfiguration(configData);
			}
			return getProm;
		};

		//
		// EMU-webApp protocol ends here
		////////////////////////////

		/**
		 * pass through to according parser
		 */
		sServObj.parseLabelFile = function (string, annotates, name, fileType) {
			var prom;
			if (fileType === 'ESPS') {
				prom = Espsparserservice.asyncParseEsps(string, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedESPS');
			} else if (fileType === 'TEXTGRID') {
				prom = Textgridparserservice.asyncParseTextGrid(string, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTEXTGRID');
			} else if (fileType === 'annotJSON') {
				var def = $q.defer();
				prom = def.promise;
				def.resolve(angular.fromJson(string));
			}

			return prom;
		};


		return sServObj;
	});
