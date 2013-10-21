'use strict';

angular.module('emulvcApp')
	.service('Drawhelperservice', function Drawhelperservice() {

		//shared service object to be returned
		var sServObj = {};

		sServObj.osciPeaks = [];		

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


		/**
		 * get current peaks to be drawn
		 * if drawing over sample exact -> samples
		 * if multiple samples per pixel -> calculate envelope points
		 */

		sServObj.calculatePeaks = function(viewState, canvas, data) {
			var k = (viewState.curViewPort.eS - viewState.curViewPort.sS) / canvas.width; // PCM Samples per new pixel

			var numberOfChannels = 1; // hardcode for now...

			var peaks = [];
			var minPeak = Infinity;
			var maxPeak = -Infinity;

			var relData;

			if (k <= 1) {
				// check if view at start            
				if (viewState.curViewPort.sS === 0) {
					relData = data.subarray(viewState.curViewPort.sS, viewState.curViewPort.eS + 2); // +2 to compensate for length
				} else {
					relData = data.subarray(viewState.curViewPort.sS - 1, viewState.curViewPort.eS + 2); // +2 to compensate for length
				}
				minPeak = Math.min.apply(Math, relData);
				maxPeak = Math.max.apply(Math, relData);
				peaks = Array.prototype.slice.call(relData);

			} else {
				relData = data.subarray(viewState.curViewPort.sS, viewState.curViewPort.eS);

				for (var i = 0; i < canvas.width; i++) {
					var sum = 0;
					for (var c = 0; c < numberOfChannels; c++) {

						var vals = relData.subarray(i * k, (i + 1) * k);
						var peak = -Infinity;

						var av = 0;
						for (var p = 0, l = vals.length; p < l; p++) {
							if (vals[p] > peak) {
								peak = vals[p];
							}
							av += vals[p];
						}
						sum += av / vals.length;
					}

					peaks[i] = sum;
					if (sum > maxPeak) {
						maxPeak = sum;
					}
				}
			} //else
			return {
				"peaks": peaks,
				"minPeak": minPeak,
				"maxPeak": maxPeak,
				"samplePerPx": k
			};
		};



		return sServObj;
	});