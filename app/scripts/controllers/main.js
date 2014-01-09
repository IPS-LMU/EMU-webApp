'use strict';

angular.module('emulvcApp')
	.controller('MainCtrl', function ($scope, $modal, $log, $compile, $timeout, $window, $document,
		viewState, HistoryService, Iohandlerservice, Soundhandlerservice, ConfigProviderService, fontScaleService, Ssffdataservice, Tierservice, dialogService) {

		$scope.cps = ConfigProviderService;
		$scope.hists = HistoryService;
		$scope.fontImage = fontScaleService;
		$scope.tds = Tierservice;
		$scope.vs = viewState;
		$scope.dials = dialogService;
		$scope.connectBtnLabel = 'connect';
		$scope.tmp = {};
		$scope.tmp.showSaveCommStaBtnDiv = false;
		$scope.showDropZone = false;
		$scope.dbLoaded = false;

		$scope.lastkeycode = 'N/A';
		$scope.uttList = [];

		$scope.showDropZone = true;

		$scope.curUserName = '';
		$scope.curUtt = {};
		$scope.modifiedCurTierItems = false;
		$scope.modifiedCurSSFF = false;
		$scope.modifiedMetaData = false;
		$scope.lastclickedutt = null;
		$scope.shortcut = null;

		$scope.filterText = '';

		$scope.windowWidth = $window.outerWidth;

		// bind window resize event
		angular.element($window).bind('resize', function () {
			$scope.refreshTimeline();
			Tierservice.deleteEditArea();
			$scope.windowWidth = $window.outerWidth;
			$scope.$apply('windowWidth');
		});

		// bind shift/alt keyups for history
		angular.element($window).bind('keyup', function (e) {
			if (e.keyCode === ConfigProviderService.vals.keyMappings.shift || e.keyCode === ConfigProviderService.vals.keyMappings.alt) {
				HistoryService.addCurChangeObjToUndoStack();
			}
		});



		// init load of config files
		ConfigProviderService.httpGetConfig();

		// init history service

		// HAS TO BE DONE WHEN NEW UTT DATA ARE READY !! TODO !!
		$scope.hists.init();

		// init pure jquery dragbar
		$('.TimelineCtrl').ownResize('.resizer');

		/**
		 * listen for configLoaded
		 */
		$scope.$on('configLoaded', function () {
			$scope.handleConfigLoaded();
		});


		/**
		 * listen for connectedToWSserver
		 */
		$scope.$on('connectedToWSserver', function () {
			// TODO hardcode removal of save / load/ manipulation buttons 
			$scope.showDropZone = false;
			ConfigProviderService.vals.main.comMode = 'ws';
			$scope.showSaveCommStaBtnDiv = true; // SIC should not hardcode... should check if in json 

			// Check if server speaks emuLVC
			Iohandlerservice.getProtocol().then(function (res) {
				if (res.protocol === 'emuLVC-websocket-protocol' && res.version === '0.0.1') {
					Iohandlerservice.getConfigFile().then(function (newVal) {
						ConfigProviderService.setVals(newVal);
					});
					if (!ConfigProviderService.vals.main.autoConnect) {
						Iohandlerservice.getDoUserManagement().then(function (manageRes) {
							if (manageRes === 'YES') {
								dialogService.open('views/login.html', 'LoginCtrl');
							} else {
								$scope.$broadcast('newUserLoggedOn', '');
							}
						});
					} else {
						$scope.connectBtnLabel = 'disconnect';
						$scope.$broadcast('newUserLoggedOn', '');

					}
				} else {
					// disconnect from server and reopen connect dialog

				}
			});
		});

		/**
		 * listen for dropped files
		 */
		// $scope.$on('fileLoaded', function (evt, type, data) {
		// 	switch (type) {
		// 	case type.WAV:
		// 		$scope.uttList[0].name = data.name.substr(0, data.name.lastIndexOf('.'));
		// 		Iohandlerservice.httpGetUtterence($scope.uttList[0], 'testData/' + $scope.uttList[0] + '/');
		// 		break;
		// 	case type.TEXTGRID:

		// 		break;
		// 	}
		// 	console.log('data');
		// 	console.log(data);
		// });

		/**
		 * listen for newlyLoadedUttList
		 */
		// $scope.$on('newlyLoadedUttList', function(evt, uttList) {
		// 	$scope.uttList = uttList;
		// 	// Iohandlerservice.httpGetUtterence($scope.uttList[0]);
		// 	$scope.curUtt = $scope.uttList[0];
		// 	if (!viewState.getsubmenuOpen()) {
		// 		$scope.openSubmenu();
		// 	}
		// });

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
					$scope.uttList = newVal;
					$scope.curUtt = newVal[0];
				});
			});
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


		// 
		$scope.handleConfigLoaded = function () {

			if (!viewState.getsubmenuOpen()) {
				$scope.openSubmenu();
			}
			// for development
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
						dialogService.open('views/error.html', 'ModalCtrl', 'Could not connect to websocket server...');
					}
				});
			}

			// init loading of files for testing
			viewState.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.N,
				ConfigProviderService.vals.spectrogramSettings.rangeFrom,
				ConfigProviderService.vals.spectrogramSettings.rangeTo,
				ConfigProviderService.vals.spectrogramSettings.dynamicRange,
				ConfigProviderService.vals.spectrogramSettings.window);

			// set timeline height according to config settings "colors.timelineHeight"
			$('.TimelineCtrl').css('height', ConfigProviderService.vals.colors.timelineHeight);
			$('.HandletiersCtrl').css('padding-top', $('.TimelineCtrl').height() + 2 * $('.menu').height() + 'px');

			// setting transition values
			var dotMs = ConfigProviderService.vals.colors.transitionTime / 1000;
			var transcss = {
				'-webkit-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out',
				'-moz-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out',
				'-ms-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out',
				'-o-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out',
				'transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out'
			};
			$('.menu').css(transcss);
			$('.HandletiersCtrl').css(transcss);
			$('.OsciDiv').css(transcss);
			$('.SpectroDiv').css(transcss);
			$('.menu-bottom').css(transcss);
			$('.cbp-spmenu').css(transcss);
			$('.cbp-spmenu-push').css(transcss);
			$('.cbp-spmenu-push-toleft').css(transcss);
			$('.cbp-spmenu-push-toright').css(transcss);



			if (ConfigProviderService.vals.restrictions.sortLabels) {
				// $('#allowSortable').sortable('enable');
			}

			// swap osci and spectro depending on config settings "signalsCanvasConfig.order"
			$('#' + ConfigProviderService.vals.signalsCanvasConfig.order[1]).insertBefore('#' + ConfigProviderService.vals.signalsCanvasConfig.order[0]);
			$('#' + ConfigProviderService.vals.signalsCanvasConfig.order[0]).insertBefore('#' + ConfigProviderService.vals.signalsCanvasConfig.order[1]);

		};


		$scope.downloadTextGrid = function () {
			console.log(Iohandlerservice.toTextGrid());
		};

		$scope.refreshTimeline = function () {
			$scope.$broadcast('refreshTimeline');
		};

		$scope.refreshScope = function () {
			$scope.$digest();
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
		$scope.menuUttClick = function (utt) {
			if ($scope.modifiedCurSSFF || $scope.modifiedCurTierItems) {
				$scope.lastclickedutt = utt;
				dialogService.open('views/saveChanges.html', 'dialog', 'Changes made to: ' + utt.name + '. Do you wish to save them?');
			} else {
				if (utt !== $scope.curUtt) {
					$scope.$broadcast('loadingNewUtt');
					Iohandlerservice.getUtt(utt).then(function (res) {
						console.log(res);
						$scope.curUtt = utt;
					});
				}
			}
		};


		/**
		 *
		 */
		$scope.menuUttSave = function () {
			// Iohandlerservice.postSaveSSFF();
			Iohandlerservice.saveUtt($scope.curUtt).then(function (arg) {
				console.log(arg);
				$scope.modifiedCurSSFF = false;
				$scope.modifTierItems = false;
			});
		};

		/**
		 *
		 */
		$scope.dragStart = function () {
			viewState.setdragBarActive(true);
		};

		/**
		 *
		 */
		$scope.dragEnd = function () {
			viewState.setdragBarActive(false);
		};

		// /**
		//  *
		//  */
		// $scope.changingMetaData = function () {
		// 	$scope.modifiedMetaData = true;
		// };

		// /**
		//  *
		//  */
		// $scope.changingSSFFdata = function () {
		// 	// console.log('changingSSFFdata')
		// 	$scope.modifiedCurSSFF = true;
		// };

		// /**
		//  *
		//  */
		// $scope.modifTierItems = function () {
		// 	console.log('items labs changed');
		// 	$scope.modifiedCurTierItems = true;
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
				// $('#submenuOpen').html('☰');
				$('#FileCtrl').removeClass('cbp-spmenu-open');
				$('#TimelineCtrl').removeClass('cbp-spmenu-push-toright').addClass('cbp-spmenu-push-toleft');
				$('#HandletiersCtrl').removeClass('cbp-spmenu-push-toright').addClass('cbp-spmenu-push-toleft');
				$('#menu').removeClass('cbp-spmenu-push-toright');
				$('#menu-bottom').removeClass('cbp-spmenu-push-toright');
			} else {
				viewState.setsubmenuOpen(true);
				// $('#submenuOpen').html('☰');
				$('#FileCtrl').addClass('cbp-spmenu-open');
				$('#TimelineCtrl').removeClass('cbp-spmenu-push-toleft').addClass('cbp-spmenu-push-toright');
				$('#HandletiersCtrl').removeClass('cbp-spmenu-push-toleft').addClass('cbp-spmenu-push-toright');
				$('#menu').addClass('cbp-spmenu-push-toright');
				$('#menu-bottom').addClass('cbp-spmenu-push-toright');
			}
			$timeout($scope.refreshTimeline, ConfigProviderService.vals.colors.transitionTime); // SIC !! has to be according to css transition... maybe read out value of css or set in conf
		};

		/////////////////////////////////////////
		// handle button clicks

		// top menu:

		//
		$scope.addTierSegBtnClick = function () {

			if (viewState.getPermission('addTierSegBtnClick')) {
				alert('not implemented yet');
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.addTierPointBtnClick = function () {

			if (viewState.getPermission('addTierPointBtnClick')) {
				alert('not implemented yet');
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.renameSelTierBtnClick = function () {
			if (viewState.getPermission('renameSelTierBtnClick')) {
				if (viewState.getcurClickTierName() !== undefined) {
				    dialogService.open('views/renameTier.html', 'ModalCtrl', viewState.getcurClickTierName());
				} else {
				    dialogService.open('views/error.html', 'ModalCtrl', 'Rename Error : Please choose a Tier first !');
				}
			} else {
				console.log('action currently not allowed');
			}
		};

		$scope.downloadTextGridBtnClick = function () {
			if (viewState.getPermission('downloadTextGridBtnClick')) {
				alert('not implemented yet');
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
				// $scope.openModal('views/connectModal.html', 'dialog', false);
				dialogService.open('views/connectModal.html', 'WsconnectionCtrl');
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.openDemoDBbtnClick = function () {
			if (viewState.getPermission('openDemoBtnDBclick')) {
				ConfigProviderService.vals.main.comMode = 'http:GET';
				viewState.setState('loadingSaving');
				Iohandlerservice.getUttList('testData/demoUttList.json').then(function (res) {
					console.log(res.data);
					$('#FileCtrl').scope().hideDropZone(); // SIC should be in service
					$scope.uttList = res.data;
					Iohandlerservice.getUtt(res.data[0]);
					$scope.curUtt = res.data[0];
					// should be then after get utt
					viewState.setState('labeling');
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
			console.log('trying to clear labeller');
			dialogService.open('views/confirmModal.html', 'ConfirmmodalCtrl', 'Do you wish to clear all loaded data? This will also delete any unsaved changes...').then(function (res) {
				if (res) {
					if (Iohandlerservice.wsH.isConnected()) {
						Iohandlerservice.wsH.closeConnect();
					}
					$scope.uttList = [];
					ConfigProviderService.httpGetConfig();
					Soundhandlerservice.wavJSO = {};
					Tierservice.data = {};
					Ssffdataservice.data = [];
					$('#FileCtrl').scope().showDropZone(); // SIC should be in service
					$scope.$broadcast('refreshTimeline');

					viewState.setState('noDBorFilesloaded');
				}
			});
		};



		// bottom menu:

		//
		$scope.cmdZoomAll = function () {
			if (viewState.getPermission('zoom')) {
				$('#HandletiersCtrl').scope().deleteEditArea(); // SIC should be in service...
				viewState.setViewPort(0, viewState.curViewPort.bufferLength);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomIn = function () {
			if (viewState.getPermission('zoom')) {
				$('#HandletiersCtrl').scope().deleteEditArea(); // SIC should be in service...
				viewState.zoomViewPort(true);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomOut = function () {
			if (viewState.getPermission('zoom')) {
				$('#HandletiersCtrl').scope().deleteEditArea();
				viewState.zoomViewPort(false);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomLeft = function () {
			if (viewState.getPermission('zoom')) {
				$('#HandletiersCtrl').scope().deleteEditArea();
				viewState.shiftViewPort(false);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomRight = function () {
			if (viewState.getPermission('zoom')) {
				$('#HandletiersCtrl').scope().deleteEditArea();
				viewState.shiftViewPort(true);
			} else {
				console.log('action currently not allowed');
			}
		};

		//
		$scope.cmdZoomSel = function () {
			if (viewState.getPermission('zoom')) {
				$('#HandletiersCtrl').scope().deleteEditArea();
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

			Iohandlerservice.wsH.saveUsrUttList($scope.curUserName, $scope.uttList);
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

	});