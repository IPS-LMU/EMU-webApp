'use strict';

angular.module('emuwebApp')
	.service('Soundhandlerservice', function Soundhandlerservice($document) {

		// private vars
		var audioContext;
		var curSource;

		// shared service object
		var sServObj = {};

		// public vars
		sServObj.wavJSO = {};
		sServObj.isPlaying = false;

		///////////////////////////////////////////
		// private API

		/**
		 * safely initialize audio context
		 * */
		function initAudioContext() {
			try {
				window.AudioContext = window.AudioContext || window.webkitAudioContext;
				audioContext = new AudioContext();
			} catch (e) {
				alert("Error loading the AudioContext (could mean your browser doesn't support the HTML5 webaudio API):" + e);
			}
		}

		///////////////////////////////////////////
		// public API

		/**
		 * decode and play a passed in buffer
		 *
		 * @param buffer arraybuffer containing audio file (as returned by XHR for example)
		 * */
		sServObj.decodeAndPlay = function (buffer) {
			if (typeof(audioContext) == "undefined") {
				initAudioContext();
			}

			audioContext.decodeAudioData(buffer, function (ab) {
				curSource = audioContext.createBufferSource();
				curSource.buffer = ab;
				curSource.connect(audioContext.destination);
				curSource.start(0);
				curSource.onended = function () {
					sServObj.isPlaying = false;
				}

			}, function (e) {
				alert(e);
			});
		};


		/**
		 * Creates new ArrayBuffer containing wav file that goes
		 * from sampleStart to endSample
		 *
		 * @param sampleStart number that represents start sample
		 * @paramn endSample number that represents end sample
		 * @returns ArrayBuffer containing wav file
		 * */
		sServObj.extractRelPartOfWav = function (sampleStart, endSample) {
			var bytePerSample = sServObj.wavJSO.BitsPerSample / 8;
			var header = sServObj.wavJSO.origArrBuf.subarray(0, 44);
			var data = sServObj.wavJSO.origArrBuf.subarray(44, sServObj.wavJSO.Data.length * bytePerSample);

			var dv = new DataView(header);
			dv.setUint32(40, (endSample - sampleStart) * bytePerSample, true);
			// var Subchunk2Size = dv.getUint32(40, true);
			// console.log(Subchunk2Size);

			var newData = data.subarray(sampleStart * bytePerSample, (endSample - sampleStart) * bytePerSample);

			var tmp = new Uint8Array(header.byteLength + newData.byteLength);
			tmp.set(new Uint8Array(header), 0);
			tmp.set(new Uint8Array(newData), header.byteLength);

			return (tmp.buffer);
		};

		/**
		 * play audio from to specified in samples
		 *
		 * @param sampleStart number that represents start sample
		 * @param endSample number that represents end sample
		 * */
		sServObj.playFromTo = function (sampleStart, endSample) {

			var cutWavBuff = this.extractRelPartOfWav(sampleStart, endSample);

			if (sServObj.isPlaying) {
				sServObj.isPlaying = false;
				curSource.stop(0);
			} else {

				sServObj.isPlaying = true;
				if (cutWavBuff.byteLength > 44) { // if wav file is bigger than just the header (a.k.a. data block is empty)
					sServObj.decodeAndPlay(cutWavBuff);
				}
			}

		};


		return sServObj;

	});