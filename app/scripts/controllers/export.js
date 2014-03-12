'use strict';

angular.module('emuwebApp')
	.controller('ExportCtrl', function ($scope, dialogService, exportData, exportName, viewState, Levelservice, HistoryService) {
		
		$scope.exportData = exportData;
		$scope.exportName = exportName;
		
		$scope.cancel = function () {
			dialogService.close();
		};
		
		$scope.getBlob = function(){
		    return new Blob([$scope.exportData], {type: "text/plain"});    
		}		
			
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
					

	});