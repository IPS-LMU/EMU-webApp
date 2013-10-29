'use strict';

angular.module('emulvcApp')
	.service('Soundhandlerservice', function Soundhandlerservice($document) {
		// shared service object
		var sServObj = {};

		sServObj.wavJSO = {};

		sServObj.paused = true;

		sServObj.playEndTime = Infinity;

		sServObj.player = $document[0].createElement('audio');

		sServObj.player.playEndTime = Infinity;

		sServObj.player.curPlayPos = 0;

		sServObj.setPlayerSrc = function(buf) {
			var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
			this.player.src = 'data:audio/wav;base64,' + base64String;
		};

		sServObj.playFromTo = function(startTime, endTime) {
			this.player.currentTime = startTime;
			this.player.playEndTime = endTime;
			this.player.play();
		};

		sServObj.player.addEventListener('timeupdate', function(evt) {
			if (this.currentTime >= this.playEndTime) {
				// console.log(this.currentTime);
				this.pause();
			}
			// console.log(this.player.currentTime);
		}, false);


		return sServObj;


		// sServObj.currentBuffer = {};

		// generate audio context according to browser type
		// if (navigator.userAgent.indexOf('Firefox') !== -1) {
		// 	sServObj.ac = new window.AudioContext();
		// } else {
		// 	sServObj.ac = new window.webkitAudioContext();

		// }

		// // check if sample rate is 44100...
		// if (sServObj.ac.sampleRate !== 44100) {
		// 	alert('sample rate not 44100!! Currently only 44100 supported! Sorry');
		// }
		// sServObj.destination = sServObj.ac.destination;

		// /**
		//  * decode audio file data
		//  *
		//  * @param {AudioBuffer} audioData Audio data.
		//  * @param cb call back function to call when done decoding
		//  */
		// sServObj.decodeAudioFile = function(audioData, cb) {
		// 	var my = this;

		// 	this.pause();
		// 	// console.log(audioData)

		// 	this.ac.decodeAudioData(
		// 		audioData,
		// 		function(buffer) {
		// 			my.currentBuffer = buffer;
		// 			my.lastStart = 0; // all set to 0?????
		// 			my.lastPause = 0;
		// 			my.startTime = null;
		// 			//console.log(buffer);
		// 			cb(buffer);
		// 		},
		// 		Error
		// 	);


		// };

		// /**
		//  * Plays the loaded audio region.
		//  *
		//  * @param {Number} start Start offset in seconds,
		//  * relative to the beginning of the track.
		//  *
		//  * @param {Number} end End offset in seconds,
		//  * relative to the beginning of the track.
		//  */
		// sServObj.play = function(start, end, delay) {

		// 	if (!this.currentBuffer) {
		// 		return;
		// 	}


		// 	// this.pause();

		// 	this.setSource(this.ac.createBufferSource());
		// 	this.source.buffer = this.currentBuffer;

		// 	//console.log(this.source);
		// 	//console.log(this.currentBuffer);
		// 	//if (null == start) { start = this.getCurrentTime(); }
		// 	//if (null == end  ) { end = this.source.buffer.duration; }
		// 	//if (null == delay) { delay = 0; }

		// 	this.lastStart = start;
		// 	this.startTime = this.ac.currentTime;

		// 	this.source.start(delay, start, end - start); //when, offset, duration in seconds
		// 	// this.source.noteOn(delay, start, end - start); //when, offset, duration in seconds

		// 	this.paused = false;
		// };

		// /**
		//  *
		//  */
		// sServObj.setSource = function(source) {
		// 	// this.source && this.source.disconnect();
		// 	this.source = source;
		// 	// this.source.connect(this.analyser);
		// 	// this.source.connect(this.proc);

		// 	this.source.connect(this.destination);
		// 	// this.source.connect(this.verb);
		// };


		// /**
		//  * Pauses the loaded audio.
		//  */
		// sServObj.pause = function(delay) {
		// 	if (!this.currentBuffer || this.paused) {
		// 		return;
		// 	}

		// 	// this.lastPause = this.getCurrentTime();

		// 	this.source.stop(delay || 0);

		// 	// this.source.noteOff(delay || 0); // deprecated version for safari... yay

		// 	this.paused = true;
		// };

	});