// import * as angular from 'angular';

// angular.module('emuwebApp')
// 	.controller('EmuWebAppController', function ($scope, $window, $document, $location, ViewStateService, HistoryService, IoHandlerService,
// 	                                        SoundHandlerService, ConfigProviderService, FontScaleService, SsffDataService,
// 	                                        LevelService, TextGridParserService, WavParserService, DrawHelperService,
// 	                                        ValidationService, AppcacheHandlerService, LoadedMetaDataService, DbObjLoadSaveService,
// 	                                        AppStateService, DataService, ModalService, BrowserDetectorService, HierarchyLayoutService) {
// 		// hook up services to use abbreviated forms
// 		$scope.cps = ConfigProviderService;
// 		$scope.hists = HistoryService;
// 		$scope.fontImage = FontScaleService;
// 		$scope.levServ = LevelService;
// 		$scope.dataServ = DataService;
// 		$scope.vs = ViewStateService;
// 		$scope.ssffds = SsffDataService;
// 		$scope.shs = SoundHandlerService;
// 		$scope.dhs = DrawHelperService;
// 		$scope.wps = WavParserService;
// 		$scope.io = IoHandlerService;
// 		$scope.ach = AppcacheHandlerService;
// 		$scope.lmds = LoadedMetaDataService;
// 		$scope.HierarchyLayoutService = HierarchyLayoutService;

// 		// init vars
// 		$scope.connectBtnLabel = 'connect';
// 		$scope.tmp = {};
// 		$scope.dbLoaded = false;
// 		$scope.is2dCancasesHidden = true;
// 		$scope.windowWidth = $window.outerWidth;
// 		$scope.internalVars = {};
// 		$scope.internalVars.showAboutHint = false;// this should probably be moved to ViewStateService

// 		$scope.xTmp = 123;
// 		$scope.yTmp = 321;
// 		// check for new version
// 		$scope.ach.checkForNewVersion();

// 		//////////////
// 		// bindings

// 		// bind window resize event
// 		angular.element($window).bind('resize', function () {
// 			LevelService.deleteEditArea();
// 			ViewStateService.setWindowWidth($window.outerWidth);
// 			if (ViewStateService.hierarchyState.isShown()) {
// 				++ViewStateService.hierarchyState.resize;
// 			}
// 			$scope.$digest();
// 		});

// 		// bind shift/alt keyups for history
// 		angular.element($window).bind('keyup', function (e) {
// 			if (e.keyCode === ConfigProviderService.vals.keyMappings.shift || e.keyCode === ConfigProviderService.vals.keyMappings.alt) {
// 				HistoryService.addCurChangeObjToUndoStack();
// 				$scope.$digest();
// 			}
// 		});

// 		// bind focus check for mouse on window and document ( mouse inside )
// 		angular.element($window).bind('blur', function () {
// 			ViewStateService.focusOnEmuWebApp = false;
// 		});

// 		// bind focus check for mouse on window and document ( mouse inside )
// 		angular.element($document).bind('blur', function () {
// 			ViewStateService.focusOnEmuWebApp = false;
// 		});

// 		// bind blur check for mouse on window and document ( mouse outside )
// 		angular.element($window).bind('focus', function () {
// 			ViewStateService.focusOnEmuWebApp = true;
// 		});

// 		// bind blur check for mouse on window and document ( mouse outside )
// 		angular.element($document).bind('focus', function () {
// 			ViewStateService.focusOnEmuWebApp = true;
// 		});

// 		// Take care of preventing navigation out of app (only if something is loaded, not in embedded mode and not developing (auto connecting))
// 		window.onbeforeunload = function () {
// 			if (ConfigProviderService.embeddedVals.audioGetUrl === '' && LoadedMetaDataService.getBundleList().length > 0 && !ConfigProviderService.vals.main.autoConnect && HistoryService.movesAwayFromLastSave > 0) {
// 				return 'Do you really wish to leave/reload the EMU-webApp? All unsaved changes will be lost...';
// 			}
// 		};

// 		//////////////
// 		// watches
// 		// watch if embedded override (if attributes are set on emuwebapp tag)
// 		// $scope.$watch('cps.embeddedVals.audioGetUrl', function (val) {
// 		// 	if (val !== undefined && val !== '') {
// 		// 		// check if both are set
// 		// 		$scope.loadFilesForEmbeddedApp();
// 		// 	}

// 		// }, true);

// 		//
// 		//////////////

// 		/////////////
// 		// listens

// 		// listen for connectionDisrupted event -> I don't like listens but in this case it might me the way to go...
// 		$scope.$on('connectionDisrupted', function () {
// 			AppStateService.resetToInitState();
// 		});

// 		// listen for resetToInitState
// 		$scope.$on('resetToInitState', function () {
// 			$scope.loadDefaultConfig();
// 		});
		
// 		$scope.$on('reloadToInitState', function (event, data) {
// 			$scope.loadDefaultConfig();
// 			ViewStateService.url = data.url;
// 			ViewStateService.somethingInProgressTxt = 'Connecting to server...';
// 			ViewStateService.somethingInProgress = true;
// 			IoHandlerService.WebSocketHandlerService.initConnect(data.url).then((message) => {
// 				if (message.type === 'error') {
// 					ModalService.open('views/error.html', 'Could not connect to websocket server: ' + data.url).then(() => {
// 						AppStateService.resetToInitState();
// 					});
// 				} else {
// 					$scope.handleConnectedToWSserver(data);
// 				}
// 			}, function (errMess) {
// 				ModalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => {
// 					AppStateService.resetToInitState();
// 				});
// 			});
// 		});

// 		//
// 		////////////

// 		// check if URL parameters are set -> if so set embedded flags! SIC this should probably be moved to loadFilesForEmbeddedApp
// 		var searchObject = $location.search();
// 		if (searchObject.audioGetUrl && searchObject.labelGetUrl && searchObject.labelType) {
// 			ConfigProviderService.embeddedVals.audioGetUrl = searchObject.audioGetUrl;
// 			ConfigProviderService.embeddedVals.labelGetUrl = searchObject.labelGetUrl;
// 			ConfigProviderService.embeddedVals.labelType = searchObject.labelType;
// 			ConfigProviderService.embeddedVals.fromUrlParams = true;
// 		}

// 		/**
// 		 *
// 		 */
// 		$scope.loadFilesForEmbeddedApp = function () {
//             var searchObject = $location.search();
// 			if (searchObject.audioGetUrl || searchObject.bndlJsonGetUrl) {
// 				if(searchObject.audioGetUrl){
//                     ConfigProviderService.embeddedVals.audioGetUrl = searchObject.audioGetUrl;
//                     ConfigProviderService.vals.activeButtons.openDemoDB = false;
//                     var promise = IoHandlerService.httpGetPath(
//                     	ConfigProviderService.embeddedVals.audioGetUrl,
// 						'arraybuffer'
// 					);
// 				}else{
//                     var promise = IoHandlerService.httpGetPath(searchObject.bndlJsonGetUrl, "application/json");
// 				}

// 				promise.then((data) => {
// 					ViewStateService.showDropZone = false;
// 					// set bundle name
// 					var tmp = ConfigProviderService.embeddedVals.audioGetUrl;
// 					LoadedMetaDataService.setCurBndlName(tmp.substr(0, tmp.lastIndexOf('.')).substr(tmp.lastIndexOf('/') + 1, tmp.length));

// 					//hide menu
// 					if (ViewStateService.getBundleListSideBarOpen()) {
// 						if(searchObject.saveToWindowParent !== "true"){
// 							ViewStateService.toggleBundleListSideBar(ConfigProviderService.design.animation.period);
// 						}
// 					}

// 					ViewStateService.somethingInProgressTxt = 'Loading DB config...';

// 					// test if DBconfigGetUrl is set if so use it
// 					var DBconfigGetUrl;
// 					if (searchObject.DBconfigGetUrl){
// 						DBconfigGetUrl = searchObject.DBconfigGetUrl;
// 					}else{
// 						DBconfigGetUrl = 'configFiles/embedded_emuwebappConfig.json';
// 					}

					
					
					
// 					// then get the DBconfigFile
// 					IoHandlerService.httpGetPath(DBconfigGetUrl).then((resp) => {
// 						// first element of perspectives is default perspective
// 						ViewStateService.curPerspectiveIdx = 0;
// 						ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
// 						// validate emuwebappConfigSchema
// 						var validRes = ValidationService.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
// 						if (validRes === true) {
// 							// turn of keybinding only on mouseover
// 							if (ConfigProviderService.embeddedVals.fromUrlParams) {
// 								ConfigProviderService.vals.main.catchMouseForKeyBinding = false;
// 							}

// 							ConfigProviderService.curDbConfig = resp.data;
							
// 							// validate DBconfigFileSchema!
// 							validRes = ValidationService.validateJSO('DBconfigFileSchema', ConfigProviderService.curDbConfig);
							
// 							if (validRes === true) {
// 								if(searchObject.saveToWindowParent === "true"){
// 									ConfigProviderService.vals.activeButtons.saveBundle = true;
// 								}
// 								var bndlList = [{'session': 'File(s)', 'name': 'from URL parameters'}];
// 								LoadedMetaDataService.setBundleList(bndlList);
// 								LoadedMetaDataService.setCurBndl(bndlList[0]);

// 								// set wav file
// 								ViewStateService.somethingInProgress = true;
// 								ViewStateService.somethingInProgressTxt = 'Parsing WAV file...';

// 								if(searchObject.audioGetUrl){
// 									WavParserService.parseWavAudioBuf(data.data).then((messWavParser) => {
// 										var audioBuffer = messWavParser;
// 										ViewStateService.curViewPort.sS = 0;
// 										ViewStateService.curViewPort.eS = audioBuffer.length;
// 										ViewStateService.resetSelect();
// 										SoundHandlerService.audioBuffer = audioBuffer;

// 										var respType;
// 										if(ConfigProviderService.embeddedVals.labelType === 'TEXTGRID'){
// 											respType = 'text';
// 										}else{
// 											// setting everything to text because the BAS webservices somehow respond with a
// 											// 200 (== successful response) but the data field is empty
// 											respType = 'text';
// 										}
// 										// get + parse file
// 										if(searchObject.labelGetUrl){
// 											IoHandlerService.httpGetPath(ConfigProviderService.embeddedVals.labelGetUrl, respType).then((data2) => {
// 												ViewStateService.somethingInProgressTxt = 'Parsing ' + ConfigProviderService.embeddedVals.labelType + ' file...';
// 												IoHandlerService.parseLabelFile(data2.data, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTextGrid', ConfigProviderService.embeddedVals.labelType).then((parseMess) => {

// 													var annot = parseMess;
// 													DataService.setData(annot);

// 													// if no DBconfigGetUrl is given generate levelDefs and co. from annotation
// 													if (!searchObject.DBconfigGetUrl){

// 														var lNames = [];
// 														var levelDefs = [];
// 														for(var i = 0, len = annot.levels.length; i < len; i++){
// 															var l = annot.levels[i];
// 															lNames.push(l.name);
// 															var attrDefs = [];
// 															for(var j = 0, len2 = l.items[0].labels.length; j < len2; j++){
// 																attrDefs.push({
// 																	'name': l.items[0].labels[j].name,
// 																	'type': 'string'
// 																});
// 															}
// 															levelDefs.push({
// 																'name': l.name,
// 																'type': l.type,
// 																'attributeDefinitions': attrDefs
// 															})
// 														}

// 														ConfigProviderService.curDbConfig.levelDefinitions = levelDefs;

// 														ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].levelCanvases.order = lNames;
// 													}

// 													ViewStateService.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);

// 													ViewStateService.somethingInProgressTxt = 'Done!';
// 													ViewStateService.somethingInProgress = false;
// 													ViewStateService.setState('labeling');

// 												}, function (errMess) {
// 													ModalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message);
// 												});

// 											}, function (errMess) {
// 												ModalService.open('views/error.html', 'Could not get label file: ' + ConfigProviderService.embeddedVals.labelGetUrl + ' ERROR ' + JSON.stringify(errMess.message, null, 4));
// 											});
// 										}else{
// 											// hide download + search buttons
// 											ConfigProviderService.vals.activeButtons.downloadAnnotation = false;
// 											ConfigProviderService.vals.activeButtons.downloadTextGrid = false;
// 											ConfigProviderService.vals.activeButtons.search = false;
// 											ViewStateService.somethingInProgressTxt = 'Done!';
// 											ViewStateService.somethingInProgress = false;
// 											ViewStateService.setState('labeling');
// 										}


// 									}, function (errMess) {
// 										ModalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message);
// 									});
//                                 }else{
//                                     DbObjLoadSaveService.loadBundle({name: 'fromURLparams'}, searchObject.bndlJsonGetUrl);
// 								}

// 							} else {
// 								ModalService.open('views/error.html', 'Error validating / checking DBconfig: ' + JSON.stringify(validRes, null, 4));
// 							}
// 						} else {
// 							ModalService.open('views/error.html', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4));
// 						}

// 					}, function (errMess) {
// 						ModalService.open('views/error.html', 'Could not get embedded_config.json: ' + errMess);
// 					});
// 				}, function (errMess) {
// 					ModalService.open('views/error.html', 'Could not get audio file:' + ConfigProviderService.embeddedVals.audioGetUrl + ' ERROR: ' + JSON.stringify(errMess, null, 4));
// 				});
// 			}
// 		};

// 		/**
// 		 * init load of config files
// 		 */
// 		$scope.loadDefaultConfig = function () {
// 			ViewStateService.somethingInProgress = true;
// 			ViewStateService.somethingInProgressTxt = 'Loading schema files';
// 			// load schemas first
// 			ValidationService.loadSchemas().then((replies) => {
// 				ValidationService.setSchemas(replies);
// 				IoHandlerService.httpGetDefaultDesign().then((response) => {
// 					ConfigProviderService.setDesign(response.data);
// 					IoHandlerService.httpGetDefaultConfig().then((response) => {
// 						ViewStateService.somethingInProgressTxt = 'Validating emuwebappConfig';
// 						var validRes = ValidationService.validateJSO('emuwebappConfigSchema', response.data);
// 						if (validRes === true) {
// 							ConfigProviderService.setVals(response.data);
// 							angular.copy($scope.cps.vals ,$scope.cps.initDbConfig);
// 							$scope.handleDefaultConfigLoaded();
// 							// loadFilesForEmbeddedApp if these are set
// 							$scope.loadFilesForEmbeddedApp();
// 							$scope.checkIfToShowWelcomeModal();
// 							// FOR DEVELOPMENT
// 							// $scope.aboutBtnClick();
// 							ViewStateService.somethingInProgress = false;
// 						} else {
// 							ModalService.open('views/error.html', 'Error validating / checking emuwebappConfigSchema: ' + JSON.stringify(validRes, null, 4)).then(() => {
// 								AppStateService.resetToInitState();
// 							});
// 						}

// 					}, (response) => { // onError
// 						ModalService.open('views/error.html', 'Could not get defaultConfig for EMU-webApp: ' + ' status: ' + response.status + ' headers: ' + response.headers + ' config ' + response.config).then(() => {
// 							AppStateService.resetToInitState();
// 						});
// 					});
// 				}, (response) => {
// 					ModalService.open('views/error.html', 'Could not get defaultConfig for EMU-webApp: ' + ' status: ' + response.status + ' headers: ' + response.headers + ' config ' + response.config).then(() => {
// 						AppStateService.resetToInitState();
// 					});
// 				});
// 			}, (errMess) => {
// 				ModalService.open('views/error.html', 'Error loading schema file: ' + JSON.stringify(errMess, null, 4)).then(() => {
// 					AppStateService.resetToInitState();
// 				});
// 			});
// 		};

// 		// call function on init
// 		$scope.loadDefaultConfig();

// 		$scope.checkIfToShowWelcomeModal = function () {
// 			var curVal = localStorage.getItem('haveShownWelcomeModal');
//             var searchObject = $location.search();

// 			if (!BrowserDetectorService.isBrowser.PhantomJS() && curVal === null && typeof searchObject.viewer_pane !== 'undefined') {
// 				localStorage.setItem('haveShownWelcomeModal', 'true');
// 				$scope.internalVars.showAboutHint = true;
// 			}

// 			// FOR DEVELOPMENT
// 			// $scope.internalVars.showAboutHint = true;
// 		};

// 		$scope.getCurBndlName = function () {
// 			return LoadedMetaDataService.getCurBndlName();
// 		};

// 		/**
// 		 * function called after default config was loaded
// 		 */
// 		$scope.handleDefaultConfigLoaded = function () {

// 			if (!ViewStateService.getBundleListSideBarOpen()) {
// 				ViewStateService.toggleBundleListSideBar(ConfigProviderService.design.animation.period);
// 			}
// 			// check if either autoConnect is set in DBconfig or as get parameter
// 			var searchObject = $location.search();

// 			if (ConfigProviderService.vals.main.autoConnect || searchObject.autoConnect === 'true') {
// 				if (typeof searchObject.serverUrl !== 'undefined') { // overwrite serverUrl if set as GET parameter
// 					ConfigProviderService.vals.main.serverUrl = searchObject.serverUrl;
// 				}
// 				if(searchObject.comMode !== "GITLAB"){
// 					// sic IoHandlerService.WebSocketHandlerService is private!
// 					IoHandlerService.WebSocketHandlerService.initConnect(ConfigProviderService.vals.main.serverUrl).then((message) => {
// 						if (message.type === 'error') {
// 							ModalService.open('views/error.html', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.serverUrl).then(() => {
// 							AppStateService.resetToInitState();
// 						});
// 						} else {
// 							$scope.handleConnectedToWSserver({session: null, reload: null});
// 						}
// 					}, function (errMess) {
// 						ModalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => {
// 							AppStateService.resetToInitState();
// 						});
// 					});
// 				} else {
// 					// set comMode and pretend we are connected to server
// 					// the IoHandlerService will take care of the rest
// 					ConfigProviderService.vals.main.comMode = "GITLAB";
// 					$scope.handleConnectedToWSserver({session: null, reload: null});
// 				}
// 			}

// 			// setspectroSettings
// 			ViewStateService.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.windowSizeInSecs,
// 				ConfigProviderService.vals.spectrogramSettings.rangeFrom,
// 				ConfigProviderService.vals.spectrogramSettings.rangeTo,
// 				ConfigProviderService.vals.spectrogramSettings.dynamicRange,
// 				ConfigProviderService.vals.spectrogramSettings.window,
// 				ConfigProviderService.vals.spectrogramSettings.drawHeatMapColors,
// 				ConfigProviderService.vals.spectrogramSettings.preEmphasisFilterFactor,
// 				ConfigProviderService.vals.spectrogramSettings.heatMapColorAnchors,
// 				ConfigProviderService.vals.spectrogramSettings.invert);

// 			// setting transition values
// 			ViewStateService.setTransitionTime(ConfigProviderService.design.animation.period);
// 		};

// 		/**
// 		 * function is called after websocket connection
// 		 * has been established. It executes the protocol
// 		 * and loads the first bundle in the bundle list (= default behavior).
// 		 */
// 		$scope.handleConnectedToWSserver = function (data) {
// 			// hide drop zone
// 			var session = data.session;
// 			var reload = data.reload;
// 			ViewStateService.showDropZone = false;
// 			if(searchObject.comMode !== "GITLAB"){
// 				ConfigProviderService.vals.main.comMode = 'WS';
// 			}
// 			ConfigProviderService.vals.activeButtons.openDemoDB = false;
// 			ViewStateService.somethingInProgress = true;
// 			ViewStateService.somethingInProgressTxt = 'Checking protocol...';
// 			// Check if server speaks the same protocol
// 			IoHandlerService.getProtocol().then((res) => {
// 				if (res.protocol === 'EMU-webApp-websocket-protocol' && res.version === '0.0.2') {
// 					ViewStateService.somethingInProgressTxt = 'Checking user management...';
// 					// then ask if server does user management
// 					IoHandlerService.getDoUserManagement().then((doUsrData) => {
// 						if (doUsrData === 'NO') {
// 							$scope.innerHandleConnectedToWSserver({session: session, reload: reload});
// 						} else {
// 							// show user management error
// 							ModalService.open('views/loginModal.html').then((res) => {
// 								if (res) {
// 									$scope.innerHandleConnectedToWSserver({session: session, reload: reload});
// 								} else {
// 									AppStateService.resetToInitState();
// 								}
// 							});
// 						}
// 					});
					
// 				} else {
// 					// show protocol error and disconnect from server
// 					ModalService.open('views/error.html', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.serverUrl + '. It does not speak the same protocol as this client. Its protocol answer was: "' + res.protocol + '" with the version: "' + res.version + '"').then(() => {
// 						AppStateService.resetToInitState();
// 					});
// 				}
// 			});
// 		};

// 		/**
// 		 * to avoid redundant code...
// 		 */
// 		$scope.innerHandleConnectedToWSserver = function (data) {
// 			var session = data.session;
// 			var reload = data.reload;
// 			ViewStateService.somethingInProgressTxt = 'Loading DB config...';
// 			// then get the DBconfigFile
// 			IoHandlerService.httpGetDefaultDesign().then((response) => {
// 				ConfigProviderService.setDesign(response.data);
// 				IoHandlerService.getDBconfigFile().then((data) => {
// 					// first element of perspectives is default perspective
// 					ViewStateService.curPerspectiveIdx = 0;
// 					ConfigProviderService.setVals(data.EMUwebAppConfig);
// 					// FOR DEVELOPMENT
// 					//$scope.showEditDBconfigBtnClick();
					
					
// 					var validRes = ValidationService.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
// 					if (validRes === true) {
// 						ConfigProviderService.curDbConfig = data;
// 						ViewStateService.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);
// 						// setspectroSettings
// 						ViewStateService.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.windowSizeInSecs,
// 							ConfigProviderService.vals.spectrogramSettings.rangeFrom,
// 							ConfigProviderService.vals.spectrogramSettings.rangeTo,
// 							ConfigProviderService.vals.spectrogramSettings.dynamicRange,
// 							ConfigProviderService.vals.spectrogramSettings.window,
// 							ConfigProviderService.vals.spectrogramSettings.drawHeatMapColors,
// 							ConfigProviderService.vals.spectrogramSettings.preEmphasisFilterFactor,
// 							ConfigProviderService.vals.spectrogramSettings.heatMapColorAnchors,
// 							ConfigProviderService.vals.spectrogramSettings.invert);
// 						// set first path as default
// 						ViewStateService.setHierarchySettings($scope.HierarchyLayoutService.findAllNonPartialPaths().possible[0]);
						
// 						validRes = ValidationService.validateJSO('DBconfigFileSchema', data);
// 						if (validRes === true) {
// 							// then get the DBconfigFile
// 							ViewStateService.somethingInProgressTxt = 'Loading bundle list...';
// 							IoHandlerService.getBundleList().then((bdata) => {
// 								validRes = LoadedMetaDataService.setBundleList(bdata);
// 								// show standard buttons
// 								ConfigProviderService.vals.activeButtons.clear = true;
// 								ConfigProviderService.vals.activeButtons.specSettings = true;
								
// 								if (validRes === true) {
// 									// then load first bundle in list
// 									if(session === null) {
// 										session = LoadedMetaDataService.getBundleList()[0];
// 									}
// 									DbObjLoadSaveService.loadBundle(session).then(() => {
// 										// FOR DEVELOPMENT:
// 										// DbObjLoadSaveService.saveBundle(); // for testing save function
// 										// $scope.menuBundleSaveBtnClick(); // for testing save button
// 										// $scope.showHierarchyBtnClick(); // for devel of showHierarchy modal
// 										// $scope.settingsBtnClick(); // for testing spect settings dial
// 										// $scope.searchBtnClick();
// 										// ViewStateService.curViewPort.sS = 27455;
// 										// ViewStateService.curViewPort.eS = 30180;

// 									});

// 									//ViewStateService.currentPage = (ViewStateService.numberOfPages(LoadedMetaDataService.getBundleList().length)) - 1;
// 									if(reload) {
// 										LoadedMetaDataService.openCollapseSession(session.session);
// 									}
// 								} else {
// 									ModalService.open('views/error.html', 'Error validating bundleList: ' + JSON.stringify(validRes, null, 4)).then(() => {
// 										AppStateService.resetToInitState();
// 									});
// 								}
// 							});

// 						} else {
// 							ModalService.open('views/error.html', 'Error validating / checking DBconfig: ' + JSON.stringify(validRes, null, 4)).then(() => {
// 								AppStateService.resetToInitState();
// 							});
// 						}

// 					} else {
// 						ModalService.open('views/error.html', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4)).then(() => {
// 							AppStateService.resetToInitState();
// 						});
// 					}
// 				});
// 			});
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.toggleCollapseSession = function (ses) {
// 			$scope.uniqSessionList[ses].collapsed = !$scope.uniqSessionList[ses].collapsed;
// 		};


// 		/**
// 		 *
// 		 */
// 		$scope.cursorInTextField = function () {
// 			ViewStateService.setcursorInTextField(true);
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cursorOutOfTextField = function () {
// 			ViewStateService.setcursorInTextField(false);
// 		};

// 		/////////////////////////////////////////
// 		// handle button clicks

// 		// top menu:
// 		/**
// 		 *
// 		 */
// 		$scope.addLevelSegBtnClick = function () {
// 			if (ViewStateService.getPermission('addLevelSegBtnClick')) {
// 				var length = 0;
// 				if (DataService.data.levels !== undefined) {
// 					length = DataService.data.levels.length;
// 				}
// 				var newName = 'levelNr' + length;
// 				var level = {
// 					items: [],
// 					name: newName,
// 					type: 'SEGMENT'
// 				};

// 				if (ViewStateService.getCurAttrDef(newName) === undefined) {
// 					var leveldef = {
// 						'name': newName,
// 						'type': 'EVENT',
// 						'attributeDefinitions': {
// 							'name': newName,
// 							'type': 'string'
// 						}
// 					};
// 					ViewStateService.setCurLevelAttrDefs(leveldef);
// 				}
// 				LevelService.insertLevel(level, length, ViewStateService.curPerspectiveIdx);
// 				//  Add to history
// 				HistoryService.addObjToUndoStack({
// 					'type': 'ANNOT',
// 					'action': 'INSERTLEVEL',
// 					'level': level,
// 					'id': length,
// 					'curPerspectiveIdx': ViewStateService.curPerspectiveIdx
// 				});
// 				ViewStateService.selectLevel(false, ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].levelCanvases.order, LevelService); // pass in LevelService to prevent circular deps
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.addLevelPointBtnClick = function () {

// 			if (ViewStateService.getPermission('addLevelPointBtnClick')) {
// 				var length = 0;
// 				if (DataService.data.levels !== undefined) {
// 					length = DataService.data.levels.length;
// 				}
// 				var newName = 'levelNr' + length;
// 				var level = {
// 					items: [],
// 					name: newName,
// 					type: 'EVENT'
// 				};
// 				if (ViewStateService.getCurAttrDef(newName) === undefined) {
// 					var leveldef = {
// 						name: newName,
// 						type: 'EVENT',
// 						attributeDefinitions: {
// 							name: newName,
// 							type: 'string'
// 						}
// 					};
// 					ViewStateService.setCurLevelAttrDefs(leveldef);
// 				}
// 				LevelService.insertLevel(level, length, ViewStateService.curPerspectiveIdx);
// 				//  Add to history
// 				HistoryService.addObjToUndoStack({
// 					'type': 'ANNOT',
// 					'action': 'INSERTLEVEL',
// 					'level': level,
// 					'id': length,
// 					'curPerspectiveIdx': ViewStateService.curPerspectiveIdx
// 				});
// 				ViewStateService.selectLevel(false, ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].levelCanvases.order, LevelService); // pass in LevelService to prevent circular deps
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.renameSelLevelBtnClick = function () {
// 			if (ViewStateService.getPermission('renameSelLevelBtnClick')) {
// 				if (ViewStateService.getcurClickLevelName() !== undefined) {
// 					ModalService.open('views/renameLevel.html', ViewStateService.getcurClickLevelName());
// 				} else {
// 					ModalService.open('views/error.html', 'Rename Error : Please choose a Level first !');
// 				}
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.downloadTextGridBtnClick = function () {
// 			if (ViewStateService.getPermission('downloadTextGridBtnClick')) {
// 				TextGridParserService.asyncToTextGrid().then((parseMess) => {
// 					parseMess = parseMess.replace(/\t/g, '    '); // replace all tabs with 4 spaces
// 					ModalService.open('views/export.html', LoadedMetaDataService.getCurBndl().name + '.TextGrid', parseMess);
// 				});
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.downloadAnnotationBtnClick = function () {
// 			if (ViewStateService.getPermission('downloadAnnotationBtnClick')) {
// 				if(ValidationService.validateJSO('emuwebappConfigSchema', DataService.getData())) {
// 					ModalService.open('views/export.html', LoadedMetaDataService.getCurBndl().name + '_annot.json', angular.toJson(DataService.getData(), true));
// 				}
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.settingsBtnClick = function () {
// 			if (ViewStateService.getPermission('spectSettingsChange')) {
// 				ModalService.open('views/settingsModal.html');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.connectBtnClick = function () {
// 			if (ViewStateService.getPermission('connectBtnClick')) {
// 				ModalService.open('views/connectModal.html').then((url) => {
// 					if (url) {
// 						ViewStateService.somethingInProgressTxt = 'Connecting to server...';
// 						ViewStateService.somethingInProgress = true;
// 						ViewStateService.url = url;
// 						// SIC IoHandlerService.WebSocketHandlerService is private
// 						IoHandlerService.WebSocketHandlerService.initConnect(url).then((message) => {
// 							if (message.type === 'error') {
// 								ModalService.open('views/error.html', 'Could not connect to websocket server: ' + url).then(() => {
// 									AppStateService.resetToInitState();
// 								});
// 							} else {
// 								$scope.handleConnectedToWSserver({session: null, reload: null});
// 							}
// 						}, function (errMess) {
// 							ModalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => {
// 								AppStateService.resetToInitState();
// 							});
// 						});
// 					}
// 				});
// 			} else {

// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.openDemoDBbtnClick = function (nameOfDB) {
// 			if (ViewStateService.getPermission('openDemoBtnDBclick')) {
// 				$scope.dropdown = false;
// 				ConfigProviderService.vals.activeButtons.openDemoDB = false;
// 				LoadedMetaDataService.setDemoDbName(nameOfDB);
// 				// hide drop zone
// 				ViewStateService.showDropZone = false;

// 				ViewStateService.somethingInProgress = true;
// 				// alert(nameOfDB);
// 				ViewStateService.setState('loadingSaving');
// 				ConfigProviderService.vals.main.comMode = 'DEMO';
// 				ViewStateService.somethingInProgressTxt = 'Loading DB config...';
// 				IoHandlerService.httpGetDefaultDesign().then((response) => {
// 					ConfigProviderService.setDesign(response.data);
// 					IoHandlerService.getDBconfigFile(nameOfDB).then((res) => {
// 						var data = res.data;
// 						// first element of perspectives is default perspective
// 						ViewStateService.curPerspectiveIdx = 0;
// 						ConfigProviderService.setVals(data.EMUwebAppConfig);

// 						var validRes = ValidationService.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
// 						if (validRes === true) {
// 							ConfigProviderService.curDbConfig = data;
// 							ViewStateService.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);
// 							validRes = ValidationService.validateJSO('DBconfigFileSchema', ConfigProviderService.curDbConfig);

// 							if (validRes === true) {
// 								// then get the DBconfigFile
// 								ViewStateService.somethingInProgressTxt = 'Loading bundle list...';

// 								IoHandlerService.getBundleList(nameOfDB).then((res) => {
// 									var bdata = res.data;
// 									// validRes = ValidationService.validateJSO('bundleListSchema', bdata);
// 									// if (validRes === true) {
// 									LoadedMetaDataService.setBundleList(bdata);
// 									// show standard buttons
// 									ConfigProviderService.vals.activeButtons.clear = true;
// 									ConfigProviderService.vals.activeButtons.specSettings = true;

// 									// then load first bundle in list
// 									DbObjLoadSaveService.loadBundle(LoadedMetaDataService.getBundleList()[0]);

// 								}, function (err) {
// 									ModalService.open('views/error.html', 'Error loading bundle list of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status).then(() => {
// 										AppStateService.resetToInitState();
// 									});
// 								});
// 							} else {
// 								ModalService.open('views/error.html', 'Error validating / checking DBconfig: ' + JSON.stringify(validRes, null, 4)).then(() => {
// 									AppStateService.resetToInitState();
// 								});
// 							}


// 						} else {
// 							ModalService.open('views/error.html', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4)).then(() => {
// 								AppStateService.resetToInitState();
// 							});
// 						}

// 					}, function (err) {
// 						ModalService.open('views/error.html', 'Error loading DB config of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status).then(() => {
// 							AppStateService.resetToInitState();
// 						});
// 					});
// 				});
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.aboutBtnClick = function () {
// 			if (ViewStateService.getPermission('aboutBtnClick')) {
// 				ModalService.open('views/help.html');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.showHierarchyBtnClick = function () {
// 			if (!ViewStateService.hierarchyState.isShown()) {
// 				ViewStateService.hierarchyState.toggleHierarchy();
// 				ModalService.open('views/showHierarchyModal.html');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.showEditDBconfigBtnClick = function () {
// 			ModalService.open('views/tabbed.html').then((res) => {
// 				if (res === false) {
// 					// do nothing when user clicks on cancle
// 				}
// 				else {
// 					if (ValidationService.validateJSO('emuwebappConfigSchema', res)) {
// 						$scope.cps.getDelta(res).then((delta) => {
// 							IoHandlerService.saveConfiguration(angular.toJson(delta, true)).then(() => {
// 								if ((HistoryService.movesAwayFromLastSave !== 0 && ConfigProviderService.vals.main.comMode !== 'DEMO')) {
// 									ModalService.open('views/confirmModal.html', 'Do you wish to clear all loaded data and if connected disconnect from the server? CAUTION: YOU HAVE UNSAVED CHANGES! These will be lost if you confirm.').then((res) => {
// 										if (res) {
// 											AppStateService.reloadToInitState();
// 										}
// 									});
// 								}
// 								else {
// 									AppStateService.reloadToInitState($scope.lmds.getCurBndl());
// 								}
// 							});				
// 						});
// 					}
// 					else {
// 						ModalService.open('views/error.html', 'Sorry, there were errors in your configuration.');
// 					}
// 				}
// 			});
// 		};


// 		/**
// 		 *
// 		 */
// 		$scope.searchBtnClick = function () {
// 			if (ViewStateService.getPermission('searchBtnClick')) {
// 				ModalService.open('views/searchAnnot.html');
// 			}
// 		};


// 		/**
// 		 *
// 		 */
// 		$scope.clearBtnClick = function () {
// 			// ViewStateService.setdragBarActive(false);
// 			var modalText;
// 			if ((HistoryService.movesAwayFromLastSave !== 0 && ConfigProviderService.vals.main.comMode !== 'DEMO')) {
// 				modalText = 'Do you wish to clear all loaded data and if connected disconnect from the server? CAUTION: YOU HAVE UNSAVED CHANGES! These will be lost if you confirm.';
// 			} else {
// 				modalText = 'Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.';
// 			}
// 			ModalService.open('views/confirmModal.html', modalText).then((res) => {
// 				if (res) {
// 					AppStateService.resetToInitState();
// 				}
// 			});
// 		};

// 		// bottom menu:

// 		/**
// 		 *
// 		 */
// 		$scope.cmdZoomAll = function () {
// 			if (ViewStateService.getPermission('zoom')) {
// 				LevelService.deleteEditArea();
// 				ViewStateService.setViewPort(0, SoundHandlerService.audioBuffer.length);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cmdZoomIn = function () {
// 			if (ViewStateService.getPermission('zoom')) {
// 				LevelService.deleteEditArea();
// 				ViewStateService.zoomViewPort(true);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cmdZoomOut = function () {
// 			if (ViewStateService.getPermission('zoom')) {
// 				LevelService.deleteEditArea();
// 				ViewStateService.zoomViewPort(false);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cmdZoomLeft = function () {
// 			if (ViewStateService.getPermission('zoom')) {
// 				LevelService.deleteEditArea();
// 				ViewStateService.shiftViewPort(false);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cmdZoomRight = function () {
// 			if (ViewStateService.getPermission('zoom')) {
// 				LevelService.deleteEditArea();
// 				ViewStateService.shiftViewPort(true);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cmdZoomSel = function () {
// 			if (ViewStateService.getPermission('zoom')) {
// 				LevelService.deleteEditArea();
// 				ViewStateService.setViewPort(ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cmdPlayView = function () {
// 			if (ViewStateService.getPermission('playaudio')) {
// 				SoundHandlerService.playFromTo(ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS);
// 				ViewStateService.animatePlayHead(ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cmdPlaySel = function () {
// 			if (ViewStateService.getPermission('playaudio')) {
// 				SoundHandlerService.playFromTo(ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE);
// 				ViewStateService.animatePlayHead(ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		/**
// 		 *
// 		 */
// 		$scope.cmdPlayAll = function () {
// 			if (ViewStateService.getPermission('playaudio')) {
// 				SoundHandlerService.playFromTo(0, SoundHandlerService.audioBuffer.length);
// 				ViewStateService.animatePlayHead(0, SoundHandlerService.audioBuffer.length);
// 			} else {
// 				//console.log('action currently not allowed');
// 			}
// 		};

// 		///////////////////////////
// 		// other

// 		$scope.tmp = function () {
// 			console.log("tmp btn click");
// 			$scope.xTmp = $scope.xTmp + 1;
// 			$scope.yTmp = $scope.yTmp + 1;
// 		};
// 		$scope.getTmp = function(){
// 			return angular.copy($scope.xTmp)
// 		};

// 		$scope.showHierarchyPathCanvas = function(){
// 			return(localStorage.getItem('showHierarchyPathCanvas') == 'true')
// 		};

// 	});
