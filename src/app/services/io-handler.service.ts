import * as angular from 'angular';
import { encode } from 'punycode';

class IoHandlerService{
	
	private $rootScope;
	private $http; 
	private $location; 
	private $q; 
	private $window;
	private HistoryService; 
	private ViewStateService; 
	private SoundHandlerService; 
	private SsffParserService; 
	private WavParserService; 
	private TextGridParserService; 
	private ConfigProviderService; 
	private EspsParserService; 
	private SsffDataService; 
	private WebSocketHandlerService; 
	private DragnDropDataService;
	private LoadedMetaDataService;
	
	constructor($rootScope, $http, $location, $q, $window, HistoryService, ViewStateService, SoundHandlerService, SsffParserService, WavParserService, TextGridParserService, ConfigProviderService, EspsParserService, SsffDataService, WebSocketHandlerService, DragnDropDataService, LoadedMetaDataService) {
		
		this.$rootScope = $rootScope;
		this.$http = $http; 
		this.$location = $location; 
		this.$q = $q; 
		this.$window = $window;
		this.HistoryService = HistoryService; 
		this.ViewStateService = ViewStateService; 
		this.SoundHandlerService = SoundHandlerService; 
		this.SsffParserService = SsffParserService; 
		this.WavParserService = WavParserService; 
		this.TextGridParserService = TextGridParserService; 
		this.ConfigProviderService = ConfigProviderService; 
		this.EspsParserService = EspsParserService; 
		this.SsffDataService = SsffDataService; 
		this.WebSocketHandlerService = WebSocketHandlerService; 
		this.DragnDropDataService = DragnDropDataService;
		this.LoadedMetaDataService = LoadedMetaDataService;
		
	}
	/**
	* default config is always loaded from same origin
	*/
	public httpGetDefaultConfig() {
		var prom = this.$http.get('configFiles/default_emuwebappConfig.json');
		return prom;
	};
	
	
	/**
	* default config is always loaded from same origin
	*/
	public httpGetPath(path, respType, ignoreComMode: boolean = false) {
		if(this.ConfigProviderService.vals.main.comMode !== "GITLAB" || ignoreComMode){
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
			getProm = this.WebSocketHandlerService.getProtocol();
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
			getProm = this.WebSocketHandlerService.getDoUserManagement();
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
			getProm = this.WebSocketHandlerService.logOnUser(name, pwd);
		}
		
		return getProm;
	};
	
	/**
	*
	*/
	public getDBconfigFile(nameOfDB) {
		var getProm;
		
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			// console.error('CORS version of getDBconfigFile not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.getDBconfigFile();
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			getProm = this.$http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_DBconfig.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB'){
			var searchObject = this.$location.search();
			let gitlabPath = this.getGitlabPathFromSearchObject(searchObject);
			getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + gitlabPath + searchObject.emuDBname + '_DBconfig.json/raw?ref=master', {
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
			getProm = this.WebSocketHandlerService.getBundleList();
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			getProm = this.$http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_bundleList.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			let searchObject = this.$location.search();
			let gitlabPath = this.getGitlabPathFromSearchObject(searchObject);
			getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + gitlabPath + 'bundleLists%2F' + searchObject.bundleListName + '_bundleList.json/raw?ref=master', {
				method: 'GET',
				headers: {
					'PRIVATE-TOKEN': searchObject.privateToken
				}
			}).then((resp) => { return(resp.json())});
		}
		
		return getProm;
	};

	private getGitlabPathFromSearchObject(searchObject, UriEncode = true) {
		let gitlabPath = "";
		if(typeof searchObject.gitlabPath != "undefined") {
			gitlabPath = searchObject.gitlabPath;
			//Strip out any leading slashes
			while(gitlabPath.indexOf("/") == 0) {
				gitlabPath = gitlabPath.substr(1, gitlabPath.length);
			}
			//Make sure we have a trailing slash
			if(gitlabPath.indexOf("/", gitlabPath.length-1) == -1) {
				gitlabPath += "/";
			}
			if(UriEncode) {
				gitlabPath = encodeURIComponent(gitlabPath);
			}
		}
		
		return gitlabPath;
	}
	
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
			getProm = this.WebSocketHandlerService.getBundle(name, session);
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			// getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
			getProm = this.$http.get('demoDBs/' + nameOfDB + '/' + name + '_bndl.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			var searchObject = this.$location.search();

			let gitlabPath = this.getGitlabPathFromSearchObject(searchObject);
			var bndlURL = searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + gitlabPath + session + '_ses%2F' + name + '_bndl%2F';
			var neededTracks = this.ConfigProviderService.findAllTracksInDBconfigNeededByEMUwebApp();
			var ssffFiles = [];
			
			neededTracks.forEach((tr) => {
				ssffFiles.push({ 
					encoding: "GETURL", 
					data: bndlURL + name + "." + tr.fileExtension + '/raw?ref=master',
					fileExtension: tr.fileExtension // this is redundant when doing the GETUR hack but has to be set to satisfy the validator
				});
			});
			if(searchObject.useLFS !== "true"){
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
				
			} else {
				console.log("using LFS");
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
			getProm = this.WebSocketHandlerService.saveBundle(bundleData);
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			// console.log(bundleData);
			var searchObject = this.$location.search();
			let gitlabPath = this.getGitlabPathFromSearchObject(searchObject, false);
			var bndlPath = gitlabPath + bundleData.session + '_ses/' + bundleData.annotation.name + '_bndl/';
			// var bndlURL = searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + bndlPath;
			var actions = [{ 
				action: "update", // _annot.json
				file_path: bndlPath + bundleData.annotation.name + "_annot.json",
				content: JSON.stringify(bundleData.annotation, null, 4),
				encoding: "text"
			},
			{ 
				action: "update", // _bundleList.json
				file_path: gitlabPath + 'bundleLists/' + searchObject.bundleListName + "_bundleList.json",
				content: JSON.stringify(this.LoadedMetaDataService.getBundleList(), null, 4),
				encoding: "text"
			}
		];
		//console.log(bundleData.ssffFiles.length);
		if(bundleData.ssffFiles.length > 0){
			actions.push({ 
				action: "update", // SSFF file (only FORMANTS 4 now)
				file_path: bndlPath + bundleData.annotation.name + "." + bundleData.ssffFiles[0].fileExtension,
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
			trigger: "manualSave",
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
		getProm = this.WebSocketHandlerService.saveConfiguration(configData);
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
		prom = this.EspsParserService.asyncParseEsps(string, this.ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedESPS');
	} else if (fileType === 'TEXTGRID') {
		prom = this.TextGridParserService.asyncParseTextGrid(string, this.ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTEXTGRID');
	} else if (fileType === 'annotJSON') {
		var def = this.$q.defer();
		prom = def.promise;
		def.resolve(angular.fromJson(string));
	}
	
	return prom;
};

}

angular.module('emuwebApp')
.service('IoHandlerService', ['$rootScope', '$http', '$location', '$q', '$window', 'HistoryService', 'ViewStateService', 'SoundHandlerService', 'SsffParserService', 'WavParserService', 'TextGridParserService', 'ConfigProviderService', 'EspsParserService', 'SsffDataService', 'WebSocketHandlerService', 'DragnDropDataService', 'LoadedMetaDataService', IoHandlerService]);
