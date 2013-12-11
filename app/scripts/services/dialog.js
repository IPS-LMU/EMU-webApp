'use strict';

angular.module('emulvcApp')
	.service('dialogService', function dialogService($modal, viewState) {
		// shared service object
		var sServObj = {};

		var modalInstance = {};

		sServObj.open = function (templatefile, argCtrl) {
			modalInstance = $modal.open({
				backdrop: 'static',
				keyboard: false,
				templateUrl: templatefile,
				controller: argCtrl
			});
		};

		sServObj.openConfirm = function () {
			modalInstance = $modal.open({
				backdrop: 'static',
				keyboard: false,
				templateUrl: 'views/confirmModal.html',
				controller: 'ConfirmmodalCtrl'
			});
		};

		sServObj.close = function () {
			viewState.focusInTextField = false;
			viewState.setState(viewState.prevState);
			modalInstance.dismiss('cancel');
		};


		return sServObj;
	});