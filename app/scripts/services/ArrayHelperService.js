'use strict';

angular.module('emuwebApp')
	.service('ArrayHelperService', function ArrayHelperService($q) {
		// shared service object
		var sServObj = {};

		var defer; // defer promise obj

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
		 *
		 */
		sServObj.multiplyEachElement = function (arr, val) {
			for (var i = 0; i < arr.length; i++) {
				arr[i] = arr[i] * val;
			}
			return arr;
		};



		/**
		 * find value between two points
		 * by linearly interpolating them
		 */
		sServObj.interp2points = function (x0, y0, x1, y1, x) {
			return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
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

		/**
		 *
		 */
		sServObj.flattenArrayOfArray = function (arrOfArrs) {
			var merged = [];
			merged = merged.concat.apply(merged, arrOfArrs);
			return merged;
		};

		/**
		 * convert array to an array that contains
		 * objects of the form {x: i, y:y[i]}
		 */
		sServObj.convertArrayToXYjsoArray = function (y) {
			var xyArray = [];
			for (var i = 0; i < y.length; i++) {
				xyArray.push({
					x: i,
					y: y[i]
				});
			}
			return xyArray;
		};


		return sServObj;
	});