'use strict';

angular.module('emuwebApp')
	.service('dialogService', function dialogService($modal, viewState) {
		// shared service object
		var sServObj = {};

		var modalInstance = {};

		sServObj.open = function (templatefile, argCtrl, txt) {
			viewState.setState('modalShowing');
			modalInstance = $modal.open({
				backdrop: 'static',
				keyboard: false,
				templateUrl: templatefile,
				controller: argCtrl,
				resolve: {
					passedInTxt: function () {
						return txt;
					}
				}
			});
			return modalInstance.result;
		};

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

		sServObj.close = function (res) {
			viewState.focusInTextField = false;
			viewState.setState(viewState.prevState);
			modalInstance.close(res);
		};


		return sServObj;
	});