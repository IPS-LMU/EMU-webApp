/**
 * A simple class that creates another thread
 * which does the ssffParserWorker work
 * @class ssffParserWorker
 * @constructor
 * @param Worker {Worker} injection point for Worker
 */
export function SsffParserWorker(Worker) {
	Worker = Worker || window.Worker;
	this.url = this.getWorkerURL();
	this.worker = new Worker(this.url);
}

SsffParserWorker.prototype = {
	// get the worker script in string format.
	getWorkerScript: function () {
		var js = '';
		js += '(' + this.workerInit + ')(this);';
		return js;
	},

	// This function really represents the body of our worker script.
	// The global context of the worker script will be passed in.
	workerInit: function (global) {


		var ssffData = {};
		var headID = 'SSFF -- (c) SHLRC\n';
		var machineID = 'Machine IBM-PC\n';
		var sepString = '-----------------\n';
		ssffData.fileExtension = '';
		ssffData.sampleRate = -1;
		ssffData.startTime = -1;
		ssffData.origFreq = -1;
		ssffData.Columns = [];

		/**
		 * Mock for atob btoa for web kit based browsers that don't support these in webworkers
		 */
		(function () {
			var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
			var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
				52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
				15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
				41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

			function base64encode(str) {
				var out, i, len;
				var c1, c2, c3;

				len = str.length;
				i = 0;
				out = '';
				while (i < len) {
					c1 = str.charCodeAt(i++) & 0xff;
					if (i === len) {
						out += base64EncodeChars.charAt(c1 >> 2);
						out += base64EncodeChars.charAt((c1 & 0x3) << 4);
						out += '==';
						break;
					}
					c2 = str.charCodeAt(i++);
					if (i === len) {
						out += base64EncodeChars.charAt(c1 >> 2);
						out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
						out += base64EncodeChars.charAt((c2 & 0xF) << 2);
						out += '=';
						break;
					}
					c3 = str.charCodeAt(i++);
					out += base64EncodeChars.charAt(c1 >> 2);
					out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
					out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
					out += base64EncodeChars.charAt(c3 & 0x3F);
				}
				return out;
			}

			function base64decode(str) {
				var c1, c2, c3, c4;
				var i, len, out;

				len = str.length;
				i = 0;
				out = '';
				while (i < len) {
					do {
						c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
					} while (i < len && c1 === -1);
					if (c1 === -1) {
						break;
					}
					do {
						c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
					} while (i < len && c2 === -1);
					if (c2 === -1) {
						break;
					}
					out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

					do {
						c3 = str.charCodeAt(i++) & 0xff;
						if (c3 === 61) {
							return out;
						}
						c3 = base64DecodeChars[c3];
					} while (i < len && c3 === -1);
					if (c3 === -1) {
						break;
					}
					out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
					do {
						c4 = str.charCodeAt(i++) & 0xff;
						if (c4 === 61) {
							return out;
						}
						c4 = base64DecodeChars[c4];
					} while (i < len && c4 === -1);
					if (c4 === -1) {
						break;
					}
					out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
				}
				return out;
			}

			//var scope = (typeof window !== 'undefined') ? window : global;
			if (!global.btoa) {
				global.btoa = base64encode;
			}
			if (!global.atob) {
				global.atob = base64decode;
			}
		})();

		/**
		 *
		 */
		global.base64ToArrayBuffer = function (stringBase64) {
			var binaryString = global.atob(stringBase64);
			var len = binaryString.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				var ascii = binaryString.charCodeAt(i);
				bytes[i] = ascii;
			}
			return bytes.buffer;
		};

		/**
		 * round to n decimal digits after the comma
		 * used to help display numbers with a given
		 * precision
		 */
		global.round = function (x, n) {
			if (n < 1 || n > 14) {
				return false;
			}
			var e = Math.pow(10, n);
			var k = (Math.round(x * e) / e).toString();
			if (k.indexOf('.') === -1) {
				k += '.';
			}
			k += e.toString().substring(1);
			return k.substring(0, k.indexOf('.') + n + 1);
		};

		/**
		 * helper function to convert string to Uint8Array
		 * @param string
		 */
		global.stringToUint = function (string) {
			var charList = string.split('');
			var uintArray = [];
			for (var i = 0; i < charList.length; i++) {
				uintArray.push(charList[i].charCodeAt(0));
			}
			return new Uint8Array(uintArray);
		};

		/**
		 *
		 */
		global.Uint8Concat = function (first, second) {
			var firstLength = first.length;
			var result = new Uint8Array(firstLength + second.length);

			result.set(first);
			result.set(second, firstLength);

			return result;
		};

		/**
		 * convert arraybuffer containing a ssff file
		 * to a javascript object
		 * @param buf arraybuffer containing ssff file
		 * @param name is fileExtension
		 * @returns ssff javascript object
		 */
		global.ssff2jso = function (buf, name) {
			ssffData.fileExtension = name;
			ssffData.Columns = [];
			// console.log('SSFF loaded');

			var uIntBuffView = new Uint8Array(buf);
			var dataView = new DataView(buf);

			// Causes 'RangeError: Maximum call stack size exceeded'
			// with some browsers (?)(Chrome/Chromium on Ubuntu)
			//var buffStr = String.fromCharCode.apply(null, uIntBuffView);
			var buffStr = '';
			if ('TextDecoder' in this) {
				var decoder = new TextDecoder('ASCII');
				buffStr = decoder.decode(dataView);
				//var headerStr = buffStr.split(sepString)[0];
				//var dataStr = buffStr.split(sepString)[1];
				//console.log(dataStr);
			} else {
				for (var j = 0; j < uIntBuffView.length; j++) {
					buffStr = buffStr + String.fromCharCode(uIntBuffView[j]);
				}
			}

			var newLsep = buffStr.split(/^/m);

			//check if header has headID and machineID
			if (newLsep[0] !== headID) {
				// alert('SSFF parse error: first line != SSFF -- (c) SHLRC');
				return ({
					'status': {
						'type': 'ERROR',
						'message': 'SSFF parse error: first line != SSFF -- (c) SHLRC in file with fileExtension ' + name
					}
				});
			}
			if (newLsep[1] !== machineID) {
				// alert('SSFF parse error: machineID != Machine IBM-PC');
				return ({
					'status': {
						'type': 'ERROR',
						'message': 'SSFF parse error: machineID != Machine IBM-PC in file with fileExtension ' + name
					}
				});
			}

			// search header for Record_Freq and Start_Time
			ssffData.sampleRate = undefined;
			ssffData.startTime = undefined;
			var counter = 0;
			while (newLsep[counter] !== sepString) {
				if (newLsep[counter].split(/[ ,]+/)[0] === 'Record_Freq') {
					// console.log('FOUND Record_Freq')
					ssffData.sampleRate = parseFloat(newLsep[counter].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm, ''));
				}
				if (newLsep[counter].split(/[ ,]+/)[0] === 'Start_Time') {
					// console.log('FOUND Start_Time')
					ssffData.startTime = parseFloat(newLsep[counter].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm, ''));
				}
				counter += 1;
			}

			// check if found Record_Freq and Start_Time
			if (ssffData.sampleRate === undefined || ssffData.startTime === undefined) {
				// alert('SSFF parse error: Required fields Record_Freq or Start_Time not set!');
				return ({
					'status': {
						'type': 'ERROR',
						'message': 'SSFF parse error: Required fields Record_Freq or Start_Time not set in file with fileExtension ' + name
					}
				});
			}


			for (var i = 4; i < newLsep.length; i++) {
				if (newLsep[i].split(/[ ,]+/)[0] === 'Original_Freq') {
					ssffData.origFreq = parseFloat(newLsep[i].split(/[ ,]+/)[2].replace(/(\r\n|\n|\r)/gm, ''));
				}
				if (newLsep[i] === sepString) {
					break;
				}
				var lSpl = newLsep[i].split(/[ ]+/);

				if (lSpl[0] === 'Column') {
					ssffData.Columns.push({
						'name': lSpl[1],
						'ssffdatatype': lSpl[2],
						'length': parseInt(lSpl[3].replace(/(\r\n|\n|\r)/gm, ''), 10),
						'values': [],
						'_minVal': Infinity,
						'_maxVal': -Infinity
					});
				}
			}

			var curBinIdx = newLsep.slice(0, i + 1).join('').length;

			var curBufferView, curBuffer, curLen, curMin, curMax;

			while (curBinIdx < uIntBuffView.length) {

				for (i = 0; i < ssffData.Columns.length; i++) {

					//console.log(ssffData.Columns[i].length);
					if (ssffData.Columns[i].ssffdatatype === 'DOUBLE') {
						curLen = 8 * ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);
						// ugly hack in order to support PhantomJS < 2.0 testing
						if (typeof Float64Array === 'undefined') {
							Float64Array = Float32Array;
						}
						curBufferView = new Float64Array(curBuffer);
						ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
						curBinIdx += curLen;

						// set _minVal and _maxVal
						curMin = Math.min.apply(null, Array.prototype.slice.call(curBufferView));
						curMax = Math.max.apply(null, Array.prototype.slice.call(curBufferView));
						if (curMin < ssffData.Columns[i]._minVal) {
							ssffData.Columns[i]._minVal = curMin;
						}
						if (curMax > ssffData.Columns[i]._maxVal) {
							ssffData.Columns[i]._maxVal = curMax;
						}

					} else if (ssffData.Columns[i].ssffdatatype === 'FLOAT') {
						curLen = 4 * ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);
						curBufferView = new Float32Array(curBuffer);
						ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
						curBinIdx += curLen;

						// set _minVal and _maxVal
						curMin = Math.min.apply(null, Array.prototype.slice.call(curBufferView));
						curMax = Math.max.apply(null, Array.prototype.slice.call(curBufferView));
						if (curMin < ssffData.Columns[i]._minVal) {
							ssffData.Columns[i]._minVal = curMin;
						}
						if (curMax > ssffData.Columns[i]._maxVal) {
							ssffData.Columns[i]._maxVal = curMax;
						}

					} else if (ssffData.Columns[i].ssffdatatype === 'SHORT') {
						curLen = 2 * ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);
						curBufferView = new Int16Array(curBuffer);
						ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
						curBinIdx += curLen;

						// set _minVal and _maxVal
						curMin = Math.min.apply(null, Array.prototype.slice.call(curBufferView));
						curMax = Math.max.apply(null, Array.prototype.slice.call(curBufferView));
						if (curMin < ssffData.Columns[i]._minVal) {
							ssffData.Columns[i]._minVal = curMin;
						}
						if (curMax > ssffData.Columns[i]._maxVal) {
							ssffData.Columns[i]._maxVal = curMax;
						}
                    } else if (ssffData.Columns[i].ssffdatatype === 'LONG') {
                        curLen = 4 * ssffData.Columns[i].length;
                        curBuffer = buf.subarray(curBinIdx, curLen);
                        curBufferView = new Int32Array(curBuffer);
                        ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
                        curBinIdx += curLen;

                        // set _minVal and _maxVal
                        curMin = Math.min.apply(null, Array.prototype.slice.call(curBufferView));
                        curMax = Math.max.apply(null, Array.prototype.slice.call(curBufferView));
                        if (curMin < ssffData.Columns[i]._minVal) {
                            ssffData.Columns[i]._minVal = curMin;
                        }
                        if (curMax > ssffData.Columns[i]._maxVal) {
                            ssffData.Columns[i]._maxVal = curMax;
                        }

					} else if (ssffData.Columns[i].ssffdatatype === 'BYTE') {
						curLen = 1 * ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);
						curBufferView = new Uint8Array(curBuffer);
						ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
						curBinIdx += curLen;
					} else {
						// alert('Unsupported column type! Only DOUBLE, FLOAT, SHORT, BYTE column types are currently supported');
						return ({
							'status': {
								'type': 'ERROR',
								'message': 'Unsupported column type! Only DOUBLE, FLOAT, SHORT, LONG, BYTE column types are currently supported in file with fileExtension ' + name
							}
						});
					}

				} //for
			} //while

			return ssffData;

		};

		/**
		 * convert javascript object of label file to
		 * array buffer containing
		 * @param ssff javascipt object
		 * @returns ssff arraybuffer
		 */
		global.jso2ssff = function (jso) {
			// create header
			var headerStr = headID + machineID;
			headerStr += 'Record_Freq ' + global.round(jso.sampleRate, 1) + '\n';
			headerStr += 'Start_Time ' + jso.startTime + '\n';

			jso.Columns.forEach((col) => {
				// console.log(col.name)
				headerStr += 'Column ' + col.name + ' ' + col.ssffdatatype + ' ' + col.length + '\n';
			});

			headerStr += 'Original_Freq DOUBLE ' + global.round(jso.origFreq, 1) + '\n';
			headerStr += sepString;

			// preallocate data buffer
			var bytePerTime = 0;
			var failed = false;

			jso.Columns.forEach((col) => {
				if (col.ssffdatatype === 'BYTE') {
					bytePerTime += col.length;
				} else if (col.ssffdatatype === 'SHORT') {
					bytePerTime += 2 * col.length;
				} else if (col.ssffdatatype === 'LONG') {
					bytePerTime += 4 * col.length;
				} else if (col.ssffdatatype === 'FLOAT') {
					bytePerTime += 4 * col.length;
				} else if (col.ssffdatatype === 'DOUBLE') {
					bytePerTime += 8 * col.length;
				} else {
					failed = true;
				}
			});

			// check if failed
			if (failed) {
				return ({
					'status': {
						'type': 'ERROR',
						'message': 'Unsupported SSFF column type! Only DOUBLE, FLOAT, LONG, SHORT, BYTE columns supported,'
					}
				});
			} else {
				var byteSizeOfDataBuffer = bytePerTime * jso.Columns[0].values.length;

				var dataBuff = new ArrayBuffer(byteSizeOfDataBuffer);
				var dataBuffView = new DataView(dataBuff);

				// convert buffer to header
				var ssffBufView = new Uint8Array(global.stringToUint(headerStr));

				// loop through vals and append array of each column to ssffBufView
				var byteOffSet = 0;
				var littleEndian;
				if (machineID === 'Machine IBM-PC\n') {
					littleEndian = true;
				} else {
					littleEndian = false;
				}
				jso.Columns[0].values.forEach((curArray, curArrayIDX) => {
					jso.Columns.forEach((curCol) => {
						if (curCol.ssffdatatype === 'BYTE') {
							curCol.values[curArrayIDX].forEach((val) => {
								dataBuffView.setInt8(byteOffSet, val);
								byteOffSet += 1;
							});
						} else if (curCol.ssffdatatype === 'SHORT') {
							curCol.values[curArrayIDX].forEach((val) => {
								dataBuffView.setInt16(byteOffSet, val, littleEndian);
								byteOffSet += 2;
							});
						} else if (curCol.ssffdatatype === 'LONG') {
							curCol.values[curArrayIDX].forEach((val) => {
								dataBuffView.setInt32(byteOffSet, val, littleEndian);
								byteOffSet += 4;
							});
						} else if (curCol.ssffdatatype === 'FLOAT') {
							curCol.values[curArrayIDX].forEach((val) => {
								dataBuffView.setFloat32(byteOffSet, val, littleEndian);
								byteOffSet += 4;
							});
						} else if (curCol.ssffdatatype === 'DOUBLE') {
							curCol.values[curArrayIDX].forEach((val) => {
								dataBuffView.setFloat64(byteOffSet, val, littleEndian);
								byteOffSet += 8;
							});
						} else {
							failed = true;
						}
					});
				});

				// check if failed
				if (failed) {
					return ({
						'status': {
							'type': 'ERROR',
							'message': 'Unsupported column type discovered when writing SSFF data; this is not expected behaviour.'
						}
					});
				}
			}

			// concatenate header with data
			var tmp = new Uint8Array(dataBuffView.buffer);
			ssffBufView = new global.Uint8Concat(ssffBufView, tmp);
			return ({
				'status': {
					'type': 'SUCCESS',
					'message': ''
				},
				'data': ssffBufView.buffer
			});
		};

		/**
		 * loop over ssff files in ssffArr and create a ssffJsoArr
		 */
		global.parseArr = function (ssffArr) {
			var noError = true;
			var resArr = [];
			var ssffJso;

			for (var i = 0; i < ssffArr.length; i++) {

				ssffJso = {};
				var arrBuff; 
				if(ssffArr[i].encoding === 'BASE64'){
					arrBuff = global.base64ToArrayBuffer(ssffArr[i].data);
				} else if(ssffArr[i].encoding === 'ARRAYBUFFER'){
					arrBuff = ssffArr[i].data;
				}
				ssffJso = global.ssff2jso(arrBuff, ssffArr[i].fileExtension);
				if (ssffJso.status === undefined) {
					resArr.push(JSON.parse(JSON.stringify(ssffJso))); // YUCK... don't know if SIC but YUCK!!!
				} else {
					noError = false;
					return ssffJso;
				}
			}
			if (noError) {
				return {
					'status': {
						'type': 'SUCCESS',
						'message': ''
					},
					'data': resArr
				};
			}
			else {
				return {
					'status': {
						'type': 'ERROR',
						'message': 'Error in parseArr() with: ' + JSON.stringify(ssffArr)
					}
				};
			}
		};

		//expand ArrayBuffer with subarray function
		ArrayBuffer.prototype.subarray = function (offset, length) {
			var sub = new ArrayBuffer(length);
			var subView = new Int8Array(sub);
			var thisView = new Int8Array(this);
			for (var i = 0; i < length; i++) {
				subView[i] = thisView[offset + i];
			}
			return sub;
		};


		global.onmessage = function (e) {
			if (e.data !== undefined) {
				switch (e.data.cmd) {
					case 'parseArr':
						global.postMessage(global.parseArr(e.data.ssffArr));
						break;
					case 'jso2ssff':
						global.postMessage(global.jso2ssff(JSON.parse(e.data.jso)));
						break;
					default:
						global.postMessage({
							'status': {
								'type': 'ERROR',
								'message': 'Unknown command sent to SsffParserWorker'
							}
						});
						break;
				}
			}
			else {
				global.postMessage({
					'status': {
						'type': 'ERROR',
						'message': 'Undefined message was sent to SsffParserWorker'
					}
				});
			}
		};
	},


	// get a blob url for the worker script from the worker script text
	getWorkerURL: function () {
		var blob, urlObj;
		try {
			blob = new Blob([this.getWorkerScript()], {type: 'application/javascript'});
		} catch (e) { // Backwards-compatibility
			window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
			blob = new BlobBuilder();
			blob.append(SsffParserWorker);
			blob = blob.getBlob();
		}
		if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
			urlObj = webkitURL.createObjectURL(blob);
		} else {
			urlObj = URL.createObjectURL(blob);
		}
		return urlObj;
	},

	// kill the spectroDrawingWorker
	kill: function () {
		if (this.worker) {
			this.worker.terminate();
			this.worker = undefined;
		}
		if (this.url) {
			if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
				webkitURL.revokeObjectURL(this.url);
			} else {
				URL.revokeObjectURL(this.url);
			}
			this.url = undefined;
		}
	},

	// say something to the ssffParserWorker
	tell: function (msg) {
		if (this.worker) {
			this.worker.postMessage(msg);
		}
	},

	// listen for the ssffParserWorker to talk back
	says: function (handler) {
		if (this.worker) {
			this.worker.addEventListener('message', function (e) {
				handler(e.data);
			});
		}
	},
};
