'use strict';

angular.module('emulvcApp')
	.service('Drawhelperservice', function Drawhelperservice() {

		//shared service object to be returned
		var sServObj = {};

		/**
		 *
		 */

		sServObj.getX = function(e) {
			return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
		};

		/**
		 *
		 */

		sServObj.getY = function(e) {
			return e.offsetY * (e.originalEvent.srcElement.height / e.originalEvent.srcElement.clientHeight);
		};

		return sServObj;
	});