'use strict';


angular.module('emuwebApp')
.directive('myDropZone', function ($animate) {
	return {
		templateUrl: 'views/myDropZone.html',
		restrict: 'E',
		link: function postLink(scope, element, attr) {
		
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
		
		}
	};
});
