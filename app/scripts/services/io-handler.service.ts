import * as angular from 'angular';

class Iohandlerservice{
	
	private $rootScope;
	private $http; 
	private $location; 
	private $q; 
	private $window;
	private HistoryService; 
	private viewState; 
	private Soundhandlerservice; 
	private Ssffparserservice; 
	private Wavparserservice; 
	private Textgridparserservice; 
	private ConfigProviderService; 
	private Espsparserservice; 
	private Ssffdataservice; 
	private Websockethandler; 
	private DragnDropDataService;
	private loadedMetaDataService;
	
	constructor($rootScope, $http, $location, $q, $window, HistoryService, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice, ConfigProviderService, Espsparserservice, Ssffdataservice, Websockethandler, DragnDropDataService, loadedMetaDataService) {
		
		this.$rootScope = $rootScope;
		this.$http = $http; 
		this.$location = $location; 
		this.$q = $q; 
		this.$window = $window;
		this.HistoryService = HistoryService; 
		this.viewState = viewState; 
		this.Soundhandlerservice = Soundhandlerservice; 
		this.Ssffparserservice = Ssffparserservice; 
		this.Wavparserservice = Wavparserservice; 
		this.Textgridparserservice = Textgridparserservice; 
		this.ConfigProviderService = ConfigProviderService; 
		this.Espsparserservice = Espsparserservice; 
		this.Ssffdataservice = Ssffdataservice; 
		this.Websockethandler = Websockethandler; 
		this.DragnDropDataService = DragnDropDataService;
		this.loadedMetaDataService = loadedMetaDataService;
		
	}
	/**
	* default config is always loaded from same origin
	*/
	public httpGetDefaultConfig() {
		var prom = this.$http.get('configFiles/default_emuwebappConfig.json');
		return prom;
	};
	
	/**
	* default design is always loaded from same origin
	*/
	public httpGetDefaultDesign() {
		var prom = this.$http.get('configFiles/default_emuwebappDesign.json');
		return prom;
	};
	
	/**
	* default config is always loaded from same origin
	*/
	public httpGetPath(path, respType) {
		if(this.ConfigProviderService.vals.main.comMode !== "GITLAB"){
			var prom = this.$http.get(path, {
				responseType: respType
			});
		} else {
			var searchObject = this.$location.search();
			prom = fetch(path, {
				method: 'GET',
				headers: {
					'PRIVATE-TOKEN': searchObject.privateToken
				}
			}).then((resp) => {
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
	public getProtocol() {
		var getProm;
		
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			// console.error('CORS version of getProtocol not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.Websockethandler.getProtocol();
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB'){
			// return mock values
			var defer = this.$q.defer();
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
	public getDoUserManagement() {
		var getProm;
		
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			// console.error('CORS version of getDoUserManagement not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.Websockethandler.getDoUserManagement();
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB'){
			// return mock values
			var defer = this.$q.defer();
			defer.resolve('NO');
			
			getProm = defer.promise;
		}
		
		return getProm;
	};
	
	/**
	*
	*/
	public logOnUser(name, pwd) {
		var getProm;
		
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			// console.error('CORS version of logOnUser not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.Websockethandler.logOnUser(name, pwd);
		}
		
		return getProm;
	};
	
	/**
	*
	*/
	public getDBconfigFile = function (nameOfDB) {
		var getProm;
		
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			// console.error('CORS version of getDBconfigFile not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.Websockethandler.getDBconfigFile();
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			getProm = this.$http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_DBconfig.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB'){
			var searchObject = this.$location.search();
			getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + searchObject.emuDBname + '_DBconfig.json/raw?ref=master', {
				method: 'GET',
				headers: {
					'PRIVATE-TOKEN': searchObject.privateToken
				}
			}).then((resp) => { return(resp.json()) });
			
		}
		
		return getProm;
	};
	
	/**
	*
	*/
	public getBundleList(nameOfDB) {
		var getProm;
		
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			// console.error('CORS version of getBundleList not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.Websockethandler.getBundleList();
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			getProm = this.$http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_bundleList.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			var searchObject = this.$location.search();
			getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/bundleLists%2F' + searchObject.bundleListName + '_bundleList.json/raw?ref=master', {
				method: 'GET',
				headers: {
					'PRIVATE-TOKEN': searchObject.privateToken
				}
			}).then((resp) => { return(resp.json())});
		}
		
		return getProm;
	};
	
	/**
	*
	*/
	public getBundle(name, session, nameOfDB) {
		var getProm;
		
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			// console.error('CORS version of getBundle not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'EMBEDDED') {
			getProm = this.DragnDropDataService.getBundle(name, session);
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.Websockethandler.getBundle(name, session);
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			// getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
			getProm = this.$http.get('demoDBs/' + nameOfDB + '/' + name + '_bndl.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			var searchObject = this.$location.search();
			var bndlURL = searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + session + '_ses%2F' + name + '_bndl%2F';
			var neededTracks = this.ConfigProviderService.findAllTracksInDBconfigNeededByEMUwebApp();
			var ssffFiles = [];
			
			neededTracks.forEach((tr) => {
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
				}).then((resp) => { return(resp.json()) })
			]).then((allResponses) => {
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
	public saveBundle(bundleData) {
		var getProm;
		
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			// console.error('CORS version of saveBundle not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.Websockethandler.saveBundle(bundleData);
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			// console.log(bundleData);
			var searchObject = this.$location.search();
			var bndlPath = bundleData.session + '_ses/' + bundleData.annotation.name + '_bndl/';
			// var bndlURL = searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + bndlPath;
			var actions = [{ 
				action: "update", // _annot.json
				file_path: bndlPath + bundleData.annotation.name + "_annot.json",
				content: JSON.stringify(bundleData.annotation, null, 4),
				encoding: "JSON"
			},
			{ 
				action: "update", // _bundleList.json
				file_path: 'bundleLists/' + searchObject.bundleListName + "_bundleList.json",
				content: JSON.stringify(this.loadedMetaDataService.getBundleList(), null, 4),
				encoding: "JSON"
			}
		];
		//console.log(bundleData.ssffFiles.length);
		if(bundleData.ssffFiles.length > 0){
			actions.push({ 
				action: "update", // SSFF file (only FORMANTS 4 now)
				file_path: bndlPath + bundleData.annotation.name + "." + "fms",
				content: bundleData.ssffFiles[0].data,
				encoding: "base64"
			});
		}
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
		
	} else if (this.ConfigProviderService.vals.main.comMode === 'EMBEDDED') {
		// this can only be reached if URL parameter: saveToWindowParent=true
		// send upload url to iframe owner
		var def = this.$q.defer();
		getProm = def.promise;
		window.parent.postMessage({
			data: bundleData
		}, '*');
		def.resolve();
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
public saveConfiguration(configData) {
	var getProm;
	
	if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
		console.error('CORS version of saveBundle not implemented');
	} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
		getProm = this.Websockethandler.saveConfiguration(configData);
	}
	return getProm;
};

//
// EMU-webApp protocol ends here
////////////////////////////

/**
* pass through to according parser
*/
public parseLabelFile(string, annotates, name, fileType) {
	var prom;
	if (fileType === 'ESPS') {
		prom = this.Espsparserservice.asyncParseEsps(string, this.ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedESPS');
	} else if (fileType === 'TEXTGRID') {
		prom = this.Textgridparserservice.asyncParseTextGrid(string, this.ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTEXTGRID');
	} else if (fileType === 'annotJSON') {
		var def = this.$q.defer();
		prom = def.promise;
		def.resolve(angular.fromJson(string));
	}
	
	return prom;
};

}

angular.module('emuwebApp')
.service('Iohandlerservice', Iohandlerservice);