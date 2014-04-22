'use strict';

angular.module('emuwebApp')
	.directive('correctiontool', function () {
		return {
			restrict: 'A',
			link: function (scope, element) {

				var canvas = element[0];
				var ctx = canvas.getContext('2d');			
				// var elem = element[0];
				var tr, col, sRaSt;

				element.bind('mousemove', function (event) {
					if (scope.vs.curCorrectionToolNr !== undefined && !scope.vs.getdragBarActive()) {
						// var col = scope.ssffds.data[0].Columns[0];
						if (tr === undefined) {
							var tr = scope.cps.getSsffTrackConfig('FORMANTS');
							var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
							var sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);
						}
						var startTimeVP = scope.vs.getViewPortStartTime();
						var endTimeVP = scope.vs.getViewPortEndTime();

						var colStartSampleNr = Math.round(startTimeVP * sRaSt.sampleRate + sRaSt.startTime);
						var colEndSampleNr = Math.round(endTimeVP * sRaSt.sampleRate + sRaSt.startTime);
						var nrOfSamples = colEndSampleNr - colStartSampleNr;
						// var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);


						// var curMouseTime = startTimeVP + (scope.dhs.getX(event) / event.originalEvent.srcElement.width) * (endTimeVP - startTimeVP);
						// var curMouseSample = Math.round((curMouseTime + col.startTime) * col.sampleRate);

						var curMouseSample = scope.vs.curMousePosSample;
						// var curMouseTime = scope.vs.curMousePosSample / scope.shs.wavJSO.sampleRate;
						scope.vs.curPreselColumnSample = curMouseSample - colStartSampleNr - 1; //-1 for in view correction

						console.log(scope.vs.curPreselColumnSample);

						// draw preselected sample
						
						

						// console.log(scope.vs.curPreselColumnSample);

						// if (event.shiftKey) {
						// 	var oldValue = angular.copy(curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1]);
						// 	var newValue = scope.vs.spectroSettings.rangeTo - scope.dhs.getY(event) / event.originalEvent.srcElement.height * scope.vs.spectroSettings.rangeTo;
						// 	// console.log('##########################');
						// 	// console.log(colStartSampleNr + scope.vs.curPreselColumnSample);
						// 	// console.log(scope.vs.curCorrectionToolNr - 1);
						// 	// console.log(oldValue);
						// 	// console.log(newValue);
						// 	curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1] = scope.vs.spectroSettings.rangeTo - scope.dhs.getY(event) / event.originalEvent.srcElement.height * scope.vs.spectroSettings.rangeTo;
						// 	scope.hists.updateCurChangeObj({
						// 		'type': 'SSFF',
						// 		'ssffIdx': 0,
						// 		'colIdx': 0,
						// 		'sampleBlockIdx': colStartSampleNr + scope.vs.curPreselColumnSample,
						// 		'sampleIdx': scope.vs.curCorrectionToolNr - 1,
						// 		'oldValue': oldValue,
						// 		'newValue': newValue
						// 	});
						// }
						scope.$apply();
					}
				});


			}
		};
	});