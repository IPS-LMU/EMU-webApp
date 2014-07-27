'use strict';

angular.module('emuwebApp')
	.controller('ExportCtrl', function ($scope, dialogService, exportData, exportName, viewState, HistoryService) {
		
		$scope.exportData = exportData;
		$scope.exportName = exportName;
		$scope.firefox = (navigator.userAgent.match(/Firefox/i) ? true: false);

		/**
		 *
		 */
		$scope.cancel = function () {
			dialogService.close();
		};
		
		/**
		 *
		 */
		$scope.getBlob = function(){
		    return new Blob([$scope.exportData], {type: 'text/plain'});
		};
		
		/**
		 *
		 */
		$scope.export = function(){
		    $scope.SaveToDisk(URL.createObjectURL($scope.getBlob()), $scope.exportName);
		    dialogService.close();
		};

		/**
		 *
		 */
		$scope.updateHistoryService = function(){
		    HistoryService.movesAwayFromLastSave = 0;
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
		 *  Save file to disk // Non-IE ONLY !!
		 */
		$scope.SaveToDisk = function (fileURL, fileName) {
		  var save = document.createElement('a');
		  if($scope.firefox) {
		    save.setAttribute('download', fileName);
		    save.href = fileURL;
		    save.innerHTML = '';
		    save.style.display = 'none';
		    document.body.appendChild(save);
		    save.click();
		  }
		  else {
		    save.href = fileURL;
		    save.target = '_blank';
		    save.download = fileName || 'unknown';
		    var event = document.createEvent('Event');
		    event.initEvent('click', true, true);
		    save.dispatchEvent(event);
		    (window.URL || window.webkitURL).revokeObjectURL(save.href);		  
		  }
		  $scope.updateHistoryService();
		};
	});