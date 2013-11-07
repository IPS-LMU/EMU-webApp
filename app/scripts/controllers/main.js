'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, $http, $compile,
		viewState, Iohandlerservice, Soundhandlerservice, ConfigProviderService) {

		$scope.lastkeycode = 'N/A';
		$scope.ssff = undefined;

		$scope.uttsList =[];

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


		// init load of config files
		ConfigProviderService.httpGetConfig();


		// init pure jquery dragbar
		$(".TimelineCtrl").ownDrag(".resizer").ownResize(".resizer");
		


		/**
		 * listen for configLoaded
		 */
		$scope.$on('configLoaded', function(evt, data) {
			// init loading of files for testing
			viewState.setspectroSettings(ConfigProviderService.vals.spectrogramSettings.N,
				ConfigProviderService.vals.spectrogramSettings.rangeFrom,
				ConfigProviderService.vals.spectrogramSettings.rangeTo,
				ConfigProviderService.vals.spectrogramSettings.dynamicRange,
				ConfigProviderService.vals.spectrogramSettings.window);
			$scope.openSubmenu();
			Iohandlerservice.httpGetUttJson("testData/uttList.json");
			
		    $scope.buttonstyle = function(id) {
		        var show = {};
		        var hidden = {"display": "none"};
		        switch(id) {
		            case "openMenu":
		                if(ConfigProviderService.vals.activeButtons.openMenu) {
		                    return show;
		                }
		                else {
		                    return hidden;
		                }
		                break;
		            case "openFile":
		                if(ConfigProviderService.vals.activeButtons.openFile) {
		                    return show;
		                }
		                else {
		                    return hidden;
		                }
		                break;
		            case "addTierSeg":
		                if(ConfigProviderService.vals.activeButtons.addTierSeg) {
		                    return show;
		                }
		                else {
		                    return hidden;
		                }
		                break;
		            case "addTierPoint":
		                if(ConfigProviderService.vals.activeButtons.addTierPoint) {
		                    return show;
		                }
		                else {
		                    return hidden;
		                }
		                break;
		            case "renameSelTier":
		                if(ConfigProviderService.vals.activeButtons.renameSelTier) {
		                    return show;
		                }
		                else {
		                    return hidden;
		                }
		                break;
		            case "downloadTextGrid":
		                if(ConfigProviderService.vals.activeButtons.downloadTextGrid) {
		                    return show;
		                }
		                else {
		                    return hidden;
		                }
		                break;	
		            case "specSettings":
		                if(ConfigProviderService.vals.activeButtons.specSettings) {
		                    return show;
		                }
		                else {
		                    return hidden;
		                }
		                break;	
		            case "Connect":
		                if(ConfigProviderService.vals.activeButtons.Connect) {
		                    return show;
		                }
		                else {
		                    return hidden;
		                }
		                break;		                		                		                		                		                
		        }
		        return hidden;
    		}			
			
		});


		/**
		 * listen for newlyLoadedUttList
		 */
		$scope.$on('newlyLoadedUttList', function(evt, uttList) {
			console.log(uttList)
			$scope.uttsList = uttList;
			Iohandlerservice.httpGetUtterence($scope.uttsList[0]);
		});


		/**
		 * listen for newlyLoadedAudioFile
		 */
		$scope.$on('newlyLoadedAudioFile', function(evt, wavJSO, fileName) {
			viewState.curViewPort.eS = wavJSO.Data.length;
			viewState.curViewPort.bufferLength = wavJSO.Data.length;
			viewState.setscrollOpen(0);
			Soundhandlerservice.wavJSO = wavJSO;
			// Soundhandlerservice.setPlayerSrc(wavJSO.origArrBuf);
			// Iohandlerservice.httpGetTextGrid('testData/msajc003.TextGrid');
			$scope.baseName = fileName.substr(0, fileName.lastIndexOf("."));
		});

		/**
		 * listen for newlyLoadedSSFFfile
		 */
		$scope.$on('newlyLoadedSSFFfile', function(evt, ssff, fileName) {
			$scope.ssff = fileName;
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

		$scope.menuUttClick = function (utt) {
			console.log(utt);
			$scope.$broadcast('loadingNewUtt');
			Iohandlerservice.httpGetUtterence(utt);
		}

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
			// todo
		};

		$scope.cmd_playSel = function() {
			// todo
		};

		$scope.cmd_playAll = function() {
			// todo
		};

	});