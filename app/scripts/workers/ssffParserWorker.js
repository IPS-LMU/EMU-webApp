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

	// convert buffer to header
	var ssffBufView = new Uint8Array(stringToUint(headerStr));

	var curBufferView, curArray;

	curBufferView = new Uint16Array(jso.Columns[0].length);
	curArray = jso.Columns[0].values[0];

	// loop through vals and append array of each column to ssffBufView
	jso.Columns[0].values.forEach(function (curArray, curArrayIDX) {
		jso.Columns.forEach(function (curCol) {
			if (curCol.ssffdatatype === 'SHORT') {
				curBufferView = new Uint16Array(curCol.length);
				curCol.values[curArrayIDX].forEach(function (val, valIDX) {
					curBufferView[valIDX] = val;
				});
				var tmp = new Uint8Array(curBufferView.buffer);
				ssffBufView = Uint8Concat(ssffBufView, tmp);
			} else {
				// alert('Only SHORT columns supported for now!!!');
				return ({
					'status': {
						'type': 'ERROR',
						'message': 'Unsupported column type! Only SHORT columns supported for now!'
					}
				});
			}
		});
	});

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
		var retVal = jso2ssff(data.jso);
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