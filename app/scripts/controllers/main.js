'use strict';

angular.module('emuwebApp')
	.controller('MainController', function ($scope, $rootScope, $modal, $log, $compile, $timeout,
		$q, $window, $document, $location, viewState, HistoryService, Iohandlerservice,
		Soundhandlerservice, ConfigProviderService, fontScaleService, Ssffdataservice,
		LevelService, dialogService, Textgridparserservice, Espsparserservice,
		Binarydatamaniphelper, Wavparserservice, Ssffparserservice, Drawhelperservice,
		Validationservice, Appcachehandler, loadedMetaDataService, dbObjLoadSaveService,
		appStateService, DataService) {
		// hook up services to use abbreviated forms
		$scope.cps = ConfigProviderService;
		$scope.hists = HistoryService;
		$scope.fontImage = fontScaleService;
		$scope.levServ = LevelService;
		$scope.dataServ = DataService;
		$scope.vs = viewState;
		$scope.dials = dialogService;
		$scope.ssffds = Ssffdataservice;
		$scope.shs = Soundhandlerservice;
		$scope.dhs = Drawhelperservice;
		$scope.wps = Wavparserservice;
		$scope.io = Iohandlerservice;
		$scope.ach = Appcachehandler;
		$scope.lmds = loadedMetaDataService;

		// init vars
		$scope.connectBtnLabel = 'connect';
		$scope.tmp = {};
		$scope.dbLoaded = false;
		$scope.is2dCancasesHidden = true;
		$scope.windowWidth = $window.outerWidth;

		// check for new version
		$scope.ach.checkForNewVersion();

		//////////////
		// bindings

		// bind window resize event
		angular.element($window).bind('resize', function () {
			LevelService.deleteEditArea();
			viewState.setWindowWidth($window.outerWidth);
			$scope.$digest();
		});

		// bind shift/alt keyups for history
		angular.element($window).bind('keyup', function (e) {
			if (e.keyCode === ConfigProviderService.vals.keyMappings.shift || e.keyCode === ConfigProviderService.vals.keyMappings.alt) {
				HistoryService.addCurChangeObjToUndoStack();
				$scope.$digest();
			}
		});

		// Take care of preventing navigation out of app (only if something is loaded, not in embedded mode and not developing (auto connecting))
		window.onbeforeunload = function () {
			if (ConfigProviderService.embeddedVals.audioGetUrl === '' && loadedMetaDataService.getBundleList().length > 0 && !ConfigProviderService.vals.main.autoConnect) {
				return 'Do you really wish to leave/reload the EMU-webApp? All unsaved changes will be lost...';
			}
		};

		//////////////
		// watches
		// watch if embedded override (if attributes are set on emuwebapp tag)
		// $scope.$watch('cps.embeddedVals.audioGetUrl', function (val) {
		// 	if (val !== undefined && val !== '') {
		// 		// check if both are set
		// 		$scope.loadFilesForEmbeddedApp();
		// 	}

		// }, true);

		//
		//////////////

		/////////////
		// listens

		// listen for connectionDisrupted event -> I don't like listens but in this case it might me the way to go...
		$scope.$on('connectionDisrupted', function (event, args) {
			appStateService.resetToInitState();
		});

		// listen for resetToInitState
		$scope.$on('resetToInitState', function () {
			$scope.loadDefaultConfig();
		});

		//
		////////////

		// check if URL parameters are set -> if so set embedded flags!
		var searchObject = $location.search();
		if (searchObject['audioGetUrl'] && searchObject['labelGetUrl'] && searchObject['labelType']) {
			ConfigProviderService.embeddedVals.audioGetUrl = searchObject.audioGetUrl;
			ConfigProviderService.embeddedVals.labelGetUrl = searchObject.labelGetUrl;
			ConfigProviderService.embeddedVals.labelType = searchObject.labelType;
			ConfigProviderService.embeddedVals.fromUrlParams = true;
		};

		/**
		 *
		 */
		$scope.loadFilesForEmbeddedApp = function () {
			if (ConfigProviderService.embeddedVals.audioGetUrl) {
			    ConfigProviderService.vals.activeButtons.openDemoDB = false;
				Iohandlerservice.httpGetPath(ConfigProviderService.embeddedVals.audioGetUrl, 'arraybuffer').then(function (data) {
					viewState.showDropZone = false;
					// set bundle name
					var tmp = ConfigProviderService.embeddedVals.audioGetUrl;
					loadedMetaDataService.setCurBndlName(tmp.substr(0, tmp.lastIndexOf('.')).substr(tmp.lastIndexOf('/') + 1, tmp.length));

					//hide menu
					if (viewState.getsubmenuOpen()) {
						viewState.togglesubmenuOpen(ConfigProviderService.vals.colors.transitionTime);
					}

					viewState.somethingInProgressTxt = 'Loading DB config...';
					// then get the DBconfigFile
					Iohandlerservice.httpGetPath('configFiles/embedded_emuwebappConfig.json').then(function (resp) {
						// first element of perspectives is default perspective
						viewState.curPerspectiveIdx = 0;
						ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
						// validate emuwebappConfigSchema
						delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
						var validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
						if (validRes === true) {
							// turn of keybinding only on mouseover
							if (ConfigProviderService.embeddedVals.fromUrlParams) {
								ConfigProviderService.vals.main.catchMouseForKeyBinding = false;
							}
							ConfigProviderService.curDbConfig = resp.data;

							// validate DBconfigFileSchema!
							validRes = Validationservice.validateJSO('DBconfigFileSchema', ConfigProviderService.curDbConfig);

							if (validRes === true) {
								// set wav file
								viewState.somethingInProgress = true;
								viewState.somethingInProgressTxt = 'Parsing WAV file...';

								Wavparserservice.parseWavArrBuf(data.data).then(function (messWavParser) {
									var wavJSO = messWavParser;
									viewState.curViewPort.sS = 0;
									viewState.curViewPort.eS = wavJSO.Data.length;
									viewState.resetSelect();
									Soundhandlerservice.wavJSO = wavJSO;

									// get + parse file
									Iohandlerservice.httpGetPath(ConfigProviderService.embeddedVals.labelGetUrl, 'utf-8').then(function (data2) {
										viewState.somethingInProgressTxt = 'Parsing ' + ConfigProviderService.embeddedVals.labelType + ' file...';
										Iohandlerservice.parseLabelFile(data2.data, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTextGrid', ConfigProviderService.embeddedVals.labelType).then(function (parseMess) {

											var annot = parseMess;
											DataService.setData(annot);

											var lNames = [];
											var levelDefs = [];
											annot.levels.forEach(function (l) {
												lNames.push(l.name);
												levelDefs.push({
													'name': l.name,
													'type': l.type,
													'attributeDefinitions': {
														'name': l.name,
														'type': 'string'
													}
												});
											});

											// set level defs
											ConfigProviderService.curDbConfig.levelDefinitions = levelDefs;
											viewState.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);

											ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order = lNames;
											viewState.somethingInProgressTxt = 'Done!';
											viewState.somethingInProgress = false;
											viewState.setState('labeling');

										}, function (errMess) {
											dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
										});

									}, function (errMess) {
										dialogService.open('views/error.html', 'ModalCtrl', 'Could not get label file: ' + ConfigProviderService.embeddedVals.labelGetUrl + ' ERROR ' + JSON.stringify(errMess, null, 4));
									});


								}, function (errMess) {
									dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
								});

							} else {
								dialogService.open('views/error.html', 'ModalCtrl', 'Error validating DBconfig: ' + JSON.stringify(validRes, null, 4));
							}
						} else {
							dialogService.open('views/error.html', 'ModalCtrl', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4));
						}

					}, function (errMess) {
						dialogService.open('views/error.html', 'ModalCtrl', 'Could not get embedded_config.json: ' + errMess);
					});
				}, function (errMess) {
					dialogService.open('views/error.html', 'ModalCtrl', 'Could not get audio file:' + ConfigProviderService.embeddedVals.audioGetUrl + ' ERROR: ' + JSON.stringify(errMess, null, 4));
				});
			}
		};

		/**
		 * init load of config files
		 */
		$scope.loadDefaultConfig = function () {
			viewState.somethingInProgress = true;
			viewState.somethingInProgressTxt = 'Loading schema files';
			// load schemas first
			Validationservice.loadSchemas().then(function (replies) {
				Validationservice.setSchemas(replies);
				Iohandlerservice.httpGetDefaultConfig().success(function (data) {
					viewState.somethingInProgressTxt = 'Validating emuwebappConfig';
					var validRes = Validationservice.validateJSO('emuwebappConfigSchema', data);
					if (validRes === true) {
						ConfigProviderService.setVals(data);
						$scope.handleDefaultConfigLoaded();
						// loadFilesForEmbeddedApp if these are set 
						$scope.loadFilesForEmbeddedApp();
						viewState.somethingInProgress = false;
					} else {
						dialogService.open('views/error.html', 'ModalCtrl', 'Error validating emuwebappConfigSchema: ' + JSON.stringify(validRes, null, 4)).then(function () {
							appStateService.resetToInitState();
						});
					}

				}).error(function (data, status, header, config) {
					dialogService.open('views/error.html', 'ModalCtrl', 'Could not get defaultConfig for EMU-webApp: ' + ' status: ' + status + ' header: ' + header + ' config ' + config).then(function () {
						appStateService.resetToInitState();
					});
				});
			}, function (errMess) {
				dialogService.open('views/error.html', 'ModalCtrl', 'Error loading schema file: ' + JSON.stringify(errMess, null, 4)).then(function () {
					appStateService.resetToInitState();
				});
			});
		};

		// call function on init
		$scope.loadDefaultConfig();
		
		$scope.getCurBndlName = function () {
 			return loadedMetaDataService.getCurBndlName();
 		};		

		/**
		 * function called after default config was loaded
		 */
		$scope.handleDefaultConfigLoaded = function () {

			if (!viewState.getsubmenuOpen()) {
				viewState.togglesubmenuOpen(ConfigProviderService.vals.colors.transitionTime);
			}

			if (ConfigProviderService.vals.main.autoConnect) {
				Iohandlerservice.wsH.initConnect(ConfigProviderService.vals.main.serverUrl).then(function (message) {
					if (message.type === 'error') {
						dialogService.open('views/error.html', 'ModalCtrl', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.serverUrl);
					} else {
						$scope.handleConnectedToWSserver();
					}
				});
			}

			// init loading of files for testing
			viewState.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.windowSizeInSecs,
				ConfigProviderService.vals.spectrogramSettings.rangeFrom,
				ConfigProviderService.vals.spectrogramSettings.rangeTo,
				ConfigProviderService.vals.spectrogramSettings.dynamicRange,
				ConfigProviderService.vals.spectrogramSettings.window,
				ConfigProviderService.vals.spectrogramSettings.drawHeatMapColors,
				ConfigProviderService.vals.spectrogramSettings.preEmphasisFilterFactor,
				ConfigProviderService.vals.spectrogramSettings.heatMapColorAnchors);

			// setting transition values
			viewState.setTransitionTime(ConfigProviderService.vals.colors.transitionTime / 1000);

		};

		/**
		 * function is called after websocket connection
		 * has been established. It executes the protocol
		 * and loads the first bundle in the bundle list (= default behavior).
		 */
		$scope.handleConnectedToWSserver = function () {
			// hide drop zone 
			viewState.showDropZone = false;
			ConfigProviderService.vals.main.comMode = 'WS';
			ConfigProviderService.vals.activeButtons.openDemoDB = false;
			viewState.somethingInProgress = true;
			viewState.somethingInProgressTxt = 'Checking protocol...';
			// Check if server speaks the same protocol
			Iohandlerservice.getProtocol().then(function (res) {
				if (res.protocol === 'EMU-webApp-websocket-protocol' && res.version === '0.0.1') {
					viewState.somethingInProgressTxt = 'Checking user management...';
					// then ask if server does user management
					Iohandlerservice.getDoUserManagement().then(function (doUsrData) {
						if (doUsrData === 'NO') {
							$scope.innerHandleConnectedToWSserver();
						} else {
							// show user management error 
							dialogService.open('views/loginModal.html', 'LoginCtrl').then(function (res) {
								if (res) {
									$scope.innerHandleConnectedToWSserver();
								} else {
									appStateService.resetToInitState();
								}
							});
						}
					});
				} else {
					// show protocol error and disconnect from server
					dialogService.open('views/error.html', 'ModalCtrl', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.serverUrl + '. It does not speak the same protocol as this client. Its protocol answer was: "' + res.protocol + '" with the version: "' + res.version + '"').then(function () {
						appStateService.resetToInitState();
					});
				}
			});
		};

		/**
		 * to avoid redundant code...
		 */
		$scope.innerHandleConnectedToWSserver = function () {
			viewState.somethingInProgressTxt = 'Loading DB config...';
			// then get the DBconfigFile
			Iohandlerservice.getDBconfigFile().then(function (data) {
				// first element of perspectives is default perspective
				viewState.curPerspectiveIdx = 0;
				ConfigProviderService.setVals(data.EMUwebAppConfig);
				delete data.EMUwebAppConfig; // delete to avoid duplicate
				var validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
				if (validRes === true) {
					ConfigProviderService.curDbConfig = data;
					viewState.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);
					validRes = Validationservice.validateJSO('DBconfigFileSchema', data);
					if (validRes === true) {
						// then get the DBconfigFile
						viewState.somethingInProgressTxt = 'Loading bundle list...';
						Iohandlerservice.getBundleList().then(function (bdata) {
							validRes = loadedMetaDataService.setBundleList(bdata);
							if (validRes === true) {
								// then load first bundle in list
								dbObjLoadSaveService.loadBundle(loadedMetaDataService.getBundleList()[0]);
							} else {
								dialogService.open('views/error.html', 'ModalCtrl', 'Error validating bundleList: ' + JSON.stringify(validRes, null, 4)).then(function () {
									appStateService.resetToInitState();
								});
							}
						});

					} else {
						dialogService.open('views/error.html', 'ModalCtrl', 'Error validating DBconfig: ' + JSON.stringify(validRes, null, 4)).then(function () {
							appStateService.resetToInitState();
						});
					}

				} else {
					dialogService.open('views/error.html', 'ModalCtrl', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4)).then(function () {
						appStateService.resetToInitState();
					});
				}
			});
		};


		/**
		 *
		 */
		$scope.toggleCollapseSession = function (ses) {
			$scope.uniqSessionList[ses].collapsed = !$scope.uniqSessionList[ses].collapsed;
		};

		/**
		 *
		 */
		$scope.sessionIsCollapsed = function (ses) {
			// return $scope.uniqSessionList[ses].collapsed;
			return false;
		};


		/**
		 *
		 */
		$scope.getEnlarge = function (index) {
			var len = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length;
			var large = 50;
			if (viewState.getenlarge() == -1) {
				return 'auto';
			} else {
				if (len === 1) {
					return 'auto';
				}
				if (len === 2) {
					if (viewState.getenlarge() == index) {
						return '70%';
					} else {
						return '27%';
					}
				} else {
					if (viewState.getenlarge() == index) {
						return large + '%';
					} else {
						return (98 - large) / (len - 1) + '%';
					}
				}
			}
		};



		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.setcursorInTextField(false);
		};

		/**
		 *
		 */
		$scope.openSubmenu = function () {
			viewState.togglesubmenuOpen(ConfigProviderService.vals.colors.transitionTime);
		};

		/////////////////////////////////////////
		// handle button clicks

		// top menu:
		/**
		 *
		 */
		$scope.addLevelSegBtnClick = function () {
			if (viewState.getPermission('addLevelSegBtnClick')) {
				var length = 0;
				if (DataService.data.levels !== undefined) {
					length = DataService.data.levels.length;
				}
				var newName = 'levelNr' + length;
				var level = {
					items: [{
						id: DataService.getNewId(),
						sampleStart: 0,
						sampleDur: Soundhandlerservice.wavJSO.Data.length,
						labels: [{
							name: newName,
							value: ConfigProviderService.vals.labelCanvasConfig.newSegmentName
						}]
					}],
					name: newName,
					type: 'SEGMENT'
				};

				if (viewState.getCurAttrDef(newName) === undefined) {
					var leveldef = {
						name: newName,
						type: 'EVENT',
						attributeDefinitions: {
							name: newName,
							type: "string"
						}
					}
					viewState.setCurLevelAttrDefs(leveldef);
				}
				LevelService.insertLevel(level, length, viewState.curPerspectiveIdx);
				//  Add to history
				HistoryService.addObjToUndoStack({
					'type': 'ANNOT',
					'action': 'INSERTLEVEL',
					'level': level,
					'id': length,
					'curPerspectiveIdx': viewState.curPerspectiveIdx
				});
				
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.addLevelPointBtnClick = function () {

			if (viewState.getPermission('addLevelPointBtnClick')) {
				var length = 0;
				if (DataService.data.levels !== undefined) {
					length = DataService.data.levels.length;
				}
				var newName = 'levelNr' + length;
				var level = {
					items: [{
						id: DataService.getNewId(),
						samplePoint: Math.round(Soundhandlerservice.wavJSO.Data.length / 2),
						labels: []
					}],
					name: newName,
					type: 'EVENT'
				};
				level.items[0].labels.push({
					name: newName,
					value: ConfigProviderService.vals.labelCanvasConfig.newEventName
				});
				if (viewState.getCurAttrDef(newName) === undefined) {
					var leveldef = {
						name: newName,
						type: 'EVENT',
						attributeDefinitions: {
							name: newName,
							type: "string"
						}
					}
					viewState.setCurLevelAttrDefs(leveldef);
				}
				LevelService.insertLevel(level, length, viewState.curPerspectiveIdx);
				//  Add to history
				HistoryService.addObjToUndoStack({
					'type': 'ANNOT',
					'action': 'INSERTLEVEL',
					'level': level,
					'id': length,
					'curPerspectiveIdx': viewState.curPerspectiveIdx
				});

			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.renameSelLevelBtnClick = function () {
			if (viewState.getPermission('renameSelLevelBtnClick')) {
				if (viewState.getcurClickLevelName() !== undefined) {
					dialogService.open('views/renameLevel.html', 'ModalCtrl', viewState.getcurClickLevelName());
				} else {
					dialogService.open('views/error.html', 'ModalCtrl', 'Rename Error : Please choose a Level first !');
				}
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.downloadTextGridBtnClick = function () {
			if (viewState.getPermission('downloadTextGridBtnClick')) {
				Textgridparserservice.asyncToTextGrid().then(function (parseMess) {
					dialogService.openExport('views/export.html', 'ExportCtrl', parseMess, loadedMetaDataService.getCurBndl().name + '.TextGrid');
				});
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.downloadAnnotationBtnClick = function () {
			if (viewState.getPermission('downloadAnnotationBtnClick')) {
				dialogService.openExport('views/export.html', 'ExportCtrl', angular.toJson(DataService.getData(), true), loadedMetaDataService.getCurBndl().name + '_annot.json');
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.spectSettingsBtnClick = function () {
			if (viewState.getPermission('spectSettingsChange')) {
				dialogService.open('views/spectSettings.html', 'spectSettingsCtrl', '');
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.connectBtnClick = function () {
			if (viewState.getPermission('connectBtnClick')) {
				dialogService.open('views/connectModal.html', 'WsconnectionCtrl').then(function (url) {
					if (url) {
						Iohandlerservice.wsH.initConnect(url).then(function (message) {
							if (message.type === 'error') {
								dialogService.open('views/error.html', 'ModalCtrl', 'Could not connect to websocket server: ' + url);
							} else {
								$scope.handleConnectedToWSserver();
							}
						});
					}
				});
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.openDemoDBbtnClick = function (nameOfDB) {
			if (viewState.getPermission('openDemoBtnDBclick')) {
			    ConfigProviderService.vals.activeButtons.openDemoDB = false;
				loadedMetaDataService.setDemoDbName(nameOfDB);
				// hide drop zone 
				viewState.showDropZone = false;

				viewState.somethingInProgress = true;
				// alert(nameOfDB);
				viewState.setState('loadingSaving');
				ConfigProviderService.vals.main.comMode = 'DEMO';
				viewState.somethingInProgressTxt = 'Loading DB config...';
				Iohandlerservice.getDBconfigFile(nameOfDB).then(function (res) {
					var data = res.data;
					// first element of perspectives is default perspective
					viewState.curPerspectiveIdx = 0;
					ConfigProviderService.setVals(data.EMUwebAppConfig);
					delete data.EMUwebAppConfig; // delete to avoid duplicate

					var validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
					if (validRes === true) {
						ConfigProviderService.curDbConfig = data;
						viewState.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);
						validRes = Validationservice.validateJSO('DBconfigFileSchema', ConfigProviderService.curDbConfig)

						if (validRes === true) {
							// then get the DBconfigFile
							viewState.somethingInProgressTxt = 'Loading bundle list...';

							Iohandlerservice.getBundleList(nameOfDB).then(function (res) {
								var bdata = res.data;
								// validRes = Validationservice.validateJSO('bundleListSchema', bdata);
								// if (validRes === true) {
								loadedMetaDataService.setBundleList(bdata);
								// then load first bundle in list
								dbObjLoadSaveService.loadBundle(loadedMetaDataService.getBundleList()[0]);
								// } else {
								// 	dialogService.open('views/error.html', 'ModalCtrl', 'Error validating bundleList: ' + JSON.stringify(validRes, null, 4)).then(function () {
								// 		appStateService.resetToInitState();
								// 	});
								// }
							}, function (err) {
								dialogService.open('views/error.html', 'ModalCtrl', 'Error loading bundle list of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status).then(function () {
									appStateService.resetToInitState();
								});
							});
						} else {
							dialogService.open('views/error.html', 'ModalCtrl', 'Error validating DBconfig: ' + JSON.stringify(validRes, null, 4)).then(function () {
								appStateService.resetToInitState();
							});
						}


					} else {
						dialogService.open('views/error.html', 'ModalCtrl', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4)).then(function () {
							appStateService.resetToInitState();
						});
					}

				}, function (err) {
					dialogService.open('views/error.html', 'ModalCtrl', 'Error loading DB config of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status).then(function () {
						appStateService.resetToInitState();
					});
				});
			} //else {
			// 	console.log('action currently not allowed');
			// }
		};

		/**
		 *
		 */
		$scope.aboutBtnClick = function () {
			dialogService.open('views/about.html', 'ModalCtrl');
		};

		/**
		 *
		 */
		$scope.showHierarchyBtnClick = function () {
			viewState.showHierarchy();
			dialogService.open('views/showHierarchyModal.html', 'ShowhierarchyCtrl');
		};

		/**
		 *
		 */
		$scope.clearBtnClick = function () {
			// viewState.setdragBarActive(false);
			var modalText;
			if ((HistoryService.movesAwayFromLastSave !== 0 && ConfigProviderService.vals.main.comMode !== 'DEMO')) {
				modalText = 'Do you wish to clear all loaded data and if connected disconnect from the server? CAUTION: YOU HAVE UNSAVED CHANGES! These will be lost if you confirm.'
			} else {
				modalText = 'Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.'
			}
			dialogService.open('views/confirmModal.html', 'ConfirmmodalCtrl', modalText).then(function (res) {
				if (res) {
					appStateService.resetToInitState();
				}
			});
		};

		// bottom menu:

		/**
		 *
		 */
		$scope.cmdZoomAll = function () {
			if (viewState.getPermission('zoom')) {
				LevelService.deleteEditArea();
				viewState.setViewPort(0, Soundhandlerservice.wavJSO.Data.length);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdZoomIn = function () {
			if (viewState.getPermission('zoom')) {
				LevelService.deleteEditArea();
				viewState.zoomViewPort(true);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdZoomOut = function () {
			if (viewState.getPermission('zoom')) {
				LevelService.deleteEditArea();
				viewState.zoomViewPort(false);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdZoomLeft = function () {
			if (viewState.getPermission('zoom')) {
				LevelService.deleteEditArea();
				viewState.shiftViewPort(false);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdZoomRight = function () {
			if (viewState.getPermission('zoom')) {
				LevelService.deleteEditArea();
				viewState.shiftViewPort(true);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdZoomSel = function () {
			if (viewState.getPermission('zoom')) {
				LevelService.deleteEditArea();
				viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdPlayView = function () {
			if (viewState.getPermission('playaudio')) {
				Soundhandlerservice.playFromTo(viewState.curViewPort.sS, viewState.curViewPort.eS);
				viewState.animatePlayHead(viewState.curViewPort.sS, viewState.curViewPort.eS);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdPlaySel = function () {
			if (viewState.getPermission('playaudio')) {
				Soundhandlerservice.playFromTo(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
				viewState.animatePlayHead(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdPlayAll = function () {
			if (viewState.getPermission('playaudio')) {
				Soundhandlerservice.playFromTo(0, Soundhandlerservice.wavJSO.Data.length);
				viewState.animatePlayHead(0, Soundhandlerservice.wavJSO.Data.length);
			} else {
				console.log('action currently not allowed');
			}
		};

		///////////////////////////
		// other

		/**
		 * function used to change perspective
		 * @param persp json object of current perspective containing name attribute
		 */
		$scope.changePerspective = function (persp) {

			var newIdx;
			for (var i = 0; i < ConfigProviderService.vals.perspectives.length; i++) {
				if (persp.name === ConfigProviderService.vals.perspectives[i].name) {
					newIdx = i;
				}
			}
			viewState.curPerspectiveIdx = newIdx;
			// close submenu
			viewState.setRightsubmenuOpen(!viewState.getRightsubmenuOpen())
		};

		/**
		 * function used by right side menu to get color of current perspecitve in ul
		 * @param persp json object of current perspective containing name attribute
		 */
		$scope.getPerspectiveColor = function (persp) {
			var cl;
			if (viewState.curPerspectiveIdx === -1 || persp.name === ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].name) {
				cl = 'emuwebapp-curSelPerspLi';
			} else {
				cl = 'emuwebapp-perspLi';
			}
			return cl;
		};

	});