'use strict';

angular.module('emuwebApp')
	.service('Ssffdataservice', function Ssffdataservice(viewState, Soundhandlerservice, ConfigProviderService) {
		// shared service object
		var sServObj = {};

		// stores files referred to by ssffTrackDefinitions
		sServObj.data = [];


		/////////////////////
		// public API
		
		sServObj.setData = function (data) {
			sServObj.data = data;
		};

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
		sServObj.getColumnOfTrack = function (trackName, columnName) {
			var file = sServObj.getFile(trackName);
			for (var y = 0; y < file.Columns.length; y++) {
				if(file.Columns[y].name === columnName) {
					return file.Columns[y];
				}
			}
			return undefined;
		};


		/**
		 *
		 */
		sServObj.getSampleRateAndStartTimeOfTrack = function (trackName) {
			var data = sServObj.getFileByExtension(sServObj.getExtension(trackName));
			var res = {};

			if (data !== undefined) {
				res.sampleRate = data.sampleRate;
				res.startTime = data.startTime;
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