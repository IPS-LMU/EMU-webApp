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
					drawTierDetails(scope.tier, scope.vs, scope.cps);
				}, true);

				scope.$watch('vs', function() {
					drawTierDetails(scope.tier, scope.vs, scope.cps);
				}, true);

				scope.updateView = function() {
					drawTierDetails(scope.tier, scope.vs, scope.cps);
				};

				/**
				 * draw tier details
				 * @param tierDetails
				 * @param perx
				 * @param pery
				 */

				function drawTierDetails(tierDetails, viewPort, cps) {

					if ($.isEmptyObject(tierDetails)) {
						console.log("undef tierDetails");
						return;
					}
					if ($.isEmptyObject(viewPort)) {
						console.log("undef viewPort");
						return;
					}
					if ($.isEmptyObject(cps)) {
						console.log("undef cps");
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
						var posS = viewPort.getPos(canvas.width, viewPort.curViewPort.selectS);
						var posE = viewPort.getPos(canvas.width, viewPort.curViewPort.selectE);
						var sDist = viewPort.getSampleDist(canvas.width);
						var xOffset;        
					if (viewPort.curViewPort.selectS == viewPort.curViewPort.selectE) {
						// calc. offset dependant on type of tier of mousemove  -> default is sample exact
						if (viewPort.curMouseMoveTierType == "seg") {
							xOffset = 0;
						} else {
							xOffset = (sDist / 2);
						}
						ctx.fillStyle = cps.vals.selectedBorderColor;
						ctx.fillRect(posS + xOffset, 0, 1, canvas.height);
						ctx.fillStyle = cps.vals.labelColor;
						ctx.fillText(viewPort.round(viewPort.curViewPort.selectS / 44100 + (1 / 44100) / 2, 6), posS + xOffset + 5, cps.vals.fontPxSize);
						ctx.fillText(viewPort.curViewPort.selectS, posS + xOffset + 5, cps.vals.fontPxSize * 2);
					} else {
						ctx.fillStyle = cps.vals.selectedAreaColor;
						ctx.fillRect(posS, 0, posE - posS, canvas.height);
						ctx.strokeStyle = cps.vals.selectedBoundaryColor;
						ctx.beginPath();
						ctx.moveTo(posS, 0);
						ctx.lineTo(posS, canvas.height);
						ctx.moveTo(posE, 0);
						ctx.lineTo(posE, canvas.height);
						ctx.closePath();
						ctx.stroke();
						ctx.fillStyle = canvas.labelColor;
						// start values
						var tW = ctx.measureText(viewPort.curViewPort.selectS).width;
						ctx.fillText(viewPort.curViewPort.selectS, posS - tW - 4, cps.vals.fontPxSize);
						tW = ctx.measureText(viewPort.round(viewPort.curViewPort.selectS / 44100, 6)).width;
						ctx.fillText(viewPort.round(viewPort.curViewPort.selectS / 44100, 6), posS - tW - 4, cps.vals.fontPxSize * 2);
						// end values
						ctx.fillText(viewPort.curViewPort.selectE, posE + 5, cps.vals.fontPxSize);
						ctx.fillText(viewPort.round(viewPort.curViewPort.selectE / 44100, 6), posE + 5, cps.vals.fontPxSize * 2);
						// dur values
						// check if space
						if (posE - posS > ctx.measureText(viewPort.round((viewPort.curViewPort.selectE - viewPort.curViewPort.selectS) / 44100, 6)).width) {
							tW = ctx.measureText(viewPort.curViewPort.selectE - viewPort.curViewPort.selectS).width;
							ctx.fillText(viewPort.curViewPort.selectE - viewPort.curViewPort.selectS - 1, posS + (posE - posS) / 2 - tW / 2, cps.vals.fontPxSize);
							tW = ctx.measureText(viewPort.round((viewPort.curViewPort.selectE - viewPort.curViewPort.selectS) / 44100, 6)).width;
							ctx.fillText(viewPort.round(((viewPort.curViewPort.selectE - viewPort.curViewPort.selectS) / 44100), 6), posS + (posE - posS) / 2 - tW / 2, cps.vals.fontPxSize * 2);
						}
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