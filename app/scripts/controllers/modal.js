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
		$scope.renameTier = function () {
		    Levelservice.renameTier($scope.passedInTxt,$scope.passedOutTxt.var);	
			HistoryService.addObjToUndoStack({
			    'type': 'ESPS',
			    'action': 'renameTier',
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
		    Levelservice.data.tiers.forEach(function (t, tIdx) {
		        if(t.tierName = name) {
		        
		        }
		    }
		};			
		
		/**
		 *  Delete a complete tier from Levelservice
		 */
		$scope.deleteTier = function () {
		    var res;	
			res = Levelservice.deleteTier(viewState.getcurClickTierName());
			HistoryService.addObjToUndoStack({
			    'type': 'ESPS',
			    'action': 'deleteTier',
			    'tierName': res.name,
			    'itemIdx': res.id,
		        'tier': res.tier
			});				
			dialogService.close();
		};				

	});