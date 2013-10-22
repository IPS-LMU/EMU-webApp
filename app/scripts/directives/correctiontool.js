'use strict';

angular.module('emulvcApp')
	.directive('correctiontool', function() {
		return {
			restrict: 'A',
			link: function(scope, element) {

				var elem = element[0];

				element.bind('mousemove', function(event) {
					var col = scope.ssffData[0].Columns[0];
					var startTimeVP = scope.vs.getViewPortStartTime();
					var endTimeVP = scope.vs.getViewPortEndTime();

					var colStartSampleNr = Math.round((startTimeVP + col.startTime) * col.sampleRate);
					var colEndSampleNr = Math.round((endTimeVP + col.startTime) * col.sampleRate);
					var nrOfSamples = colEndSampleNr - colStartSampleNr;
					var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);


					var curMouseTime = startTimeVP + (scope.dhs.getX(event) / event.originalEvent.srcElement.width) * (endTimeVP - startTimeVP);
					var curMouseSample = Math.round((curMouseTime + col.startTime) * col.sampleRate);
					scope.vs.curPreselColumnSample = curMouseSample - colStartSampleNr;

					if (event.shiftKey) {
						curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1] = 8000 - scope.dhs.getY(event) / event.originalEvent.srcElement.height * 8000; // SIC hardcoded

					}
					scope.$apply();
				});

			}
		};
	});