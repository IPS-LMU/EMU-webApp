'use strict';

angular.module('emuwebApp')
	.service('ArrayHelperService', function ArrayHelperService() {
		// shared service object
		var sServObj = {};


		/**
		 * convert values of array to max values
		 *
		 * @param arr array to convert
		 * @returns array containing Math.abs() values
		 */
		sServObj.convertToAbsValues = function (arr) {
			for (var i = 0; i < arr.length; i++) {
				arr[i] = Math.abs(arr[i]);
			}
			return arr;
		};

		/**
		 * find threshold in array (an adapted reimplementation of findth by
		 * Phil Hoole Version 17.6.2006)
		 *
		 * @param x
		 * @param minVal
		 * @param maxVal
		 * @param threshold
		 * @param direction
		 * @returns array containing found thresholds
		 */
		sServObj.findThresholds = function (x, minVal, maxVal, threshold, direction) {


			var thdir = direction;
			var thdat = minVal + (maxVal - minVal) * threshold;

			var xx = x * thdir; // handle positive/neg.

			var lx = length(xx);
			var xsh = xx.slice(1, xx.length);
			var loguk = 1;
			var higuk = lx;


			var allThreshIdxs = [];
			for (var i = 0; i < arr.length - 1; i++) {
				// check if stepping over threshold
				if ((arr[i] < thVal && arr[i + 1] > thVal) || (arr[i] > thVal && arr[i + 1] < thVal)) {
					allThreshIdxs.push(i);
				}
			}
			return allThreshIdxs;
		};

		/**
		 * find min or maximum value in array
		 *
		 * @param arr array to search in
		 * @param minOrMax string value either 'min' or 'max'
		 * @returns object with attributes val and idx
		 */
		sServObj.findMinMax = function (arr, minOrMax) {
			var val, idx;
			if (minOrMax === 'min') {
				val = Infinity;
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] < val) {
						val = arr[i];
						idx = i;
					}
				}
			} else if (minOrMax === 'max') {
				val = -Infinity;
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] > val) {
						val = arr[i];
						idx = i;
					}
				}
			}

			return {
				'val': val,
				'idx': idx
			};
		};



		return sServObj;
	});