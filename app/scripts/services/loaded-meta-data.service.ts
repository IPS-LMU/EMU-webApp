import * as angular from 'angular';

/**
 * @ngdoc service
 * @name emuwebApp.loadedMetaDataService
 * @description
 * # loadedMetaDataService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('loadedMetaDataService', function loadedMetaDataService(Validationservice) {

		//////////////////////
		// private vars
		var uniqSessionList = [];
		var bundleList = [];
		var curBndl = {} as any;
		var demoDbName = '';
		var rendOptBndlList = {} as any; // render optimized bundle list

		//////////////////////
		// private functions
		function genUniqSessionList(bndlList) {
			var sList = [];
			var fistSes;
			bndlList.forEach((bndl, idx) => {
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
			bndlList.forEach((bndl) => {
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
		this.setBundleList = function (bList) {
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
		this.getBundleList = function () {
			return bundleList;
		};

		/**
		 * getter for rendOptBndlList
		 */
		this.getRendOptBndlList = function () {
			return rendOptBndlList;
		};

		///////////
		// curBndl 

		/**
		 * getter curBndl
		 */
		this.getCurBndl = function () {
			return curBndl;
		};

		/**
		 * setter curBndl
		 */
		this.setCurBndl = function (bndl) {
			curBndl = bndl;
		};

		/**
		 * remove BndlComment
		 */
		this.setBndlComment = function (comment, key, index) {
			rendOptBndlList[key][index].comment = comment;
		};

		/**
		 * setter BndlFinished
		 */
		this.setBndlFinished = function (finished, key, index) {
			rendOptBndlList[key][index].finishedEditing = finished;
		};


		/**
		 * getter curBndl name
		 */
		this.getCurBndlName = function () {
			return curBndl.name;
		};

		/**
		 * setter curBndl name
		 */
		this.setCurBndlName = function (name) {
			curBndl.name = name;
		};

		///////////
		// timeAnchors

		/**
		 * setter timeAnchors
		 */
		this.setTimeAnchors = function (timeAnchors) {
			curBndl.timeAnchors = timeAnchors;
		};



		//////////////
		// demoDbName

		/**
		 * setter demoDbName
		 */
		this.setDemoDbName = function (name) {
			demoDbName = name;
		};

		/**
		 * getter demoDbName
		 */
		this.getDemoDbName = function () {
			return demoDbName;
		};


		///////////////////
		// uniqSessionList

		/**
		 *
		 */
		this.toggleCollapseSession = function (session) {
			// console.log(session);
			if(uniqSessionList[session] === undefined) {
				uniqSessionList[session] = {};
			}
			uniqSessionList[session].collapsed = !uniqSessionList[session].collapsed;
			// close all other sessions
			Object.keys(uniqSessionList).forEach((key) => {
				if (key !== session) {
					uniqSessionList[key].collapsed = true;
				}
			});
		};
		
		this.openCollapseSession = function (session) {
			// console.log(session);
			uniqSessionList[session] = {};
			uniqSessionList[session].collapsed = false;
			// close all other sessions
			Object.keys(uniqSessionList).forEach((key) => {
				if (key !== session) {
					uniqSessionList[key].collapsed = true;
				}
			});
		};

		/**
		 *
		 */
		// this.updateCollapseSessionState = function (text) {
		// 	angular.forEach(this.getBundleList(), (bundle) => {
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
		this.getSessionCollapseState = function (session) {
			if(uniqSessionList[session] === undefined) {
				return undefined;
			}
			else {
				return uniqSessionList[session].collapsed;
			}
		};


		///////////////////
		// other functions

		/**
		 * reset all private vals to init state
		 */
		this.resetToInitState = function () {
			uniqSessionList = [];
			bundleList = [];
			curBndl = {};
			rendOptBndlList = {};
		};

	});