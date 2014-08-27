'use strict';

angular.module('emuwebApp')
	.service('ArrayHelperService', function ArrayHelperService($q, dialogService) {
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
		 * find threshold in array (an adapted reimplementation of findth.m by
		 * Phil Hoole Version 17.6.2006)
		 *
		 * @param x
		 * @param minVal
		 * @param maxVal
		 * @param threshold
		 * @param direction
		 * @param descriptions describes the task
		 * @returns array containing found thresholds
		 */
		sServObj.interactiveFindThresholds = function (x, minVal, maxVal, threshold, direction, description) {
			console.log('interactiveFindThresholds');

			var thdat = minVal + (maxVal - minVal) * threshold;

			var thdir = direction;

			thdat = thdat * thdir


			var xx = sServObj.multiplyEachElement(x, thdir); // handle positive/neg.

			var lx = xx.length;
			var xsh = xx.slice(1, lx);
			var loguk = 0;
			var higuk = lx - 1;

			// console.log(lx);
			// console.log(xx);
			// console.log(xsh);
			// console.log(loguk);
			// console.log(higuk);

			// vz=find((xsh>=thdat)&(xx(1:(lx-1))<thdat));
			var vz = [];
			for (var i = 0; i < xx.length; i++) {
				if ((xsh[i] >= thdat) && (xx[i] < thdat)) {
					vz.push(i);
				}
			}

			// anavv=find(vz>=loguk & vz<=higuk);
			var anavv = [];
			for (var i = 0; i < vz.length; i++) {
				if ((vz[i] >= loguk) && vz[i] <= higuk) {
					anavv.push(i);
				}
			}

			if (anavv.length > 1) {
				defer = $q.defer();
				var infos = {};
				infos.description = description;
				infos.options = [];
				infos.y = xx;
				infos.minVal = minVal;
				infos.maxVal = maxVal;
				infos.threshold = threshold;
				for (var i = 0; i < vz.length; i++) {
					infos.options.push({
						'thresholdIdx': vz[i],
						'thresholdValue': xx[i],
					})
				};

				dialogService.open('views/selectModalCtrl.html', 'SelectmodalCtrl', infos).then(function (resp) {
					console.log(resp);
					var ap = vz[anavv[resp]];
					// console.log('-----')
					// console.log(xx[ap])
					// console.log(xx[ap + 1])
					// console.log(ap);
					// console.log(ap + 1);
					ap = sServObj.interp2points(xx[ap], ap, xx[ap + 1], ap + 1, thdat);

					console.log('done with selectmodal modal');
					console.log(ap);
					defer.resolve(ap);
				});
				return defer.promise;
			} else if (anavv.length === 0) {
				defer = $q.defer();
				dialogService.open('views/error.html', 'ModalCtrl', 'Could not find any values that step over the threshold!!').then(function () {
					defer.reject();
				});
				return defer.promise;
			} else {
				defer = $q.defer();
				var ap = vz[anavv[0]];
				ap = sServObj.interp2points(xx[ap], ap, xx[ap + 1], ap + 1, thdat);
				defer.resolve(ap);
				return defer.promise;
			}

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