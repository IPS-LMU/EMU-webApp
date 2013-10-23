'use strict';

angular.module('emulvcApp')
	.factory('dialogService', ['$modal',
		function($modal) {
			return {
				open: function(templatefile, myContent, myTitle) {
					var modalInstance = $modal.open({
						backdrop: true,
						keyboard: true,
						backdropClick: true,
						templateUrl: templatefile,
						controller: 'ModalInstanceCtrl',
						resolve: {
							modalContent: function() {
								return myContent;
							},
							modalTitle: function() {
								return myTitle;
							}
						}
					});
				},
				closeModal: function() {
					alert('Hier');
					$modal.close();
				}
			};
		}
	]);