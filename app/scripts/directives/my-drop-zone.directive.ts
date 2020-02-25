import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('myDropZone', function ($animate, $compile, DragnDropService, browserDetector, appStateService, modalService) {
		return {
			templateUrl: 'views/myDropZone.html',
			restrict: 'E',
			replace: true,
			scope: {},
			link: function postLink(scope, element) {
				/* --------- Messages -------- */
				scope.dropTextDefault = 'Drop your files here (.wav files; .wav & annotJSON file pairs; .wav & TextGrid file pairs) or click here to do the same with a file dialog';
				scope.dropTextErrorFileType = 'Error: Could not parse file. The following file types are supported: .WAV .TEXTGRID _annot.json';
				scope.dropTextErrorAPI = 'Sorry ! The File APIs are not supported in your browser.';
				scope.dropAllowed = 'Drop file(s) to start loading !';
				scope.dropParsingWaiting = '.TextGrid loaded! Please load .WAV file in order to start!';
				scope.dropParsingWAV = '.WAV loaded! Proceeding without annotation data.';
				scope.dropParsingWaitingAnnot = 'Annotation file loaded! Please load .WAV file in order to start!';
				scope.dropFirefoxWarning = 'Sorry ! Firefox does not support dropping folders ! please drop single or multiple files !';

				scope.dropText = scope.dropTextDefault;
				scope.dropClass = '';
				scope.dropClassDefault = '';
				scope.dropClassOver = 'over';
				scope.dropClassError = 'error';
				scope.count = 0;
				scope.handles = [];
				scope.bundles = [];
				scope.bundleNames = [];

				scope.updateQueueLength = function (quantity) {
					scope.count += quantity;
				};

				scope.enqueueFileAddition = function (file) {
					var identifier = file.name.substring(file.name.lastIndexOf('_') + 1, file.name.lastIndexOf('.')).toUpperCase();
					var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
					var bundle = '';
					if (identifier === 'ANNOT') {
						bundle = file.name.substr(0, file.name.lastIndexOf('_'));
					}
					else {
						bundle = file.name.substr(0, file.name.lastIndexOf('.'));
					}
					var j = scope.bundleNames.indexOf(bundle);
					if (j === -1) {
						scope.bundleNames.push(bundle);
						j = scope.bundleNames.indexOf(bundle);
						scope.bundles[j] = [];
						scope.bundles[j][0] = bundle;
					}
					if (extension === 'WAV') {
						scope.bundles[j][1] = file;
						scope.handles.push(file);
						scope.dropClass = scope.dropClassDefault;
						scope.dropText = scope.dropParsingWAV;
					}
					else if (extension === 'TEXTGRID') {
						scope.bundles[j][2] = {};
						scope.bundles[j][2].file = file;
						scope.bundles[j][2].type = 'textgrid';
						scope.handles.push(file);
						scope.dropClass = scope.dropClassDefault;
						scope.dropText = scope.dropParsingWaiting;
					}
					else if (extension === 'JSON' && identifier === 'ANNOT') {
						scope.bundles[j][2] = {};
						scope.bundles[j][2].file = file;
						scope.bundles[j][2].type = 'annotation';
						scope.handles.push(file);
						scope.dropClass = scope.dropClassDefault;
						scope.dropText = scope.dropParsingWaitingAnnot;
					}
					else {
						if (browserDetector.isBrowser.Firefox()) {
							if (file.size === 0) {
								scope.dropClass = scope.dropClassError;
								scope.dropText = scope.dropFirefoxWarning;
							}
							else {
								scope.dropClass = scope.dropClassError;
								scope.dropText = scope.dropTextErrorFileType;
							}
						}
						else {
							scope.dropClass = scope.dropClassError;
							scope.dropText = scope.dropTextErrorFileType;
						}
						scope.handles = [];
						scope.bundles = [];
						scope.bundleNames = [];
						scope.count = 0;
					}
					if (!browserDetector.isBrowser.Firefox() && !browserDetector.isBrowser.Safari()) {
						scope.$digest();
					}
					if (scope.bundles[j] !== undefined) {
						scope.startRendering();
					}
				};

				scope.startRendering = function () {
					// If all the files we expect have shown up, then flush the queue.
					if (scope.count === scope.handles.length) {
						if (DragnDropService.setData(scope.bundles) === false) {
							modalService.open('views/error.html', 'Sorry you dropped too many bundles (' + scope.handles.length + '). The maximum currently allowed is: ' + DragnDropService.maxDroppedBundles).then(function () {
								appStateService.resetToInitState();
							});
						}
						scope.handles = [];
						scope.bundles = [];
						scope.bundleNames = [];
						scope.count = 0;
						scope.dropText = scope.dropTextDefault;
						scope.dropClass = scope.dropClassDefault;
					}
				};

				scope.loadFiles = function (files) {
					scope.updateQueueLength(files.length);
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						if (file.name === '.DS_Store') {
							scope.updateQueueLength(-1);
						}
						else {
							var entry, reader;

							if (file.isFile || file.isDirectory) {
								entry = file;
							}
							else if (file.getAsEntry) {
								entry = file.getAsEntry();
							}
							else if (file.webkitGetAsEntry) {
								entry = file.webkitGetAsEntry();
							}
							else if (typeof file.getAsFile === 'function') {
								scope.enqueueFileAddition(file.getAsFile());
								continue;
							}
							else if (File && file instanceof File) {
								scope.enqueueFileAddition(file);
								continue;
							}
							else {
								scope.updateQueueLength(-1);
								continue;
							}

							if (!entry) {
                                scope.updateQueueLength(-1);
							}
							else if (entry.isFile) {
								entry.file(function (file) {
									scope.enqueueFileAddition(file);
								}, function (err) {
									console.warn(err);
								});
							}
							else if (entry.isDirectory) {
								reader = entry.createReader();
								reader.readEntries(function (entries) {
									scope.loadFiles(entries);
									scope.updateQueueLength(-1);
								}, function (err) {
									console.warn(err);
								});
							}
						}
					}
				};

				scope.dropFiles = function (evt) {
					evt.stopPropagation();
					evt.preventDefault();
					scope.$apply(function () {
						if (window.File && window.FileReader && window.FileList && window.Blob) {
							if (evt.originalEvent !== undefined) {
                                var items;
								if (browserDetector.isBrowser.Firefox()) {
									items = evt.originalEvent.dataTransfer.files;
								}
								else if (browserDetector.isBrowser.Safari()) {
									items = evt.originalEvent.dataTransfer.files;
								}
								else { // we assume it is chrome
									items = evt.originalEvent.dataTransfer.items;
								}

								scope.loadFiles(items);
							}
						}
						else {
							// no browser support for FileAPI
							modalService.open('views/error.html', scope.dropTextErrorAPI).then(function () {
								scope.dropText = scope.dropTextDefault;
								scope.dropClass = scope.dropClassDefault;
								appStateService.resetToInitState();
							});
						}
					});
				};

				scope.dragEnterLeave = function (evt) {
					evt.preventDefault();
					scope.$apply(function () {
						scope.dropText = scope.dropTextDefault;
						scope.dropClass = scope.dropClassDefault;
					});
				};

				scope.handleDragOver = function (evt) {
					evt.preventDefault();
					scope.$apply(function () {
						scope.dropText = scope.dropAllowed;
						scope.dropClass = scope.dropClassOver;
					});
				};

				element.bind('drop', function (event) {
					scope.dropFiles(event);
				});

				element.bind('dragover', function (event) {
					scope.handleDragOver(event);
				});

				element.bind('dragenter', function (event) {
					scope.dragEnterLeave(event);
				});

				element.bind('dragleave', function (event) {
					scope.dragEnterLeave(event);
				});

				element.bind('click', function () {
					var input = element.find('input');
					// call click of my-drop-zone-input
                    input[0].click();
				});


			}
		};
	});
