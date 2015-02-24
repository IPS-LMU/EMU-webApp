'use strict';

angular.module('emuwebApp')
	.service('Ssffdataservice', function Ssffdataservice(viewState, Soundhandlerservice, ConfigProviderService) {
		// shared service object
		var sServObj = {};

		// stores files referred to by ssffTrackDefinitions
		sServObj.data = [];



		/////////////////////
		// public API

		/**
		 * Search through ssffTrackDefinitions to find correct
		 * file. Then search thought data and return file.
		 * @param trackName name of track to get file for
		 */
		sServObj.getFile = function (trackName) {
			var res;
			if (ConfigProviderService.curDbConfig.ssffTrackDefinitions !== undefined) {
				ConfigProviderService.curDbConfig.ssffTrackDefinitions.forEach(function (std) {
					if (std.name === trackName) {
						sServObj.data.forEach(function (f) {
							if (f.fileExtension === std.fileExtension) {
								res = f;
							}
						});
					}
				});
			}
			return res;
		};

		/**
		 *
		 */
		sServObj.getColumnOfTrack = function (trackName, columnName) {
			var res;
			var file = sServObj.getFile(trackName);


			if (file !== undefined) {
				file.Columns.forEach(function (col) {
					if (col.name === columnName) {
						res = col;
					}
				});
				return res;
			}
		};


		/**
		 *
		 */
		sServObj.getSampleRateAndStartTimeOfTrack = function (trackName) {
			var res = {};
			var file = sServObj.getFile(trackName);

			if (file !== undefined) {
				res.sampleRate = file.sampleRate;
				res.startTime = file.startTime;
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