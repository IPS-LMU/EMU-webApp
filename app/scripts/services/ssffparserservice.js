'use strict';

angular.module('emulvcApp')
	.service('Ssffparserservice', function Ssffparserservice() {

		// shared service object
		var sServObj = {};

		sServObj.ssffData = {};

		sServObj.headID = "SSFF -- (c) SHLRC\n";
		sServObj.machineID = "Machine IBM-PC\n";
		sServObj.sepString = "-----------------\n";

		sServObj.columTypeMap = {
			'DOUBLE': 8
		};

		sServObj.ssffData.sampleRate = -1;
		sServObj.ssffData.startTime = -1;
		sServObj.ssffData.origFreq = -1;
		sServObj.ssffData.Columns = [];


		/**
		 * @param buf arraybuffer containing ssff file
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
				this.ssffData.sampleRate = parseFloat(newLsep[2].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm,""));
				this.ssffData.startTime = parseFloat(newLsep[3].split(/[ ,]+/)[1].replace(/(\r\n|\n|\r)/gm,""));
			} else {
				alert('no ssff file... or missing fields ');
			}

			for (var i = 4; i < newLsep.length; i++) {
				if (newLsep[i].split(/[ ,]+/)[0] == "Original_Freq") {
					this.ssffData.origFreq = parseFloat(newLsep[i].split(/[ ,]+/)[2].replace(/(\r\n|\n|\r)/gm,""));
				}
				if (newLsep[i] == this.sepString) {
					break;
				}
				var lSpl = newLsep[i].split(/[ ]+/);

				if (lSpl[0] == "Column") {
					this.ssffData.Columns.push({
						"name": lSpl[1],
						"ssffdatatype": lSpl[2],
						"length": parseInt(lSpl[3].replace(/(\r\n|\n|\r)/gm,"")),
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
						//console.log("fasdfsd");
						alert("not supported... only doubles and floats for now");
					}

				} //for
			} //while
			console.log(this.ssffData);
			// console.log(JSON.stringify(this.ssffData, undefined, 2));
			return this.ssffData;

		}

		return sServObj;

	});