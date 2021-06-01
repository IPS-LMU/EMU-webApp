import * as angular from 'angular';

angular.module('emuwebApp')
	.controller('ModalCtrl', ['$scope', 'ArrayHelperService', 'BrowserDetectorService', 'ModalService', 'ViewStateService', 'LevelService', 'HistoryService', 'ConfigProviderService',
		function ($scope, ArrayHelperService, BrowserDetectorService, ModalService, ViewStateService, LevelService, HistoryService, ConfigProviderService) {

		$scope.cps = ConfigProviderService;
		$scope.vs = ViewStateService;
		$scope.data = undefined;
		$scope.mySelect = null;

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			ViewStateService.setEditing(true);
			ViewStateService.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			ViewStateService.setEditing(false);
			ViewStateService.setcursorInTextField(false);
		};

		/**
		 *  Save changes made on SSFF
		 */
		$scope.saveChanges = function () {
			ModalService.close();
		};


		/**
		 *  Save changes made on SSFF
		 */
		$scope.discardChanges = function () {
			ModalService.close();
		};

		/**
		 *  Save a URL
		 */
		$scope.saveURL = function () {
			var currentURLS = $scope.getURLs();
			if (currentURLS.indexOf(ModalService.dataOut) === -1) {
				currentURLS.push(ModalService.dataOut);
			}
			localStorage.setItem('urls', JSON.stringify(currentURLS));
			$scope.myUrls = currentURLS;
			$scope.mySelect = $scope.myUrls[0];
		};

		/**
		 *  Return all URLs from localStorage
		 */
		$scope.getURLs = function () {
			var curVal = localStorage.getItem('urls');
			var urlData = [];
			if (!BrowserDetectorService.isBrowser.PhantomJS() && curVal !== null) {
				urlData = JSON.parse(curVal);
			}
			return urlData;
		};

		/**
		 *  Return all URLs from localStorage
		 */
		$scope.setCurrentURL = function (data) {
			ModalService.dataOut = data;
		};


		/**
		 *  delete a specific url
		 */
		$scope.deleteURL = function (data) {
			var currentURLS = $scope.getURLs();
			if (currentURLS.indexOf(data) !== -1) {
				currentURLS.splice(currentURLS.indexOf(data), 1);
			}
			localStorage.setItem('urls', JSON.stringify(currentURLS));
			$scope.myUrls = currentURLS;
			$scope.mySelect = $scope.myUrls[0];
		};


		/**
		 *  Rename a level
		 */
		$scope.renameLevel = function () {
			LevelService.renameLevel(ModalService.dataIn, $scope.data, ViewStateService.curPerspectiveIdx);
			HistoryService.addObjToUndoStack({
				'type': 'ANNOT',
				'action': 'RENAMELEVEL',
				'newname': $scope.data,
				'name': ModalService.dataIn,
				'curPerspectiveIdx': ViewStateService.curPerspectiveIdx
			});
			ModalService.close();
		};

		/**
		 *  Delete a complete level from LevelService
		 */
		$scope.deleteLevel = function () {
			var lvl = LevelService.getLevelDetails(ViewStateService.getcurClickLevelName());
			LevelService.deleteLevel(ViewStateService.getcurClickLevelIndex(), ViewStateService.curPerspectiveIdx);
			HistoryService.addObjToUndoStack({
				'type': 'ANNOT',
				'action': 'DELETELEVEL',
				'level': lvl,
				'id': ViewStateService.getcurClickLevelIndex(),
				'curPerspectiveIdx': ViewStateService.curPerspectiveIdx
			});
			ModalService.close();
		};

	}]);
