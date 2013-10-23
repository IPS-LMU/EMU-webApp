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
					drawTierDetails(scope.tier, scope.vs, scope.config);
				}, true);

				scope.$watch('vs', function() {
					drawTierDetails(scope.tier, scope.vs, scope.config);
					$(".HandletiersCtrl").css("padding-top",(scope.vs.getscroll()+scope.vs.getheightOsci()+scope.vs.getheightSpectro() + (2*$(".menu").height()) + 5)+"px");
				}, true);


				scope.updateView = function() {
					drawTierDetails(scope.tier, scope.vs, scope.config);
				};

				/**
				 * draw tier details
				 * @param tierDetails
				 * @param viewPort
				 * @param cps
				 */

				function drawTierDetails(tierDetails, viewPort, config) {

					if ($.isEmptyObject(tierDetails)) {
						//console.log("undef tierDetails");
						return;
					}
					if ($.isEmptyObject(viewPort)) {
						//console.log("undef viewPort");
						return;
					}
					if ($.isEmptyObject(config)) {
						//console.log("undef config");
						return;
					}
			
					var ctx = canvas[0].getContext('2d');
					ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);

					if (tierDetails.TierName == viewPort.curClickTierName) {
						ctx.fillStyle = config.vals.colors.selectedTierColor;
						ctx.fillRect(0, 0, canvas[0].width, canvas[0].height);
					}

					var sDist = viewPort.getSampleDist(canvas[0].width);
					var selection = viewPort.getSelect();
					
					// draw name of tier
					ctx.fillStyle = config.vals.colors.labelColor;
					ctx.font = (config.vals.colors.fontPxSize + 'px' + ' ' + config.vals.colors.fontType);
					ctx.fillText(tierDetails.TierName, 5, config.vals.colors.fontPxSize);
					ctx.fillText("(" + tierDetails.type + ")", 5, config.vals.colors.fontPxSize * 2);

					var segMId = viewPort.getcurMouseSegmentId();
					var segCId = viewPort.getselected();
					var curID = -1;
					var curPoS = selection[0];
					var curPoE = selection[1];
					if (tierDetails.type == "seg") {
						var posS = viewPort.getPos(canvas[0].width, viewPort.curViewPort.selectS);
						var posE = viewPort.getPos(canvas[0].width, viewPort.curViewPort.selectE);
						var sDist = viewPort.getSampleDist(canvas[0].width);
						var xOffset;
						if (posS == posE) {
							// calc. offset dependant on type of tier of mousemove  -> default is sample exact
							if (viewPort.curMouseMoveTierType == "seg") {
								xOffset = 0;
							} else {
								xOffset = (sDist / 2);
							}
							ctx.fillStyle = config.vals.colors.selectedBorderColor;
							ctx.fillRect(posS + xOffset, 0, 1, canvas[0].height);
						} else {
							ctx.fillStyle = config.vals.colors.selectedAreaColor;
							ctx.fillRect(posS, 0, posE - posS, canvas[0].height);
							ctx.strokeStyle = config.vals.colors.selectedBoundaryColor;
							ctx.beginPath();
							ctx.moveTo(posS, 0);
							ctx.lineTo(posS, canvas[0].height);
							ctx.moveTo(posE, 0);
							ctx.lineTo(posE, canvas[0].height);
							ctx.closePath();
							ctx.stroke();

						}

						ctx.fillStyle = config.vals.colors.startBoundaryColor;
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
											ctx.fillStyle = config.vals.colors.selectedSegmentColor;
											ctx.fillRect(posS, 0, posE - posS, canvas[0].height);
											ctx.fillStyle = config.vals.colors.startBoundaryColor;
										}
									});

								}

								if (segMId == curID && tierDetails.TierName == viewPort.getcurMouseTierName()) {
									ctx.fillStyle = "blue"; //SIC -> colors externally defined
									ctx.fillRect(posS, 0, 3, canvas[0].height);
									ctx.fillStyle = 'black'; //SIC -> colors externally defined
								} else {
									ctx.fillStyle = 'black'; //SIC -> colors externally defined
									ctx.fillRect(posS, 0, 2, canvas[0].height / 2);
								}


								//draw segment end

								ctx.fillStyle = config.vals.colors.endBoundaryColor;
								ctx.fillRect(posE, canvas[0].height / 2, 2, canvas[0].height);

								// draw label 
								ctx.strokeStyle = config.vals.colors.labelColor;
								ctx.fillStyle = config.vals.colors.labelColor;
								var tW = ctx.measureText(curEvt.label).width;
								var tX = posS + (posE - posS) / 2 - tW / 2;
								// 			//check for enough space to stroke text
								if (posE - posS > tW) {
									ctx.fillText(curEvt.label, tX, canvas[0].height / 2 + 3);
								}

								//draw helper lines
								if (posE - posS > ctx.measureText("m").width * 3) {
									// start helper line
									ctx.strokeStyle = config.vals.colors.startBoundaryColor;
									ctx.beginPath();
									ctx.moveTo(posS, canvas[0].height / 4);
									ctx.lineTo(tX + tW / 2, canvas[0].height / 4);
									ctx.lineTo(tX + tW / 2, canvas[0].height / 4 + 10);
									ctx.stroke();

									// draw startSample numbers
									ctx.fillStyle = config.vals.colors.startBoundaryColor;
									var sStW = ctx.measureText(curEvt.startSample).width;
									//check for enough space to stroke text
									if (posE - posS > sStW) {
										ctx.fillText(curEvt.startSample, posS + 3, canvas[0].height / 5);
									}
									// end helper line
									ctx.strokeStyle = config.vals.colors.endBoundaryColor;
									ctx.beginPath();
									ctx.moveTo(posE, canvas[0].height / 4 * 3);
									ctx.lineTo(tX + tW / 2, canvas[0].height / 4 * 3);
									ctx.lineTo(tX + tW / 2, canvas[0].height / 4 * 3 - 10);
									ctx.stroke();
								}
								// draw sampleDur numbers.
								ctx.fillStyle = config.vals.colors.endBoundaryColor;
								var sDtW = ctx.measureText("dur: " + curEvt.sampleDur).width;
								//check for enough space to stroke text
								if (posE - posS > sDtW) {
									ctx.fillText("dur: " + curEvt.sampleDur, posE - sDtW, canvas[0].height - canvas[0].height / 12);
								}
							}
						}
					} else {
						//console.log(tierDetails.type);
						var posS = Math.round(viewPort.getPos(canvas[0].width, viewPort.curViewPort.selectS));
						var posE = viewPort.getPos(canvas[0].width, viewPort.curViewPort.selectE);
					}
					// draw cursor/selected area
				}
			}
		};
	});