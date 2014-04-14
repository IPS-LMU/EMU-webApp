'use strict';

angular.module('emuwebApp')
	.controller('MainCtrl', function ($scope, $rootScope, $modal, $log, $compile, $timeout, $window, $document, ngProgressLite,
		viewState, HistoryService, Iohandlerservice, Soundhandlerservice, ConfigProviderService, fontScaleService, Ssffdataservice, Levelservice, dialogService, Textgridparserservice, Binarydatamaniphelper, Wavparserservice, Ssffparserservice, Drawhelperservice) {

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

		// init vars
		$scope.connectBtnLabel = 'connect';
		$scope.tmp = {};
		$scope.tmp.showSaveCommStaBtnDiv = false;
		$scope.dbLoaded = false;
		$scope.isRightSideMenuHidden = true;
		$scope.is2dCancasesHidden = true;
		$scope.showDropZone = true;

		$scope.lastkeycode = 'N/A';
		$scope.bundleList = [];

		$scope.curUserName = '';
		$scope.curUtt = {};
		$scope.modifiedCurLevelItems = false;
		$scope.modifiedCurSSFF = false;
		$scope.modifiedMetaData = false;
		$scope.lastclickedutt = null;
		$scope.shortcut = null;
		$scope.filterText = '';
		$scope.windowWidth = $window.outerWidth;

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
			}
		});


		/**
		 * listen for newUserLoggedOn (also called for no user on auto connect)
		 */
		$scope.$on('newUserLoggedOn', function (evt, name) {
			$scope.curUserName = name;
			viewState.setState('loadingSaving');
			Iohandlerservice.getUsrUttList(name).then(function (newVal) {
				Iohandlerservice.getUtt(newVal[0]).then(function (argument) {
					console.log(argument);
					viewState.setState('labeling');
					$scope.curUtt = newVal[0];
					$('#FileCtrl').scope().hideDropZone(); // SIC should be in service
					if (!viewState.getsubmenuOpen()) {
						$scope.openSubmenu();
					}
					$scope.bundleList = newVal;
					$scope.curUtt = newVal[0];
				});
			});
		});

		/**
		 * clear view when new utt is loaded
		 */
		$scope.$on('loadingNewUtt', function () {
			viewState.resetSelect();
			viewState.setcurClickLevelName(undefined);
		});

		/**
		 * listen for saveSSFFb4load
		 */
		$scope.$on('saveSSFFb4load', function () { // SIC switch to promises
			console.log('saving utt');
			// Iohandlerservice.postSaveSSFF();
			Iohandlerservice.wsH.saveSSFFfile($scope.curUserName, Ssffdataservice.data[0]); // SIC hardcoded
			$scope.modifiedCurSSFF = false;
			$scope.$broadcast('loadingNewUtt');
			console.log($scope.lastclickedutt);
			// Iohandlerservice.httpGetUtterence($scope.lastclickedutt);
			Iohandlerservice.wsH.getUtt($scope.curUserName, $scope.lastclickedutt);
			$scope.curUtt = $scope.lastclickedutt;
		});

		/**
		 * listen for saveSSFFb4load
		 */
		$scope.$on('discardSSFFb4load', function () { // SIC switch to promises
			console.log('discarding ssff changes');
			$scope.modifiedCurSSFF = false;
			$scope.$broadcast('loadingNewUtt');
			console.log($scope.lastclickedutt);
			// Iohandlerservice.httpGetUtterence($scope.lastclickedutt);
			Iohandlerservice.wsH.getUtt($scope.curUserName, $scope.lastclickedutt);
			$scope.curUtt = $scope.lastclickedutt;
		});


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

			// SIC!! use ConfigProviderService.vals.keyMappings.strRep directly
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
				// console.log("DEVEL");
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

			if (ConfigProviderService.vals.restrictions.sortLabels) {
				// $('#allowSortable').sortable('enable');
			}

			// swap osci and spectro depending on config settings "signalsCanvasConfig.order"
			// $('#' + ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order[1]).insertBefore('#' + ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order[0]);
			// $('#' + ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order[0]).insertBefore('#' + ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order[1]);

		};

		/**
		 *
		 */
		$scope.handleConnectedToWSserver = function () {
			// TODO hardcode removal of save / load/ manipulation buttons 
			$scope.showDropZone = false;
			ConfigProviderService.vals.main.comMode = 'WS';
			$scope.showSaveCommStaBtnDiv = true; // SIC should not hardcode... should check if in json 

			// Check if server speaks the same protocol
			Iohandlerservice.getProtocol().then(function (res) {
				if (res.protocol === 'EMU-webApp-websocket-protocol' && res.version === '0.0.1') {
					// then ask if server does user management
					Iohandlerservice.getDoUserManagement().then(function (doUsrData) {
						if (doUsrData === 'NO') {
							// then get the DBconfigFile
							Iohandlerservice.getDBconfigFile().then(function (data) {
								viewState.curPerspectiveIdx = 0;
								ConfigProviderService.setVals(data.EMUwebAppConfig);
								delete data.EMUwebAppConfig; // delete to avoid duplicate
								ConfigProviderService.curDbConfig = data;
								// then get the DBconfigFile
								Iohandlerservice.getBundleList().then(function (bdata) {
									$scope.bundleList = bdata;
									// then load first bundle in list
									$scope.menuBundleClick($scope.bundleList[0]);
								});
							});
						} else {
							dialogService.open('views/error.html', 'ModalCtrl', 'We are sorry but the EMU-webApp does not support user management yet...');
						}
					});
					if (!ConfigProviderService.vals.main.autoConnect) {
						// Iohandlerservice.getDoUserManagement().then(function (manageRes) {
						// 	if (manageRes === 'YES') {
						// 		dialogService.open('views/login.html', 'LoginCtrl');
						// 	} else {
						// 		$scope.$broadcast('newUserLoggedOn', '');
						// 	}
						// });
					} else {
						// $scope.connectBtnLabel = 'disconnect';
						// $scope.$broadcast('newUserLoggedOn', '');

					}
				} else {
					// show protocol error and disconnect from server
					dialogService.open('views/error.html', 'ModalCtrl', 'Could not connect to websocket server: ' + ConfigProviderService.vals.main.wsServerUrl + '. It does not speak the same protocol as this client. Its protocol answer was: "' + res.protocol + '" with the version: "' + res.version + '"');
					Iohandlerservice.wsH.closeConnect();
				}
			});
		};

		$scope.downloadTextGrid = function () {
			console.log(Iohandlerservice.toTextGrid());
		};

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
		 *
		 */
		$scope.menuBundleClick = function (utt) {
			if (HistoryService.getNrOfPosibleUndos() > 0) {
				$scope.modifiedCurSSFF = true;
			}
			if ($scope.modifiedCurSSFF || $scope.modifiedCurLevelItems) {
				$scope.lastclickedutt = utt;
				dialogService.open('views/saveChanges.html', 'ModalCtrl', utt.name);
			} else {
				if (utt !== $scope.curUtt) {
					// empty ssff files
					Ssffdataservice.data = [];
					Iohandlerservice.getBundle(utt.name).then(function (bundleData) {
						// check if response from http request
						if (bundleData.status === 200) {
							bundleData = bundleData.data;
						}
						ngProgressLite.done();

						var arrBuff;
						// set wav file
						arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);

						// var wavJSO = Wavparserservice.wav2jso(arrBuff);
						Wavparserservice.parseWavArrBuf(arrBuff).then(function (messWavParser) {
							var wavJSO = messWavParser;
							viewState.curViewPort.sS = 0;
							viewState.curViewPort.eS = wavJSO.Data.length;
							// FOR DEVELOPMENT:
							// viewState.curViewPort.sS = 110678;
							// viewState.curViewPort.eS = 110703;
							viewState.curViewPort.bufferLength = wavJSO.Data.length;
							viewState.resetSelect();
							Soundhandlerservice.wavJSO = wavJSO;

							// set all ssff files
							// var ssffJso;
							Ssffparserservice.parseSsffArr(bundleData.ssffFiles).then(function (ssffJson) {
								console.log(ssffJson.data)
								Ssffdataservice.data = ssffJson.data;
								// set annotation
								Levelservice.setData(bundleData.annotation);
								$scope.curUtt = utt;
								viewState.setState('labeling');
							}, function (errMess) {
								// console.error(errMess)
								dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing SSFF file: ' + errMess.status.message);
							});
							// set annotation
							Levelservice.setData(bundleData.annotation);
							$scope.curUtt = utt;
							viewState.setState('labeling');
						}, function (errMess) {
							// console.error(errMess)
							dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
						});


						// bundleData.ssffFiles.forEach(function (ssffFile, idx) {
						// 	console.log(idx);
						// 	arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(ssffFile.data);
						// 	var ssffJso = Ssffparserservice.ssff2jso(arrBuff, ssffFile.ssffTrackName);
						// 	Ssffdataservice.data.push(angular.copy(ssffJso));
						// });

					});
				}
			}
		};


		/**
		 *
		 */
		$scope.menuBundleSaveBtnClick = function () {


			//create bundle json
			var bundleData = {};

			// ssffFiles (only FORMANTS are allowed to be manipulated)
			// if ($scope.modifiedCurSSFF) {
			bundleData.ssffFiles = [];
			Ssffdataservice.data.forEach(function (el, idx) {

				if (el.ssffTrackName === 'FORMANTS') {
					bundleData.ssffFiles.push({
						'ssffTrackName': el.ssffTrackName,
						'encoding': 'BASE64',
						'data': Binarydatamaniphelper.arrayBufferToBase64(Ssffparserservice.jso2ssff(el))
					});
				}
			});
			// }
			// annotation
			// if ($scope.modifiedCurLevelItems) {
			bundleData.annotation = Levelservice.getData();

			Iohandlerservice.saveBundle(bundleData).then(function (arg) {
				ngProgressLite.done();
				$scope.modifiedCurSSFF = false;
				$scope.modifLevelItems = false;
			});
			// }
		};

		/**
		 *
		 */
		// $scope.dragStart = function () {
		// 	viewState.setdragBarActive(true);
		// };

		/**
		 *
		 */
		// $scope.dragEnd = function () {
		// 	viewState.setdragBarActive(false);
		// };


		/**
		 *
		 */
		$scope.uttIsDisabled = function (utt) {
			if (utt.name === $scope.curUtt.name) {
				return false;
			} else {
				return true;
			}
		};

		/**
		 *
		 */
		$scope.getUttColor = function (utt) {
			var curColor;
			if (HistoryService.getNrOfPosibleUndos() > 0) {
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

			// console.log(utt.name)
			if (utt.name === $scope.curUtt.name) {
				return curColor;
			}
		};

		/**
		 *
		 */
		$scope.getMetaBtnColor = function () {
			var curColor;
			if (!$scope.modifiedMetaData) {
				curColor = {
					'color': 'rgb(128,230,25)'
				};

			} else {
				curColor = {
					'color': 'red'
				};
			}
			return curColor;
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
		//
		$scope.addLevelSegBtnClick = function () {

			if (viewState.getPermission('addLevelSegBtnClick')) {
				alert('not implemented yet');
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.addLevelPointBtnClick = function () {

			if (viewState.getPermission('addLevelPointBtnClick')) {
				alert('not implemented yet');
			} else {
				console.log('action currently not allowed');
			}
		};

		//
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

		$scope.downloadTextGridBtnClick = function () {
			if (viewState.getPermission('downloadTextGridBtnClick')) {
				dialogService.openExport('views/export.html', 'ExportCtrl', Textgridparserservice.toTextGrid(Levelservice.data), 'textgrid.txt');
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.spectSettingsBtnClick = function () {
			if (viewState.getPermission('spectSettingsChange')) {
				dialogService.open('views/spectroSettings.html', 'SpectsettingsCtrl');
			} else {
				console.log('action currently not allowed');
			}
		};

		//
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

		//
		$scope.openDemoDBbtnClick = function () {
			if (viewState.getPermission('openDemoBtnDBclick')) {
				ConfigProviderService.vals.main.comMode = 'DEMO';
				viewState.setState('loadingSaving');
				Iohandlerservice.getDBconfigFile().then(function (dbConfig) {
					ConfigProviderService.setVals(dbConfig.data.EMUwebAppConfig);
					delete dbConfig.data.EMUwebAppConfig; // delete to avoid duplicate
					ConfigProviderService.curDbConfig = dbConfig.data;

					Iohandlerservice.getBundleList().then(function (res) {
						$scope.showDropZone = false;
						$scope.bundleList = res.data;
						$scope.menuBundleClick($scope.bundleList[0]);
						// 	// Iohandlerservice.getUtt(res.data[0]);
						// 	// $scope.curUtt = res.data[0];
						// 	// should be then after get utt
						viewState.setState('labeling');
					});
				});
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.aboutBtnClick = function () {
			dialogService.open('views/about.html', 'AboutCtrl');
		};

		//
		$scope.clearBtnClick = function () {
			// viewState.setdragBarActive(false);
			dialogService.open('views/confirmModal.html', 'ConfirmmodalCtrl', 'Do you wish to clear all loaded data and if connected disconnect from the server? This will also delete any unsaved changes...').then(function (res) {
				if (res) {
					if (Iohandlerservice.wsH.isConnected()) {
						Iohandlerservice.wsH.closeConnect();
					}
					$scope.bundleList = [];

					Soundhandlerservice.wavJSO = {};
					Levelservice.data = {};
					Ssffdataservice.data = [];
					$scope.showDropZone = true;
					$scope.loadDefaultConfig();

					//$scope.$broadcast('refreshTimeline'); // SIC SIC SIC

					viewState.setState('noDBorFilesloaded');
				}
			});
		};



		// bottom menu:

		//
		$scope.cmdZoomAll = function () {
			if (viewState.getPermission('zoom')) {
				viewState.deleteEditArea(); // SIC should be in service...
				viewState.setViewPort(0, viewState.curViewPort.bufferLength);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomIn = function () {
			if (viewState.getPermission('zoom')) {
				viewState.deleteEditArea(); // SIC should be in service...
				viewState.zoomViewPort(true);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomOut = function () {
			if (viewState.getPermission('zoom')) {
				viewState.deleteEditArea();
				viewState.zoomViewPort(false);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomLeft = function () {
			if (viewState.getPermission('zoom')) {
				viewState.deleteEditArea();
				viewState.shiftViewPort(false);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomRight = function () {
			if (viewState.getPermission('zoom')) {
				viewState.deleteEditArea();
				viewState.shiftViewPort(true);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomSel = function () {
			if (viewState.getPermission('zoom')) {
				viewState.deleteEditArea();
				viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdPlayView = function () {
			if (viewState.getPermission('playaudio')) {
				Soundhandlerservice.playFromTo(viewState.curViewPort.sS, viewState.curViewPort.eS);
				viewState.animatePlayHead(viewState.curViewPort.sS, viewState.curViewPort.eS);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdPlaySel = function () {
			if (viewState.getPermission('playaudio')) {
				Soundhandlerservice.playFromTo(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
				viewState.animatePlayHead(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdPlayAll = function () {
			if (viewState.getPermission('playaudio')) {
				Soundhandlerservice.playFromTo(0, Soundhandlerservice.wavJSO.Data.length);
				viewState.animatePlayHead(0, Soundhandlerservice.wavJSO.Data.length);
			} else {
				console.log('action currently not allowed');
			}
		};

		// other

		//
		$scope.saveMetaData = function () {

			Iohandlerservice.wsH.saveUsrUttList($scope.curUserName, $scope.bundleList);
			$scope.modifiedMetaData = false;
		};

		//
		$scope.openFile = function () {
			alert('code to open file');
		};

		//
		$scope.setlastkeycode = function (c) {
			$scope.lastkeycode = c;
		};

		//
		$scope.toggleRightSideMenuHidden = function () {
			$scope.isRightSideMenuHidden = !$scope.isRightSideMenuHidden;
		};

		//
		$scope.toggle2dCancases = function () {
			$scope.is2dCancasesHidden = !$scope.is2dCancasesHidden;
		};

		//
		$scope.changePerspective = function (persp) {

			var newIdx;
			for (var i = 0; i < ConfigProviderService.vals.perspectives.length; i++) {
				console.log(ConfigProviderService.vals.perspectives[i].name);
				if (persp.name === ConfigProviderService.vals.perspectives[i].name) {
					newIdx = i;
				}
			}
			viewState.curPerspectiveIdx = newIdx;
			// close submenu
			$scope.toggleRightSideMenuHidden();
		};

		//
		$scope.getPerspectiveColor = function (persp) {
			var curColor;
			if (viewState.curPerspectiveIdx === -1 || persp.name === ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].name) {
				curColor = {
					'background-color': '#999',
					'color': 'white'
				};
			} else {
				curColor = {
					'background-color': 'white',
					'color': 'black'
				};
			}
			return curColor;
		};

	});