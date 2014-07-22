'use strict';

angular.module('emuwebApp')
	.controller('ModalCtrl', function ($scope, dialogService, passedInTxt, viewState, LevelService, HistoryService) {

		$scope.passedInTxt = passedInTxt;
		$scope.passedOutTxt = {
			'var': null,
		};

		$scope.cancel = function () {
			dialogService.close();
		};

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};

		/**
		 *  Save changes made on SSFF
		 */
		$scope.saveChanges = function (name) {
			dialogService.close('saveChanges');
		};


		/**
		 *  Save changes made on SSFF
		 */
		$scope.discardChanges = function (name) {
			dialogService.close('discardChanges');
		};


		/**
		 *  Rename a level
		 */
		$scope.renameLevel = function () {

			LevelService.renameLevel($scope.passedInTxt, $scope.passedOutTxt.var, viewState.curPerspectiveIdx);
			HistoryService.addObjToUndoStack({
				'type': 'ESPS',
				'action': 'renameLevel',
				'newname': $scope.passedOutTxt.var,
				'name': $scope.passedInTxt,
				'curPerspectiveIdx': viewState.curPerspectiveIdx
			});
			dialogService.close();
		};

		/**
		 *  Delete a complete level from LevelService
		 */
		$scope.deleteLevel = function () {
			var lvl = LevelService.getLevelDetails(viewState.getcurClickLevelName());
			LevelService.deleteLevel(viewState.getcurClickLevelIndex(), viewState.curPerspectiveIdx);
			HistoryService.addObjToUndoStack({
				'type': 'ESPS',
				'action': 'deleteLevel',
				'level': lvl.level,
				'id': viewState.getcurClickLevelIndex(),
				'curPerspectiveIdx': viewState.curPerspectiveIdx
			});
			dialogService.close();
		};

	});