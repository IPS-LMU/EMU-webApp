'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.loadedMetaDataService
 * @description
 * # loadedMetaDataService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('loadedMetaDataService', function loadedMetaDataService(Validationservice) {
		// shared service object
		var sServObj = {};

		//////////////////////
		// private vars
		var uniqSessionList = [];
		var bundleList = [];
		var curBndl = {};
		var demoDbName = '';
		var drandropBundles = [];
		var rendOptBndlList = {}; // render optimized bundle list

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

		function genRendOptBndlList(bndlList) {
			bndlList.forEach(function (bndl, idx) {
				if (rendOptBndlList[bndl.session] === undefined) {
					rendOptBndlList[bndl.session] = [];
				}
				rendOptBndlList[bndl.session].push(bndl);
			});
			return rendOptBndlList;
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
				// generate render optimized bundlList
				rendOptBndlList = genRendOptBndlList(bundleList);
			}
			return validRes;
		};

		/**
		 * getter for bundleList
		 */
		sServObj.getBundleList = function () {
			return bundleList;
		};

		/**
		 * getter for rendOptBndlList
		 */
		sServObj.getRendOptBndlList = function () {
			return rendOptBndlList;
		};	

		///////////
		// curBndl 

		/**
		 * getter curBndl
		 */
		sServObj.getCurBndl = function () {
			return curBndl;
		};

		/**
		 * setter curBndl
		 */
		sServObj.setCurBndl = function (bndl) {
			curBndl = bndl;
		};
		
		/**
		 * setter BndlComment
		 */
		sServObj.setBndlComment = function (bndl, key, index) {
			rendOptBndlList[key][index].comment = bndl.comment;
		};		
		
		/**
		 * setter BndlFinished
		 */
		sServObj.setBndlFinished = function (key, index, finised) {
			rendOptBndlList[key][index].finishedEditing = finised;
		};		


		/**
		 * getter curBndl name
		 */
		sServObj.getCurBndlName = function () {
			return curBndl.name;
		};

		/**
		 * setter curBndl name
		 */
		sServObj.setCurBndlName = function (name) {
			curBndl.name = name;
		};



		//////////////
		// demoDbName

		/**
		 * setter demoDbName
		 */
		sServObj.setDemoDbName = function (name) {
			demoDbName = name;
		};

		/**
		 * getter demoDbName
		 */
		sServObj.getDemoDbName = function () {
			return demoDbName;
		};


		///////////////////
		// uniqSessionList

		/**
		 *
		 */
		sServObj.toggleCollapseSession = function (session) {
			uniqSessionList[session].collapsed = !uniqSessionList[session].collapsed;
			// close all other sessions
			Object.keys(uniqSessionList).forEach(function (key) {
				if (key !== session) {
					uniqSessionList[key].collapsed = true;
				}
			});
		};

		/**
		 *
		 */
		// sServObj.updateCollapseSessionState = function (text) {
		// 	angular.forEach(sServObj.getBundleList(), function (bundle) {
		// 		if (bundle.name.indexOf(text)) {
		// 			uniqSessionList[bundle.session].collapsed = false;
		// 		} else {
		// 			uniqSessionList[bundle.session].collapsed = true;
		// 		}
		// 	});
		// };

		/**
		 *
		 */
		sServObj.getSessionCollapseState = function (session) {
			return uniqSessionList[session].collapsed;
		};


		///////////////////
		// other functions

		/**
		 * reset all private vals to init state
		 */
		sServObj.resetToInitState = function () {
			uniqSessionList = [];
			bundleList = [];
			curBndl = {};
			rendOptBndlList = {};
		};

		return (sServObj);
	});