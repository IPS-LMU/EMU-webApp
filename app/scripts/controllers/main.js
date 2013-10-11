'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, $http, dialogService, viewState, Iohandlerservice, Soundhandlerservice, Colorproviderservice) {

		$scope.lastkeycode = "N/A";

		// init load of config files
		Colorproviderservice.httpGetDrawingColorsConfig();
		// get keyboard shortcut mappings
		$http.get('configFiles/keyboardShortcuts.json').success(function(data) {
			$scope.keyMappings = data;
		});


		// init loading of files for testing for testing
		Iohandlerservice.httpGetLabelJson();
		Iohandlerservice.httpGetAudioFile();

		/**
		 * listen for newlyLoadedLabelJson broadcast
		 * update tierDetails if heard
		 */
		$scope.$on('newlyLoadedAudioFile', function(evt, data) {
			// console.log(data);
			Soundhandlerservice.decodeAudioFile(data, function(d) {
				console.log(d);
				// Soundhandlerservice.play(0, 2.9044217803634114 , undefined)
			});
		});

		$scope.openModal = function(myTitle, myContent) {
			var modalInstance = $modal.open({
				templateUrl: 'modal.html',
				controller: ModalInstanceCtrl,
				resolve: {
					modalContent: function() {
						return myContent;
					},
					modalTitle: function() {
						return myTitle;
					}
				}
			});

			modalInstance.result.then(function(selectedItem) {
				$scope.selected = selectedItem;
			}, function() {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};

		$scope.setlastkeycode = function(c, shift) {
			$scope.lastkeycode = c;
			switch (c) {
				case 9:
					if (shift)
						$('#HandletiersCtrl').scope().tabPrev();
					else
						$('#HandletiersCtrl').scope().tabNext();
					break;
				case 13:
					$('#HandletiersCtrl').scope().renameLabel();
					break;
				case 27:
					$('#HandletiersCtrl').scope().deleteEditArea();
					break;
				case 90:
					$('#HandletiersCtrl').scope().goBackHistory();
					break;
				default:
					break;
			}
		};

	});


var ModalInstanceCtrl = function($scope, $modalInstance, modalTitle, modalContent) {

	$scope.modalContent = modalContent;
	$scope.modalTitle = modalTitle;

	$scope.ok = function() {
		//$modalInstance.close($scope.selected.item);
		$modalInstance.dismiss('cancel');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
};