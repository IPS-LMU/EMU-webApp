import * as angular from 'angular';

angular.module('emuwebApp')
	.service('Ssffdataservice', function Ssffdataservice(viewState, Soundhandlerservice, ConfigProviderService) {

		// stores files referred to by ssffTrackDefinitions
		this.data = [];


		/////////////////////
		// public API

		/**
		 * Search through ssffTrackDefinitions to find correct
		 * file. Then search thought data and return file.
		 * @param trackName name of track to get file for
		 */
		this.getFile = function (trackName) {
			var res;
			if (ConfigProviderService.curDbConfig.ssffTrackDefinitions !== undefined) {
				ConfigProviderService.curDbConfig.ssffTrackDefinitions.forEach((std) => {
					if (std.name === trackName) {
						this.data.forEach((f) => {
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
		this.getColumnOfTrack = function (trackName, columnName) {
			var res;
			var file = this.getFile(trackName);


			if (file !== undefined) {
				file.Columns.forEach((col) => {
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
		this.getSampleRateAndStartTimeOfTrack = function (trackName) {
			var res = {} as any;
			var file = this.getFile(trackName);

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
		this.calculateSamplePosInVP = function (colSampleNr, sampleRate, startTime) {
			var sampleTime = (colSampleNr / sampleRate) + startTime;
			var audioSample = Math.round(sampleTime * Soundhandlerservice.audioBuffer.sampleRate);
			return audioSample;
		};

	});