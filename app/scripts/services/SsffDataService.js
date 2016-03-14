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
			if (ConfigProviderService.curDbConfig.ssffTrackDefinitions !== undefined) {
				var tD = ConfigProviderService.curDbConfig.ssffTrackDefinitions;
				for (var x = 0; x < tD.length; x++) {
					if (tD[x].name === trackName) {
						for (var y = 0; y < sServObj.data.length; y++) {
							if (sServObj.data[y].fileExtension === tD[x].fileExtension) {
								return sServObj.data[y];
							}
						}
					}
				}
			}
			return null;
		};
		
		/**
		 * Search through ssffTrackDefinitions to find correct
		 * extension.
		 * @param trackName name of track to get extension for
		 */
		sServObj.getExtension = function (trackName) {
			if (ConfigProviderService.curDbConfig.ssffTrackDefinitions !== undefined) {
				var tD = ConfigProviderService.curDbConfig.ssffTrackDefinitions;
				for (var x = 0; x < tD.length; x++) {
					if (tD[x].name === trackName) {
						return tD[x].fileExtension;
					}
				}
			}
			return null;
		};	
		
		/**
		 * Search through ssffTrackDefinitions to find correct
		 * extension.
		 * @param trackName name of track to get extension for
		 */
		sServObj.getFileByExtension = function (extension) {
			for (var y = 0; y < sServObj.data.length; y++) {
				if (sServObj.data[y].fileExtension === extension) {
					return sServObj.data[y];
				}
			}
			return null;
		};		
			

		/**
		 *
		 */
		sServObj.getColumnOfTrack = function (trackName, columnName, file) {
			var res;
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
		sServObj.getSampleRateAndStartTimeOfTrack = function (trackName, file) {
			var res = {};

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