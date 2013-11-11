'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, $http, $compile,
		viewState, Iohandlerservice, Soundhandlerservice, ConfigProviderService, Ssffdataservice) {

		$scope.lastkeycode = 'N/A';
		$scope.uttsList = [];

		$scope.curUserName = 'user1';
		$scope.uttsChangedColor = 'green';

		// init load of config files
		ConfigProviderService.httpGetConfig();


		// init pure jquery dragbar
		$('.TimelineCtrl').ownDrag('.resizer').ownResize('.resizer');



		/**
		 * listen for configLoaded
		 */
		$scope.$on('configLoaded', function(evt, data) {
			// for devel.
			Iohandlerservice.httpGetUttJson('testData/' + $scope.curUserName + '.json');

			// init loading of files for testing
			viewState.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.N,
				ConfigProviderService.vals.spectrogramSettings.rangeFrom,
				ConfigProviderService.vals.spectrogramSettings.rangeTo,
				ConfigProviderService.vals.spectrogramSettings.dynamicRange,
				ConfigProviderService.vals.spectrogramSettings.window);

			// set timeline height according to config settings "colors.timelineHeight"
			$('.TimelineCtrl').css('height', ConfigProviderService.vals.colors.timelineHeight);

			if (ConfigProviderService.vals.restrictions.sortLabels) {
				$('#allowSortable').sortable('enable');
			}


			// swap osci and spectro depending on config settings "signalsCanvasConfig.order"
			$('#' + ConfigProviderService.vals.signalsCanvasConfig.order[1]).insertBefore('#' + ConfigProviderService.vals.signalsCanvasConfig.order[0]);
			$('#' + ConfigProviderService.vals.signalsCanvasConfig.order[0]).insertBefore('#' + ConfigProviderService.vals.signalsCanvasConfig.order[1]);



			$scope.buttonstyle = function(id) {
				var show = {};
				var hidden = {
					'display': 'none'
				};
				switch (id) {
					case 'openMenu':
						if (ConfigProviderService.vals.activeButtons.openMenu) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'openFile':
						if (ConfigProviderService.vals.activeButtons.openFile) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'addTierSeg':
						if (ConfigProviderService.vals.activeButtons.addTierSeg) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'addTierPoint':
						if (ConfigProviderService.vals.activeButtons.addTierPoint) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'renameSelTier':
						if (ConfigProviderService.vals.activeButtons.renameSelTier) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'downloadTextGrid':
						if (ConfigProviderService.vals.activeButtons.downloadTextGrid) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'specSettings':
						if (ConfigProviderService.vals.activeButtons.specSettings) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'Connect':
						if (ConfigProviderService.vals.activeButtons.Connect) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'deleteSingleTier':
						if (ConfigProviderService.vals.activeButtons.deleteSingleTier) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'resizeSingleTier':
						if (ConfigProviderService.vals.activeButtons.resizeSingleTier) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'saveSingleTier':
						if (ConfigProviderService.vals.activeButtons.saveSingleTier) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'resizeOsci':
						if (ConfigProviderService.vals.activeButtons.resizeOsci) {
							return show;
						} else {
							return hidden;
						}
						break;
					case 'resizeSpectro':
						if (ConfigProviderService.vals.activeButtons.resizeSpectro) {
							return show;
						} else {
							return hidden;
						}
						break;
				}
				return hidden;
			}

			// open login modal
			// $scope.openModal('views/login.html','dialog');

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
			$scope.openSubmenu();

		});

		/**
		 * listen for newUserLoggedOn
		 */
		$scope.$on('newUserLoggedOn', function(evt, name) {
			$scope.curUserName = name;
		});


		/**
		 * listen for newlyLoadedAudioFile
		 */
		$scope.$on('newlyLoadedAudioFile', function(evt, wavJSO, fileName) {
			// for dev:
			// viewState.curViewPort.sS = 28535;
			// viewState.curViewPort.eS = 29555;
			viewState.curViewPort.eS = wavJSO.Data.length;
			viewState.curViewPort.bufferLength = wavJSO.Data.length;
			viewState.setscrollOpen(0);
			Soundhandlerservice.wavJSO = wavJSO;
			$scope.baseName = fileName.substr(0, fileName.lastIndexOf("."));
		});


		$scope.renameTier = function() {
			if (viewState.getcurClickTierName() !== undefined) {
				$scope.openModal('views/renameTier.html', 'dialog');
			} else {
				$scope.openModal('views/error.html', 'dialog', 'Rename Error', 'Please choose a Tier first !');
			}
		};

		$scope.downloadTextGrid = function() {
			console.log(Iohandlerservice.toTextGrid());
		};

		$scope.menuUttClick = function(utt) {
			console.log("menuUttClick gekljasdlkfj");
			$scope.$broadcast('loadingNewUtt');
			Iohandlerservice.httpGetUtterence(utt);
		};

		/**
		 *
		 */
		$scope.menuUttSave = function(utt) {
			// SIC should not be done here but in iohandler...
			$http({
				url: 'index.html',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				data: {
					method: 'saveSSFFfile',
					data: {
						'a': 1234
					}
				}
			}).success(function() {});

		};

		$scope.openModal = function(templatefile, cssStyle, title, content) {
			viewState.setmodalOpen(true);
			var modalInstance = $modal.open({
				backdrop: true,
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


		$scope.changedUttList = function() {
			$scope.uttsChangedColor = 'red';
		};

		$scope.openSubmenu = function() {
			if (viewState.getsubmenuOpen()) {
				viewState.setsubmenuOpen(false);
				$('#submenuOpen').html('Open Menu');
				$('#menuLeft').removeClass('cbp-spmenu-open');
				$('#TimelineCtrl').removeClass('cbp-spmenu-push-toright');
				$('#HandletiersCtrl').removeClass('cbp-spmenu-push-toright');
				$('#menu').removeClass('cbp-spmenu-push-toright');
				$('#menu-bottom').removeClass('cbp-spmenu-push-toright');
			} else {
				viewState.setsubmenuOpen(true);
				$('#submenuOpen').html('Close Menu');
				$('#menuLeft').addClass('cbp-spmenu-open');
				$('#TimelineCtrl').addClass('cbp-spmenu-push-toright');
				$('#HandletiersCtrl').addClass('cbp-spmenu-push-toright');
				$('#menu').addClass('cbp-spmenu-push-toright');
				$('#menu-bottom').addClass('cbp-spmenu-push-toright');
			}
		};

		/**
		 *
		 */
		$scope.saveUttList = function() {
			// SIC should not be done here but in iohandler...
			$http({
				url: 'index.html',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				data: {
					method: 'saveUttList',
					username: $scope.curUserName,
					data: $scope.uttsList
				}
			}).success(function() {
				$scope.uttsChangedColor = 'green';
			});

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