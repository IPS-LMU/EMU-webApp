'use strict';


angular.module('emulvcApp')
	.directive('tier', function() {
		return {
			templateUrl: 'views/tier.html',
			restrict: 'E',
			link: function postLink(scope, element) {
				// select the needed DOM elements from the template
				var canvas = element.find('canvas');

				// var myid = scope.tier.TierName;
				scope.$watch('tierDetails', function() {
					drawTierDetails(scope.tier, scope.vs, scope.config);
				}, true);

				scope.$watch('vs', function() {
					drawTierDetails(scope.tier, scope.vs, scope.config);
					drawTierMarkup(scope.tier, scope.vs, scope.config);
					$('.HandletiersCtrl').css('padding-top', (scope.vs.getscroll() + scope.vs.getheightOsci() + scope.vs.getheightSpectro() + (2 * $('.menu').height()) + 5) + 'px');
				}, true);


				scope.updateView = function() {
					drawTierDetails(scope.tier, scope.vs, scope.config);
				};

				/**
				 * draw tier details
				 * @param tierDetails
				 * @param viewState
				 * @param cps
				 */

				function drawTierDetails(tierDetails, viewState, config) {

					if ($.isEmptyObject(tierDetails)) {
						//console.log("undef tierDetails");
						return;
					}
					if ($.isEmptyObject(viewState)) {
						//console.log("undef viewState");
						return;
					}
					if ($.isEmptyObject(config)) {
						//console.log("undef config");
						return;
					}

					var ctx = canvas[0].getContext('2d');
					ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);



					//predef vars
					var sDist, posS, posE;

					sDist = viewState.getSampleDist(canvas[0].width);
					// var selection = viewState.getSelect();

					// draw name of tier
					ctx.fillStyle = config.vals.colors.labelColor;
					ctx.font = (config.vals.colors.fontPxSize + 'px' + ' ' + config.vals.colors.fontType);
					ctx.fillText(tierDetails.TierName, 5, config.vals.colors.fontPxSize);
					ctx.fillText('(' + tierDetails.type + ')', 5, config.vals.colors.fontPxSize * 2);

					var segMId = viewState.getcurMouseSegmentId();
					var segCId = viewState.getselected();
					var curID = -1;
					// var curPoS = selection[0];
					// var curPoE = selection[1];
					if (tierDetails.type === 'seg') {
						ctx.fillStyle = config.vals.colors.startBoundaryColor;
						// draw segments
						var e = tierDetails.events;

						e.forEach(function(curEvt) {
							++curID;

							if (curEvt.startSample > viewState.curViewPort.sS &&
								curEvt.startSample < viewState.curViewPort.eS || //within segment
								curEvt.startSample + curEvt.sampleDur > viewState.curViewPort.sS &&
								curEvt.startSample + curEvt.sampleDur < viewState.curViewPort.eS || //end in segment
								curEvt.startSample < viewState.curViewPort.sS &&
								curEvt.startSample + curEvt.sampleDur > viewState.curViewPort.eS // within sample
							) {

								// draw segment start
								posS = Math.round(viewState.getPos(canvas[0].width, curEvt.startSample));
								posE = Math.round(viewState.getPos(canvas[0].width, curEvt.startSample + curEvt.sampleDur + 1));
								ctx.fillStyle = config.vals.colors.startBoundaryColor;
								ctx.fillRect(posS, 0, 2, canvas[0].height / 2);

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
								if (posE - posS > ctx.measureText('m').width * 3) {
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
								var sDtW = ctx.measureText('dur: ' + curEvt.sampleDur).width;
								//check for enough space to stroke text
								if (posE - posS > sDtW) {
									ctx.fillText('dur: ' + curEvt.sampleDur, posE - sDtW, canvas[0].height - canvas[0].height / 12);
								}
							}
						});
					} else if (tierDetails.type === 'point') {
						ctx.fillStyle = config.vals.colors.startBoundaryColor;
						// predef. vars
						var perc, tW;

						for (var k in tierDetails.events) {
							//for (curEvtNr = 0; curEvtNr < tierDetails.events.length; curEvtNr++) {
							var curEvt = tierDetails.events[k];
							// var id = viewState.getId(tierDetails, curEvt.label, curEvt.startSample);
							if (curEvt.startSample > viewState.curViewPort.sS && curEvt.startSample < viewState.curViewPort.eS) {
								perc = Math.round(viewState.getPos(canvas[0].width, curEvt.startSample) + (sDist / 2));

								if (tierDetails.TierName === viewState.curMouseMoveTierName && segMId === viewState.curMouseMoveSegmentName) {
									console.log('this is the selected boundary');
									// 		ctx.fillStyle = config.vals.colors.selectedBoundaryColor;
									// 		ctx.fillRect(perc, 0, 8, canvas[0].height / 2 - canvas[0].height / 10);
									// 		ctx.fillRect(perc, canvas[0].height / 2 + canvas[0].height / 10, 8, canvas[0].height / 2 - canvas[0].height / 10);
									// 		tW = ctx.measureText(tierDetails.events[k].label).width;
									// 		ctx.fillStyle = this.params.labelColor;
									// 		ctx.fillText(tierDetails.events[k].label, perc - tW / 2 + 1, canvas[0].height / 2);
								} else {
									ctx.fillStyle = config.vals.colors.startBoundaryColor;
									ctx.fillRect(perc, 0, 1, canvas[0].height / 2 - canvas[0].height / 10);
									ctx.fillRect(perc, canvas[0].height / 2 + canvas[0].height / 10, 1, canvas[0].height / 2 - canvas[0].height / 10);
									tW = ctx.measureText(tierDetails.events[k].label).width;
									ctx.fillStyle = config.vals.colors.labelColor;
									ctx.fillText(tierDetails.events[k].label, perc - tW / 2 + 1, canvas[0].height / 2);
								}
								ctx.fillStyle = config.vals.colors.startBoundaryColor;
								tW = ctx.measureText(curEvt.startSample).width;
								ctx.fillText(curEvt.startSample, perc + 5, canvas[0].height / 8);


							}
						}
					}
					// draw cursor/selected area
				}

				function drawTierMarkup(tierDetails, viewState, config) {
					var ctx = canvas[1].getContext('2d');
					ctx.clearRect(0, 0, canvas[1].width, canvas[1].height);
					
					if (tierDetails.TierName === viewState.curClickTierName) {
						ctx.fillStyle = config.vals.colors.selectedTierColor;
						ctx.fillRect(0, 0, canvas[0].width, canvas[0].height);
					}					
					
					var posS, posE, sDist, xOffset, curEvt;

					posS = viewState.getPos(canvas[1].width, viewState.curViewPort.selectS);
					posE = viewState.getPos(canvas[1].width, viewState.curViewPort.selectE);
					sDist = viewState.getSampleDist(canvas[1].width);

					if (posS === posE) {
						// calc. offset dependant on type of tier of mousemove  -> default is sample exact
						if (viewState.curMouseMoveTierType === 'seg') {
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



					var segMId = viewState.getcurMouseSegmentId();
					var segCId = viewState.getselected();
					var tierId = viewState.getcurClickTierName();

					// draw clicked on selected areas
					if (tierId !== '' && tierDetails.TierName === tierId) {
						segCId.forEach(function(entry) {
							curEvt = tierDetails.events[entry];
							posS = Math.round(viewState.getPos(canvas[0].width, curEvt.startSample));
							posE = Math.round(viewState.getPos(canvas[0].width, curEvt.startSample + curEvt.sampleDur + 1));
							ctx.fillStyle = config.vals.colors.selectedSegmentColor;
							ctx.fillRect(posS, 0, posE - posS, canvas[0].height);
							ctx.fillStyle = config.vals.colors.startBoundaryColor;
						});
					}
					// draw preselected boundary
					if (segMId !== undefined && tierDetails.TierName === viewState.getcurMouseTierName()) {
						curEvt = tierDetails.events[segMId];
						
						posS = Math.round(viewState.getPos(canvas[1].width, curEvt.startSample));
						posE = Math.round(viewState.getPos(canvas[1].width, curEvt.startSample + curEvt.sampleDur + 1));

						ctx.fillStyle = config.vals.colors.selectedBoundaryColor;
						ctx.fillRect(posS, 0, 3, canvas[1].height);
						ctx.fillStyle = config.vals.colors.startBoundaryColor;
					}


				}
			}
		};
	});