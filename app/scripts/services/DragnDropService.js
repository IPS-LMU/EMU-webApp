'use strict';

angular.module('emuwebApp')
	.service('DragnDropService', function DragnDropService($q, $rootScope, modalService, DataService, Validationservice, ConfigProviderService, DragnDropDataService, Iohandlerservice, viewState, Soundhandlerservice, Binarydatamaniphelper, browserDetector, Wavparserservice, Textgridparserservice, loadedMetaDataService) {
		// shared service object
		var sServObj = {};
		sServObj.drandropBundles = [];
		sServObj.bundleList = [];
		sServObj.sessionName = 'File(s)';
		sServObj.maxDroppedBundles = 10;

		///////////////////////////////
		// public api
		
		///////////////////
		// drag n drop data 
		sServObj.setData = function (bundles) {
		    var prom = [];
		    var count = 0;
			angular.forEach(bundles, function (bundle, i) {
			    sServObj.setDragnDropData(bundle[0], i, 'wav', bundle[1]);
			    sServObj.setDragnDropData(bundle[0], i, 'annotation', bundle[2]);
			    count = i;
			});
			if(count<=sServObj.maxDroppedBundles) {
				sServObj.convertDragnDropData(sServObj.drandropBundles, 0).then( function() {
					loadedMetaDataService.setBundleList(sServObj.bundleList);
					loadedMetaDataService.setCurBndlName(sServObj.bundleList[DragnDropDataService.sessionDefault]);
					loadedMetaDataService.setDemoDbName(sServObj.bundleList[DragnDropDataService.sessionDefault]);	
					sServObj.handleLocalFiles();
					return true;
				});
			}
			else {
			    return false;
			}
		};
		
		sServObj.resetToInitState = function () {
    		sServObj.drandropBundles = [];
	    	sServObj.bundleList = [];
		};
		
		/**
		 * setter sServObj.drandropBundles
		 */
		sServObj.setDragnDropData = function (bundle, i, type, data) {

			if(sServObj.drandropBundles[i] === undefined) {
			    sServObj.drandropBundles[i] = {};
			    DragnDropDataService.convertedBundles[i] = {};
			    DragnDropDataService.convertedBundles[i].name = bundle;
			    sServObj.bundleList.push({
			        name: bundle, 
			        session: sServObj.sessionName
			    });
			    DragnDropDataService.setDefaultSession(i);
			}
			if(type === 'wav') {
                sServObj.drandropBundles[i].wav = data;
			}
			else if(type === 'annotation') {
			    sServObj.drandropBundles[i].annotation = data;
			}
		};
		
		/**
		 * getter sServObj.drandropBundles
		 */
		sServObj.getDragnDropData = function (bundle, type) {
			if(type === 'wav') {
			    return sServObj.drandropBundles[bundle].wav;
			}
			else if(type === 'annotation') {
			    return sServObj.drandropBundles[bundle].annotation;
			}
			else {
			    return false;
			}
		};
		
		sServObj.generateDrop = function (data) {
			var objURL;
		    if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
		        objURL = webkitURL.createObjectURL(sServObj.getBlob(data));
		    } else {
		        objURL = URL.createObjectURL(sServObj.getBlob(data));
		    }	
		    return objURL;
		};
		
		/**
		 *
		 */
		sServObj.getBlob = function(data){
		    var blob;
		    try {
		        blob = new Blob([data], {type: 'text/plain'});
		    } catch (e) { // Backwards-compatibility
		        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
		        blob = new BlobBuilder();
		        blob.append(data);
		        blob = blob.getBlob();
		    }
		    return blob;
		};
		
		
		
		
		sServObj.convertDragnDropData = function (bundles, i) {
		    var defer = $q.defer();
			var data = sServObj.drandropBundles[i];
            var reader = new FileReader();
            var reader2 = new FileReader();
            var res;
            if(bundles.length>i) {
                if(data.wav===undefined) {
                    
                }
                else {
					reader.readAsArrayBuffer(data.wav);
					reader.onloadend = function (evt) {
						if (evt.target.readyState == FileReader.DONE) {
							if (browserDetector.isBrowser.Firefox()) {
								res = evt.target.result;
							} else {
								res = evt.currentTarget.result;
							} 
							Wavparserservice.parseWavArrBuf(res).then(function (wavJSO) { 
								DragnDropDataService.convertedBundles[i].mediaFile = {};
								Soundhandlerservice.wavJSO = wavJSO;
								DragnDropDataService.convertedBundles[i].mediaFile.data = Binarydatamaniphelper.arrayBufferToBase64(wavJSO.origArrBuf);
								DragnDropDataService.convertedBundles[i].ssffFiles =  {};
								var bundle = data.wav.name.substr(0, data.wav.name.lastIndexOf('.'));
								if(data.annotation===undefined) {
									DragnDropDataService.convertedBundles[i].annotation = {
										levels: [],
										links: [],
										sampleRate: wavJSO.SampleRate,
										annotates: bundle,
										name: bundle
									};
									sServObj.convertDragnDropData(bundles, i+1).then( function () {
										defer.resolve();
									});
								}
								else {
									reader2.readAsText(data.annotation);
									reader2.onloadend = function (evt) {
										if (evt.target.readyState == FileReader.DONE) {
											Textgridparserservice.asyncParseTextGrid(evt.currentTarget.result, data.wav.name, bundle).then(function (parseMess) {
												DragnDropDataService.convertedBundles[i].annotation =  parseMess;
												sServObj.convertDragnDropData(bundles, i+1).then( function () {
													defer.resolve();
												});
											});                                                            
										}
									};
								}
							});
						}
					}; 
				}           
            }
            else {
                defer.resolve();
                return defer.promise;
            }			
			return defer.promise;
		};

		/**
		 * handling local file drops after loading them
		 */
        sServObj.handleLocalFiles = function () {
            var validRes;
            var wav = DragnDropDataService.convertedBundles[DragnDropDataService.sessionDefault].mediaFile.data;
            var ab = Binarydatamaniphelper.base64ToArrayBuffer(wav);
            var annotation = DragnDropDataService.convertedBundles[DragnDropDataService.sessionDefault].annotation;
            viewState.showDropZone = false;
            viewState.setState('loadingSaving');
            // reset history
            viewState.somethingInProgress = true;
            viewState.somethingInProgressTxt = 'Loading local File: ' + wav.name;
            Iohandlerservice.httpGetPath('configFiles/standalone_emuwebappConfig.json').then(function (resp) {
                // first element of perspectives is default perspective
                viewState.curPerspectiveIdx = 0;
                ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
                delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
                validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
                if (validRes === true) {
                    ConfigProviderService.curDbConfig = resp.data;
                    viewState.somethingInProgressTxt = 'Parsing WAV file...';
					Wavparserservice.parseWavArrBuf(ab).then(function (messWavParser) {
						var wavJSO = messWavParser;
						viewState.curViewPort.sS = 0;
						viewState.curViewPort.eS = wavJSO.Data.length;
						viewState.curViewPort.selectS = -1;
						viewState.curViewPort.selectE = -1;
						viewState.curClickSegments = [];
						viewState.curClickLevelName = undefined;
						viewState.curClickLevelType = undefined;
						loadedMetaDataService.setCurBndl(DragnDropDataService.convertedBundles[DragnDropDataService.sessionDefault]);
						viewState.resetSelect();
						viewState.curPerspectiveIdx = 0;
						var annot = annotation;
						DataService.setData(annotation);
						var lNames = [];
						var levelDefs = [];
						annotation.levels.forEach(function (l) {
							lNames.push(l.name);
							levelDefs.push({
								'name': l.name,
								'type': l.type,
								'attributeDefinitions': {
									'name': l.name,
									'type': 'string'
								}
							});
						});
						// set level defs
						ConfigProviderService.curDbConfig.levelDefinitions = levelDefs;
						viewState.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);
						ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order = lNames;							
						Soundhandlerservice.wavJSO = wavJSO;

						// set all ssff files
						viewState.somethingInProgressTxt = 'Parsing SSFF files...';
						var validRes = Validationservice.validateJSO('annotationFileSchema', annotation);
						if (validRes === true) {
							DataService.setData(annotation);
							viewState.setState('labeling');
							viewState.somethingInProgress = false;
							viewState.somethingInProgressTxt = 'Done!';
						} else {
							modalService.open('views/error.html', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(function () {
								appStateService.resetToInitState();
							});
						}
				}, function (errMess) {
						modalService.open('views/error.html', 'Error parsing wav file: ' + errMess).then(function () {
							appStateService.resetToInitState();
						});
					});

                }

            });
            viewState.somethingInProgress = false;
        };
		
		
		
		
	
		return sServObj;
	});