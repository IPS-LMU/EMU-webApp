'use strict';


angular.module('emuwebApp')
.directive('myDropZoneInput', function ($animate, browserDetector) {
	return {
		templateUrl: 'views/myDropZoneInput.html',
		restrict: 'E',
		scope: {	    
		},
		link: function postLink(scope, element, attr) {
		  scope.handler = false;
		  
		  scope.handleFilesonChange = function() {
		    scope.handler = true;
		    var loadedFiles = element.context.children.fileDialog;
		    if(browserDetector.isBrowser.Firefox()) {
              for (var i = 0; i < loadedFiles.files.length; i++) {
                var file = loadedFiles.files[i];
                var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
                if(extension==="WAV" && file.type.match('audio/x-wav') ) {
                  scope.wav = file;
                  scope.handleLocalFiles();	
                }
                else if(extension==="TEXTGRID" ) {
                  scope.grid = file;
                }            
                else  {
                  scope.other = file;
                }                         
              }
            }    
            else {
              for (var i = 0; i < loadedFiles.files.length; i++) {
                var file = loadedFiles.files[i];
                var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
                if(extension==="WAV" && file.type.match('audio/wav') ) {
                  scope.$parent.$parent.wav = file;
                  scope.$parent.$parent.handleLocalFiles();	
                }
                else if(extension==="TEXTGRID" ) {
                  scope.$parent.$parent.grid = file;
                }            
                else  {
                  scope.$parent.$parent.other = file;
                }                         
              }
            }
          }
          
          element.bind('change', function (event) {
            scope.handleFilesonChange(event);
          });
          
          element.bind('click', function (event) {
            var elem = angular.element('input');
            if(elem[1]!==undefined) {
              elem[1].click();
            }
          });	                   	
          		
		}
	}
});		