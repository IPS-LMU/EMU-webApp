'use strict';

/**
 * @ngdoc function
 * @name emuwebApp.controller:BundlelistsidebarctrlCtrl
 * @description
 * # bundleListSideBarCtrl
 * Controller of the bundleListSideBar
 */
angular.module('emuwebApp')
	.controller('bundleListSideBarCtrl', function ($scope, viewState, HistoryService, loadedMetaDataService, dbObjLoadSaveService, ConfigProviderService) {

		$scope.vs = viewState;
		$scope.lmds = loadedMetaDataService;
		$scope.dolss = dbObjLoadSaveService;
		$scope.cps = ConfigProviderService;
		
		$scope.filterText = '';

		/**
		 * retuns false if bndl is current bndl
		 */
		$scope.uttIsDisabled = function (bndl) {
			if (bndl.name === loadedMetaDataService.getCurBndl().name) {
				return false;
			} else {
				return true;
			}
		};

		/**
		 * returns jso with css defining color dependent
		 * on if changes have been made that have not been saved
		 * @param bndl object containing name attribute of bundle item
		 * requesting color
		 * @returns color as jso object used by ng-style
		 */
		$scope.getBndlColor = function (bndl) {
			var curColor;
			if (HistoryService.movesAwayFromLastSave !== 0) {
				curColor = {
					'background-color': '#f00',
					'color': 'white'
				};
			} else {
				curColor = {
					'background-color': '#999',
					'color': 'black'
				};
			}

			// console.log(bndl.name)
			if (bndl.name === loadedMetaDataService.getCurBndl().name) {
				return curColor;
			}
		};
	});