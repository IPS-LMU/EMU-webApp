'use strict';


angular.module('emuwebApp')
.directive('myDropZoneInput', function ($animate, browserDetector, dialogService, appStateService) {
	return {
		templateUrl: 'views/myDropZoneInput.html',
		restrict: 'E',
		scope: {	    
		},
		link: function postLink(scope, element, attr) {
		  scope.handler = false;
		  
		  
		  scope.acceptGrid = '.TextGrid';
		  scope.acceptWav = 'audio/wav';
		  scope.acceptBoth = scope.acceptWav + ',' + scope.acceptGrid;
		  scope.acceptFile = scope.acceptBoth;
		  
		  scope.handleFilesonChange = function() {
		    scope.handler = true;
		    var loadedFiles = element.context.children.fileDialog;
		    if(browserDetector.isBrowser.Firefox()) {
              for (var i = 0; i < loadedFiles.files.length; i++) {
                var file = loadedFiles.files[i];
                var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
                if(extension==="WAV" && file.type.match('audio/x-wav') ) {
                  scope.$apply(function () {
		            scope.$parent.dropText = scope.$parent.dropTextDefault;
		            scope.acceptFile = scope.acceptBoth;
		          });
		          scope.$parent.$parent.wav = file;
                  scope.$parent.$parent.handleLocalFiles();
                }
                else if(extension==="TEXTGRID" ) {
                  scope.$parent.$parent.grid = file;
                  scope.$apply(function () {
		            scope.$parent.dropText = scope.$parent.dropParsingWaiting;
		            scope.acceptFile = scope.acceptWav;
		          });
                }            
                else  {
                  scope.$parent.error = true;
                  scope.$parent.$parent.other = file;
                  scope.$parent.dropText = scope.$parent.dropTextErrorFileType;
                  scope.$parent.dropClass = 'error';
                  dialogService.open('views/error.html', 'ModalCtrl', 'Error: Unknown File Type for File ' + scope.$parent.other.name).then(function (res) {
                    scope.$parent.dropText = scope.$parent.dropTextDefault;
                    scope.$parent.dropClass = '';
                    appStateService.resetToInitState();
                  });
                }                         
              }
            }    
            else {
              for (var i = 0; i < loadedFiles.files.length; i++) {
                var file = loadedFiles.files[i];
                var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
                if(extension==="WAV" && file.type.match('audio/wav') ) {
                  scope.$apply(function () {
		            scope.$parent.dropText = scope.$parent.dropTextDefault;
		            scope.acceptFile = scope.acceptBoth;
		          });                  
		          scope.$parent.$parent.wav = file;
                  scope.$parent.$parent.handleLocalFiles();
                }
                else if(extension==="TEXTGRID" ) {
                  scope.$apply(function () {
		            scope.$parent.dropText = scope.$parent.dropParsingWaiting;
		            scope.acceptFile = scope.acceptWav;
		          });                
                  scope.$parent.$parent.grid = file;
                }            
                else  {
                  scope.$parent.error = true;
                  scope.$parent.$parent.other = file;
                  scope.$parent.dropText = scope.$parent.dropTextErrorFileType;
                  scope.$parent.dropClass = 'error';
                  dialogService.open('views/error.html', 'ModalCtrl', 'Error: Unknown File Type for File ' + scope.$parent.other.name).then(function (res) {
                    scope.$parent.dropText = scope.$parent.dropTextDefault;
                    scope.$parent.dropClass = '';
                    appStateService.resetToInitState();
                  });
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