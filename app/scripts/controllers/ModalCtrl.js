'use strict';

angular.module('emuwebApp')
	.controller('ModalCtrl', function ($scope, dialogService, viewState, LevelService, HistoryService, ConfigProviderService) {

		$scope.cps = ConfigProviderService;

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
				'type': 'ANNOT',
				'action': 'RENAMELEVEL',
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
				'type': 'ANNOT',
				'action': 'DELETELEVEL',
				'level': lvl.level,
				'id': viewState.getcurClickLevelIndex(),
				'curPerspectiveIdx': viewState.curPerspectiveIdx
			});
			dialogService.close();
		};

	});