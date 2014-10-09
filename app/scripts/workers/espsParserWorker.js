'use strict';

function toJSO(string, annotates, name, sampleRate) {

	var labelJSO = {};
	labelJSO.name = name;
	labelJSO.annotates = annotates;
	labelJSO.sampleRate = sampleRate;
	labelJSO.levels = [];

	// var ext = '_' + filePath.split('.')[filePath.split('.').length - 1];

	// remove all empty lines from string
	string = string.replace(/([ \t]*\r?\n)+/g, '\n');
	// replace all blanks with single whitespace
	string = string.replace(/[ \t]+/g, ' ');
	var lines = string.split('\n');

	// find header end
	var headEndIdx;
	for (var i = 0; i < lines.length; i++) {
		if (lines[i] === '#') {
			headEndIdx = i;
			break;
		}
	}

	//init empty labelJSO
	labelJSO.levels[0] = {};
	labelJSO.levels[0].name = name;
	labelJSO.levels[0].items = [];

	var idCounter = 1;

	// set level type
	var prevLineArr;
	var curLineArr = lines[headEndIdx + 1].split(/\s+/);
	if (curLineArr[curLineArr.length - 1] !== 'H#') {
		labelJSO.levels[0].type = 'EVENT';
	} else {
		labelJSO.levels[0].type = 'SEGMENT';
	}

	if (labelJSO.levels[0].type === 'EVENT') {
		for (i = headEndIdx + 1; i < lines.length - 1; i++) {
			curLineArr = lines[i].split(/\s+/);
			labelJSO.levels[0].items.push({
				id: idCounter,
				labels: [{
					name: name,
					value: curLineArr[curLineArr.length - 1]
				}],
				samplePoint: Math.floor(curLineArr[1] * sampleRate)
			});
			idCounter += 1;
		}
	} else {
		// take care of H# by not doing anything :-)
		idCounter += 1;

		for (i = headEndIdx + 2; i < lines.length - 1; i++) {
			curLineArr = lines[i].split(/\s+/);
			prevLineArr = lines[i - 1].split(/\s+/);
			labelJSO.levels[0].items.push({
				id: idCounter,
				labels: [{
					name: name,
					value: curLineArr[curLineArr.length - 1]
				}],
				sampleStart: Math.floor(prevLineArr[1] * sampleRate),
				sampleDur: Math.floor(curLineArr[1] * sampleRate) - Math.floor(prevLineArr[1] * sampleRate) - 1
			});
			idCounter += 1;
		}

	}
	return labelJSO;
}

/**
 * SIC! This function probably has to be fixed...
 */
function toESPS(data, name, sampleRate) {
	var espsStr = '';
	// construct header
	espsStr += 'signal ' + name + '\n';
	espsStr += 'nfields 1\n';
	espsStr += '#\n';
	var curLabel;
	for (var j = 0; j < data.length; j++) {
		//angular.forEach(data, function (i, idx) {
		if (data[j].labels[0].value === '' && j === 0) {
			curLabel = 'H#';
		} else {
			curLabel = data[j].labels[0].value;
		}
		espsStr += '\t' + String((data[j].sampleStart + data[j].sampleDur) / sampleRate) + '\t125\t' + curLabel + '\n';
	}
	//});

	// console.log(espsStr);
	return espsStr;
}


/**
 * add event listener to webworker
 */
addEventListener('message', function (e) {
	var data = e.data;
	var retVal;
	switch (data.cmd) {
	case 'parseESPS':
		// sampleRate = data.sampleRate;
		retVal = toJSO(data.esps, data.annotates, data.name, data.sampleRate);
		if (retVal.type === undefined) {
			this.postMessage({
				'status': {
					'type': 'SUCCESS',
					'message': ''
				},
				'data': retVal
			});
		} else {
			this.postMessage(retVal);
		}
		break;
	case 'parseJSO':
		retVal = toESPS(data.level.items, data.level.name, data.sampleRate);
		if (retVal.type === undefined) {
			this.postMessage({
				'status': {
					'type': 'SUCCESS',
					'message': ''
				},
				'data': retVal
			});
		} else {
			this.postMessage(retVal);
		}
		break;
	default:
		this.postMessage({
			'status': {
				'type': 'ERROR',
				'message': 'Unknown command sent to espsParserWorker: ' + data.cmd
			}
		});

		break;
	}
});