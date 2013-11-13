'use strict';

angular.module('emulvcApp')
	.service('Espsparserservice', function Espsparserservice(Soundhandlerservice) {
		// shared service object
		var sServObj = {};

		/**
		 *
		 */
		sServObj.toJSO = function(string, filePath) {

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
				fileInfos : [{
					fileURI: '',
					fileType: 'esps',
					associatedTierNames: [ext]
				}],
				tiers: []
			};

			labelJSO.tiers.push({
				TierName: ext,
				type: '',
				events: []
			});

			console.log(Soundhandlerservice.wavJSO);
			// set tier type
			var prevLineArr;
			var curLineArr = lines[headEndIdx + 1].split(/\s+/);
			if (curLineArr[curLineArr.length - 1] !== 'H#') {
				labelJSO.tiers[0].type = 'point';
			} else {
				labelJSO.tiers[0].type = 'seg';
			}

			if (labelJSO.tiers[0].type === 'point') {
				for (i = headEndIdx + 1; i < lines.length - 1; i++) {
					curLineArr = lines[i].split(/\s+/);
					labelJSO.tiers[0].events.push({
						label: curLineArr[curLineArr.length - 1],
						startSample: Math.round(curLineArr[1] * 44100) // SIC
					});
				}
			} else {
				// take care of H#
				curLineArr = lines[headEndIdx + 1].split(/\s+/);
				labelJSO.tiers[0].events.push({
					label: '',
					startSample: 0,
					sampleDur: Math.round(curLineArr[1] * labelJSO.origSamplerate)
				});
				for (i = headEndIdx + 2; i < lines.length - 1; i++) {
					curLineArr = lines[i].split(/\s+/);
					prevLineArr = lines[i - 1].split(/\s+/);
					labelJSO.tiers[0].events.push({
						label: curLineArr[curLineArr.length - 1],
						startSample: Math.round(prevLineArr[1] * 44100), // SIC
						sampleDur: Math.round((curLineArr[1] - prevLineArr[1]) * 44100) // SIC
					});
				}

			}

			// console.log(JSON.stringify(labelJSO, undefined, 2));
			return labelJSO;
		};

		return sServObj;
	});