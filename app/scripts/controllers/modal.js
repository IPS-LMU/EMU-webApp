'use strict';

angular.module('emulvcApp')
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
		 *  Rename a tier
		 */
		$scope.renameLevel = function () {
		    Levelservice.renameLevel($scope.passedInTxt,$scope.passedOutTxt.var);	
			HistoryService.addObjToUndoStack({
			    'type': 'ESPS',
			    'action': 'renameLevel',
			    'tierName': $scope.passedOutTxt.var,
			    'oldName': $scope.passedInTxt
			});			    
			dialogService.close();
		};					
	
		
		/**
		 *  Save changes made on SSFF
		 */
		$scope.saveChanges = function (name) { 
			dialogService.close();
		};					
	
		
		/**
		 *  Save changes made on SSFF
		 */
		$scope.discardChanges = function (name) {
		    dialogService.close();
		};			
		
		/**
		 *  Delete a complete tier from Levelservice
		 */
		$scope.deleteLevel = function () {
		    var res;	
			res = Levelservice.deleteLevel(viewState.getcurClickTierName());
			HistoryService.addObjToUndoStack({
			    'type': 'ESPS',
			    'action': 'deleteLevel',
			    'tierName': res.name,
			    'itemIdx': res.id,
		        'tier': res.tier
			});				
			dialogService.close();
		};				

	});