'use strict';

angular.module('emuwebApp')
	.service('Textgridparserservice', function Textgridparserservice(Soundhandlerservice, viewState) {
		// shared service object
		var sServObj = {};
		sServObj.shs = Soundhandlerservice;
		sServObj.l1 = 'File type = \"ooTextFile\"';
		sServObj.l2 = 'Object class = \"TextGrid\"';

		/**
		 * parse a textgrid string to the specified json format
		 *
		 * @param string TextGrid file string to be parsed
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
				origSamplerate: this.shs.wavJSO.SampleRate,
				fileURI: '',
				levels: []
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
						// get level type
						if (lines[i + 1].split(/=/)[1] === '\"IntervalLevel\"') {
							tT = 'seg';
						} else {
							tT = 'point';
						}
						// get level name
						tN = lines[i + 2].split(/=/)[1].replace(/"/g, '');

						// adding new level
						labelJSO.levels.push({
							LevelName: tN,
							type: tT,
							items: []
						});
					}
					if (labelJSO.levels.length > 0 && labelJSO.levels[labelJSO.levels.length - 1].type === 'seg' && (cL.indexOf('intervals') === 0) && (cL.indexOf('intervals:') !== 0)) {
						// parse seg levels event
						var eSt = Math.ceil(lines[i + 1].split(/=/)[1] * this.shs.wavJSO.SampleRate);
						var eEt = Math.floor(lines[i + 2].split(/=/)[1] * this.shs.wavJSO.SampleRate);
						lab = lines[i + 3].split(/=/)[1].replace(/"/g, '');

						// var correctFact = 0;
						if (eSt === 0) {
							eSt = eSt + 1; // for start first sample is 1
						}

						labelJSO.levels[labelJSO.levels.length - 1].items.push({
							label: lab,
							sampleStart: eSt - 1, // correct so starts at 0
							sampleDur: eEt - eSt
						});
					} else if (labelJSO.levels.length > 0 && labelJSO.levels[labelJSO.levels.length - 1].type === 'point' && cL.indexOf('points') === 0 && cL.indexOf('points:') !== 0) {
						// parse point level event
						eT = lines[i + 1].split(/=/)[1] * this.shs.wavJSO.SampleRate;
						lab = lines[i + 2].split(/=/)[1].replace(/"/g, '');

						labelJSO.levels[labelJSO.levels.length - 1].items.push({
							label: lab,
							sampleStart: Math.round(eT)
						});
					}

				}
				// console.log(JSON.stringify(labelJSO, undefined, 2));
				this.testForGapsInLabelJSO(labelJSO);
				return labelJSO;

			} else {
				alert('bad header in TextGrid file!!! The header has to be: ', this.l1, '\n', this.l2);
			}

		};

		/**
		 * converts the internal levels format returned from levelHandler.getLevels
		 * to a string containing a TextGrid file
		 */
		sServObj.toTextGrid = function() {

			var l1 = 'File type = \"ooTextFile\"';
			var l2 = 'Object class = \"TextGrid\"';
			var tG = '';
			var nl = '\n';
			var t = '\t';

			// writing header infos
			tG = tG + l1 + nl + l2 + nl + nl;
			tG = tG + 'xmin = ' + sServObj.findTimeOfMinSample() + nl;
			tG = tG + 'xmax = ' + sServObj.findTimeOfMaxSample() + nl;
			tG = tG + 'levels? <exists>' + nl;
			tG = tG + 'size = ' + $('#HandleLevelsCtrl').scope().getLevelLength() + nl;
			tG = tG + 'item []:' + nl;
			var levelNr = 0;
			$('#HandleLevelsCtrl level').each(function() {
				var curLevel = $('#HandleLevelsCtrl').scope().getLevel($(this).attr('id'));
				//write level items
				levelNr = levelNr + 1;
				tG = tG + t + 'item [' + levelNr + ']:' + nl;
				if (curLevel.type === 'seg') {
					tG = tG + t + t + 'class = "IntervalLevel"' + nl;
				} else if (curLevel.type === 'point') {
					tG = tG + t + t + 'class = "TextLevel"' + nl;
				}
				tG = tG + t + t + 'name = "' + curLevel.LevelName + '"' + nl;
				tG = tG + t + t + 'xmin = ' + sServObj.findTimeOfMinSample() + nl;
				tG = tG + t + t + 'xmax = ' + sServObj.findTimeOfMaxSample() + nl;
				if (curLevel.type === 'seg') {
					tG = tG + t + t + 'intervals: size = ' + curLevel.items.length + nl;
				} else if (curLevel.type === 'point') {
					tG = tG + t + t + 'points: size = ' + curLevel.items.length + nl;
				}
				for (var j = 0; j < curLevel.items.length; j++) {
					var evtNr = j + 1;
					if (curLevel.type === 'seg') {
						tG = tG + t + t + t + 'intervals [' + evtNr + ']:' + nl;
						if (curLevel.items[j].sampleStart !== 0) {
							tG = tG + t + t + t + t + 'xmin = ' + ((curLevel.items[j].sampleStart) / Soundhandlerservice.wavJSO.SampleRate + ((1 / Soundhandlerservice.wavJSO.SampleRate) / 2)) + nl;
						} else {
							tG = tG + t + t + t + t + 'xmin = ' + 0 + nl;
						}
						if (j < curLevel.items.length - 1) {
							tG = tG + t + t + t + t + 'xmax = ' + ((curLevel.items[j].sampleStart + curLevel.items[j].sampleDur + 1) / Soundhandlerservice.wavJSO.SampleRate + ((1 / Soundhandlerservice.wavJSO.SampleRate) / 2)) + nl;
						} else {
							tG = tG + t + t + t + t + 'xmax = ' + sServObj.findTimeOfMaxSample() + nl;
						}

						tG = tG + t + t + t + t + 'text = "' + curLevel.items[j].label + '"' + nl;
					} else if (curLevel.type === 'point') {
						tG = tG + t + t + t + 'points[' + evtNr + ']:' + nl;
						tG = tG + t + t + t + t + 'time = ' + curLevel.items[j].sampleStart / Soundhandlerservice.wavJSO.SampleRate + nl;
						tG = tG + t + t + t + t + 'mark = "' + curLevel.items[j].label + '"' + nl;
					}
				}
			});
			return (tG);
		};


		/**
		 *
		 */
		sServObj.findTimeOfMinSample = function() {
			return 0.000000; // maybe needed at some point...
		};

		/**
		 *
		 */
		sServObj.findTimeOfMaxSample = function() {
			return viewState.curViewPort.bufferLength / Soundhandlerservice.wavJSO.SampleRate;
		};


		/**
		 * test to see if all the segments in seg levels
		 * are "snapped" -> sampleStart+dur+1 = sampleStart of next Segment
		 */
		sServObj.testForGapsInLabelJSO = function(labelJSO) {
			var counter = 0;
			for (var i = 0; i < labelJSO.levels.length; i++) {
				if (labelJSO.levels[i].type === 'seg') {
					for (var j = 0; j < labelJSO.levels[i].items.length - 1; j++) {
						if (labelJSO.levels[i].items[j].sampleStart + labelJSO.levels[i].items[j].sampleDur + 1 !== labelJSO.levels[i].items[j + 1].sampleStart) {
							counter = counter + 1;
						}
					}
				}
			}
			// console.log('TextGridParser had: ', counter, 'alignment issues found in parsed TextGrid');
		};

		return sServObj;
	});