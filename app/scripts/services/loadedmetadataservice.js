'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.loadedMetaDataService
 * @description
 * # loadedMetaDataService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('loadedMetaDataService', function loadedMetaDataService(dialogService, Validationservice) {
		// shared service object
		var sServObj = {};

		//////////////////////
		// private vars
		var uniqSessionList = [];
		var bundleList = [];
		var curBndl = {};
		var demoDbName = '';

		//////////////////////
		// private functions
		function genUniqSessionList(bndlList) {
			var sList = [];
			var fistSes;
			bndlList.forEach(function (bndl, idx) {
				sList[bndl.session] = {
					'collapsed': true
				};
				if (idx === 0) {
					fistSes = bndl.session;
				}
			});
			// open fist session up 
			sList[fistSes].collapsed = false;
			return sList;
		}

		//////////////////////
		//////////////////////
		// public API

		///////////////
		// bundleList

		/**
		 * setter for bundleList
		 * @returns validation result for bundle list
		 */
		sServObj.setBundleList = function (bList) {
			// validate
			var validRes = Validationservice.validateJSO('bundleListSchema', bList);
			if (validRes === true) {
				// set
				bundleList = bList;
				// generate uniqSessionList
				uniqSessionList = genUniqSessionList(bundleList);
			}
			return validRes;
		};

		/**
		 * getter for bundleList
		 */
		sServObj.getBundleList = function () {
			return bundleList;
		};

		///////////
		// curBndl 

		/**
		 * set curBndl
		 */
		sServObj.setCurBndl = function (bndl) {
			curBndl = bndl;
		};

		/**
		 * setter curBndl name
		 */
		sServObj.setCurBndlName = function (name) {
			curBndl.name = name;
		};

		/**
		 * setter curBndl name
		 */
		sServObj.getCurBndlName = function () {
			return curBndl.name;
		};

		/**
		 * getter curBndl
		 */
		sServObj.getCurBndl = function () {
			return curBndl;
		};

		//////////////
		// demoDbName

		/**
		 * setter curBndl
		 */
		sServObj.setDemoDbName = function (name) {
			demoDbName = name;
		};

		/**
		 * getter curBndl
		 */
		sServObj.getDemoDbName = function () {
			return demoDbName;
		};

		///////////////////
		// uniqSessionList

		/**
		 * 
		 */
		sServObj.toggleCollapseSession = function(session){
			uniqSessionList[session].collapsed = !uniqSessionList[session].collapsed;
		};

		/**
		 * 
		 */
		sServObj.getSessionCollapseState = function(session){
			return uniqSessionList[session].collapsed;
		}



		///////////////////
		// other functions

		/**
		 * reset all private vals to init state
		 */
		sServObj.resetToInitState = function () {
			uniqSessionList = [];
			bundleList = [];
			curBndl = {};
		}

		return (sServObj);
	});