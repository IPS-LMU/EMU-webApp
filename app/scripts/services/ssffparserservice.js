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
		sServObj.ssffData.origFreq = -1;
		sServObj.ssffData.startTime = -1;
		sServObj.ssffData.startRecord = -1;
		sServObj.ssffData.endRecord = -1;
		sServObj.ssffData.ssffColumnTypes = {};
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
				this.ssffData.sampleRate = newLsep[2].split(/[ ,]+/)[1];
				this.ssffData.startTime = newLsep[3].split(/[ ,]+/)[1];
			} else {
				alert('no ssff file... or missing fields ');
			}

			for (var i = 4; i < newLsep.length; i++) {
				if (newLsep[i] == this.sepString) {
					//console.log(newLsep[i]);
					break;
				}
				var lSpl = newLsep[i].split(/[ ]+/);

				if (lSpl[0] == "Column") {
					this.ssffData.Columns.push({
						"name": lSpl[1],
						"type": lSpl[2],
						"length": lSpl[3],
						"values": []
					});
					this.ssffData.ssffColumnTypes[lSpl[1]] = lSpl[2];
				}

			}


			var curBinIdx = newLsep.slice(0, i + 1).join("").length;

			var curBufferView, curBuffer, curLen;

			while (curBinIdx <= uIntBuffView.length) {

				for (i = 0; i < this.ssffData.Columns.length; i++) {
					//console.log(this.ssffData.Columns[i].length);
					if (this.ssffData.Columns[i].type == "DOUBLE") {

						curLen = 8 * this.ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);
						
						curBufferView = new Float64Array(curBuffer);

						this.ssffData.Columns[i].values.push(curBufferView);

						curBinIdx += curLen;

					} else if (this.ssffData.Columns[i].type == "FLOAT") {

						curLen = 4 * this.ssffData.Columns[i].length;
						curBuffer = buf.subarray(curBinIdx, curLen);

						curBufferView = new Float32Array(curBuffer);
						this.ssffData.Columns[i].values.push(curBufferView);

						curBinIdx += curLen;

					} else {
						//console.log("fasdfsd");
						alert("not supported... only doubles for now");
					}

				} //for
			} //while
			console.log(this.ssffData);

		}

		return sServObj;

	});