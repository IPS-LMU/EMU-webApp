'use strict';

angular.module('emulvcApp')
	.directive('correctiontool', function() {
		return {
			restrict: 'A',
			link: function(scope, element) {

				var elem = element[0];

				element.bind('mousemove', function(event) {
					var col = scope.ssffds.data[0].Columns[0]; // SIC hardcoded...
					var startTimeVP = scope.vs.getViewPortStartTime();
					var endTimeVP = scope.vs.getViewPortEndTime();

					var colStartSampleNr = Math.round(startTimeVP * col.sampleRate + col.startTime);
					var colEndSampleNr = Math.round(endTimeVP * col.sampleRate + col.startTime);
					var nrOfSamples = colEndSampleNr - colStartSampleNr;
					var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);


					var curMouseTime = startTimeVP + (scope.dhs.getX(event) / event.originalEvent.srcElement.width) * (endTimeVP - startTimeVP);
					var curMouseSample = Math.round((curMouseTime + col.startTime) * col.sampleRate);
					scope.vs.curPreselColumnSample = curMouseSample - colStartSampleNr - 1; //-1 for in view correction

					if (event.shiftKey) {
						curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1] = scope.vs.spectroSettings.rangeTo - scope.dhs.getY(event) / event.originalEvent.srcElement.height * scope.vs.spectroSettings.rangeTo;
						scope.changingSSFFdata();

					}
					scope.$apply();
				});

			}
		};
	});