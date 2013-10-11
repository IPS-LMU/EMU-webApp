'use strict';

var MainCtrl = angular.module('emulvcApp')
	.controller('MainCtrl', function($scope, $modal, $log, viewState, Iohandlerservice, Soundhandlerservice) {

		$scope.lastkeycode = "N/A";

		// init loading of files for testing for testing
		Iohandlerservice.httpGetLabelJson();
		Iohandlerservice.httpGetAudioFile();

		/**
		* listen for newlyLoadedLabelJson broadcast
		* update tierDetails if heard
		*/ 
		$scope.$on('newlyLoadedAudioFile', function(evt, data){
			// console.log(data);
			Soundhandlerservice.decodeAudioFile(data, function(d){
				console.log(d);
				// Soundhandlerservice.play(0, 2.9044217803634114 , undefined)
			});
		});

		$scope.openModal = function(templatefile,title, content) {
			var modalInstance = $modal.open({
		        backdrop: true,
                keyboard: true,
                backdropClick: true,
				templateUrl: templatefile,
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