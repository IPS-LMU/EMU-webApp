/**
 * A simple class that creates another thread
 * which does the TextGridParserWorker work
 * @class TextGridParserWorker
 * @constructor
 * @param Worker {Worker} injection point for Worker
 */
function TextGridParserWorker(Worker) {
	Worker = Worker || window.Worker;
	this.url = this.getWorkerURL();
	this.worker = new Worker(this.url);
}

TextGridParserWorker.prototype = {
	// get the worker script in string format.
	getWorkerScript: function () {
		var js = '';
		js += '(' + this.workerInit + ')(this);';
		return js;
	},

	// This function really represents the body of our worker script.
	// The global context of the worker script will be passed in.
	workerInit: function (global) {

		global.l1 = 'File type = \"ooTextFile\"';
		global.l2 = 'Object class = \"TextGrid\"';
		global.localID = 0;

		/**
		 * test to see if all the segments in seg levels
		 * are "snapped" -> sampleStart+dur+1 = sampleStart of next Segment
		 */
		global.testForGapsInLabelJSO = function (labelJSO) {
			var counter = 0;
			for (var i = 0; i < labelJSO.levels.length; i++) {
				if (labelJSO.levels[i].type === 'SEGMENT') {
					for (var j = 0; j < labelJSO.levels[i].items.length - 1; j++) {
						if (labelJSO.levels[i].items[j].sampleStart + labelJSO.levels[i].items[j].sampleDur + 1 !== labelJSO.levels[i].items[j + 1].sampleStart) {
							counter = counter + 1;
						}
					}
				}
			}
		};

		/**
		 *
		 */
		global.findTimeOfMinSample = function () {
			return 0.000000; // maybe needed at some point...
		};

		/**
		 *
		 */
		global.findTimeOfMaxSample = function (buffLength, sampleRate) {
			return buffLength / sampleRate;
		};

		/**
		 * parse a textgrid string to the specified json format
		 *
		 * @param string TextGrid file string to be parsed
		 * @returns a label java script object
		 */
		global.toJSO = function (string, myFile, myName, sampleRate) {

			var VU_STR = '123abcABCCBAcba321'; // very unlikly string

			// remove all empty lines from string
			string = string.replace(/([ \t]*\r?\n)+/g, '\n');

			// replace blanks in quates with VU_STR to preserve blanks in labels
			string = string.replace(/("[^\n]*")/g, function ($0, $1) {
				var res = $1.replace(/\s+/g, VU_STR);
				return res;
			});

			// remove remaining blanks
			string = string.replace(/[\t ]+/g, '');

			// convert VU_STR back to blanks
			var re = new RegExp(VU_STR, 'g');
			string = string.replace(re, ' ');

			var lines = string.split('\n');

			var tT, tN, eT, lab;
			var inHeader = true;
			var labs = [];

			//meta info for labelJSO
			var labelJSO = {
				name: myName,
				annotates: myFile,
				sampleRate: sampleRate,
				levels: [],
				links: []
			};

			if (lines[0].replace(/\s+/g, '') === global.l1.replace(/\s+/g, '') && lines[1].replace(/\s+/g, '') === global.l2.replace(/\s+/g, '')) {
				for (var i = 2; i < lines.length; i++) {
					var cL = lines[i];
					if (cL === 'item[]:') {
						inHeader = false;
						continue;
					}
					if (inHeader) {
						continue;
					}

					if (cL.indexOf('item[') === 0) {
						// get level name
						tN = lines[i + 2].split(/=/)[1].replace(/"/g, '');
						// get level type
						if (lines[i + 1].split(/=/)[1] === '\"IntervalTier\"') {
							tT = 'SEGMENT';
							// adding new level
							labelJSO.levels.push({
								name: tN,
								type: tT,
								// sampleRate: sampleRate,
								items: []
							});
						} else if (lines[i + 1].split(/=/)[1] === '\"TextTier\"') {
							tT = 'EVENT';
							// adding new level
							labelJSO.levels.push({
								name: tN,
								type: tT,
								// sampleRate: sampleRate,
								items: []
							});
						} else {
							// tT = 'ITEM';
							// // adding new level
							// labelJSO.levels.push({
							// 	name: tN,
							// 	type: tT,
							// 	items: []
							// });
						}
					}
					if (labelJSO.levels.length > 0 && labelJSO.levels[labelJSO.levels.length - 1].type === 'SEGMENT' && (cL.indexOf('intervals') === 0) && (cL.indexOf('intervals:') !== 0)) {
						// parse seg levels event
						var itemST = Math.floor(lines[i + 1].split(/=/)[1] * sampleRate);
						var itemET = Math.floor(lines[i + 2].split(/=/)[1] * sampleRate);
						lab = lines[i + 3].split(/=/)[1].replace(/"/g, '');
						labs = [];
						labs.push({
							name: labelJSO.levels[labelJSO.levels.length - 1].name,
							value: lab
						});

						labelJSO.levels[labelJSO.levels.length - 1].items.push({
							id: global.localID,
							sampleStart: itemST,
							sampleDur: itemET - itemST - 1,
							labels: labs
						});

						++global.localID;

					} else if (labelJSO.levels.length > 0 && labelJSO.levels[labelJSO.levels.length - 1].type === 'EVENT' && cL.indexOf('points') === 0 && cL.indexOf('points:') !== 0) {
						// parse point level event
						eT = lines[i + 1].split(/=/)[1] * sampleRate;
						lab = lines[i + 2].split(/=/)[1].replace(/"/g, '');
						labs = [];
						labs.push({
							name: labelJSO.levels[labelJSO.levels.length - 1].name,
							value: lab
						});

						labelJSO.levels[labelJSO.levels.length - 1].items.push({
							id: global.localID,
							samplePoint: Math.round(eT),
							labels: labs
						});

						++global.localID;
					}

				}
				// console.log(JSON.stringify(labelJSO, undefined, 2));
				global.testForGapsInLabelJSO(labelJSO);
				return labelJSO;

			} else {
				// alert('bad header in TextGrid file!!! The header has to be: ', global.l1, '\n', global.l2);
				return ({
					'status': {
						'type': 'ERROR',
						'message': 'bad header in TextGrid file!!! The header has to be: ' + global.l1 + '\n' + global.l2 + '; Note: Currently only long-form text TextGrids are supported!'
					}
				});
			}
		};

		/**
		 * converts the internal levels format returned from levelHandler.getLevels
		 * to a string containing a TextGrid file
		 */
		global.toTextGrid = function (levelData, buffLength, sampleRate) {

			var tG = '';
			var nl = '\n';
			var t = '\t';

			// writing header infos
			tG = tG + global.l1 + nl + global.l2 + nl + nl;
			tG = tG + 'xmin = ' + global.findTimeOfMinSample() + nl;
			tG = tG + 'xmax = ' + global.findTimeOfMaxSample(buffLength, sampleRate) + nl;
			tG = tG + 'levels? <exists>' + nl;
			tG = tG + 'size = ' + levelData.length + nl;
			tG = tG + 'item []:' + nl;
			//var levelNr = 0;
			for (var levelNr = 0; levelNr < levelData.length; levelNr++) {
				//angular.forEach(levelData, function (curLevel) {
				//write level items
				//levelNr = levelNr + 1;
				var curLevel = levelData[levelNr];
				tG = tG + t + 'item [' + levelNr + ']:' + nl;
				if (curLevel.type === 'SEGMENT') {
					tG = tG + t + t + 'class = "IntervalTier"' + nl;
				} else if (curLevel.type === 'EVENT') {
					tG = tG + t + t + 'class = "TextTier"' + nl;
				}
				tG = tG + t + t + 'name = "' + curLevel.name + '"' + nl;
				tG = tG + t + t + 'xmin = ' + global.findTimeOfMinSample() + nl;
				tG = tG + t + t + 'xmax = ' + global.findTimeOfMaxSample(buffLength, sampleRate) + nl;
				if (curLevel.type === 'SEGMENT') {
					tG = tG + t + t + 'intervals: size = ' + curLevel.items.length + nl;
				} else if (curLevel.type === 'EVENT') {
					tG = tG + t + t + 'points: size = ' + curLevel.items.length + nl;
				}
				var curVal;
				for (var j = 0; j < curLevel.items.length; j++) {
					var evtNr = j + 1;
					if (curLevel.type === 'SEGMENT') {
						tG = tG + t + t + t + 'intervals [' + evtNr + ']:' + nl;
						if (curLevel.items[j].sampleStart !== 0) {
							curVal = ((curLevel.items[j].sampleStart / sampleRate) + ((1 / sampleRate) / 2));
							tG = tG + t + t + t + t + 'xmin = ' + curVal + nl;
						} else {
							tG = tG + t + t + t + t + 'xmin = ' + 0 + nl;
						}
						if (j < curLevel.items.length - 1) {
							curVal = (((curLevel.items[j].sampleStart + curLevel.items[j].sampleDur) / sampleRate) + ((1 / sampleRate) / 2));
							tG = tG + t + t + t + t + 'xmax = ' + curVal + nl;
						} else {
							tG = tG + t + t + t + t + 'xmax = ' + global.findTimeOfMaxSample(buffLength, sampleRate) + nl;
						}

						tG = tG + t + t + t + t + 'text = "' + curLevel.items[j].labels[0].value + '"' + nl;
					} else if (curLevel.type === 'EVENT') {
						tG = tG + t + t + t + 'points[' + evtNr + ']:' + nl;
						tG = tG + t + t + t + t + 'time = ' + curLevel.items[j].samplePoint / sampleRate + nl;
						tG = tG + t + t + t + t + 'mark = "' + curLevel.items[j].labels[0].value + '"' + nl;
					}
				}
			}
			return (tG);
		};

		global.onmessage = function (e) {
			if (e.data !== undefined) {
				var retVal;
				switch (e.data.cmd) {
					case 'parseTG':
						retVal = global.toJSO(e.data.textGrid, e.data.annotates, e.data.name, e.data.sampleRate);
						if (retVal.status === undefined) {
							global.postMessage({
								'status': {
									'type': 'SUCCESS',
									'message': ''
								},
								'data': retVal
							});
						} else {
							global.postMessage(retVal);
						}
						break;
					case 'toTextGrid':
						retVal = global.toTextGrid(e.data.levels, e.data.buffLength, e.data.sampleRate);
						if (retVal.status === undefined) {
							global.postMessage({
								'status': {
									'type': 'SUCCESS',
									'message': ''
								},
								'data': retVal
							});
						} else {
							global.postMessage(retVal);
						}
						break;
					default:
						global.postMessage({
							'status': {
								'type': 'ERROR',
								'message': 'Unknown command sent to TextGridParserWorker'
							}
						});
						break;
				}
			}
			else {
				global.postMessage({
					'status': {
						'type': 'ERROR',
						'message': 'Undefined message was sent to TextGridParserWorker'
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
			blob.append(TextGridParserWorker);
			blob = blob.getBlob();
		}
		if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
			urlObj = webkitURL.createObjectURL(blob);
		} else {
			urlObj = URL.createObjectURL(blob);
		}
		return urlObj;
	},


	// kill the TextGridParserWorker
	kill: function () {
		if (this.worker) {
			this.worker.terminate();
		}
		if (this.url) {
			URL.revokeObjectURL(this.url);
		}
	},

	// say something to the TextGridParserWorker
	tell: function (msg) {
		if (this.worker) {
			this.worker.postMessage(msg);
		}
	},

	// listen for the TextGridParserWorker to talk back
	says: function (handler) {
		if (this.worker) {
			this.worker.addEventListener('message', function (e) {
				handler(e.data);
			});
		}
	},
};