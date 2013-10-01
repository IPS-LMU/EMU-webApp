'use strict';


angular.module('emulvcApp')
	.directive('osci', function() {
		return {
			templateUrl: 'views/osci.html',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// select the needed DOM elements from the template
				var canvas = element.find("canvas")[0];

								
				var myid = element[0].id;
				scope.$watch('tierDetails', function() {
					//drawTierDetails(scope.tierDetails,scope.viewState);
				}, true);

				scope.$watch('viewState', function() {
					//drawTierDetails(scope.tierDetails,scope.viewState);
				}, true);
				
				/**
				 * draw tier details
				 * @param tierDetails
				 * @param perx
				 * @param pery
				 */

				function drawTierDetails(tierDetails, viewPort) {

					if ($.isEmptyObject(tierDetails)) {
						 console.log("undef tierDetails");
						return;
					}
					if ($.isEmptyObject(viewPort)) {
						 console.log("undef viewPort");
						return;
					}
				}
			}
		}
	});