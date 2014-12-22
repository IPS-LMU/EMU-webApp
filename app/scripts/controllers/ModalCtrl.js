'use strict';

angular.module('emuwebApp')
	.controller('ModalCtrl', function ($scope, ArrayHelperService, modalService, viewState, LevelService, HistoryService, ConfigProviderService) {

		$scope.cps = ConfigProviderService;
		$scope.data = undefined;
		
		//$scope.myData = ArrayHelperService.convertArrayToXYjsoArray(modalService.dataIn.y);

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
			modalService.close('saveChanges');
		};


		/**
		 *  Save changes made on SSFF
		 */
		$scope.discardChanges = function (name) {
			modalService.close('discardChanges');
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
				'level': lvl.level,
				'id': viewState.getcurClickLevelIndex(),
				'curPerspectiveIdx': viewState.curPerspectiveIdx
			});
			modalService.close();
		};

	});