'use strict';

angular.module('emulvcApp')
	.controller('ErrormodalCtrl', function ($scope, dialogService, passedInTxt, viewState, Tierservice, HistoryService) {
		
		$scope.passedInTxt = passedInTxt;
		
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
		 *  Delete a complete tier from Tierservice
		 */
		$scope.deleteTier = function () {
			var x = 0;
			var id = viewState.getcurClickTierName();
			
			angular.forEach(Tierservice.data.tiers, function (t) {
				if (t.TierName === id) {
				    HistoryService.addObjToUndoStack({
				        'type': 'ESPS',
				        'action': 'deleteTier',
				        'tierName': id,
				        'itemIdx': x,
				        'tier': t
				    });
					Tierservice.data.tiers.splice(x, 1);
				}
				++x;
			});
			dialogService.close();
		};				

	});