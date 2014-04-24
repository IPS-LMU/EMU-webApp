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
        var newfiles = {};
        for (var i = 0; i < loadedFiles.files.length; i++) {
            var file = loadedFiles.files[i];
            var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
            if(extension==="WAV" && file.type.match('audio/wav') ) {
                doLoad = true;
                newfiles.wav = file;
            }
            if(extension==="TEXTGRID" ) {
                newfiles.textgrid = file;
            }            
            
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
        $scope.$parent.vs.somethingInProgressTxt = 'Loading local File: ' + files.wav.name;
        // empty ssff files
        $scope.$parent.ssffds.data = [];
        
        //arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
		$scope.$parent.vs.somethingInProgressTxt = 'Parsing WAV file...';
		
		var reader = new FileReader();
		reader.readAsArrayBuffer(files.wav);
		reader.onloadend = function(evt) {
		    if (evt.target.readyState == FileReader.DONE) { 
		        //console.log(evt.currentTarget.result);
    		    $scope.$parent.wps.parseWavArrBuf(evt.currentTarget.result).then(function (messWavParser) {
	    		var wavJSO = messWavParser;
		    	$scope.$parent.vs.curViewPort.sS = 0;
			    $scope.$parent.vs.curViewPort.eS = wavJSO.Data.length;
    			$scope.$parent.vs.curViewPort.bufferLength = wavJSO.Data.length;
	    		$scope.$parent.vs.resetSelect();
	    		$scope.$parent.vs.curPerspectiveIdx = 0;
		    	$scope.$parent.shs.wavJSO = wavJSO;
			    // set all ssff 
    			$scope.$parent.vs.somethingInProgressTxt = 'Parsing SSFF files...';
	    		$scope.$parent.vs.setState('labeling');
		    	$scope.$parent.vs.somethingInProgress = false;
			    $scope.$parent.vs.somethingInProgressTxt = 'Done!';
			}, function (errMess) {
			    $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
			});
               
            }
        };
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
      var doLoad = false;
      var newfiles = {};
      if (item.isFile) {
        item.file(function (file) {
          var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
          if (extension === 'WAV') {
            if (file.type.match('audio/wav')) {
              if (window.File && window.FileReader && window.FileList && window.Blob) {
                newfiles.wav = file;  
                doLoad = true
                ++$scope.wavLoaded;
                $scope.$apply();
              } else {
                $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Sorry ! The File APIs are not fully supported in your browser.');
              } 
            }
          }
          if (extension === 'TEXTGRID') {
            newfiles.textgrid = file;  
            ++$scope.txtGridLoaded;
            $scope.$apply();     
          }
          if (extension === 'LAB' || extension === 'TONE') {
            ++$scope.labelLoaded;  
            $scope.$apply();
          }   
          if(doLoad) {
              $scope.handleLocalFiles(newfiles); 
          }
          else {
              $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error: Could not parse file.\nYou can drop multiple files, but you have to select at least one WAVE file. The following file types are supported: .WAV .TEXTGRID');
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