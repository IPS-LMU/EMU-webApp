'use strict';

angular.module('emulvcApp')
	.service('Textgridparserservice', function Textgridparserservice(Soundhandlerservice) {
		// shared service object
		var sServObj = {};
		sServObj.shs = Soundhandlerservice;
		sServObj.l1 = 'File type = \"ooTextFile\"';
		sServObj.l2 = 'Object class = \"TextGrid\"';

		/**
		 * parse a textgrid string to the specified json format
		 *
		 * @param string TextGrid file string to be parsed
		 * @param fileName name of textGrid including ext.
		 * @returns a label java script object
		 */
		sServObj.toJSO = function(string) {

			// remove all empty lines from string
			string = string.replace(/([ \t]*\r?\n)+/g, '\n');
			// remove all blanks
			string = string.replace(/[ \t]+/g, '');
			var lines = string.split('\n');

			var tT, tN, eT, lab;
			var inHeader = true;

			//meta info for labelJSO
			var labelJSO = {
				origSamplerate: this.ssr,
				labelEncoding: 'UTF-8',
				tiers: []
			};

			if (lines[0].replace(/\s+/g, '') === this.l1.replace(/\s+/g, '') && lines[1].replace(/\s+/g, '') === this.l2.replace(/\s+/g, '')) {
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
						// get tier type
						if (lines[i + 1].split(/=/)[1] === '\"IntervalTier\"') {
							tT = 'seg';
						} else {
							tT = 'point';
						}
						// get tier name
						tN = lines[i + 2].split(/=/)[1].replace(/"/g, '');

						// adding new tier
						labelJSO.tiers.push({
							TierName: tN,
							type: tT,
							events: []
						});
					}
					if (labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length - 1].type === 'seg' && (cL.indexOf('intervals') === 0) && (cL.indexOf('intervals:') !== 0)) {
						// parse seg tiers event
						var eSt = Math.ceil(lines[i + 1].split(/=/)[1] * this.shs.wavJSO.SampleRate);
						var eEt = Math.floor(lines[i + 2].split(/=/)[1] * this.shs.wavJSO.SampleRate);
						lab = lines[i + 3].split(/=/)[1].replace(/"/g, '');

						// var correctFact = 0;
						if (eSt === 0) {
							eSt = eSt + 1; // for start first sample is 1
						}

						labelJSO.tiers[labelJSO.tiers.length - 1].events.push({
							label: lab,
							startSample: eSt - 1, // correct so starts at 0
							sampleDur: eEt - eSt
						});
					} else if (labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length - 1].type === 'point' && cL.indexOf('points') === 0 && cL.indexOf('points:') !== 0) {
						// parse point tier event
						eT = lines[i + 1].split(/=/)[1] * this.shs.wavJSO.SampleRate;
						lab = lines[i + 2].split(/=/)[1].replace(/"/g, '');

						labelJSO.tiers[labelJSO.tiers.length - 1].events.push({
							label: lab,
							startSample: Math.round(eT)
						});
					}

				}
				// console.log(JSON.stringify(labelJSO, undefined, 2));
				this.testForGapsInLabelJSO(labelJSO);
				return labelJSO;

			} else {
				alert('bad header in textgrid file!!! The header has to be: ', this.l1, '\n', this.l2);
			}

		};



		/**
		 * test to see if all the segments in seg tiers
		 * are "snapped" -> startSample+dur+1 = startSample of next Segment
		 */
		sServObj.testForGapsInLabelJSO = function(labelJSO) {
			var counter = 0;
			for (var i = 0; i < labelJSO.tiers.length; i++) {
				if (labelJSO.tiers[i].type === 'seg') {
					for (var j = 0; j < labelJSO.tiers[i].events.length - 1; j++) {
						if (labelJSO.tiers[i].events[j].startSample + labelJSO.tiers[i].events[j].sampleDur + 1 !== labelJSO.tiers[i].events[j + 1].startSample) {
							counter = counter + 1;
						}
					}
				}
			}
			console.log('TextGridParser had: ', counter, 'alignment issues found in parsed TextGrid');
		};

		return sServObj;
	});