import * as angular from 'angular';

angular.module('emuwebApp')
	.controller('ExportCtrl', ['$scope', '$window', 'ModalService', 'BrowserDetectorService', 'ViewStateService', 'HistoryService', 
		function ($scope, $window, ModalService, BrowserDetectorService, ViewStateService, HistoryService) {

		$scope.firefox = BrowserDetectorService.isBrowser.Firefox();

		/**
		 *
		 */
		$scope.getBlob = function () {
			var blob;
			try {
				blob = new Blob([ModalService.dataExport], {type: 'text/plain'});
			} catch (e) { // Backwards-compatibility
				blob = new ($window.BlobBuilder || $window.WebKitBlobBuilder || $window.MozBlobBuilder);
				blob.append($scope.exportData);
				blob = blob.getBlob();
			}
			return blob;
		};

		/**
		 *
		 */
		$scope.updateHistoryService = function () {
			HistoryService.movesAwayFromLastSave = 0;
		};

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			ViewStateService.setEditing(true);
			ViewStateService.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			ViewStateService.setEditing(false);
			ViewStateService.setcursorInTextField(false);
		};

		/**
		 *
		 */
		$scope.export = function () {
			var objURL;
			if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
				objURL = webkitURL.createObjectURL($scope.getBlob());
			} else {
				objURL = URL.createObjectURL($scope.getBlob());
			}
			$scope.SaveToDisk(objURL, ModalService.dataIn);
			ModalService.close();
		};

		/**
		 *  Save file to disk // Non-IE ONLY !!
		 */
		$scope.SaveToDisk = function (fileURL, fileName) {
			var save = document.createElement('a');
//			if (true) {
				save.setAttribute('download', fileName);
				save.href = fileURL;
				save.innerHTML = '';
				save.style.display = 'none';
				document.body.appendChild(save);
				save.click();
//			}
//			else {
//				save.href = fileURL;
//				save.target = '_blank';
//				save.download = fileName || 'unknown';
//				var event = document.createEvent('Event');
//				event.initEvent('click', true, true);
//				save.dispatchEvent(event);
//				(window.URL || window.webkitURL).revokeObjectURL(save.href);
//			}
			$scope.updateHistoryService();
		};
	}]);