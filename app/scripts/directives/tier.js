'use strict';


angular.module('emulvcApp')
	.directive('tier', function() {
		return {
			templateUrl: 'views/tier.html',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// select the needed DOM elements from the template
				var canvas = element.find("canvas");

				var myid = scope.tier.TierName;
				scope.$watch('tierDetails', function() {
					drawTierDetails(scope.tier, scope.viewState);
				}, true);

				scope.$watch('viewState', function() {
					drawTierDetails(scope.tier, scope.viewState);
				}, true);

				scope.updateView = function() {
					drawTierDetails(scope.tier, scope.viewState);
				};


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

					var ctx = canvas[0].getContext('2d');
					ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
					var sDist = viewPort.getSampleDist(canvas[0].width);
					var selection = viewPort.getSelect();

					// draw name of tier
					ctx.fillStyle = 'black';
					ctx.font = ('12' + 'px' + ' ' + 'Calibri');
					ctx.fillText(tierDetails.TierName, 5, 24);
					ctx.fillText("(" + tierDetails.type + ")", 5, 24 * 2);

					var segMId = viewPort.getcurMouseSegment();
					var segCId = viewPort.getselected();
					var curID = -1;
					var curPoS = selection[0];
					var curPoE = selection[1];
					if (tierDetails.type == "seg") {

						if (viewPort.selectS == viewPort.selectE) {
							if (viewPort.selectS !== -1) {
								// draw clickbox + pos line
								ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
								ctx.fillRect(curPoS - 5, 0, 10, 10);
								ctx.beginPath();
								ctx.moveTo(curPoS, 10);
								ctx.lineTo(curPoS, canvas.height);
								ctx.stroke();
							}
						} else {
							ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
							ctx.fillRect(posS, 0, curPoE - curPoS, canvas.height);
							ctx.beginPath();
							ctx.moveTo(curPoS, 0);
							ctx.lineTo(curPoS, canvas.height);
							ctx.moveTo(curPoE, 0);
							ctx.lineTo(curPoE, canvas.height);
							ctx.stroke();
						}

						// cc.fillStyle = this.params.startBoundaryColor;
						// draw segments
						var e = tierDetails.events;
						for (var k in e) {
							++curID;
							var curEvt = e[k];
							if (curEvt.startSample > viewPort.curViewPort.sS &&
								curEvt.startSample < viewPort.curViewPort.eS || //within segment
								curEvt.startSample + curEvt.sampleDur > viewPort.curViewPort.sS &&
								curEvt.startSample + curEvt.sampleDur < viewPort.curViewPort.eS || //end in segment
								curEvt.startSample < viewPort.curViewPort.sS &&
								curEvt.startSample + curEvt.sampleDur > viewPort.curViewPort.eS // within sample
							) {

								// draw segment start
								var posS = Math.round(viewPort.getPos(canvas[0].width, curEvt.startSample));
								var posE = Math.round(viewPort.getPos(canvas[0].width, curEvt.startSample + curEvt.sampleDur + 1));

								// check if selected -> if draw as marked
								var tierId = viewPort.getcurClickTierName();


								if (tierId == tierDetails.TierName) {

									segCId.forEach(function(entry) {
										if (entry == curID) {
											ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
											ctx.fillRect(posS, 0, posE - posS, canvas[0].height);
											ctx.fillStyle = 'black';
										}
									});

								}

								if (segMId == curEvt) {
									ctx.fillStyle = "blue";
									ctx.fillRect(posS, 0, 3, canvas[0].height);
									ctx.fillStyle = 'black';
								} else {
									ctx.fillStyle = 'black';
									ctx.fillRect(posS, 0, 2, canvas[0].height / 2);
								}


								//draw segment end

								// cc.fillStyle = this.params.endBoundaryColor;
								ctx.fillRect(posE, canvas[0].height / 2, 2, canvas[0].height);

								// 			// draw label 
								// 			// cc.strokeStyle = this.;
								// 			cc.fillStyle = this.params.labelColor;
								var tW = ctx.measureText(curEvt.label).width;
								var tX = posS + (posE - posS) / 2 - tW / 2;
								// 			//check for enough space to stroke text
								if (posE - posS > tW) {
									ctx.fillText(curEvt.label, tX, canvas[0].height / 2 + 3);
								}

								//draw helper lines
								if (posE - posS > ctx.measureText("m").width * 3) {
									// start helper line
									ctx.strokeStyle = 'black';
									ctx.beginPath();
									ctx.moveTo(posS, canvas[0].height / 4);
									ctx.lineTo(tX + tW / 2, canvas[0].height / 4);
									ctx.lineTo(tX + tW / 2, canvas[0].height / 4 + 10);
									ctx.stroke();

									// draw startSample numbers
									ctx.fillStyle = 'black';
									var sStW = ctx.measureText(curEvt.startSample).width;
									//check for enough space to stroke text
									if (posE - posS > sStW) {
										ctx.fillText(curEvt.startSample, posS + 3, canvas[0].height / 5);
									}
									// end helper line
									ctx.strokeStyle = 'black';
									ctx.beginPath();
									ctx.moveTo(posE, canvas[0].height / 4 * 3);
									ctx.lineTo(tX + tW / 2, canvas[0].height / 4 * 3);
									ctx.lineTo(tX + tW / 2, canvas[0].height / 4 * 3 - 10);
									ctx.stroke();
								}
								// draw sampleDur numbers.
								ctx.fillStyle = 'black';
								var sDtW = ctx.measureText("dur: " + curEvt.sampleDur).width;
								//check for enough space to stroke text
								if (posE - posS > sDtW) {
									ctx.fillText("dur: " + curEvt.sampleDur, posE - sDtW, canvas[0].height - canvas[0].height / 12);
								}
							}
						}
					}
				};
			}
		};
	});