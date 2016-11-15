'use strict';

angular.module('emuwebApp')
	.controller('ModalCtrl', function ($scope, ArrayHelperService, browserDetector, modalService, viewState, LevelService, HistoryService, ConfigProviderService) {

		$scope.cps = ConfigProviderService;
		$scope.vs = viewState;
		$scope.data = undefined;
		$scope.mySelect = null;

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.setEditing(true);
			viewState.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.setEditing(false);
			viewState.setcursorInTextField(false);
		};

		/**
		 *  Save changes made on SSFF
		 */
		$scope.saveChanges = function () {
			modalService.close();
		};


		/**
		 *  Save changes made on SSFF
		 */
		$scope.discardChanges = function () {
			modalService.close();
		};

		/**
		 *  Save a URL
		 */
		$scope.saveURL = function () {
			var currentURLS = $scope.getURLs();
			if (currentURLS.indexOf(modalService.dataOut) === -1) {
				currentURLS.push(modalService.dataOut);
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
			if (!browserDetector.isBrowser.PhantomJS() && curVal !== null) {
				urlData = JSON.parse(curVal);
			}
			return urlData;
		};

		/**
		 *  Return all URLs from localStorage
		 */
		$scope.setCurrentURL = function (data) {
			modalService.dataOut = data;
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
			LevelService.renameLevel(modalService.dataIn, $scope.data, viewState.curPerspectiveIdx);
			HistoryService.addObjToUndoStack({
				'type': 'ANNOT',
				'action': 'RENAMELEVEL',
				'newname': $scope.data,
				'name': modalService.dataIn,
				'curPerspectiveIdx': viewState.curPerspectiveIdx
			});
			modalService.close();
		};

		/**
		 *  Delete a complete level from LevelService
		 */
		$scope.deleteLevel = function () {
			var lvl = LevelService.getLevelDetails(viewState.getcurClickLevelName());
			LevelService.deleteLevel(viewState.getcurClickLevelIndex(), viewState.curPerspectiveIdx);
			HistoryService.addObjToUndoStack({
				'type': 'ANNOT',
				'action': 'DELETELEVEL',
				'level': lvl,
				'id': viewState.getcurClickLevelIndex(),
				'curPerspectiveIdx': viewState.curPerspectiveIdx
			});
			modalService.close();
		};

	});
