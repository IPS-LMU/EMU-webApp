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

		/**
		 * setter sServObj.drandropBundles
		 */
		sServObj.setDragnDropData = function (bundle, type, data) {
			if(sServObj.drandropBundles[bundle] === undefined) {
			    sServObj.drandropBundles[bundle] = {};
			    sServObj.bundleList.push({name: bundle, session: sServObj.sessionName})
			    loadedMetaDataService.setBundleList(sServObj.bundleList);
			    loadedMetaDataService.setCurBndlName(bundle);
			}
			if(type === 'wav') {
			    sServObj.drandropBundles[bundle].wav = data;
			}
			else if(type === 'grid') {
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
		
		sServObj.setSession = function (name) {
		    sServObj.sessionName = name;
		};
		
		sServObj.getBundle = function (name, session) {
    		return sServObj.drandropBundles[name];
		};
	
		return sServObj;
	});