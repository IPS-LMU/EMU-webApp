'use strict';

angular.module('emuwebApp')
	.service('Ssffdataservice', function Ssffdataservice() {
		// shared service object
		var sServObj = {};

		sServObj.data = [];

		/**
		 *
		 */
		sServObj.getColumnOfTrack = function (trackName, columnName) {
			var res;
			sServObj.data.forEach(function (tr) {
				if (tr.ssffTrackName === trackName) {
					tr.Columns.forEach(function (col) {
						if (col.name === columnName) {
							res = col;
						}
					});
				}
			});

			return res;
		};


		/**
		 *
		 */
		sServObj.getSampleRateAndStartTimeOfTrack = function (trackName) {
			var res = {};
			sServObj.data.forEach(function (tr) {
				if (tr.ssffTrackName === trackName) {
					res.sampleRate = tr.sampleRate;
					res.startTime = tr.startTime;
				}
			});

			return res;
		};

		return sServObj;
	});