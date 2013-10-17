'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, $http,
		viewState, Iohandlerservice, Soundhandlerservice, Colorproviderservice) {

		$scope.lastkeycode = "N/A";

		// init load of config files
		Colorproviderservice.httpGetDrawingColorsConfig();				

		// move out of controller...
		// get keyboard shortcut mappings
		$http.get('configFiles/keyboardShortcuts.json').success(function(data) {
			$scope.keyMappings = data;
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