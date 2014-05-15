'use strict';

angular.module('emuwebApp')
  .controller('FileCtrl', function ($scope, Binarydatamaniphelper, Textgridparserservice, ConfigProviderService, Validationservice) {

    $scope.dropzone = document.getElementById('dropzone');
    $scope.fileInput = document.getElementById('fileDialog');
    $scope.dropDefault = 'Drop your files here or click here to open a file';
    $scope.dropErrorFileType = 'Error: Could not parse file. You can drop multiple files, but you have to select at least one .WAV file. The following file types are supported: .WAV .TEXTGRID';
    $scope.dropErrorAPI = 'Sorry ! The File APIs are not fully supported in your browser.';
    $scope.dropNotAllowed = 'File is not allowed';
    $scope.dropAllowed = 'Drop files to start loading';
    $scope.dropParsingStarted = 'Parsing started';
    $scope.newfiles = [];
    $scope.wav = {};
    $scope.grid = {};
    $scope.curBndl = {};
    $scope.dropText = $scope.dropDefault;
    $scope.dropzone.addEventListener('dragenter', dragEnterLeave, false);
    $scope.dropzone.addEventListener('dragleave', dragEnterLeave, false);
    $scope.dropzone.addEventListener('dragover', handleDragOver, false);
    $scope.fileInput.addEventListener('change', handleFilesonChange, false);


    $scope.loadFiles = function () {
        setTimeout(function() {
            $scope.fileInput.click();
        }, 0);    
    };

    
    function handleFilesonChange() {
        var loadedFiles = $scope.fileInput;
        for (var i = 0; i < loadedFiles.files.length; i++) {
            var file = loadedFiles.files[i];
            var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
            if(extension==="WAV" && file.type.match('audio/wav') ) {
                $scope.wav = file;
            }
            else if(extension==="TEXTGRID" ) {
                $scope.grid = file;
            }            
            else  {
                $scope.other = file;
            }                         
        }
    }
    

    function dragEnterLeave(evt) {
      evt.preventDefault();
      var files = evt.target.files || evt.dataTransfer.files;
      $scope.$apply(function () {
        $scope.dropText = $scope.dropDefault;
        $scope.dropClass = '';
      });
    }

    
    
    function  handleDragOver(evt) {
       evt.preventDefault();
       var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
       $scope.$apply(function () {
         $scope.dropClass = ok ? 'over' : 'not-available';
       });
    }
    
    $scope.resetToInitState = function () {
        $scope.newfiles = [];
        $scope.wav = {};
        $scope.grid = {};
        $scope.curBndl = {};
        $scope.dropText = $scope.dropDefault;
    };    
    
    $scope.$watch('wav', function () {
        if($.isEmptyObject($scope.other)) {
            if (!$.isEmptyObject($scope.wav)) {
                $scope.handleLocalFiles();	
            }   
        }
     }, true);        
     
    $scope.$watch('other', function () {
        if ($.isEmptyObject($scope.wav) && !$.isEmptyObject($scope.other)) {
            var extension = $scope.other.name.substr($scope.other.name.lastIndexOf('.')+1);
            $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error: Unknown File Type for File ' + $scope.other.name);
            $scope.resetToInitState();
        }
     }, true);        
          
     
     $scope.$on('resetToInitState', function () {
         $scope.resetToInitState();
    });      


    $scope.handleLocalFiles = function () {
        $scope.$parent.showDropZone = false;
        $scope.$parent.cps.vals.main.comMode = 'FileAPI';
        $scope.$parent.vs.setState('loadingSaving');
        // reset history
        $scope.$parent.hists.resetToInitState();
        $scope.$parent.vs.somethingInProgress = true;
        $scope.$parent.vs.somethingInProgressTxt = 'Loading local File: ' + $scope.wav.name;
        // empty ssff files
        $scope.$parent.ssffds.data = [];
        $scope.$parent.levServ.data = {};
        //arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
		$scope.$parent.vs.somethingInProgressTxt = 'Parsing WAV file...';
		var reader = new FileReader();
		reader.readAsArrayBuffer($scope.wav);
		reader.onloadend = function(evt) {
		    if (evt.target.readyState == FileReader.DONE) { 
		        $scope.$parent.io.httpGetPath('configFiles/standalone_emuwebappConfig.json').then(function (resp) {
			        // first element of perspectives is default perspective
					$scope.$parent.vs.curPerspectiveIdx = 0;
					$scope.$parent.cps.setVals(resp.data.EMUwebAppConfig);
					delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
					var validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals)
					if (validRes === true) {
					    $scope.$parent.cps.curDbConfig = resp.data;
    					$scope.curBndl = {};
	    				$scope.curBndl.name = $scope.wav.name.substr(0,$scope.wav.name.lastIndexOf('.'));
				    	$scope.$parent.bundleList.push($scope.curBndl);
					    $scope.$parent.curBndl = $scope.curBndl;
    					// then get the DBconfigFile
    					$scope.$parent.wps.parseWavArrBuf(evt.currentTarget.result).then(function (wavJSO) {
					        $scope.$parent.vs.curViewPort.sS = 0;
    					    $scope.$parent.vs.curViewPort.eS = wavJSO.Data.length;
		    			    $scope.$parent.vs.resetSelect();
			    		    $scope.$parent.vs.curPerspectiveIdx = 0;
				    	    $scope.$parent.shs.wavJSO = wavJSO;	
					        // parsing of Textgrid Data
					        if(!$.isEmptyObject($scope.grid)) {
					            var reader = new FileReader();
    					        reader.readAsText($scope.grid);
	    				        reader.onloadend = function(evt) {
		    			            if (evt.target.readyState == FileReader.DONE) {
			    		                var extension = $scope.wav.name.substr(0,$scope.wav.name.lastIndexOf('.'));
				    	                Textgridparserservice.asyncParseTextGrid(evt.currentTarget.result, $scope.wav.name, extension).then(function (parseMess) {
					                    var annot = parseMess.data;
					                    $scope.$parent.levServ.setData(annot);
					                    // console.log(JSON.stringify(l, undefined, 2));
					                    var lNames = [];
					                    annot.levels.forEach(function (l) {
					                        lNames.push(l.name);
    					                });
	    				                $scope.$parent.cps.vals.perspectives[$scope.$parent.vs.curPerspectiveIdx].levelCanvases.order = lNames;
		    			                $scope.$parent.vs.somethingInProgressTxt = 'Done!';
			    		                $scope.$parent.vs.somethingInProgress = false;
				    	                $scope.$parent.vs.setState('labeling');
					                    $scope.$parent.openSubmenu();
					                });
					            }
    					    }, function (errMess) {
	    	    	            $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error parsing textgrid file: ' + errMess.status.message);
		    	            };
		    	        }
      			        else {
    			          $scope.$parent.vs.setState('labeling');
	    		          $scope.$parent.vs.somethingInProgress = false;
		    	          $scope.$parent.vs.somethingInProgressTxt = 'Done!';		            
	                    $scope.$parent.openSubmenu();		    
			          }
			      
                    });    								

					} else {
					    $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error validating ConfigProviderService.vals (emuwebappConfig data) : ' + JSON.stringify(validRes, null, 4));
					}
			}, function (errMess) {
			    $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
			});
               
            }
            
        };
    };
    
    $scope.dropzone.addEventListener('drop', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $scope.$apply(function () {
            $scope.dropText = $scope.dropParsingStarted;
            $scope.dropClass = '';        
        });
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var items = evt.dataTransfer.items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i].webkitGetAsEntry();
                if (item) {
                    $scope.traverseFileTree(item); 
                    $scope.$apply();       
                }
            }     
        }
        else {
            $scope.$parent.dials.open('views/error.html', 'ModalCtrl', $scope.dropErrorAPI);
            $scope.dropText = $scope.dropDefault;
        }
     }, false);
     
    $scope.traverseFileTree = function (item, path) {
        path = path || '';
            if (item.isFile) {
                item.file(function (file) {
                    var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
                    if (extension === 'WAV') {
                        $scope.wav = file;
                        $scope.$apply();    
                    }
                    else if (extension === 'TEXTGRID') {
                        $scope.grid = file;  
                        $scope.$apply();   
                    }
                    else {
                        $scope.other = file; 
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