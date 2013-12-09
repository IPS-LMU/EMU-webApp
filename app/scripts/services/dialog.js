'use strict';

angular.module('emulvcApp')
	.service('dialogService', function dialogService($modal) {
		// shared service object
		var sServObj = {};

		var modalInstance = {};

		sServObj.open = function (templatefile, argCtrl) {
			modalInstance = $modal.open({
				backdrop: true,
				keyboard: true,
				backdropClick: true,
				templateUrl: templatefile,
				controller: argCtrl
			});
		};

		sServObj.close = function () {
			modalInstance.dismiss('cancel');
		};


		return sServObj;
	});

// angular.module('emulvcApp')
// 	.factory('dialogService', ['$modal',
// 		function ($modal) {
// 			return {

// 				open: function (templatefile, myContent, myTitle) {
// 					$modal.open({
// 						backdrop: true,
// 						keyboard: true,
// 						backdropClick: true,
// 						templateUrl: templatefile,
// 						resolve: {
// 							modalContent: function () {
// 								return myContent;
// 							},
// 							modalTitle: function () {
// 								return myTitle;
// 							}
// 						}
// 					});
// 				},
// 				closeModal: function () {
// 					// alert('Hier');
// 					$modal.dismiss('cancel');
// 				}
// 			};
// 		}
// 	]);