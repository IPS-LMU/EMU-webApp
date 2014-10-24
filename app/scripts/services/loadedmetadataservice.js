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
		var demoDbName = ''; // TODO

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
		 */
		sServObj.setBundleList = function (bList) {
			// validate
			var validRes = Validationservice.validateJSO('bundleListSchema', bList);
			if (validRes === true) {
				// set
				bundleList = bList;
				// generate uniqSessionList
				uniqSessionList = genUniqSessionList(bundleList);
			} else {
				dialogService.open('views/error.html', 'ModalCtrl', 'Error validating bundleList: ' + JSON.stringify(validRes, null, 4)).then(function () {
					// $scope.resetToInitState();
					alert('resetToInitState currently not implemented in loadedMetaDataService have to do more refactoring')
				});
			}
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