'use strict';

angular.module('emuwebApp')
	.controller('ModalCtrl', function ($scope, dialogService, passedInTxt, viewState, Levelservice, HistoryService) {

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
		 *  Rename a level
		 */
		$scope.renameLevel = function () {
			Levelservice.renameLevel($scope.passedInTxt, $scope.passedOutTxt.var);
			HistoryService.addObjToUndoStack({
				'type': 'ESPS',
				'action': 'renameLevel',
				'levelName': $scope.passedOutTxt.
				var,
						'oldName': $scope.passedInTxt
			});
			dialogService.close();
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
		 *  Delete a complete level from Levelservice
		 */
		$scope.deleteLevel = function () {
		    console.log($scope);
			var res = Levelservice.deleteLevel(viewState.getcurClickLevelName(), viewState.getcurClickLevelIndex());
			HistoryService.addObjToUndoStack({
				'type': 'ESPS',
				'action': 'deleteLevel',
				'levelName': res.name,
				'itemIdx': res.id,
				'level': res.level
			});
			dialogService.close();
		};

	});