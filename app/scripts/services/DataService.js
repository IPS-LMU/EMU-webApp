'use strict';

angular.module('emuwebApp')
	.service('DataService', function DataService() {
		// shared service object
		var sServObj = {};
		sServObj.data = {};
		sServObj.maxItemID = 0;

		///////////////////////////////
		// public api
		
		/**
		 * returns all the data
		 * @return the data
		 */
		sServObj.getData = function () {
			return sServObj.data;
		};
		
		/**
		 * returns all the level data
		 * @return the data
		 */
		sServObj.getLevelData = function () {
			return sServObj.data.levels;
		};
		
		/**
		 * returns all the level data
		 * @return the data
		 */
		sServObj.getLinkData = function () {
			return sServObj.data.links;
		};	
		
		/**
		 * returns all the level data
		 * @return the data
		 */
		sServObj.setLinkData = function (data) {
			sServObj.data.links = data;
		};		

		/**
		 * sets annotation data and sets maxItemID 
		 * by parsing id in elements
		 * @param the data
		 */
		sServObj.setData = function (data) {
			angular.copy(data, sServObj.data);
			angular.forEach(sServObj.data.levels, function (level) {
				level.items.forEach(function (item) {
					if (item.id > sServObj.maxItemID) {
						sServObj.maxItemID = item.id;
					}
				});
			});
		};

		/**
		 * called externally by handlekeystrokes
		 */
		sServObj.getNewId = function () {
			sServObj.maxItemID += 1;
			return sServObj.maxItemID;
		};


		/**
		 * called internally by functions
		 */
		sServObj.raiseId = function (amount) {
			sServObj.maxItemID += amount;
		};

		/**
		 * called internally by functions
		 */
		sServObj.lowerId = function (amount) {
			sServObj.maxItemID -= amount;
		};
	
		return sServObj;
	});