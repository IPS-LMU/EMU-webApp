'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, $http,
		viewState, Iohandlerservice, Soundhandlerservice, ConfigProviderService) {

		

		// init load of config files
		ConfigProviderService.httpGetConfig();		
		
		$scope.lastkeycode = "N/A";
		console.log(ConfigProviderService.vals);
		
		$scope.$on('configLoaded', function(evt, data) {
		    if(ConfigProviderService.vals.main.mode=="standalone") {
	    	    $("#menu").prepend($("<a>").attr({
                    "class": "mini-btn tool-tip",
                    "ng-click": "openFile();",
                    "title":"Shortcut: O"
                }).text("Open File"));
    		}
	    	else {
	    	    $("#menu").prepend($("<a>").attr({
                    "class": "mini-btn tool-tip",
                    "ng-click": "openMenu();",
                    "title":"Shortcut: O"
                }).text("Open Menu"));
    		}		
		});

		// init loading of files for testing
		Iohandlerservice.httpGetLabelJson();
		Iohandlerservice.httpGetAudioFile();
		Iohandlerservice.httpGetSSFFfile('testData/msajc003.fms');
		
		

		/**
		 * listen for newlyLoadedAudioFile
		 */
		$scope.$on('newlyLoadedAudioFile', function(evt, data) {
			Soundhandlerservice.decodeAudioFile(data, function(d) {
				viewState.curViewPort.bufferLength = d.length;
				viewState.setheightOsci($(".OsciCanvas").height());
				viewState.setheightSpectro($(".SpectroCanvas").height());
				$scope.keyMappings = ConfigProviderService.vals.shortcuts;
				$scope.$apply(); // To update changed var... don't know if this is the way to do it... but it seems to be needed
			});
		});	

		$scope.openModal = function(templatefile, cssStyle, title, content) {
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
					}
				}
			});
		};

		$scope.setlastkeycode = function(c, shift) {
			$scope.lastkeycode = c;
		};
		
		$scope.cmd_zoomAll = function() {
		    viewState.setViewPort(0,viewState.curViewPort.bufferLength);
		};
		
		$scope.cmd_zoomSel = function() {
		    viewState.setViewPort(viewState.curViewPort.selectS,viewState.curViewPort.selectE);
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