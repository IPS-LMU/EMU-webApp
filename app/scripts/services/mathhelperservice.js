'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.mathHelperService
 * @description
 * # mathHelperService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('mathHelperService', function () {

		//shared service object to be returned
		var sServObj = {};

		//////////////////////
		//////////////////////
		// public API

		/**
		 * calculate the closest power of two that is
		 * greater than the passed in number
		 * @param num
		 * @returns power of two value
		 */
		sServObj.calcClosestPowerOf2Gt = function (num) {
			var curExp = 0;

			while (Math.pow(2, curExp) < num) {
				curExp = curExp + 1;
			}

			return (Math.pow(2, curExp));

		};

		return (sServObj);
	});