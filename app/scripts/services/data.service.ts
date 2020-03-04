import * as angular from 'angular';

angular.module('emuwebApp')
	.service('DataService', function DataService() {
		// shared service object
		var sServObj = {} as any;
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
		 * sets all the level data
		 * @param data containing all level data
		 */
		sServObj.setLevelData = function (data) {
			sServObj.data.levels = data;
		};

		/**
		 * returns all the level data
		 * @return data containing all level data
		 */
		sServObj.getLevelData = function () {
			return sServObj.data.levels;
		};


		/**
		 * returns all the level data
		 * @return data containing all level data
		 */
		sServObj.getLevelOrder = function (order) {
			if (sServObj.data.levels !== undefined) {
				return sServObj.data.levels.sort(function (a, b) {
					return order.indexOf(a.name) - order.indexOf(b.name);
				});
			}
		};

		/**
		 * returns a specific level at given position
		 * @param position of the level in the level array
		 */
		sServObj.getLevelDataAt = function (position) {
			return sServObj.data.levels[position];
		};


		/**
		 * inserts a single level into level data at a given position
		 * @param position of the level in the level array
		 * @param newLevel the new level to insert
		 */
		sServObj.insertLevelDataAt = function (position, newLevel) {
			sServObj.data.levels.splice(position, 0, newLevel);
		};

		/**
		 * deletes a single level from level data at a given position
		 * @param position of the level in the level array
		 */
		sServObj.deleteLevelDataAt = function (position) {
			sServObj.data.levels.splice(position, 1);
		};

		/**
		 * returns all the link data
		 * @return the data
		 */
		sServObj.getLinkData = function () {
			return sServObj.data.links;
		};

		/**
		 * sets all the link data
		 * @param data containing all link data
		 */
		sServObj.setLinkData = function (data) {
			sServObj.data.links = data;
		};

		/**
		 * inserts a single link into link data by pushing it
		 * on to the array
		 * @param newLink the new link to insert
		 */
		sServObj.insertLinkData = function (newLink) {
			sServObj.data.links.push(newLink);
		};

		/**
		 * deletes a single link from link data at a given position
		 * @param position of the link in the link array
		 */
		sServObj.deleteLinkDataAt = function (position) {
			sServObj.data.links.splice(position, 1);
		};

		/**
		 * inserts a single link into link data at a given position
		 * @param position of the link in the link array
		 * @param newLink the new link to insert
		 */
		sServObj.insertLinkDataAt = function (position, newLink) {
			sServObj.data.links.splice(position, 0, newLink);
		};

		/**
		 * changes a single link at a given position with new data
		 * @param position of the link in the link array
		 * @param fromNewID the new fromID of the link
		 * @param toNewID the new toID of the link
		 */
		sServObj.changeLinkDataAt = function (position, fromNewID, toNewID) {
			sServObj.data.links[position].fromID = fromNewID;
			sServObj.data.links[position].toID = toNewID;
		};

		/**
		 * sets annotation data and sets maxItemID
		 * by parsing id in elements
		 * should be used to fill links and levels
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
		 * called externally by functions
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
