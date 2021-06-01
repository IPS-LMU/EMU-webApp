import * as angular from 'angular';

class SsffDataService{
	private SoundHandlerService;
	private ConfigProviderService;
	
	// stores files referred to by ssffTrackDefinitions
	public data;
	constructor(SoundHandlerService, ConfigProviderService){
		this.SoundHandlerService = SoundHandlerService; 
		this.ConfigProviderService = ConfigProviderService;
		this.data = [];
	}
	
	/////////////////////
	// public API
	
	/**
	* Search through ssffTrackDefinitions to find correct
	* file. Then search thought data and return file.
	* @param trackName name of track to get file for
	*/
	public getFile(trackName) {
		var res;
		if (this.ConfigProviderService.curDbConfig.ssffTrackDefinitions !== undefined) {
			this.ConfigProviderService.curDbConfig.ssffTrackDefinitions.forEach((std) => {
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
	public getColumnOfTrack(trackName, columnName) {
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
	public getSampleRateAndStartTimeOfTrack(trackName) {
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
	public calculateSamplePosInVP(colSampleNr, sampleRate, startTime) {
		var sampleTime = (colSampleNr / sampleRate) + startTime;
		var audioSample = Math.round(sampleTime * this.SoundHandlerService.audioBuffer.sampleRate);
		return audioSample;
	};
	
	
}

angular.module('emuwebApp')
.service('SsffDataService', ['SoundHandlerService', 'ConfigProviderService', SsffDataService]);