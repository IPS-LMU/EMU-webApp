'use strict';


angular.module('emuwebApp')
.directive('myDropZone', function ($animate) {
	return {
		templateUrl: 'views/myDropZone.html',
		restrict: 'E',
		link: function postLink(scope, element, attr) {
		
		  scope.dropDefault = 'Drop your files here or click here to open a file';
		  scope.dropErrorFileType = 'Error: Could not parse file. You can drop multiple files, but you have to select at least one .WAV file. The following file types are supported: .WAV .TEXTGRID';
		  scope.dropErrorAPI = 'Sorry ! The File APIs are not fully supported in your browser.';
		  scope.dropNotAllowed = 'File is not allowed';
		  scope.dropAllowed = 'Drop files to start loading';
		  scope.dropParsingStarted = 'Parsing started';
		  scope.dropText = scope.dropDefault;
		  scope.dropClass = '';
		
		  function dragEnterLeave(evt) {
		    evt.preventDefault();
		    scope.$apply(function () {
		      scope.dropText = scope.dropDefault;
		      scope.dropClass = '';
		    });
		  }
		  
		  function handleDragOver(evt) {
		    evt.preventDefault();
		    scope.$apply(function () {
		      scope.dropText = scope.dropAllowed;
		      scope.dropClass = 'over';
		    });
		  }	
		  
		  function dropFiles(evt) {
		    evt.stopPropagation();
		    evt.preventDefault();
		    scope.$apply(function () {
              scope.dropText = scope.dropParsingStarted;
              scope.dropClass = '';        
              if (window.File && window.FileReader && window.FileList && window.Blob) {
		        scope.dropText = scope.dropParsingStarted;
		        scope.dropClass = 'over';              
                if(scope.firefox) {
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
                scope.$parent.dials.open('views/error.html', 'ModalCtrl', scope.dropErrorAPI);
                scope.dropText = $scope.dropDefault;
              }
            });
		  }		  

          element.bind('drop', function (event) {
            dropFiles(event);
          });	  

          element.bind('dragover', function (event) {
            handleDragOver(event);
          });
              		
          element.bind('dragenter', function (event) {
            dragEnterLeave(event);
          });	
    		
          element.bind('dragleave', function (event) {
            dragEnterLeave(event);
          });		
    		
          element.bind('click', function (event) {
            element.context.children[0].children[1].click();
          });		
		
		}
	};
});
