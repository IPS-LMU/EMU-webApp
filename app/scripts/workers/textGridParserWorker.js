'use strict';

var sampleRate;
var l1 = 'File type = \"ooTextFile\"';
var l2 = 'Object class = \"TextGrid\"';

var localID = 0;

/**
 * parse a textgrid string to the specified json format
 *
 * @param string TextGrid file string to be parsed
 * @returns a label java script object
 */
function toJSO(string, myFile, myName) {

	// remove all empty lines from string
	string = string.replace(/([ \t]*\r?\n)+/g, '\n');
	// remove all blanks
	string = string.replace(/[ \t]+/g, '');
	var lines = string.split('\n');

	var tT, tN, eT, lab;
	var inHeader = true;

	//meta info for labelJSO
	var labelJSO = {
		name: myName,
		annotates: myFile,
		sampleRate: sampleRate,
		levels: [],
		links: []
	};

	if (lines[0].replace(/\s+/g, '') === l1.replace(/\s+/g, '') && lines[1].replace(/\s+/g, '') === l2.replace(/\s+/g, '')) {
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
				var eSt = Math.floor(lines[i + 1].split(/=/)[1] * sampleRate) + 1;
				// correct to zero for first sample
				if (eSt === 1) {
					eSt = 0;
				}
				var eEt = Math.floor(lines[i + 2].split(/=/)[1] * sampleRate);
				lab = lines[i + 3].split(/=/)[1].replace(/"/g, '');

				var labs = [];
				labs.push({
					name: labelJSO.levels[labelJSO.levels.length - 1].name,
					value: lab
				});

				labelJSO.levels[labelJSO.levels.length - 1].items.push({
					id: localID,
					sampleStart: eSt,
					sampleDur: eEt - eSt + 1,
					labels: labs
				});

				++localID;

			} else if (labelJSO.levels.length > 0 && labelJSO.levels[labelJSO.levels.length - 1].type === 'EVENT' && cL.indexOf('points') === 0 && cL.indexOf('points:') !== 0) {
				// parse point level event
				eT = lines[i + 1].split(/=/)[1] * sampleRate;
				lab = lines[i + 2].split(/=/)[1].replace(/"/g, '');
				var labs = [];
				labs.push({
					name: labelJSO.levels[labelJSO.levels.length - 1].name,
					value: lab
				});

				labelJSO.levels[labelJSO.levels.length - 1].items.push({
					id: localID,
					samplePoint: Math.round(eT),
					labels: labs
				});

				++localID;
			}

		}
		// console.log(JSON.stringify(labelJSO, undefined, 2));
		testForGapsInLabelJSO(labelJSO);
		return labelJSO;

	} else {
		// alert('bad header in TextGrid file!!! The header has to be: ', l1, '\n', l2);
		return ({
			'status': {
				'type': 'ERROR',
				'message': 'bad header in TextGrid file!!! The header has to be: ' + l1 + '\n' + l2
			}
		});
	}

};

/**
 * converts the internal levels format returned from levelHandler.getLevels
 * to a string containing a TextGrid file
 */
function toTextGrid(levelData, buffLength, sampleRate) {

	var l1 = 'File type = \"ooTextFile\"';
	var l2 = 'Object class = \"TextGrid\"';
	var tG = '';
	var nl = '\n';
	var t = '\t';

	// writing header infos
	tG = tG + l1 + nl + l2 + nl + nl;
	tG = tG + 'xmin = ' + findTimeOfMinSample() + nl;
	tG = tG + 'xmax = ' + findTimeOfMaxSample(buffLength, sampleRate) + nl;
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
		tG = tG + t + t + 'xmin = ' + findTimeOfMinSample() + nl;
		tG = tG + t + t + 'xmax = ' + findTimeOfMaxSample(buffLength, sampleRate) + nl;
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
					curVal = ((curLevel.items[j].sampleStart / sampleRate) + ((1 / sampleRate) / 2) );
					tG = tG + t + t + t + t + 'xmin = ' + curVal  + nl;
				} else {
					tG = tG + t + t + t + t + 'xmin = ' + 0 + nl;
				}
				if (j < curLevel.items.length - 1) {
					curVal =(((curLevel.items[j].sampleStart + curLevel.items[j].sampleDur) / sampleRate) + ((1 / sampleRate) / 2) );
					tG = tG + t + t + t + t + 'xmax = ' + curVal + nl;
				} else {
					tG = tG + t + t + t + t + 'xmax = ' + findTimeOfMaxSample(buffLength, sampleRate) + nl;
				}

				tG = tG + t + t + t + t + 'text = "' + curLevel.items[j].labels[0].value + '"' + nl;
			} else if (curLevel.type === 'EVENT') {
				tG = tG + t + t + t + 'points[' + evtNr + ']:' + nl;
				tG = tG + t + t + t + t + 'time = ' + curLevel.items[j].sampleStart / sampleRate + nl;
				tG = tG + t + t + t + t + 'mark = "' + curLevel.items[j].label + '"' + nl;
			}
		}
	}
	return (tG);
};


/**
 *
 */
function findTimeOfMinSample() {
	return 0.000000; // maybe needed at some point...
};

/**
 *
 */
function findTimeOfMaxSample(buffLength, sampleRate) {
	return buffLength / sampleRate;
};


/**
 * test to see if all the segments in seg levels
 * are "snapped" -> sampleStart+dur+1 = sampleStart of next Segment
 */
function testForGapsInLabelJSO(labelJSO) {
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
	// console.log('TextGridParser had: ', counter, 'alignment issues found in parsed TextGrid');
};

/**
 * add event listener to webworker
 */
self.addEventListener('message', function (e) {
	var data = e.data;
	switch (data.cmd) {
	case 'parseTG':
		sampleRate = data.sampleRate;
		var retVal = toJSO(data.textGrid, data.annotates, data.name)
			// console.log(JSON.stringify(retVal, undefined, 2));
		if (retVal.status === undefined) {
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
	case 'toTextGrid':
		var retVal = toTextGrid(data.levels, data.buffLength, data.sampleRate)
		if (retVal.status === undefined) {
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
				'message': 'Unknown command sent to textGridParserWorker: ' + data.cmd
			}
		});

		break;
	}
})