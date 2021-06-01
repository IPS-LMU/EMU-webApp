import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('dragout', ['$window', 'DataService', 'LoadedMetaDataService', 'BrowserDetectorService', 'ConfigProviderService', 
		function ($window, DataService, LoadedMetaDataService, BrowserDetectorService, ConfigProviderService) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				name: '@'
			},
			link: function (scope, element, attrs) {
				scope.cps = ConfigProviderService;
				var el = element[0];
				// var dragIcon = document.createElement('img');
				// dragIcon.src = 'img/save.svg';
				// dragIcon.width = '35';
				// dragIcon.height = '35';

				scope.generateURL = function () {
					return scope.getURL(angular.toJson(DataService.getData(), true));
				};

				scope.isActive = function () {
					if (attrs.name === LoadedMetaDataService.getCurBndl().name) {
						return true;
					}
					else{
						return false;
					}
				};

				scope.getURL = function (data) {
					var objURL;
					if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
						objURL = webkitURL.createObjectURL(scope.getBlob(data));
					} else {
						objURL = URL.createObjectURL(scope.getBlob(data));
					}
					return objURL;
				};

				scope.getBlob = function (data) {
					var blob;
					try {
						blob = new Blob([data], {type: 'text/plain'});
					} catch (e) { // Backwards-compatibility
						blob = new ($window.BlobBuilder || $window.WebKitBlobBuilder || $window.MozBlobBuilder);
						blob.append(data);
						blob = blob.getBlob();
					}
					return blob;
				};

				el.addEventListener(
					'dragstart',
					function (e) {
						// console.log('dragstart');
						if (scope.isActive()) {
							this.classList.add('drag');
							var url = scope.generateURL();
							if (BrowserDetectorService.isBrowser.Firefox() || BrowserDetectorService.isBrowser.Chrome()) {
								if(e.dataTransfer !== undefined){
									// add image
									// e.dataTransfer.setDragImage(dragIcon, -8, -8);
									// e.dataTransfer.effectAllowed = 'move';
									e.dataTransfer.setData('DownloadURL', 'application/json:' + attrs.name + '_annot.json:' + url);
								}
							}
						}
						else {
							e.preventDefault();
							// console.log('dropping inactive bundles is not allowed');
						}
						return false;
					},
					false
				);

				el.addEventListener(
					'dragend',
					function (e) {
						// console.log('dragend');
						if (scope.isActive()) {
							this.classList.remove('drag');
							e.preventDefault();
						}
						return false;

					},
					false
				);
			}
		};
	}]);
