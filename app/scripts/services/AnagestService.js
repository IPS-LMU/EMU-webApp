'use strict';

angular.module('emuwebApp')
	.service('AnagestService', function LevelService($q, $log, viewState, LevelService, ConfigProviderService, Ssffdataservice, ArrayHelperService) {
		// shared service object
		var sServObj = {};
		/**
		 *
		 */
		sServObj.insertAnagestEvents = function () {

			// TODO: precheck if exist in interval

			// vertical position signal
			var trackName = ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.verticalPosSsffTrackName;
			var tr = ConfigProviderService.getSsffTrackConfig(trackName);
			var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);

			var sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);

			// velocity signal
			var vTrackName = ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.velocitySsffTrackName;
			var vTr = ConfigProviderService.getSsffTrackConfig(vTrackName);
			var vCol = Ssffdataservice.getColumnOfTrack(vTr.name, vTr.columnName);
			var vSRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(vTr.name);

			if (col.length !== 1 || vCol.length !== 1) {
				alert('UPS... the column length of of one of the tracks is != 1 this means something is badly configured in the DB!!!');
				return;
			}
			// flatten columns
			var flatColVals = ArrayHelperService.flattenArrayOfArray(col.values);
			var flatVcolVals = ArrayHelperService.flattenArrayOfArray(vCol.values);

			/////////////////////////////////////////

			var gdat = [NaN, NaN];
			var vdat = [NaN, NaN];
			var ndat = [NaN, NaN];
			var cdat = [NaN, NaN];

			// easiest way to handle non-tangential signals (and has no effect on tangential signals)
			vCol = ArrayHelperService.convertToAbsValues(vCol);

			// selected column samples
			var startTimeSel = viewState.getSelectedStartTime();
			var endTimeSel = viewState.getSelectedEndTime();
			var colStartSampleNr = Math.round(startTimeSel * sRaSt.sampleRate + sRaSt.startTime);
			var colEndSampleNr = Math.round(endTimeSel * sRaSt.sampleRate + sRaSt.startTime);

			var nrOfSamples = colEndSampleNr - colStartSampleNr;

			var selCol = flatColVals.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
			var selVCol = flatVcolVals.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);;


			// maxConstr
			var maxVerticalPos = ArrayHelperService.findMinMax(selCol, 'max');
			cdat[0] = maxVerticalPos.idx;

			// max vel before max constriction
			var maxVelBeforeMaxConstr = ArrayHelperService.findMinMax(selVCol.slice(0, cdat[0] + 1), 'max');
			vdat[0] = maxVelBeforeMaxConstr.idx;

			// min vel before max vel
			var minVelBeforeMaxVel = ArrayHelperService.findMinMax(selVCol.slice(0, vdat[0] + 1), 'min');

			// gesture onset
			$log.info('Looking for gesture onset');

			var defer = $q.defer();
			var promises = [];

			ArrayHelperService.interactiveFindThresholds(selVCol.slice(0, vdat[0] + 1), minVelBeforeMaxVel.val, maxVelBeforeMaxConstr.val, ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.threshold, 1, 'Looking for gesture onset').then(function (resp) {
				// keyboard;
				var on20 = resp;
				gdat[0] = on20;

				// min vel between max vel 1 and max constriction
				var minVelBetwMaxVel1maxConstr = ArrayHelperService.findMinMax(selVCol.slice(vdat[0], cdat[0]), 'min');

				var minp = minVelBetwMaxVel1maxConstr.idx + vdat[0] + 1;

				// nucleus onset
				$log.info('Looking for nucleus onset');
				ArrayHelperService.interactiveFindThresholds(selVCol.slice(vdat[0], minp), minVelBetwMaxVel1maxConstr.val, maxVelBeforeMaxConstr.val, ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.threshold, -1, 'Looking for nucleus onset').then(function (resp) {
					var off20 = resp;
					ndat[0] = off20 + vdat[0] - 1;

					// max vel after max constriction
					var maxVelAfterMaxConstr = ArrayHelperService.findMinMax(selVCol.slice(cdat[0]), 'max'); // max vel before max constriction
					vdat[1] = maxVelAfterMaxConstr.idx + cdat[0] - 1;


					// minimum between max constriction and max vel after constriction
					var minBetwMaxConstrMaxVelConstr = ArrayHelperService.findMinMax(selVCol.slice(cdat[0], vdat[1] + 1), 'min');

					minp = minBetwMaxConstrMaxVelConstr.idx + cdat[0] - 1;

					// nucleus offset
					$log.info('Looking for nucleus offset');
					ArrayHelperService.interactiveFindThresholds(selVCol.slice(minp, vdat[1] + 1), minBetwMaxConstrMaxVelConstr.val, maxVelBeforeMaxConstr.val, ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.threshold, 1, 'Looking for nucleus offset').then(function (resp) {
						var on20 = resp;
						ndat[1] = on20 + minp - 1;

						// minimum velocity after max vel after constriction
						var minVelAfterMaxVelAfterConstr = ArrayHelperService.findMinMax(selVCol.slice(vdat[1]), 'min');

						minp = minVelAfterMaxVelAfterConstr.idx + vdat[1] - 1;
						// gesture offset

						$log.info('Looking for gesture offset');
						ArrayHelperService.interactiveFindThresholds(selVCol.slice(vdat[1], minp + 1), minVelAfterMaxVelAfterConstr.val, maxVelBeforeMaxConstr.val, ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.threshold, -1, 'Looking for gesture offset').then(function (resp) {
							var off20 = resp;
							gdat[1] = off20 + vdat[1] - 1;
							// insert points
							// console.log(gdat)
							gdat[0] = Ssffdataservice.calculateSamplePosInVP(colStartSampleNr + gdat[0], sRaSt.sampleRate, sRaSt.startTime);
							gdat[1] = Ssffdataservice.calculateSamplePosInVP(colStartSampleNr + gdat[1], sRaSt.sampleRate, sRaSt.startTime);
							LevelService.insertPoint(viewState.getcurClickLevelName(), gdat[0], ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.gestureOnOffsetLabels[0]);
							LevelService.insertPoint(viewState.getcurClickLevelName(), gdat[1], ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.gestureOnOffsetLabels[1]);
							// console.log(vdat);
							vdat[0] = Ssffdataservice.calculateSamplePosInVP(colStartSampleNr + vdat[0], sRaSt.sampleRate, sRaSt.startTime);
							vdat[1] = Ssffdataservice.calculateSamplePosInVP(colStartSampleNr + vdat[1], sRaSt.sampleRate, sRaSt.startTime);
							LevelService.insertPoint(viewState.getcurClickLevelName(), vdat[0], ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.maxVelocityOnOffsetLabels[0]);
							LevelService.insertPoint(viewState.getcurClickLevelName(), vdat[1], ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.maxVelocityOnOffsetLabels[1]);
							// console.log(ndat);
							ndat[0] = Ssffdataservice.calculateSamplePosInVP(colStartSampleNr + ndat[0], sRaSt.sampleRate, sRaSt.startTime);
							ndat[1] = Ssffdataservice.calculateSamplePosInVP(colStartSampleNr + ndat[1], sRaSt.sampleRate, sRaSt.startTime);
							LevelService.insertPoint(viewState.getcurClickLevelName(), ndat[0], ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.constrictionPlateauBeginEndLabels[0]);
							LevelService.insertPoint(viewState.getcurClickLevelName(), ndat[1], ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.constrictionPlateauBeginEndLabels[1]);
							// console.log(cdat);
							cdat[0] = Ssffdataservice.calculateSamplePosInVP(colStartSampleNr + cdat[0], sRaSt.sampleRate, sRaSt.startTime);
							LevelService.insertPoint(viewState.getcurClickLevelName(), cdat[0], ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).anagestConfig.maxConstrictionLabel);
							console.log('Should auto hook up hierarchy');
						})
					});
				});

			}, function () {
				console.error('rejected duuuude!!!!');
			});
		};

		return sServObj;
	});