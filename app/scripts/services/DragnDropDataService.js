'use strict';

angular.module('emuwebApp')
	.service('DragnDropDataService', function DragnDropDataService($q, $rootScope, Soundhandlerservice, Binarydatamaniphelper, browserDetector, Wavparserservice, Textgridparserservice, loadedMetaDataService) {
		// shared service object
		var sServObj = {};
		sServObj.drandropBundles = [];
		sServObj.convertedBundles = [];
		sServObj.bundleList = [];
		sServObj.sessionName = 'File(s)';
		sServObj.sessionDefault = '';

		///////////////////////////////
		// public api
		
		///////////////////
		// drag n drop data 
		sServObj.setData = function (bundles) {
		    var prom = [];
			angular.forEach(bundles, function (bundle, i) {
			    sServObj.setDragnDropData(bundle[0], i, 'wav', bundle[1]);
			    sServObj.setDragnDropData(bundle[0], i, 'annotation', bundle[2]);
			});
			sServObj.convertDragnDropData(sServObj.drandropBundles, 0).then( function() {
			    $rootScope.$broadcast('handle');
			});
		};
		
		/**
		 * setter sServObj.drandropBundles
		 */
		sServObj.setDragnDropData = function (bundle, i, type, data) {
			if(sServObj.drandropBundles[i] === undefined) {
			    sServObj.drandropBundles[i] = {};
			    sServObj.convertedBundles[i] = {};
			    sServObj.convertedBundles[i].name = bundle;
			    sServObj.bundleList.push({
			        name: bundle, 
			        session: sServObj.sessionName,
			        draggable: true,
			        downloadurl: ''
			    })
			    loadedMetaDataService.setBundleList(sServObj.bundleList);
			    loadedMetaDataService.setCurBndlName(bundle);
			    loadedMetaDataService.setDemoDbName(bundle);
			    sServObj.sessionDefault = i;
			}
			if(type === 'wav') {
                sServObj.drandropBundles[i].wav = data;
			}
			else if(type === 'annotation') {
			    sServObj.drandropBundles[i].annotation = data;
			}
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
								sServObj.convertedBundles[i].mediaFile = {};
								Soundhandlerservice.wavJSO = wavJSO;
								sServObj.convertedBundles[i].mediaFile.data = Binarydatamaniphelper.arrayBufferToBase64(wavJSO.origArrBuf);
								sServObj.convertedBundles[i].ssffFiles =  {};
								var bundle = data.wav.name.substr(0, data.wav.name.lastIndexOf('.'));
								if(data.annotation===undefined) {
									sServObj.convertedBundles[i].annotation = {
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
												sServObj.convertedBundles[i].annotation =  parseMess;
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
		
		/**
		 * getter sServObj.drandropBundles
		 */
		sServObj.getDragnDropDataDefault = function () {
			return sServObj.drandropBundles[sServObj.sessionDefault];
		};
		
		sServObj.setSession = function (name) {
		    sServObj.sessionName = name;
		};
		
		sServObj.getBundle = function (name, session) {
		    var defer = $q.defer();
		    var ret = {}
		    angular.forEach(sServObj.convertedBundles, function (bundle, i) {
		        if(bundle.name === name) {
		            defer.resolve({
		                status: 200,
		                data: bundle
		            });
		        }
		    });
		    return defer.promise;
		};
	
		return sServObj;
	});