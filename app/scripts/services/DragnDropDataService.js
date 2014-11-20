'use strict';

angular.module('emuwebApp')
	.service('DragnDropDataService', function DragnDropDataService(loadedMetaDataService) {
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
			angular.forEach(bundles, function (bundle) {
				sServObj.setDragnDropData(bundle[0], 'wav', bundle[1]);
				sServObj.setDragnDropData(bundle[0], 'annotation', bundle[2]);
			});

		};
		
		/**
		 * setter sServObj.drandropBundles
		 */
		sServObj.setDragnDropData = function (bundle, type, data) {
		    console.log(bundle, type, data);
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
			    sServObj.drandropBundles[bundle].wav = data;
			}
			else if(type === 'annotation') {
			    sServObj.drandropBundles[bundle].grid = data;
			}
			else {
			    sServObj.drandropBundles[bundle].other = data;
			}
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