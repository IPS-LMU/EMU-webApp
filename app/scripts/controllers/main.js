'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, $compile, $timeout,
		viewState, Iohandlerservice, Soundhandlerservice, ConfigProviderService, fontScaleService, Ssffdataservice) {

		$scope.cps = ConfigProviderService;
		$scope.fontImage = fontScaleService;

		$scope.lastkeycode = 'N/A';
		$scope.uttsList = [];

		$scope.showDropZone = true;

		$scope.curUserName = '';
		$scope.curUtt = {};
		$scope.modifiedCurSSFF = false;
		$scope.modifiedMetaData = false;
		$scope.lastclickedutt = null;
		$scope.shortcut = null;

		// $scope.sssffChangedColor = 'rgba(152, 152, 152, 0.25)';

		// init load of config files
		ConfigProviderService.httpGetConfig();

		// init pure jquery dragbar
		$('.TimelineCtrl').ownResize('.resizer');
		// implementing it in angular again

		/**
		 * listen for configLoaded
		 */
		$scope.$on('configLoaded', function() {
			$scope.handleConfigLoaded();
		});


		/**
		 * listen for connectedToWSserver
		 */
		$scope.$on('connectedToWSserver', function(evt, type, data) {
			console.log('connectedToWSserver');
			// TODO hardcode removal of save / load/ manipulation buttons 

			$scope.showDropZone = false;

			// Check if server speaks emuLVC
			Iohandlerservice.wsH.getProtocol().then(function(res) {
				if (res.protocol === 'emuLVC-websocket-protocol' && res.version === '0.0.1') {
					console.log('we speak the same protocol!!');
					Iohandlerservice.wsH.getDoUserManagement().then(function (manageRes) {
						// if(manageRes === 'YES'){
						// 	$scope.openModal('views/login.html', 'dialog', true);
						// }
					});

				} else {
					// disconnect from server and reopen connect dialog

				}
			});

			var promConf = Iohandlerservice.wsH.getConfigFile();

			promConf.then(function(newVal) {
				ConfigProviderService.vals = newVal;
			})

			$scope.uttsList = Iohandlerservice.wsH.getUsrUttList();
			var prom = Iohandlerservice.wsH.getUsrUttList('florian');
			// console.log($scope.uttsList)
			prom.then(function(newVal) {
				// console.log(newVal[0]);
				Iohandlerservice.wsH.getUtt($scope.curUserName, newVal[0]);
				$scope.curUtt = newVal[0];
				if (!viewState.getsubmenuOpen()) {
					$scope.openSubmenu();
				}
				$scope.uttsList = newVal;
			})

		});

		/**
		 * listen for dropped files
		 */
		$scope.$on('fileLoaded', function(evt, type, data) {
			switch (type) {
				case fileType.WAV:
					$scope.uttsList[0].utteranceName = data.name.substr(0, data.name.lastIndexOf("."));
					Iohandlerservice.httpGetUtterence($scope.uttsList[0], 'testData/' + $scope.uttsList[0] + '/');
					break;
				case fileType.TEXTGRID:

					break;
			}
			console.log("data");
			console.log(data);
		});

		/**
		 * listen for newlyLoadedUttList
		 */
		$scope.$on('newlyLoadedUttList', function(evt, uttList) {
			$scope.uttsList = uttList;
			Iohandlerservice.httpGetUtterence($scope.uttsList[0]);
			$scope.curUtt = $scope.uttsList[0];
			if (!viewState.getsubmenuOpen()) {

				$scope.openSubmenu();
			}
		});

		/**
		 * listen for newUserLoggedOn
		 */
		$scope.$on('newUserLoggedOn', function(evt, name) {
			$scope.curUserName = name;
		});


		/**
		 * listen for saveSSFFb4load
		 */
		$scope.$on('saveSSFFb4load', function(evt, data) {
			console.log("saving utt")
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
		$scope.$on('discardSSFFb4load', function(evt, data) {
			console.log("discarding ssff changes")
			$scope.modifiedCurSSFF = false;
			$scope.$broadcast('loadingNewUtt');
			console.log($scope.lastclickedutt);
			// Iohandlerservice.httpGetUtterence($scope.lastclickedutt);
			Iohandlerservice.wsH.getUtt($scope.curUserName, $scope.lastclickedutt);
			$scope.curUtt = $scope.lastclickedutt;
		});

		/**
		 * listen for newlyLoadedAudioFile
		 */
		$scope.$on('newlyLoadedAudioFile', function(evt, wavJSO, fileName) {
			// for dev:
			// viewState.curViewPort.sS = 28535;
			// viewState.curViewPort.eS = 29555;
			viewState.curViewPort.sS = 0;
			viewState.curViewPort.eS = wavJSO.Data.length;
			viewState.curViewPort.bufferLength = wavJSO.Data.length;
			viewState.setscrollOpen(0);
			Soundhandlerservice.wavJSO = wavJSO;
			$scope.baseName = fileName.substr(0, fileName.lastIndexOf("."));
		});

		// 
		$scope.handleConfigLoaded = function() {

			// for develment
			console.log(ConfigProviderService.vals.main.develMode)
			if (!viewState.getsubmenuOpen()) {
				$scope.openSubmenu();
			}

			$scope.shortcut = Object.create(ConfigProviderService.vals.keyMappings);
			// convert int values to char for front end
			for (var i in $scope.shortcut) {
				// sonderzeichen space
				if ($scope.shortcut[i] === 32) {
					$scope.shortcut[i] = 'SPACE';
				} else if ($scope.shortcut[i] === 8) {
					$scope.shortcut[i] = 'BACKSPACE';
				} else if ($scope.shortcut[i] === 9) {
					$scope.shortcut[i] = 'TAB';
				} else if ($scope.shortcut[i] === 13) {
					$scope.shortcut[i] = 'ENTER';
				} else if ($scope.shortcut[i] === 27) {
					$scope.shortcut[i] = 'ESC';
				} else {
					$scope.shortcut[i] = String.fromCharCode($scope.shortcut[i]);
				}
			}

			if (ConfigProviderService.vals.main.develMode) {
				$scope.curUserName = 'florian';
				// Iohandlerservice.httpGetUttJson('testData/' + $scope.curUserName + '.json');
			} else {
				// open login modal
				$scope.openModal('views/login.html', 'dialog', true);
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

			if (ConfigProviderService.vals.restrictions.sortLabels) {
				$('#allowSortable').sortable('enable');
			}

			// connect to ws server if it says so in config
			if (ConfigProviderService.vals.main.mode === 'server' && ConfigProviderService.vals.main.wsServerUrl !== undefined) {
				Iohandlerservice.wsH.initConnect(ConfigProviderService.vals.main.wsServerUrl);
			}

			// swap osci and spectro depending on config settings "signalsCanvasConfig.order"
			$('#' + ConfigProviderService.vals.signalsCanvasConfig.order[1]).insertBefore('#' + ConfigProviderService.vals.signalsCanvasConfig.order[0]);
			$('#' + ConfigProviderService.vals.signalsCanvasConfig.order[0]).insertBefore('#' + ConfigProviderService.vals.signalsCanvasConfig.order[1]);

		};


		$scope.renameTier = function() {
			if (viewState.getcurClickTierName() !== undefined) {
				$scope.openModal('views/renameTier.html', 'dialog', true);
			} else {
				$scope.openModal('views/error.html', 'dialog', 'Rename Error', false, 'Please choose a Tier first !');
			}
		};

		$scope.downloadTextGrid = function() {
			console.log(Iohandlerservice.toTextGrid());
		};

		$scope.refreshTimeline = function() {
			$scope.$broadcast("refreshTimeline");
		};

		$scope.refreshScope = function() {
			$scope.$digest();
		};

		/**
		 *
		 */
		$scope.menuUttClick = function(utt) {
			if ($scope.modifiedCurSSFF) {
				$scope.lastclickedutt = utt;
				$scope.openModal('views/saveChanges.html', 'dialog', 'Changes not Saved Warning', true, 'Changes made to: ' + utt.utteranceName + '. Do you wish to save them?');
			} else {
				$scope.$broadcast('loadingNewUtt');
				// Iohandlerservice.httpGetUtterence(utt);
				console.log(utt);
				Iohandlerservice.wsH.getUtt($scope.curUserName, utt);
				$scope.curUtt = utt;
			}
		};


		/**
		 *
		 */
		$scope.menuUttSave = function() {
			// Iohandlerservice.postSaveSSFF();
			Iohandlerservice.wsH.saveSSFFfile($scope.curUserName, Ssffdataservice.data[0]); // SIC hardcoded
			$scope.modifiedCurSSFF = false;
		};



		/**
		 *
		 */
		$scope.openModal = function(templatefile, cssStyle, blocking, title, content) {
			var drop = true;
			if (blocking) {
				drop = "static";
			}
			viewState.setmodalOpen(true);
			var modalInstance = $modal.open({
				backdrop: drop,
				keyboard: true,
				backdropClick: true,
				templateUrl: templatefile,
				windowClass: cssStyle,
				controller: 'ModalInstanceCtrl',
				resolve: {
					modalContent: function() {
						return content;
					},
					modalTitle: function() {
						return title;
					},
					windowLength: function() {
						return viewState.spectroSettings.windowLength;
					},
					rangeFrom: function() {
						return viewState.spectroSettings.rangeFrom;
					},
					rangeTo: function() {
						return viewState.spectroSettings.rangeTo;
					},
					dynamicRange: function() {
						return viewState.spectroSettings.dynamicRange;
					},
					window: function() {
						return viewState.spectroSettings.window;
					},
					keyZoomIn: function() {
						return String.fromCharCode(ConfigProviderService.vals.keyMappings.zoomIn);
					},
					keyZoomOut: function() {
						return String.fromCharCode(ConfigProviderService.vals.keyMappings.zoomOut);
					},
					keyZoomAll: function() {
						return String.fromCharCode(ConfigProviderService.vals.keyMappings.zoomAll);
					},
					keyZoomSel: function() {
						return String.fromCharCode(ConfigProviderService.vals.keyMappings.zoomSel);
					},
					shiftViewPortLeft: function() {
						return String.fromCharCode(ConfigProviderService.vals.keyMappings.shiftViewPortLeft);
					},
					shiftViewPortRight: function() {
						return String.fromCharCode(ConfigProviderService.vals.keyMappings.shiftViewPortRight);
					},
					currentTier: function() {
						if (viewState.getcurClickTierName() !== '') {
							return viewState.getcurClickTierName();
						} else {
							return "error";
						}
					}
				}
			});
		};

		/**
		 *
		 */
		$scope.changingMetaData = function() {
			$scope.modifiedMetaData = true;
		};

		/**
		 *
		 */
		$scope.changingSSFFdata = function() {
			// console.log('changingSSFFdata')
			$scope.modifiedCurSSFF = true;
		};


		/**
		 *
		 */
		$scope.uttIsDisabled = function(utt) {
			if (utt.utteranceName === $scope.curUtt.utteranceName) {
				return false;
			} else {
				return true;
			}
		};

		/**
		 *
		 */
		$scope.getUttColor = function(utt) {
			var curColor;
			if (!$scope.modifiedCurSSFF) {
				curColor = {
					'background-color': '#999',
					'color': 'black'
				};
			} else {
				curColor = {
					'background-color': '#f00',
					'color': 'white'
				};

			}

			// console.log(utt.utteranceName)
			if (utt.utteranceName === $scope.curUtt.utteranceName) {
				return curColor
			}
		};

		/**
		 *
		 */
		$scope.getMetaBtnColor = function() {
			if (!$scope.modifiedMetaData) {
				var curColor = {
					'color': 'rgb(128,230,25)'
				};

			} else {
				var curColor = {
					'color': 'red'
				};
			}
			return curColor;
		};

		/**
		 *
		 */
		$scope.cursorInTextField = function() {
			viewState.focusInTextField = true;
			// console.log("CURSOR");
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function() {
			viewState.focusInTextField = false;
		};

		/**
		 *
		 */
		$scope.openSubmenu = function() {
			if (viewState.getsubmenuOpen()) {
				viewState.setsubmenuOpen(false);
				// $('#submenuOpen').html('☰');
				$('#menuLeft').removeClass('cbp-spmenu-open');
				$('#TimelineCtrl').removeClass('cbp-spmenu-push-toright').addClass('cbp-spmenu-push-toleft');
				$('#HandletiersCtrl').removeClass('cbp-spmenu-push-toright').addClass('cbp-spmenu-push-toleft');
				$('#menu').removeClass('cbp-spmenu-push-toright');
				$('#menu-bottom').removeClass('cbp-spmenu-push-toright');
			} else {
				viewState.setsubmenuOpen(true);
				// $('#submenuOpen').html('☰');
				$('#menuLeft').addClass('cbp-spmenu-open');
				$('#TimelineCtrl').removeClass('cbp-spmenu-push-toleft').addClass('cbp-spmenu-push-toright');
				$('#HandletiersCtrl').removeClass('cbp-spmenu-push-toleft').addClass('cbp-spmenu-push-toright');
				$('#menu').addClass('cbp-spmenu-push-toright');
				$('#menu-bottom').addClass('cbp-spmenu-push-toright');
			}
			var mytimeout = $timeout($scope.refreshTimeline, 350); // SIC !! has to be according to css transition... maybe read out value of css or set in conf
		};


		/**
		 *
		 */
		$scope.saveMetaData = function() {

			Iohandlerservice.wsH.saveUsrUttList($scope.curUserName, $scope.uttsList);
			$scope.modifiedMetaData = false;
		};


		$scope.openFile = function() {
			alert('code to open file');
		};

		$scope.setlastkeycode = function(c, shift) {
			$scope.lastkeycode = c;
		};

		$scope.cmd_zoomAll = function() {
			viewState.setViewPort(0, viewState.curViewPort.bufferLength);
		};

		$scope.cmd_zoomSel = function() {
			viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
		};

		$scope.cmd_zoomIn = function() {
			viewState.zoomViewPort(true);
		};

		$scope.cmd_zoomOut = function() {
			viewState.zoomViewPort(false);
		};

		$scope.cmd_zoomLeft = function() {
			viewState.shiftViewPort(false);
		};

		$scope.cmd_zoomRight = function() {
			viewState.shiftViewPort(true);
		};

		$scope.cmd_playView = function() {
			Soundhandlerservice.playFromTo(viewState.curViewPort.sS, viewState.curViewPort.eS);
			viewState.animatePlayHead(viewState.curViewPort.sS, viewState.curViewPort.eS);
		};

		$scope.cmd_playSel = function() {
			Soundhandlerservice.playFromTo(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
			viewState.animatePlayHead(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
		};

		$scope.cmd_playAll = function() {
			Soundhandlerservice.playFromTo(0, Soundhandlerservice.wavJSO.Data.length);
			viewState.animatePlayHead(0, Soundhandlerservice.wavJSO.Data.length);
		};

	});