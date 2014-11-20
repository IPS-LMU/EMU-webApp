'use strict';

angular.module('emuwebApp')
	.service('DragnDropDataService', function DragnDropDataService($q, $rootScope, browserDetector, Wavparserservice, loadedMetaDataService) {
		// shared service object
		var sServObj = {};
		sServObj.drandropBundles = [];
		sServObj.bundleList = [];
		sServObj.sessionName = 'File(s)';
		sServObj.sessionDefault = '';

		///////////////////////////////
		// public api
		
		///////////////////
		// drag n drop data 
		sServObj.setData = function (bundles) {
		    var prom = [];
			angular.forEach(bundles, function (bundle) {
				prom.push(
				    sServObj.setDragnDropData(bundle[0], 'wav', bundle[1]).then( function () {
				        sServObj.setDragnDropData(bundle[0], 'annotation', bundle[2])
				    })
				);

			})
			$q.all(prom).then(function () {
                $rootScope.$broadcast('handle', sServObj.drandropBundles);
            });
		};
		
		/**
		 * setter sServObj.drandropBundles
		 */
		sServObj.setDragnDropData = function (bundle, type, data) {
		    var defer = $q.defer();
			if(sServObj.drandropBundles[bundle] === undefined) {
			    sServObj.drandropBundles[bundle] = {};
			    sServObj.bundleList.push({
			        name: bundle, 
			        session: sServObj.sessionName,
			        draggable: true,
			        downloadurl: ''
			    })
			    loadedMetaDataService.setBundleList(sServObj.bundleList);
			    loadedMetaDataService.setCurBndlName(bundle);
			    sServObj.sessionDefault = bundle;
			}
			if(type === 'wav') {
                var reader = new FileReader();
                var validRes;
                reader.readAsArrayBuffer(data);
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        if (browserDetector.isBrowser.Firefox()) {
                            validRes = evt.target.result;
                        } else {
                            validRes = evt.currentTarget.result;
                        }
                        
                        Wavparserservice.parseWavArrBuf(validRes).then(function (wavJSO) {
                            console.log(wavJSO);
                            sServObj.drandropBundles[bundle].mediaFile = wavJSO;
                            defer.resolve();
                        });
                    }
                };
			}
			else if(type === 'annotation') {
			    sServObj.drandropBundles[bundle].grid = data;
			    defer.resolve();
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
			else if(type === 'grid') {
			    return sServObj.drandropBundles[bundle].grid;
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
    		return sServObj.drandropBundles[name];
		};
	
		return sServObj;
	});