'use strict';

angular.module('emuwebApp')
  .controller('FileCtrl', function ($scope) {

    $scope.dropzone = document.getElementById('dropzone');
    $scope.fileInput = document.getElementById('fileDialog');
    $scope.dropDefault = 'Drop your files here or click here to open a file';
    $scope.dropNotAllowed = 'File is not allowed';
    $scope.dropAllowed = 'Drop files to start loading';
    $scope.dropParsingStarted = 'Parsing started';
    $scope.wavLoaded = 0;
    $scope.txtGridLoaded = 0;
    $scope.labelLoaded = 0;


    $scope.dropText = $scope.dropDefault;
    
    $scope.files = [];
    $scope.percentage = 0;

    $scope.hideDropZone = function () {
      $scope.dropClass = 'hidden';
    };
    
    $scope.loadFiles = function () {
        setTimeout(function() {
            $scope.fileInput.click();
        }, 0);    
    };

    $scope.showDropZone = function () {
      $scope.dropClass = '';
    };
    

    function dragEnterLeave(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      $scope.$apply(function () {
        $scope.dropText = $scope.dropDefault;
        $scope.dropClass = '';
      });
    }
     $scope.dropzone.addEventListener('dragenter', dragEnterLeave, false);
     $scope.dropzone.addEventListener('dragleave', dragEnterLeave, false);
     $scope.dropzone.addEventListener('dragover', function (evt) {
       evt.stopPropagation();
       evt.preventDefault();
       var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
       var files = evt.dataTransfer.files;
       console.log(files);
       
       $scope.$apply(function () {
         $scope.dropText = ok ? $scope.dropAllowed : $scope.dropNotAllowed;
         $scope.dropClass = ok ? 'over' : 'not-available';
         $scope.wavLoaded = 0;
         $scope.txtGridLoaded = 0;
         $scope.labelLoaded = 0;
       });
     }, false);

     $scope.dropzone.addEventListener('drop', function (evt) {
       evt.stopPropagation();
       evt.preventDefault();
       $scope.$apply(function () {
         $scope.dropText = $scope.dropParsingStarted;
         $scope.dropClass = '';        
       });
       var items = evt.dataTransfer.items;
       for (var i = 0; i < items.length; i++) {
         var item = items[i].webkitGetAsEntry();
         if (item) {
           $scope.traverseFileTree(item);       
         }
       }        
      
     }, false);

    $scope.traverseFileTree = function (item, path) {
      path = path || '';
      if (item.isFile) {
        item.file(function (file) {
          var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
          console.log(extension);
          if (extension === 'WAV') {
            if (file.type.match('audio/wav')) {
              if (window.File && window.FileReader && window.FileList && window.Blob) {
                var reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onloadend = function(evt) {
                 if (evt.target.readyState == FileReader.DONE) { 


$scope.wps.parseWavArrBuf(evt.target.result).then(function (messWavParser) {
							var wavJSO = messWavParser;
							$scope.vs.curViewPort.sS = 0;
							$scope.vs.curViewPort.eS = wavJSO.Data.length;
							// FOR DEVELOPMENT:
							// viewState.curViewPort.sS = 110678;
							// $scope.vs.curViewPort.eS = 110703;
							$scope.vs.curViewPort.bufferLength = wavJSO.Data.length;
							$scope.vs.resetSelect();
							$scope.shs.wavJSO = wavJSO;

							// set all ssff files
							// var ssffJso;
							
						}, function (errMess) {
							// console.error(errMess)
							dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
						});

                  //console.log($scope.wps.wav2jso(evt.target.result));
                 }
                };
                ++$scope.wavLoaded;
                $scope.$apply();
              } else {
                alert('The File APIs are not fully supported in this browser.');
              } 
            }
          }
          if (extension === 'TEXTGRID') {
            ++$scope.txtGridLoaded;
            $scope.$apply();     
          }
          if (extension === 'LAB' || extension === 'TONE') {
            ++$scope.labelLoaded;  
            $scope.$apply();
          }          
        });
      } else if (item.isDirectory) {
        var dirReader = item.createReader();
        dirReader.readEntries(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            $scope.traverseFileTree(entries[i], path + item.name + '/');
          }
        });
      }
    };
  });