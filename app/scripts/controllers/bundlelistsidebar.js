'use strict';

/**
 * @ngdoc function
 * @name emuwebApp.controller:BundlelistsidebarctrlCtrl
 * @description
 * # bundleListSideBarCtrl
 * Controller of the bundleListSideBar
 */
angular.module('emuwebApp')
	.controller('bundleListSideBarCtrl', function ($scope, viewState, HistoryService, loadedMetaDataService, dbObjLoadSaveService, ConfigProviderService, LevelService) {

		$scope.vs = viewState;
		$scope.lmds = loadedMetaDataService;
		$scope.dolss = dbObjLoadSaveService;
		$scope.cps = ConfigProviderService;
		$scope.ls = LevelService;

		$scope.filterText = '';

		$scope.vs.pageSize = 500;
		$scope.vs.currentPage = 0;

		$scope.turn = function (direction) {
			if (direction) {
				$scope.vs.currentPage++;
			}
			else {
				$scope.vs.currentPage--;
			}
		};


		/**
		 * returns false if bndl is current bndl
		 */
		$scope.uttIsDisabled = function (bndl) {
			return bndl.name !== loadedMetaDataService.getCurBndl().name;
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

			var curBndl = loadedMetaDataService.getCurBndl();
			if (bndl.name === curBndl.name && bndl.session === curBndl.session) {
				return curColor;
			}
		};

		/**
		 * checks if name is undefined
		 * @return bool
		 */
		$scope.isSessionDefined = function (ses) {
			return ses !== 'undefined';
		};

		/**
		 * zoom to next / previous time anchor
		 */
		$scope.nextPrevAnchor= function (next) {
			var curBndl = loadedMetaDataService.getCurBndl();
			if(next){
				if($scope.vs.curTimeAnchorIdx < curBndl.timeAnchors.length - 1){
					$scope.vs.curTimeAnchorIdx = $scope.vs.curTimeAnchorIdx + 1;
					$scope.vs.select(curBndl.timeAnchors[$scope.vs.curTimeAnchorIdx].sample_start, curBndl.timeAnchors[$scope.vs.curTimeAnchorIdx].sample_end);
					$scope.vs.setViewPort(curBndl.timeAnchors[$scope.vs.curTimeAnchorIdx].sample_start, curBndl.timeAnchors[$scope.vs.curTimeAnchorIdx].sample_end);
					$scope.vs.zoomViewPort(false, $scope.ls);
				}
			}else{
				if($scope.vs.curTimeAnchorIdx > 0){
					$scope.vs.curTimeAnchorIdx = $scope.vs.curTimeAnchorIdx - 1;
					$scope.vs.select(curBndl.timeAnchors[$scope.vs.curTimeAnchorIdx].sample_start, curBndl.timeAnchors[$scope.vs.curTimeAnchorIdx].sample_end);
					$scope.vs.setViewPort(curBndl.timeAnchors[$scope.vs.curTimeAnchorIdx].sample_start, curBndl.timeAnchors[$scope.vs.curTimeAnchorIdx].sample_end);
					$scope.vs.zoomViewPort(false, $scope.ls);
				}
			}
		};
		/**
		 * get max nr of time anchors
		 */
		$scope.getTimeAnchorIdxMax = function () {
			var curBndl = loadedMetaDataService.getCurBndl();
			var res;
			if(angular.equals({}, curBndl)){
				res = -1;
			}else{
				res = curBndl.timeAnchors.length - 1;
			}
			return(res);
		};


		$scope.isCurBndl= function (bndl) {
			var curBndl = loadedMetaDataService.getCurBndl();
			return (bndl.name === curBndl.name && bndl.session === curBndl.session);
		};
	});