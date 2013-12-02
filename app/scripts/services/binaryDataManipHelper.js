'use strict';

angular.module('emulvcApp')
	.service('Binarydatamaniphelper', function Binarydatamaniphelper() {

		// shared service object
		var sServObj = {};

		/**
		 *
		 */
		sServObj.base64ToArrayBuffer = function(string_base64) {
			console.log('ficken ficken ficken')
			var binary_string = window.atob(string_base64);
			var len = binary_string.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				var ascii = binary_string.charCodeAt(i);
				bytes[i] = ascii;
			}
			return bytes.buffer;
		}

		/**
		 *
		 */
		sServObj.arrayBufferToBase64 = function(buffer) {
			var binary = '';
			var bytes = new Uint8Array(buffer);
			var len = bytes.byteLength;
			for (var i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i])
			}
			return window.btoa(binary);
		};

		/**
		 *
		 */
		sServObj.stringToArrayBuffer = function(str) {
			var ab = new ArrayBuffer(str.length);
			var view = new Uint8Array(ab);
			for (var i = 0; i < str.length; ++i) {
				view[i] = str.charCodeAt(i);
			}
			return ab;
		}


		return sServObj;
	});