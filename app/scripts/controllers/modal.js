'use strict';

angular.module('emulvcApp')
	.controller('ModalCtrl', function ($scope, dialogService, passedInTxt, viewState, Tierservice, HistoryService) {
		
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
		    Tierservice.renameTier($scope.passedInTxt,$scope.passedOutTxt.var);	
			HistoryService.addObjToUndoStack({
			    'type': 'ESPS',
			    'action': 'renameTier',
			    'tierName': $scope.passedOutTxt.var,
			    'oldName': $scope.passedInTxt
			});			    
			dialogService.close();
		};					
	
		
		
		/**
		 *  Delete a complete tier from Tierservice
		 */
		$scope.deleteTier = function () {
		    var res;	
			res = Tierservice.deleteTier(viewState.getcurClickTierName());
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