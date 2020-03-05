import * as angular from 'angular';

angular.module('emuwebApp')
	.service('DataService', function DataService() {

		this.data = {
			levels: []
		};
		this.maxItemID = 0;

		///////////////////////////////
		// public api

		/**
		 * returns all the data
		 * @return the data
		 */
		this.getData = function () {
			return this.data;
		};

		/**
		 * sets all the level data
		 * @param data containing all level data
		 */
		this.setLevelData = function (data) {
			this.data.levels = data;
		};

		/**
		 * returns all the level data
		 * @return data containing all level data
		 */
		this.getLevelData = function () {
			return this.data.levels;
		};


		/**
		 * returns all the level data
		 * @return data containing all level data
		 */
		this.getLevelOrder = function (order) {
			if (this.data.levels !== undefined) {
				return this.data.levels.sort(function (a, b) {
					return order.indexOf(a.name) - order.indexOf(b.name);
				});
			}
		};

		/**
		 * returns a specific level at given position
		 * @param position of the level in the level array
		 */
		this.getLevelDataAt = function (position) {
			return this.data.levels[position];
		};


		/**
		 * inserts a single level into level data at a given position
		 * @param position of the level in the level array
		 * @param newLevel the new level to insert
		 */
		this.insertLevelDataAt = function (position, newLevel) {
			this.data.levels.splice(position, 0, newLevel);
		};

		/**
		 * deletes a single level from level data at a given position
		 * @param position of the level in the level array
		 */
		this.deleteLevelDataAt = function (position) {
			this.data.levels.splice(position, 1);
		};

		/**
		 * returns all the link data
		 * @return the data
		 */
		this.getLinkData = function () {
			return this.data.links;
		};

		/**
		 * sets all the link data
		 * @param data containing all link data
		 */
		this.setLinkData = function (data) {
			this.data.links = data;
		};

		/**
		 * inserts a single link into link data by pushing it
		 * on to the array
		 * @param newLink the new link to insert
		 */
		this.insertLinkData = function (newLink) {
			this.data.links.push(newLink);
		};

		/**
		 * deletes a single link from link data at a given position
		 * @param position of the link in the link array
		 */
		this.deleteLinkDataAt = function (position) {
			this.data.links.splice(position, 1);
		};

		/**
		 * inserts a single link into link data at a given position
		 * @param position of the link in the link array
		 * @param newLink the new link to insert
		 */
		this.insertLinkDataAt = function (position, newLink) {
			this.data.links.splice(position, 0, newLink);
		};

		/**
		 * changes a single link at a given position with new data
		 * @param position of the link in the link array
		 * @param fromNewID the new fromID of the link
		 * @param toNewID the new toID of the link
		 */
		this.changeLinkDataAt = function (position, fromNewID, toNewID) {
			this.data.links[position].fromID = fromNewID;
			this.data.links[position].toID = toNewID;
		};

		/**
		 * sets annotation data and sets maxItemID
		 * by parsing id in elements
		 * should be used to fill links and levels
		 * @param the data
		 */
		this.setData = function (data) {
			angular.copy(data, this.data);
			this.data.levels.forEach((level) => {
				level.items.forEach((item) => {
					if (item.id > this.maxItemID) {
						this.maxItemID = item.id;
					}
				});
			});
		};

		/**
		 * called externally by functions
		 */
		this.getNewId = function () {
			this.maxItemID += 1;
			return this.maxItemID;
		};


		/**
		 * called internally by functions
		 */
		this.raiseId = function (amount) {
			this.maxItemID += amount;
		};

		/**
		 * called internally by functions
		 */
		this.lowerId = function (amount) {
			this.maxItemID -= amount;
		};

	});
