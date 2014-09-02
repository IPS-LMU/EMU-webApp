'use strict';

angular.module('emuwebApp')
	.service('dialogService', function dialogService($modal, viewState) {
		// shared service object
		var sServObj = {};

		var modalInstance = {};

		/**
		 *
		 */
		sServObj.open = function (templatefile, argCtrl, passedIn) {
			viewState.setState('modalShowing');
			modalInstance = $modal.open({
				backdrop: 'static',
				keyboard: false,
				templateUrl: templatefile,
				controller: argCtrl,
				resolve: {
					passedInTxt: function () {
						return passedIn;
					},
					passedInOpts: function () {
						return passedIn;
					}
				}
			});
			return modalInstance.result;
		};

		/**
		 *
		 */
		sServObj.openExport = function (templatefile, argCtrl, data, txt) {
			viewState.setState('modalShowing');
			modalInstance = $modal.open({
				backdrop: 'static',
				keyboard: false,
				templateUrl: templatefile,
				controller: argCtrl,
				resolve: {
					exportData: function () {
						return data;
					},
					exportName: function () {
						return txt;
					}
				}
			});
			return modalInstance.result;
		};

		/**
		 *
		 */
		sServObj.close = function (res) {
			viewState.focusInTextField = false;
			viewState.setState(viewState.prevState);
			modalInstance.close(res);
		};

		return sServObj;
	});