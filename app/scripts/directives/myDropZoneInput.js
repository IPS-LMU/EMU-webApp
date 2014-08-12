'use strict';


angular.module('emuwebApp')
.directive('myDropZoneInput', function ($animate) {
	return {
		templateUrl: 'views/myDropZoneInput.html',
		restrict: 'E',
		link: function postLink(scope, element, attr) {
		
		  function handleFilesonChange() {
		    var loadedFiles = element.context.children.fileDialog;
		    if(scope.firefox) {
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
          }

          element.bind('change', function (event) {
            handleFilesonChange(event);
          });
          
          element.bind('click', function (event) {
            var elem = angular.element('input');
            elem[1].click();
          });	                   	
          		
		}
	}
});		