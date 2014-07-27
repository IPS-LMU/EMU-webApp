'use strict';

var ssffData = {};

var headID = 'SSFF -- (c) SHLRC\n';
var machineID = 'Machine IBM-PC\n';
var sepString = '-----------------\n';

ssffData.ssffTrackName = '';
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
			if (i == len) {
				out += base64EncodeChars.charAt(c1 >> 2);
				out += base64EncodeChars.charAt((c1 & 0x3) << 4);
				out += '==';
				break;
			}
			c2 = str.charCodeAt(i++);
			if (i == len) {
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
			/* c1 */
			do {
				c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
			} while (i < len && c1 == -1);
			if (c1 == -1)
				break;

			/* c2 */
			do {
				c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
			} while (i < len && c2 == -1);
			if (c2 == -1)
				break;

			out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

			/* c3 */
			do {
				c3 = str.charCodeAt(i++) & 0xff;
				if (c3 == 61)
					return out;
				c3 = base64DecodeChars[c3];
			} while (i < len && c3 == -1);
			if (c3 == -1)
				break;

			out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

			/* c4 */
			do {
				c4 = str.charCodeAt(i++) & 0xff;
				if (c4 == 61)
					return out;
				c4 = base64DecodeChars[c4];
			} while (i < len && c4 == -1);
			if (c4 == -1)
				break;
			out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
		}
		return out;
	}

	var scope = (typeof window !== 'undefined') ? window : self;
	if (!scope.btoa) scope.btoa = base64encode;
	if (!scope.atob) scope.atob = base64decode;

})();


/**
 *
 */
ArrayBuffer.prototype.subarray = function (offset, length) {
	var sub = new ArrayBuffer(length);
	var subView = new Int8Array(sub);
	var thisView = new Int8Array(this);
	for (var i = 0; i < length; i++) {
		subView[i] = thisView[offset + i];
	}
	return sub;
};

/**
 *
 */
function base64ToArrayBuffer(stringBase64) {
	var binaryString = atob(stringBase64);
	var len = binaryString.length;
	var bytes = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
		var ascii = binaryString.charCodeAt(i);
		bytes[i] = ascii;
	}
	return bytes.buffer;
}

/**
 * round to n decimal digits after the comma
 * used to help display numbers with a given
 * precision
 */
function round(x, n) {
	if (n < 1 || n > 14) {
		console.error('error in call of round function!!');
	}
	var e = Math.pow(10, n);
	var k = (Math.round(x * e) / e).toString();
	if (k.indexOf('.') === -1) {
		k += '.';
	}
	k += e.toString().substring(1);
	return k.substring(0, k.indexOf('.') + n + 1);
}

/**
 * helper function to convert string to Uint8Array
 * @param string
 */
function stringToUint(string) {
	// var string = btoa(unescape(encodeURIComponent(string)));
	var charList = string.split('');
	var uintArray = [];
	for (var i = 0; i < charList.length; i++) {
		uintArray.push(charList[i].charCodeAt(0));
	}
	return new Uint8Array(uintArray);
}

/**
 *
 */
function Uint8Concat(first, second) {
	var firstLength = first.length;
	var result = new Uint8Array(firstLength + second.length);

	result.set(first);
	result.set(second, firstLength);

	return result;
}

/**
 * convert arraybuffer containing a ssff file
 * to a javascript object
 * @param buf arraybuffer containing ssff file
 * @param name is ssffTrackName
 * @returns ssff javascript object
 */
function ssff2jso(buf, name) {
	ssffData.ssffTrackName = name;
	ssffData.Columns = [];
	// console.log('SSFF loaded');

	var uIntBuffView = new Uint8Array(buf);

	// Causes "RangeError: Maximum call stack size exceeded"
	// with some browsers (?)(Chrome/Chromium on Ubuntu)
	//var buffStr = String.fromCharCode.apply(null, uIntBuffView);
	var buffStr = '';
	var i;
	for (i = 0; i < uIntBuffView.length; i++) {
		buffStr = buffStr + String.fromCharCode(uIntBuffView[i]);
	}

	var newLsep = buffStr.split(/^/m);

	//check if header has headID and machineID
	if (newLsep[0] !== headID) {
		// alert('SSFF parse error: first line != SSFF -- (c) SHLRC');
		return ({
			'status': {
				'type': 'ERROR',
				'message': 'SSFF parse error: first line != SSFF -- (c) SHLRC in ssffTrackName ' + name
			}
		});
	}
	if (newLsep[1] !== machineID) {
		// alert('SSFF parse error: machineID != Machine IBM-PC');
		return ({
			'status': {
				'type': 'ERROR',
				'message': 'SSFF parse error: machineID != Machine IBM-PC in ssffTrackName ' + name
			}
		});
	}

	// search header for Record_Freq and Start_Time
	ssffData.sampleRate = undefined;
	ssffData.startTime = undefined;
	var counter = 0;
	while (newLsep[counter] !== sepString) {
		if (newLsep[counter].split(/[ ,]+/)[0] === 'Record_Freq') {
			// console.log("FOUND Record_Freq")
			ssffData.sampleRate = parseFloat(newLsep[counter].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm, ''));
		}
		if (newLsep[counter].split(/[ ,]+/)[0] === 'Start_Time') {
			// console.log("FOUND Start_Time")
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
				'message': 'SSFF parse error: Required fields Record_Freq or Start_Time not set in ssffTrackName ' + name
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

	while (curBinIdx <= uIntBuffView.length) {

		for (i = 0; i < ssffData.Columns.length; i++) {

			//console.log(ssffData.Columns[i].length);
			if (ssffData.Columns[i].ssffdatatype === 'DOUBLE') {
				curLen = 8 * ssffData.Columns[i].length;
				curBuffer = buf.subarray(curBinIdx, curLen);
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
				curBufferView = new Uint16Array(curBuffer);
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
						'message': 'Unsupported column type! Only DOUBLE, FLOAT, SHORT, BYTE column types are currently supported in ssffTrackName ' + name
					}
				});
			}

		} //for
	} //while

	return ssffData;

}

/**
 * convert javascript object of label file to
 * array buffer containing
 * @param ssff javascipt object
 * @returns ssff arraybuffer
 */
function jso2ssff(jso) {
	// create header
	var headerStr = headID + machineID;
	headerStr += 'Record_Freq ' + round(jso.sampleRate, 1) + '\n';
	headerStr += 'Start_Time ' + jso.startTime + '\n';

	jso.Columns.forEach(function (col) {
		// console.log(col.name)
		headerStr += 'Column ' + col.name + ' ' + col.ssffdatatype + ' ' + col.length + '\n';
	});

	headerStr += 'Original_Freq DOUBLE ' + round(jso.origFreq, 1) + '\n';
	headerStr += sepString;

	// preallocate data buffer
	var bytePerTime = 0;
	jso.Columns.forEach(function (col) {
		if (col.ssffdatatype === 'SHORT') {
			bytePerTime += 2 * col.length;
		} else {
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Unsupported column type! Only SHORT columns supported for now!'
				}
			});
		}
	});

	var byteSizeOfDataBuffer = bytePerTime * jso.Columns[0].values.length;

	var dataBuff = new ArrayBuffer(byteSizeOfDataBuffer);
	var dataBuffView = new DataView(dataBuff);

	// convert buffer to header
	var ssffBufView = new Uint8Array(stringToUint(headerStr));

	// loop through vals and append array of each column to ssffBufView
	var byteOffSet = 0;
	jso.Columns[0].values.forEach(function (curArray, curArrayIDX) {
		jso.Columns.forEach(function (curCol) {
			if (curCol.ssffdatatype === 'SHORT') {
				curCol.values[curArrayIDX].forEach(function (val) {
					dataBuffView.setInt16(byteOffSet, val, true);
					byteOffSet += 2;
				});
			} else {
				return ({
					'status': {
						'type': 'ERROR',
						'message': 'Unsupported column type! Only SHORT columns supported for now!'
					}
				});
			}
		});
	});

	// concatenate header with data
	var tmp = new Uint8Array(dataBuffView.buffer);
	ssffBufView = Uint8Concat(ssffBufView, tmp);

	// console.log(String.fromCharCode.apply(null, ssffBufView));
	return ssffBufView.buffer;
}


/**
 * loop over ssff files in ssffArr and create a ssffJsoArr
 */
function parseArr(ssffArr) {
	var noError = true;
	var resArr = [];
	var ssffJso;

	for (var i = 0; i < ssffArr.length; i++) {

		ssffJso = {};
		var arrBuff;
		arrBuff = base64ToArrayBuffer(ssffArr[i].data);
		ssffJso = ssff2jso(arrBuff, ssffArr[i].ssffTrackName);
		if (ssffJso.status === undefined) {
			resArr.push(JSON.parse(JSON.stringify(ssffJso))); // YUCK... don't know if SIC but YUCK!!!
		} else {
			console.error(ssffJso.status.message)
			self.postMessage(ssffJso);
			noError = false;
			break;
		}
	}
	if (noError) {
		self.postMessage({
			'status': {
				'type': 'SUCCESS',
				'message': ''
			},
			'data': resArr
		});
	}
}

/**
 * add event listener to webworker
 */
self.addEventListener('message', function (e) {
	var data = e.data;
	switch (data.cmd) {
	case 'parseArr':
		parseArr(data.ssffArr);
		break;
	case 'jso2ssff':
		var retVal = jso2ssff(JSON.parse(data.jso));
		if (retVal.type === undefined) {
			self.postMessage({
				'status': {
					'type': 'SUCCESS',
					'message': ''
				},
				'data': retVal
			});
		} else {
			self.postMessage(retVal);
		}

		break;
	default:
		self.postMessage({
			'status': {
				'type': 'ERROR',
				'message': 'Unknown command sent to ssffParserWorker'
			}
		});

		break;

	}
});