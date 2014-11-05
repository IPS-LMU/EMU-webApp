'use strict';


angular.module('emuwebApp')
.directive('myDropZone', function ($animate, $compile, browserDetector, appStateService, dialogService) {
	return {
		templateUrl: 'views/myDropZone.html',
		restrict: 'E',
		scope: {
		},
		link: function postLink(scope, element, attr) {
		
		
		  scope.dropTextDefault = 'Drop your files here or click here to open a file';
		  scope.dropTextErrorFileType = 'Error: Could not parse file. The following file types are supported: .WAV .TEXTGRID';
		  scope.dropTextErrorAPI = 'Sorry ! The File APIs are not fully supported in your browser.';
		  scope.dropAllowed = 'Drop file(s) to start loading !';
		  scope.dropParsingStarted = 'Parsing started';
		  scope.dropParsingWaiting = '.TextGrid loaded! Please load .WAV file in order to start!';
		  
		  scope.dropHintDefault = 'Load .TextGrid first or .TextGrid and .WAV at once!';
		  
		  scope.dropText = scope.dropTextDefault;
		  scope.dropHint = scope.dropHintDefault;
		  
		  scope.dropClass = '';
		  scope.error = false;
		  
		  scope.traverseFileTreeChrome = function (item, path) {
            path = path || '';
            if (item.isFile) {
                item.file(function (file) {
                    var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
                    if (scope.error !== true && extension === 'WAV') {
                        scope.$parent.wav = file;
                        scope.$parent.handleLocalFiles();
                    } else if (scope.error !== true && extension === 'TEXTGRID') {
                        scope.$parent.grid = file;
                        scope.$apply(function () {
		                    scope.dropText = scope.dropParsingWaiting;
		                    scope.dropClass = 'waiting';
		                });
                    } else if (scope.error !== true) {
                        scope.error = true;
                        scope.$parent.other = file;
                        scope.dropText = scope.dropTextErrorFileType;
                        scope.dropClass = 'error';
                        dialogService.open('views/error.html', 'ModalCtrl', 'Error: Unknown File Type for File ' + scope.$parent.other.name).then(function (res) {
                            scope.dropText = scope.dropTextDefault;
                            scope.dropClass = '';
                            appStateService.resetToInitState();
                        });
                    }
                });
            } else if (item.isDirectory) {
                var dirReader = item.createReader();
                dirReader.readEntries(function (entries) {
                    for (var i = 0; i < entries.length; i++) {
                        scope.traverseFileTreeChrome(entries[i], path + item.name + '/');
                    }
                });
            }
		  };


		  scope.traverseFileTreeFirefox = function (item, path) {
            path = path || '';
            if (item.size > 0) {
                var extension = item.name.substr(item.name.lastIndexOf('.') + 1).toUpperCase();
                if (scope.error !== true && extension === 'WAV') {
                    scope.$parent.wav = item;
                    scope.$parent.handleLocalFiles();
                } else if (scope.error !== true && extension === 'TEXTGRID') {
                    scope.$parent.grid = item;
                    scope.$apply(function () {
		                scope.dropText = scope.dropParsingWaiting;
		                scope.dropClass = 'waiting';
		            });
                } else if(scope.error !== true) {
                    scope.error = true;
                    scope.$parent.other = item;
                    scope.dropText = scope.dropTextErrorFileType;
                    scope.dropClass = 'error';
                    dialogService.open('views/error.html', 'ModalCtrl', 'Error: Unknown File Type for File ' + scope.$parent.other.name).then(function (res) {
                        scope.dropText = scope.dropTextDefault;
                        scope.dropClass = '';
                        appStateService.resetToInitState();
                    });
                }
            } else if (item.isDirectory) {
                var dirReader = item.createReader();
                dirReader.readEntries(function (entries) {
                    for (var i = 0; i < entries.length; i++) {
                        scope.traverseFileTreeFirefox(entries[i], path + item.name + '/');
                    }
                });
            }
		  };		  
		
		  scope.dragEnterLeave = function(evt) {
		    evt.preventDefault();
		    scope.$apply(function () {
		      scope.dropText = scope.dropTextDefault;
		      scope.dropClass = '';
		    });
		  }
		  
		  scope.handleDragOver = function(evt) {
		    evt.preventDefault();
		    scope.$apply(function () {
		      scope.dropText = scope.dropAllowed;
		      scope.dropClass = 'over';
		    });
		  }	
		  
		  scope.dropFiles = function(evt) {
		    scope.error = false;
		    evt.stopPropagation();
		    evt.preventDefault();
		    scope.$apply(function () {
              if (window.File && window.FileReader && window.FileList && window.Blob) {
		        if(evt.originalEvent !== undefined) {          
                  if(browserDetector.isBrowser.Firefox()) {
                    var dt = evt.originalEvent.dataTransfer;
                    var files = dt.files;
                    var count = files.length;
                    for (var i = 0; i < files.length; i++) {
                        scope.traverseFileTreeFirefox(files[i]); 
                    }
                  }
                  else {        
                    var items = evt.originalEvent.dataTransfer.items;
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i].webkitGetAsEntry();
                        if (item) {
                            scope.traverseFileTreeChrome(item); 
                        }
                    }    
                  }
                }
                else {
    		      scope.dropText = scope.dropTextErrorFileType;
	    	      scope.dropClass = 'error';  
                  dialogService.open('views/error.html', 'ModalCtrl', 'Error: Unknown File Type for File ' + scope.$parent.other.name).then(function (res) {
                    scope.dropText = scope.dropTextDefault;
                    scope.dropClass = '';
                    appStateService.resetToInitState();
                  });              
                }
              }
              else {
                dialogService.open('views/error.html', 'ModalCtrl', scope.dropTextErrorAPI);
                scope.dropText = scope.dropTextDefault;
                scope.dropClass = '';
              }
            });
		  }		  

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
    		
          element.bind('click', function (event) {
            element.context.children[0].children[1].click();
          });		
		
		}
	};
});
