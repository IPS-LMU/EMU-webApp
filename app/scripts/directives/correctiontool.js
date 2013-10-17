'use strict';

angular.module('emulvcApp')
	.directive("correctiontool", function() {
		return {
			restrict: "A",
			link: function(scope, element) {

				var elem = element[0];

				element.bind('mousemove', function(event) {
					if (event.shiftKey) {
						scope.$apply(
							scope.ssffData[0].Columns[0].values.forEach(function(arr, arrIDX) {
								if (scope.vs.curCorrectionToolNr != -1) {
									arr[scope.vs.curCorrectionToolNr - 1] = 8000 - scope.dhs.getY(event) / event.originalEvent.srcElement.height * 8000; // SIC hardcoded
								}
							})
						);
					}
				});

			}
		};
	});