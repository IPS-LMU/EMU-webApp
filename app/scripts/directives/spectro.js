'use strict';


angular.module('emulvcApp')
	.directive('spectro', function() {
		return {
			templateUrl: 'views/spectro.html',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// select the needed DOM elements from the template
				var canvas = element.find("canvas");
								
				var myid = element[0].id;

				scope.$watch('vs', function() {
					if (!$.isEmptyObject(scope.shs.currentBuffer)) {
					    alert("vs");
					}
				}, true);

				scope.$watch('viewState', function() {
				    alert("viewState");
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