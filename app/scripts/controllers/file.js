'use strict';

angular.module('emuwebApp')
  .controller('FileCtrl', function ($scope, Binarydatamaniphelper) {

    $scope.dropzone = document.getElementById('dropzone');
    $scope.fileInput = document.getElementById('fileDialog');
    $scope.dropDefault = 'Drop your files here or click here to open a file';
    $scope.dropNotAllowed = 'File is not allowed';
    $scope.dropAllowed = 'Drop files to start loading';
    $scope.dropParsingStarted = 'Parsing started';
    $scope.wavLoaded = 0;
    $scope.txtGridLoaded = 0;
    $scope.labelLoaded = 0;
    
    $scope.fileInput.addEventListener('change', handleFilesonChange, false);

    $scope.dropText = $scope.dropDefault;
    
    $scope.files = [];

    $scope.loadFiles = function () {
        setTimeout(function() {
            $scope.fileInput.click();
        }, 0);    
    };

    
    function handleFilesonChange() {
        var doLoad = false;
        var loadedFiles = $scope.fileInput;
        var newfiles = [];
        for (var i = 0; i < loadedFiles.files.length; i++) {
            var file = loadedFiles.files[i];
            var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
            if(extension==="WAV" && file.type.match('audio/wav') ) {
                doLoad = true;
            }
            newfiles.push(file);
        }
        if(doLoad) {
            $scope.handleLocalFiles(newfiles);
        }
        else {
           $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'You have to select one WAV file at least.'); 
        }
    }
    
    $scope.handleLocalFiles = function (files) {
        $scope.$parent.showDropZone = false;
        $scope.$parent.cps.vals.main.comMode = 'FILE';
        $scope.$parent.vs.setState('loadingSaving');
        // reset history
		$scope.$parent.hists.resetToInitState();
		$scope.$parent.vs.somethingInProgress = true;
		
		$scope.$parent.vs.somethingInProgressTxt = 'Loading local File: ' + files[0].name;
		// empty ssff files
		$scope.$parent.ssffds.data = [];

		// set wav file
		//arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
		$scope.$parent.vs.somethingInProgressTxt = 'Parsing WAV file...';
		
		console.log(files);

		/*Wavparserservice.parseWavArrBuf(arrBuff).then(function (messWavParser) {
			var wavJSO = messWavParser;
			viewState.curViewPort.sS = 0;
			viewState.curViewPort.eS = wavJSO.Data.length;

			// FOR DEVELOPMENT:
			viewState.curViewPort.sS = 4000;
			viewState.curViewPort.eS = 5000;
							
			viewState.curViewPort.bufferLength = wavJSO.Data.length;
			viewState.resetSelect();
			Soundhandlerservice.wavJSO = wavJSO;

							// set all ssff files
							viewState.somethingInProgressTxt = 'Parsing SSFF files...';
							Ssffparserservice.asyncParseSsffArr(bundleData.ssffFiles).then(function (ssffJson) {
								Ssffdataservice.data = ssffJson.data;
								// set annotation
								Levelservice.setData(bundleData.annotation);
								$scope.curBndl = bndl;
								viewState.setState('labeling');
								viewState.somethingInProgress = false;
								viewState.somethingInProgressTxt = 'Done!';
								// FOR DEVELOPMENT:
								// $scope.menuBundleSaveBtnClick(); // for testing save button
							}, function (errMess) {
								dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing SSFF file: ' + errMess.status.message);
							});
						}, function (errMess) {
							dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
						});*/

    };
    
    

    function dragEnterLeave(evt) {
      evt.preventDefault();
      // fetch FileList object
      var files = evt.target.files || evt.dataTransfer.files;
      console.log(files);
      $scope.$apply(function () {
        $scope.dropText = $scope.dropDefault;
        $scope.dropClass = '';
      });
    }

    
    
    function  handleDragOver(evt) {
       evt.preventDefault();
       var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
       $scope.$apply(function () {
         //$scope.dropText = ok ? $scope.dropAllowed : $scope.dropNotAllowed;
         //$scope.dropText = evt.originalEvent.dataTransfer.files;
         $scope.dropClass = ok ? 'over' : 'not-available';
         $scope.wavLoaded = 0;
         $scope.txtGridLoaded = 0;
         $scope.labelLoaded = 0;
       });
    }
    
     $scope.dropzone.addEventListener('dragenter', dragEnterLeave, false);
     $scope.dropzone.addEventListener('dragleave', dragEnterLeave, false);
     $scope.dropzone.addEventListener('dragover', handleDragOver, false);
     

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
      var newfiles = [];
      if (item.isFile) {
        item.file(function (file) {
          var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
          if (extension === 'WAV') {
            if (file.type.match('audio/wav')) {
              if (window.File && window.FileReader && window.FileList && window.Blob) {
                //var reader = new FileReader();
                //reader.readAsArrayBuffer(file);
                //reader.onloadend = function(evt) {
                // if (evt.target.readyState == FileReader.DONE) { 
                //  $scope.handleLocalFiles(evt);                   
                // }
                //};
                newfiles.push(file);  
                $scope.handleLocalFiles(newfiles); 
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