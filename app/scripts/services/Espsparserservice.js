'use strict';

angular.module('emulvcApp')
	.service('Espsparserservice', function Espsparserservice(Soundhandlerservice) {
		// shared service object
		var sServObj = {};

		/**
		 *
		 */
		sServObj.toJSO = function (string, filePath) {

			var ext = '_' + filePath.split('.')[filePath.split('.').length - 1];

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
			var labelJSO = {
				fileInfos: [{
					fileURI: filePath,
					fileType: 'esps',
					associatedLevelNames: [ext]
				}],
				levels: []
			};

			labelJSO.levels.push({
				LevelName: ext,
				type: '',
				items: []
			});

			// set level type
			var prevLineArr;
			var curLineArr = lines[headEndIdx + 1].split(/\s+/);
			if (curLineArr[curLineArr.length - 1] !== 'H#') {
				labelJSO.levels[0].type = 'point';
			} else {
				labelJSO.levels[0].type = 'seg';
			}

			if (labelJSO.levels[0].type === 'point') {
				for (i = headEndIdx + 1; i < lines.length - 1; i++) {
					curLineArr = lines[i].split(/\s+/);
					labelJSO.levels[0].items.push({
						label: curLineArr[curLineArr.length - 1],
						sampleStart: Math.round(curLineArr[1] * Soundhandlerservice.wavJSO.SampleRate)
					});
				}
			} else {
				// take care of H#
				curLineArr = lines[headEndIdx + 1].split(/\s+/);
				labelJSO.levels[0].items.push({
					label: '',
					sampleStart: 0,
					sampleDur: Math.round(curLineArr[1] * Soundhandlerservice.wavJSO.SampleRate)
				});
				for (i = headEndIdx + 2; i < lines.length - 1; i++) {
					curLineArr = lines[i].split(/\s+/);
					prevLineArr = lines[i - 1].split(/\s+/);
					labelJSO.levels[0].items.push({
						label: curLineArr[curLineArr.length - 1],
						sampleStart: Math.round(prevLineArr[1] * Soundhandlerservice.wavJSO.SampleRate),
						sampleDur: Math.round((curLineArr[1] - prevLineArr[1]) * Soundhandlerservice.wavJSO.SampleRate)
					});
				}

			}

			// console.log(JSON.stringify(labelJSO, undefined, 2));
			return labelJSO;
		};

		/**
		 *
		 */
		sServObj.toESPS = function (espsJSO) {
			var fBaseN = espsJSO.LevelName.substring(1);
			var espsStr = '';
			// construct header
			espsStr += 'signal ' + fBaseN + '\n';
			espsStr += 'nfields 1\n';
			espsStr += '#\n';
			var curLabel;
			espsJSO.items.forEach(function (i, idx) {
				if (i.label === '' && idx === 0) {
					curLabel = 'H#';
				} else {
					curLabel = i.label;
				}
				espsStr += '\t' + String((i.sampleStart + i.sampleDur) / Soundhandlerservice.wavJSO.SampleRate) + '\t125\t' + curLabel + '\n';
			});

			// console.log(espsStr);
			return espsStr;
		};

		return sServObj;
	});