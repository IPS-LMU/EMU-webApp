'use strict';

angular.module('emulvcApp')
	.service('Ssffparserservice', function Ssffparserservice() {

		// shared service object
		var sServObj = {};

		sServObj.ssffData = {};

		sServObj.headID = "SSFF -- (c) SHLRC\n";
		sServObj.machineID = "Machine IBM-PC\n";
		sServObj.sepString = "-----------------\n";

		sServObj.ssffData.fileURL = '';
		sServObj.ssffData.sampleRate = -1;
		sServObj.ssffData.startTime = -1;
		sServObj.ssffData.origFreq = -1;
		sServObj.ssffData.Columns = [];


		/**
		 * convert arraybuffer containing a ssff file
		 * to a javascript object
		 * @param buf arraybuffer containing ssff file
		 * @returns ssff javascript object
		 */
		sServObj.ssff2jso = function(buf) {
			var my = this;
			// console.log('SSFF loaded');

			var uIntBuffView = new Uint8Array(buf);
			var buffStr = String.fromCharCode.apply(null, uIntBuffView);

			var newLsep = buffStr.split(/^/m);

			//check if header has headID and machineID
			if (newLsep[0] != my.headID || newLsep[1] != my.machineID) {
				alert('no ssff file... or missing fields');
			}
			// check if Record_Freq+Start_Time is there
			if (newLsep[2].split(/[ ,]+/)[0] != "Record_Freq " || newLsep[3].split(/[ ,]+/)[0] != "Start_Time ") {
				this.ssffData.sampleRate = parseFloat(newLsep[2].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm, ""));
				this.ssffData.startTime = parseFloat(newLsep[3].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm, ""));
			} else {
				alert('no ssff file... or missing fields ');
			}

			for (var i = 4; i < newLsep.length; i++) {
				if (newLsep[i].split(/[ ,]+/)[0] == "Original_Freq") {
					this.ssffData.origFreq = parseFloat(newLsep[i].split(/[ ,]+/)[2].replace(/(\r\n|\n|\r)/gm, ""));
				}
				if (newLsep[i] == this.sepString) {
					break;
				}
				var lSpl = newLsep[i].split(/[ ]+/);

				if (lSpl[0] == "Column") {
					this.ssffData.Columns.push({
						"name": lSpl[1],
						"ssffdatatype": lSpl[2],
						"length": parseInt(lSpl[3].replace(/(\r\n|\n|\r)/gm, "")),
						"values": []
					});
				}

			}

			var curBinIdx = newLsep.slice(0, i + 1).join("").length;

			var curBufferView, curBuffer, curLen;

			while (curBinIdx <= uIntBuffView.length) {

				for (i = 0; i < this.ssffData.Columns.length; i++) {
					//console.log(this.ssffData.Columns[i].length);
					if (this.ssffData.Columns[i].ssffdatatype == "DOUBLE") {
						curLen = 8 * this.ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);
						curBufferView = new Float64Array(curBuffer);
						this.ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
						curBinIdx += curLen;

					} else if (this.ssffData.Columns[i].ssffdatatype == "FLOAT") {
						curLen = 4 * this.ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);
						curBufferView = new Float32Array(curBuffer);
						this.ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
						curBinIdx += curLen;

					} else if (this.ssffData.Columns[i].ssffdatatype == "SHORT") {
						curLen = 2 * this.ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);
						curBufferView = new Uint16Array(curBuffer);
						this.ssffData.Columns[i].values.push(Array.prototype.slice.call(curBufferView));
						curBinIdx += curLen;

					} else {
						alert("not supported... only doubles, floats, short  column types and for now");
					}

				} //for
			} //while
			console.log(this.ssffData);
			// console.log(JSON.stringify(this.ssffData, undefined, 2));
			return this.ssffData;

		};

		/**
		 * convert javascript object of label file to
		 * array buffer containing
		 * @param ssff javascipt object
		 * @returns ssff arraybuffer
		 */
		sServObj.jso2ssff = function(jso) {

			// create header
			var headerStr = this.headID + this.machineID;
			headerStr += "Record_Freq " + jso.sampleRate + "\n";
			headerStr += "Start_Time " + jso.startTime + "\n";

			jso.Columns.forEach(function(col, index) {
				console.log(col.name)
				headerStr += "Column " + col.name + " " + col.ssffdatatype + " " + col.length + "\n";
			});

			headerStr += "Original_Freq DOUBLE " + jso.origFreq + "\n";
			headerStr += this.sepString;

			// convert buffer to header
			var ssffBuf = new Uint8Array(this.stringToUint(headerStr));

			var curBufferView, curRecord;

			console.log("####################");
			if (jso.Columns[0].ssffdatatype == "SHORT") {
				console.log(jso.Columns[0]);
				curBufferView = new Uint16Array(jso.Columns[0].length);
				curRecord = jso.Columns[0].values[0];
				console.log(curRecord);
				curBufferView[0] = curRecord[0];
				curBufferView[1] = curRecord[1];
				curBufferView[2] = curRecord[2];
				curBufferView[3] = curRecord[3];
				console.log(curBufferView)
				var tmp = new Uint8Array(curBufferView);
				ssffBuf = this.Uint8Concat(ssffBuf, tmp);
			}

			// console.log(ssffBuf);
			console.log(String.fromCharCode.apply(null, ssffBuf));
			return ssffBuf;
		};

		/**
		 * helper function to convert string to Uint8Array
		 * @param string
		 */
		sServObj.stringToUint = function(string) {
			// var string = btoa(unescape(encodeURIComponent(string)));
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
		sServObj.Uint8Concat = function(first, second) {
			var firstLength = first.length;
			var result = new Uint8Array(firstLength + second.length);

			result.set(first);
			result.set(second, firstLength);

			return result;
		};

		return sServObj;

	});