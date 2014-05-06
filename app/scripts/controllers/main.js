'use strict';

angular.module('emuwebApp')
	.controller('MainCtrl', function ($scope, $rootScope, $modal, $log, $compile, $timeout, $q, $window, $document,
		viewState, HistoryService, Iohandlerservice, Soundhandlerservice, ConfigProviderService, fontScaleService, Ssffdataservice, Levelservice, dialogService, Textgridparserservice, Espsparserservice, Binarydatamaniphelper, Wavparserservice, Ssffparserservice, Drawhelperservice) {

		// hook up services to use abbreviated forms
		$scope.cps = ConfigProviderService;
		$scope.hists = HistoryService;
		$scope.fontImage = fontScaleService;
		$scope.tds = Levelservice;
		$scope.vs = viewState;
		$scope.dials = dialogService;
		$scope.ssffds = Ssffdataservice;
		$scope.shs = Soundhandlerservice;
		$scope.dhs = Drawhelperservice;
		$scope.wps = Wavparserservice;
		$scope.io = Iohandlerservice;

		// init vars
		$scope.connectBtnLabel = 'connect';
		$scope.tmp = {};

		$scope.dbLoaded = false;
		$scope.isRightSideMenuHidden = true;
		$scope.is2dCancasesHidden = true;
		$scope.showDropZone = true;

		$scope.lastkeycode = 'N/A';
		$scope.bundleList = [];

		$scope.curUserName = '';
		$scope.curBndl = {};

		$scope.lastclickedutt = null;
		$scope.shortcut = null;
		$scope.filterText = '';
		$scope.windowWidth = $window.outerWidth;

		$scope.demoDbName = '';

		//////////////
		// bindings

		// bind window resize event
		angular.element($window).bind('resize', function () {
			viewState.deleteEditArea();
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

		//////////////
		// watches
		// watch if embedded override (if attributes are set on emuwebapp tag)
		$scope.$watch('cps.embeddedVals.audioGetUrl', function (val) {
			if (val !== undefined && val !== '') {
				// check if both are set
				$scope.loadFilesForEmbeddedApp();
			}

		}, true);

		//
		//////////////

		/**
		 *
		 */
		$scope.loadFilesForEmbeddedApp = function () {
			Iohandlerservice.httpGetPath(ConfigProviderService.embeddedVals.audioGetUrl, 'arraybuffer').then(function (data) {
				// check if file extension is correct 

				// if (ConfigProviderService.embeddedVals.labelGetUrl.split('.')[1] !== 'TextGrid') {
				// 	alert("File extention of embedded mode has to be .TextGrid")
				// 	return;
				// }

				viewState.showDropZone = false;

				//hide menu
				if (viewState.getsubmenuOpen()) {
					$scope.openSubmenu();
				}

				viewState.somethingInProgressTxt = 'Loading DB config...';
				// then get the DBconfigFile
				Iohandlerservice.httpGetPath('configFiles/embedded_config.json').then(function (resp) {
					// first element of perspectives is default perspective
					viewState.curPerspectiveIdx = 0;
					ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
					delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
					ConfigProviderService.curDbConfig = resp.data;
					// then get the DBconfigFile

					// set wav file
					viewState.somethingInProgress = true;
					viewState.somethingInProgressTxt = 'Parsing WAV file...';

					Wavparserservice.parseWavArrBuf(data.data).then(function (messWavParser) {
						var wavJSO = messWavParser;
						viewState.curViewPort.sS = 0;
						viewState.curViewPort.eS = wavJSO.Data.length;
						// viewState.curViewPort.selectS = -1;
						// viewState.curViewPort.selectE = -1;
						// viewState.curClickSegments = [];
						// viewState.curClickLevelName = undefined;
						// viewState.curClickLevelType = undefined;

						viewState.curViewPort.bufferLength = wavJSO.Data.length;
						viewState.resetSelect();
						Soundhandlerservice.wavJSO = wavJSO;

						// get + parse file
						Iohandlerservice.httpGetPath(ConfigProviderService.embeddedVals.labelGetUrl, 'utf-8').then(function (data2) {
							viewState.somethingInProgressTxt = 'Parsing ' + ConfigProviderService.embeddedVals.labelType + ' file...';
							Iohandlerservice.parseLabelFile(data2.data, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTextGrid', ConfigProviderService.embeddedVals.labelType).then(function (parseMess) {
								// console.log(parseMess)
								var annot = parseMess.data;
								Levelservice.setData(annot);
								// console.log(JSON.stringify(l, undefined, 2));
								var lNames = [];
								annot.levels.forEach(function (l) {
									lNames.push(l.name);
								})

								ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order = lNames;
								viewState.somethingInProgressTxt = 'Done!';
								viewState.somethingInProgress = false;
								viewState.setState('labeling');
							}, function (errMess) {
								dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
							});

						}, function (errMess) {
							dialogService.open('views/error.html', 'ModalCtrl', 'Could not get label file: ' + ConfigProviderService.embeddedVals.labelGetUrl + ' ERROR ' + errMess);
						});


					}, function (errMess) {
						dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
					})
				}, function (errMess) {
					dialogService.open('views/error.html', 'ModalCtrl', 'Could not get embedded_config.json: ' + errMess);
				});
			}, function (errMess) {
				dialogService.open('views/error.html', 'ModalCtrl', 'Could not get audio file:' + ConfigProviderService.embeddedVals.audioGetUrl + ' ERROR: ' + errMess);
			});


		};

		/**
		 * init load of config files
		 */
		$scope.loadDefaultConfig = function () {

			Iohandlerservice.httpGetDefaultConfig().success(function (data) {
				ConfigProviderService.setVals(data);
				$scope.handleDefaultConfigLoaded();
			}).error(function (data, status, header, config) {
				dialogService.open('views/error.html', 'ModalCtrl', 'Could not get defaultConfig for EMU-webApp: ' + ' status: ' + status + ' header: ' + header + ' config ' + config);
			});

		};

		// call function on init
		$scope.loadDefaultConfig();

		/**
		 * function called after default config was loaded
		 */
		$scope.handleDefaultConfigLoaded = function () {

			if (!viewState.getsubmenuOpen()) {
				$scope.openSubmenu();
			}
			// FOR DEVELOPMENT:
			// $scope.openDemoDBbtnClick();
			// $scope.aboutBtnClick();

			$scope.shortcut = Object.create(ConfigProviderService.vals.keyMappings);

			// convert int values to char for front end
			for (var i in $scope.shortcut) {
				// sonderzeichen space
				if ($scope.shortcut[i] === 8) {
					$scope.shortcut[i] = 'BACKSPACE';
				} else if ($scope.shortcut[i] === 9) {
					$scope.shortcut[i] = 'TAB';
				} else if ($scope.shortcut[i] === 13) {
					$scope.shortcut[i] = 'ENTER';
				} else if ($scope.shortcut[i] === 16) {
					$scope.shortcut[i] = 'SHIFT';
				} else if ($scope.shortcut[i] === 18) {
					$scope.shortcut[i] = 'ALT';
				} else if ($scope.shortcut[i] === 27) {
					$scope.shortcut[i] = 'ESC';
				} else if ($scope.shortcut[i] === 32) {
					$scope.shortcut[i] = 'SPACE';
				} else if ($scope.shortcut[i] === -1) {
					$scope.shortcut[i] = 'NONE';
				} else if ($scope.shortcut[i] === 38) {
					$scope.shortcut[i] = 'ARROW UP';
				} else if ($scope.shortcut[i] === 40) {
					$scope.shortcut[i] = 'ARROW DOWN';
				} else if ($scope.shortcut[i] === 187) {
					$scope.shortcut[i] = '+';
				} else if ($scope.shortcut[i] === 189) {
					$scope.shortcut[i] = '-';
				} else {
					$scope.shortcut[i.toString()] = String.fromCharCode($scope.shortcut[i]);

				}
			}

			if (ConfigProviderService.vals.main.autoConnect) {
				Iohandlerservice.wsH.initConnect(ConfigProviderService.vals.main.wsServerUrl).then(function (message) {
					if (message.type === 'error') {
						dialogService.open('views/error.html', 'ModalCtrl', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.wsServerUrl);
					} else {
						$scope.handleConnectedToWSserver();
					}
				});
			}

			// init loading of files for testing
			viewState.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.N,
				ConfigProviderService.vals.spectrogramSettings.rangeFrom,
				ConfigProviderService.vals.spectrogramSettings.rangeTo,
				ConfigProviderService.vals.spectrogramSettings.dynamicRange,
				ConfigProviderService.vals.spectrogramSettings.window);

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
			$scope.showDropZone = false;
			ConfigProviderService.vals.main.comMode = 'WS';

			viewState.somethingInProgress = true;
			viewState.somethingInProgressTxt = 'Checking protocol...';
			// Check if server speaks the same protocol
			Iohandlerservice.getProtocol().then(function (res) {
				if (res.protocol === 'EMU-webApp-websocket-protocol' && res.version === '0.0.1') {
					viewState.somethingInProgressTxt = 'Checking user management...';
					// then ask if server does user management
					Iohandlerservice.getDoUserManagement().then(function (doUsrData) {
						if (doUsrData === 'NO') {
							viewState.somethingInProgressTxt = 'Loading DB config...';
							// then get the DBconfigFile
							Iohandlerservice.getDBconfigFile().then(function (data) {
								// first element of perspectives is default perspective
								viewState.curPerspectiveIdx = 0;
								ConfigProviderService.setVals(data.EMUwebAppConfig);
								delete data.EMUwebAppConfig; // delete to avoid duplicate
								ConfigProviderService.curDbConfig = data;
								// then get the DBconfigFile
								viewState.somethingInProgressTxt = 'Loading bundle list...';
								Iohandlerservice.getBundleList().then(function (bdata) {
									$scope.bundleList = bdata;
									// then load first bundle in list
									$scope.menuBundleClick($scope.bundleList[0]);
								});
							});
						} else {
							// show user management error 
							dialogService.open('views/error.html', 'ModalCtrl', 'We are sorry but the EMU-webApp does not support user management yet...').then(function () {
								$scope.resetToInitState();
							});
						}
					});
				} else {
					// show protocol error and disconnect from server
					dialogService.open('views/error.html', 'ModalCtrl', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.wsServerUrl + '. It does not speak the same protocol as this client. Its protocol answer was: "' + res.protocol + '" with the version: "' + res.version + '"').then(function () {
						$scope.resetToInitState();
					});
				}
			});
		};

		/**
		 *
		 */
		$scope.downloadTextGrid = function () {
			console.log(Iohandlerservice.toTextGrid());
		};

		/**
		 *
		 */
		$scope.getShortCut = function (name) {
			if ($scope.shortcut !== null) {
				if ($scope.shortcut[name] !== null) {
					if ($scope.shortcut[name] !== '') {
						return $scope.shortcut[name];
					} else {
						return 'NONE';
					}
				} else {
					return 'NONE';
				}
			} else {
				return 'NOT SET';
			}
		};

		/**
		 * Handle click on bundle in side menu. It is
		 * also used as a general loadBundle method.
		 * @param bndl object containing name attribute of currently loaded bundle
		 */
		$scope.menuBundleClick = function (bndl) {

			// check if bndl has to be saved
			if ((HistoryService.movesAwayFromLastSave !== 0)) {
				console.log(ConfigProviderService.vals.main)
				if (bndl !== $scope.curBndl) {
					$scope.lastclickedutt = bndl;
					dialogService.open('views/saveChanges.html', 'ModalCtrl', bndl.name).then(function (messModal) {
						if (messModal === 'saveChanges') {
							// save current bundle
							$scope.menuBundleSaveBtnClick().then(function () {
								// load new bundle
								$scope.menuBundleClick(bndl);
							});
						} else if (messModal === 'discardChanges') {
							// reset history
							HistoryService.resetToInitState();
							// load new bundle
							$scope.menuBundleClick(bndl);
						}
					});
				}
			} else {
				if (bndl !== $scope.curBndl) {
					// reset history
					HistoryService.resetToInitState();
					// reset viewstate

					viewState.somethingInProgress = true;
					viewState.somethingInProgressTxt = 'Loading bundle: ' + bndl.name;
					// empty ssff files
					Ssffdataservice.data = [];
					Iohandlerservice.getBundle(bndl.name, $scope.demoDbName).then(function (bundleData) {
						// check if response from http request
						if (bundleData.status === 200) {
							bundleData = bundleData.data;
						}

						var arrBuff;

						// set wav file
						arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
						viewState.somethingInProgressTxt = 'Parsing WAV file...';

						Wavparserservice.parseWavArrBuf(arrBuff).then(function (messWavParser) {
							var wavJSO = messWavParser;
							viewState.curViewPort.sS = 0;
							viewState.curViewPort.eS = wavJSO.Data.length;
							viewState.curViewPort.selectS = -1;
							viewState.curViewPort.selectE = -1;
							viewState.curClickSegments = [];
							viewState.curClickLevelName = undefined;
							viewState.curClickLevelType = undefined;

							// FOR DEVELOPMENT:
							// viewState.curViewPort.sS = 4000;
							// viewState.curViewPort.eS = 5000;

							viewState.curViewPort.bufferLength = wavJSO.Data.length;
							viewState.resetSelect();
							Soundhandlerservice.wavJSO = wavJSO;

							// set all ssff files
							viewState.somethingInProgressTxt = 'Parsing SSFF files...';
							Ssffparserservice.asyncParseSsffArr(bundleData.ssffFiles).then(function (ssffJso) {
								Ssffdataservice.data = ssffJso.data;
								// set annotation
								Levelservice.setData(bundleData.annotation);


								console.log(bndl);

								$scope.curBndl = bndl;
								viewState.setState('labeling');
								viewState.somethingInProgress = false;
								viewState.somethingInProgressTxt = 'Done!';
								// FOR DEVELOPMENT:
								// $scope.menuBundleSaveBtnClick(); // for testing save button
							}, function (errMess) {
								dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing SSFF file: ' + errMess.status.message);
							});
						}, function (errMess) {
							dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
						});

					}, function (errMess) {
						// check for http vs websocket response
						if (errMess.data) {
							dialogService.open('views/error.html', 'ModalCtrl', 'Error loading bundle: ' + errMess.data);
						} else {
							dialogService.open('views/error.html', 'ModalCtrl', 'Error loading bundle: ' + errMess.status.message);
						}
					});
				}
			}
		};


		/**
		 * Handle save bundle button click. The function is also used
		 * as a gerneral purpose save bundle function.
		 * @return promise that is resolved after completion (rejected on error)
		 */
		$scope.menuBundleSaveBtnClick = function () {
			// check if something has changed
			// if (HistoryService.movesAwayFromLastSave !== 0) { // Commented out FOR DEVELOPMENT!
			var defer = $q.defer();
			viewState.somethingInProgress = true;
			//create bundle json
			var bundleData = {};
			viewState.somethingInProgressTxt = 'Creating bundle json...';
			bundleData.ssffFiles = [];
			var formants = {};
			// ssffFiles (only FORMANTS are allowed to be manipulated so only this track is sent back to server)
			Ssffdataservice.data.forEach(function (el) {

				if (el.ssffTrackName === 'FORMANTS') {
					formants = el;
				}
			});
			if (!$.isEmptyObject()) {
				Ssffparserservice.asyncJso2ssff(el).then(function (messParser) {
					bundleData.ssffFiles.push({
						'ssffTrackName': el.ssffTrackName,
						'encoding': 'BASE64',
						'data': Binarydatamaniphelper.arrayBufferToBase64(messParser.data)
					});
					$scope.getAnnotationAndSaveBndl(bundleData, defer);

				}, function (errMess) {
					dialogService.open('views/error.html', 'ModalCtrl', 'Error converting javascript object to ssff file: ' + errMess.status.message);
					defer.reject();
				});
			} else {
				$scope.getAnnotationAndSaveBndl(bundleData, defer);
			}

			return defer.promise;
			// } // Commented out FOR DEVELOPMENT!

		};


		/**
		 *
		 */
		$scope.getAnnotationAndSaveBndl = function (bundleData, defer) {
			// annotation
			bundleData.annotation = Levelservice.getData();
			viewState.somethingInProgressTxt = 'Saving bundle...';
			Iohandlerservice.saveBundle(bundleData).then(function () {
				viewState.somethingInProgressTxt = 'Done!';
				viewState.somethingInProgress = false;
				HistoryService.movesAwayFromLastSave = 0;
				defer.resolve();
			}, function (errMess) {
				// console.log(mess);
				dialogService.open('views/error.html', 'ModalCtrl', 'Error saving bundle: ' + errMess.status.message);
				defer.reject();
			});
		};

		/**
		 *
		 */
		$scope.uttIsDisabled = function (bndl) {
			if (bndl.name === $scope.curBndl.name) {
				return false;
			} else {
				return true;
			}
		};

		/**
		 * returns jso with css defining color dependent
		 * on if changes have been made that have not been saved
		 * @param bndl object containing name attribute of bundle item
		 * requesting color
		 * @returns color as jso object used by ng-style
		 */
		$scope.getBndlColor = function (bndl) {
			var curColor;
			if (HistoryService.movesAwayFromLastSave !== 0) {
				curColor = {
					'background-color': '#f00',
					'color': 'white'
				};
			} else {
				curColor = {
					'background-color': '#999',
					'color': 'black'
				};
			}

			// console.log(bndl.name)
			if (bndl.name === $scope.curBndl.name) {
				return curColor;
			}
		};


		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
			// console.log("CURSOR");
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};

		/**
		 *
		 */
		$scope.openSubmenu = function () {
			if (viewState.getsubmenuOpen()) {
				viewState.setsubmenuOpen(false);
			} else {
				viewState.setsubmenuOpen(true);
			}
			//$timeout($scope.refreshTimeline, ConfigProviderService.vals.colors.transitionTime);
		};

		/////////////////////////////////////////
		// handle button clicks

		// top menu:
		/**
		 *
		 */
		$scope.addLevelSegBtnClick = function () {

			if (viewState.getPermission('addLevelSegBtnClick')) {
				alert('not implemented yet');
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.addLevelPointBtnClick = function () {

			if (viewState.getPermission('addLevelPointBtnClick')) {
				alert('not implemented yet');
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
				    console.log(parseMess.data);
				});

				//dialogService.openExport('views/export.html', 'ExportCtrl', Textgridparserservice.toTextGrid(Levelservice.data), 'textgrid.txt');
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.spectSettingsBtnClick = function () {
			if (viewState.getPermission('spectSettingsChange')) {
				dialogService.open('views/spectroSettings.html', 'SpectsettingsCtrl');
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
								dialogService.open('views/error.html', 'ModalCtrl', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.wsServerUrl);
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
				$scope.demoDbName = nameOfDB;
				// hide drop zone 
				$scope.showDropZone = false;

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
					ConfigProviderService.curDbConfig = data;
					// then get the DBconfigFile
					viewState.somethingInProgressTxt = 'Loading bundle list...';

					Iohandlerservice.getBundleList(nameOfDB).then(function (res) {
						var bdata = res.data;
						$scope.bundleList = bdata;
						// then load first bundle in list
						$scope.menuBundleClick($scope.bundleList[0]);
					}, function (err) {
						dialogService.open('views/error.html', 'ModalCtrl', 'Error loading bundle list of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status);
					});

				}, function (err) {
					dialogService.open('views/error.html', 'ModalCtrl', 'Error loading DB config of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status);
				});
			} //else {
			// 	console.log('action currently not allowed');
			// }
		};

		/**
		 *
		 */
		$scope.aboutBtnClick = function () {
			dialogService.open('views/about.html', 'AboutCtrl');
		};

		/**
		 *
		 */
		$scope.clearBtnClick = function () {
			// viewState.setdragBarActive(false);
			dialogService.open('views/confirmModal.html', 'ConfirmmodalCtrl', 'Do you wish to clear all loaded data and if connected disconnect from the server? This will also delete any unsaved changes...').then(function (res) {
				if (res) {
					$scope.resetToInitState();
				}
			});
		};

		/**
		 *
		 */
		$scope.resetToInitState = function () {
			if (Iohandlerservice.wsH.isConnected()) {
				Iohandlerservice.wsH.closeConnect();
			}
			$scope.bundleList = [];
			Soundhandlerservice.wavJSO = {};
			Levelservice.data = {};
			Ssffdataservice.data = [];
			HistoryService.resetToInitState();

			viewState.somethingInProgress = false;
			viewState.resetToInitState();

			$scope.showDropZone = true;
			$scope.loadDefaultConfig();

			viewState.setState('noDBorFilesloaded');

			$scope.$broadcast('resetToInitState');

		};


		// bottom menu:

		/**
		 *
		 */
		$scope.cmdZoomAll = function () {
			if (viewState.getPermission('zoom')) {
				viewState.deleteEditArea(); // SIC should be in service...
				viewState.setViewPort(0, viewState.curViewPort.bufferLength);
			} else {
				console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		$scope.cmdZoomIn = function () {
			if (viewState.getPermission('zoom')) {
				viewState.deleteEditArea(); // SIC should be in service...
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
				viewState.deleteEditArea();
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
				viewState.deleteEditArea();
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
				viewState.deleteEditArea();
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
				viewState.deleteEditArea();
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
		 *
		 */
		$scope.setlastkeycode = function (c) {
			$scope.lastkeycode = c;
		};

		/**
		 * SIC should move into viewstate.rightSubmenuOpen variable
		 */
		$scope.toggleRightSideMenuHidden = function () {
			$scope.isRightSideMenuHidden = !$scope.isRightSideMenuHidden;
		};

		/**
		 * function used to change perspective
		 * @param persp json object of current perspective containing name attribute
		 */
		$scope.changePerspective = function (persp) {
			console.log('-----------------------------------------')
			// viewState.somethingInProgress = true;
			// alert(nameOfDB);
			// viewState.somethingInProgressTxt = 'Changing perspective...';

			var newIdx;
			for (var i = 0; i < ConfigProviderService.vals.perspectives.length; i++) {
				if (persp.name === ConfigProviderService.vals.perspectives[i].name) {
					newIdx = i;
				}
			}
			viewState.curPerspectiveIdx = newIdx;
			// close submenu
			$scope.toggleRightSideMenuHidden();
			// viewState.somethingInProgressTxt = 'Done!';
			// viewState.somethingInProgress = false;
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