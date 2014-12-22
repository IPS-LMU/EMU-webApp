'use strict';

angular.module('emuwebApp')
	.service('Ssffdataservice', function Ssffdataservice(viewState, Soundhandlerservice) {
		// shared service object
		var sServObj = {};

		sServObj.data = [];

		/**
		 *
		 */
		sServObj.getColumnOfTrack = function (trackName, columnName) {
			var res = {};
			sServObj.data.forEach(function (tr) {
				if (tr.ssffTrackName === trackName) {
					tr.Columns.forEach(function (col) {
						if (col.name === columnName) {
							res = col;
						}
					});
				}
			});

			if (res !== undefined) {
				return res;
			} 
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
			if (res !== undefined) {
				return res;
			} 
		};


		/**
		 * calculates the closest audio sample of
		 * the passed in column sample nr
		 */
		sServObj.calculateSamplePosInVP = function (colSampleNr, sampleRate, startTime) {
			var sampleTime = (colSampleNr / sampleRate) + startTime;
			var audioSample = Math.round(sampleTime * Soundhandlerservice.wavJSO.SampleRate);
			return audioSample;
		};

		return sServObj;
	});