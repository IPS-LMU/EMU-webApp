'use strict';


angular.module('emulvcApp')
	.directive('level', function () {
		return {
			templateUrl: 'views/level.html',
			restrict: 'E',
			link: function postLink(scope, element) {
				// select the needed DOM elements from the template
				var canvas = element.find('canvas');

				scope.$watch('tierDetails.data', function () {
					drawTierDetails(scope.tier, scope.vs, scope.config);
				}, true);

				scope.$watch('vs', function () {
					drawTierDetails(scope.tier, scope.vs, scope.config);
					drawTierMarkup(scope.tier, scope.vs, scope.config);
				}, true);

				// on mouse leave reset viewState.
				element.bind('mouseleave', function () {
					scope.vs.setcurMouseSegmentId(undefined);
					drawTierMarkup(scope.tier, scope.vs, scope.config);
				});

				scope.$on('refreshTimeline', function () {
					if (!$.isEmptyObject(scope.tier)) {
						if (!$.isEmptyObject(scope.vs)) {
							drawTierDetails(scope.tier, scope.vs, scope.config);
						}
					}
				});


				scope.updateView = function () {
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
					var sDist, posS, posE, horizontalText;

					sDist = viewState.getSampleDist(canvas[0].width);
					// var selection = viewState.getSelect();

					horizontalText = scope.fontImage.getTextImageTwoLines(ctx, tierDetails.TierName, '(' + tierDetails.type + ')', config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, false);
					ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 5, 0, horizontalText.width, horizontalText.height);

					var segMId = viewState.getcurMouseSegmentId();
					var segCId = viewState.getcurClickSegments();
					var tierId = viewState.getcurClickLevelName();
					var curID = -1;
					// var curPoS = selection[0];
					// var curPoE = selection[1];
					if (tierDetails.type === 'seg') {
						ctx.fillStyle = config.vals.colors.startBoundaryColor;
						// draw segments
						var e = tierDetails.elements;

						e.forEach(function (curEvt) {
							++curID;

							if (curEvt.startSample >= viewState.curViewPort.sS &&
								curEvt.startSample <= viewState.curViewPort.eS || //within segment
								curEvt.startSample + curEvt.sampleDur > viewState.curViewPort.sS &&
								curEvt.startSample + curEvt.sampleDur < viewState.curViewPort.eS || //end in segment
								curEvt.startSample < viewState.curViewPort.sS &&
								curEvt.startSample + curEvt.sampleDur > viewState.curViewPort.eS // within sample
							) {

								// draw segment start
								//posS = Math.round(viewState.getPos(canvas[0].width, curEvt.startSample));
								//posE = Math.round(viewState.getPos(canvas[0].width, curEvt.startSample + curEvt.sampleDur+1));
								posS = viewState.getPos(canvas[0].width, curEvt.startSample);
								posE = viewState.getPos(canvas[0].width, curEvt.startSample + curEvt.sampleDur);

								ctx.fillStyle = config.vals.colors.startBoundaryColor;
								ctx.fillRect(posS, 0, 2, canvas[0].height / 2);

								//draw segment end
								ctx.fillStyle = config.vals.colors.endBoundaryColor;
								ctx.fillRect(posE, canvas[0].height / 2, 2, canvas[0].height);

								horizontalText = scope.fontImage.getTextImage(ctx, curEvt.label, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor);
								var tW = scope.fontImage.getLastImageWidth();
								var tX = posS + (posE - posS) / 2 - tW / 2;

								// 			//check for enough space to stroke text
								if (posE - posS > (tW)) {
									ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, tX, (canvas[0].height / 2) - (config.vals.font.fontPxSize), horizontalText.width, horizontalText.height);
								}

								var horizontalSubText1 = scope.fontImage.getTextImage(ctx, curEvt.startSample, config.vals.font.fontPxSize - 2, config.vals.font.fontType, config.vals.colors.endBoundaryColor);
								var hst1 = scope.fontImage.getLastImageWidth();
								var tX1 = posS + (posE - posS) / 2 - hst1 / 2;
								var horizontalSubText2 = scope.fontImage.getTextImage(ctx, 'dur: ' + curEvt.sampleDur, config.vals.font.fontPxSize - 2, config.vals.font.fontType, config.vals.colors.endBoundaryColor);
								var hst2 = scope.fontImage.getLastImageWidth();
								// var tX2 = posS + (posE - posS) / 2 - hst2 / 2;
								//draw helper lines


								// start helper line
								ctx.strokeStyle = config.vals.colors.startBoundaryColor;
								ctx.beginPath();
								ctx.moveTo(posS, canvas[0].height / 4);
								ctx.lineTo(tX1 + hst1 / 2, canvas[0].height / 4);
								ctx.lineTo(tX1 + hst1 / 2, canvas[0].height / 4 + 10);
								ctx.stroke();
								// end helper line
								ctx.strokeStyle = config.vals.colors.endBoundaryColor;
								ctx.beginPath();
								ctx.moveTo(posE, canvas[0].height / 4 * 3);
								ctx.lineTo(tX1 + hst1 / 2, canvas[0].height / 4 * 3);
								ctx.lineTo(tX1 + hst1 / 2, canvas[0].height / 4 * 3 - 10);
								ctx.stroke();

								if (posE - posS <= tW) {

									ctx.strokeStyle = config.vals.colors.startBoundaryColor;
									ctx.beginPath();
									ctx.moveTo(tX1 + hst1 / 2, canvas[0].height / 4 + 10);
									ctx.lineTo(tX1 + hst1 / 2, canvas[0].height / 4 + 30);
									ctx.stroke();
								}

								// draw startSample numbers
								//check for enough space to stroke text
								if (posE - posS > hst1) {
									ctx.drawImage(horizontalSubText1, 0, 0, horizontalText.width, horizontalText.height, posS + 3, 0, horizontalText.width, horizontalText.height);
								}
								// draw sampleDur numbers.

								//sStW = scope.fontImage.getLastImageWidth();
								//var sDtW = ctx.measureText('dur: ' + curEvt.sampleDur).width;
								//ctx.fillStyle = config.vals.colors.endBoundaryColor;
								//check for enough space to stroke text
								if (posE - posS > hst2) {
									ctx.drawImage(horizontalSubText2, 0, 0, horizontalText.width, horizontalText.height, posE - hst2, canvas[0].height / 4 * 3 - 5, horizontalText.width, horizontalText.height);
									//ctx.fillText('dur: ' + curEvt.sampleDur, posE - sDtW, canvas[0].height - canvas[0].height / 12);
								}
							}
						});
					} else if (tierDetails.type === 'point') {
						ctx.fillStyle = config.vals.colors.startBoundaryColor;
						// predef. vars
						var perc;

						tierDetails.elements.forEach(function (curEvt) {

							if (curEvt.startSample > viewState.curViewPort.sS && curEvt.startSample < viewState.curViewPort.eS) {
								perc = Math.round(viewState.getPos(canvas[0].width, curEvt.startSample) + (sDist / 2));

								if (tierDetails.TierName === viewState.curMouseMoveTierName && segMId === viewState.curMouseMoveSegmentName) {
									//console.log('this is the selected boundary');
									// 		ctx.fillStyle = config.vals.colors.selectedBoundaryColor;
									// 		ctx.fillRect(perc, 0, 8, canvas[0].height / 2 - canvas[0].height / 10);
									// 		ctx.fillRect(perc, canvas[0].height / 2 + canvas[0].height / 10, 8, canvas[0].height / 2 - canvas[0].height / 10);
									// 		tW = ctx.measureText(tierDetails.elements[k].label).width;
									// 		ctx.fillStyle = this.params.labelColor;
									// 		ctx.fillText(tierDetails.elements[k].label, perc - tW / 2 + 1, canvas[0].height / 2);
								} else {
									ctx.fillStyle = config.vals.colors.startBoundaryColor;
									ctx.fillRect(perc, 0, 1, canvas[0].height / 2 - canvas[0].height / 10);
									ctx.fillRect(perc, canvas[0].height / 2 + canvas[0].height / 10, 1, canvas[0].height / 2 - canvas[0].height / 10);
									horizontalText = scope.fontImage.getTextImage(ctx, curEvt.label, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor);
									ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, perc - 5, canvas[0].height / 3, horizontalText.width, horizontalText.height);
								}

								horizontalText = scope.fontImage.getTextImage(ctx, curEvt.startSample, config.vals.font.fontPxSize - 2, config.vals.font.fontType, config.vals.colors.startBoundaryColor);
								ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, perc + 5, 0, horizontalText.width, horizontalText.height);


							}
						});
					}
					// draw cursor/selected area
				}

				/**
				 *
				 */

				function drawTierMarkup(tierDetails, viewState, config) {
					var ctx = canvas[1].getContext('2d');
					ctx.clearRect(0, 0, canvas[1].width, canvas[1].height);
					if (tierDetails.TierName === viewState.curClickTierName) {
						ctx.fillStyle = config.vals.colors.selectedTierColor;
						ctx.fillRect(0, 0, canvas[0].width, canvas[0].height);
					}


					// draw moving boundary line if moving
					scope.dhs.drawMovingBoundaryLine(ctx);

					// draw current viewport selected
					scope.dhs.drawCurViewPortSelected(ctx);

					
					var posS, posE, sDist, xOffset, curEvt;
					posS = viewState.getPos(canvas[1].width, viewState.curViewPort.selectS);
					posE = viewState.getPos(canvas[1].width, viewState.curViewPort.selectE);
					sDist = viewState.getSampleDist(canvas[1].width);


					var segMId = viewState.getcurMouseSegmentId();
					var segCId = viewState.getcurClickSegments();
					var tierId = viewState.getcurClickLevelName();
					if (segCId !== undefined) {
						// draw clicked on selected areas
						if (tierDetails.TierName === tierId && segCId.length > 0) {
							segCId.forEach(function (entry) {
								if (entry !== undefined) {
									posS = Math.round(viewState.getPos(canvas[0].width, entry.startSample));
									posE = Math.round(viewState.getPos(canvas[0].width, entry.startSample + entry.sampleDur));
									ctx.fillStyle = config.vals.colors.selectedSegmentColor;
									ctx.fillRect(posS, 0, posE - posS, canvas[0].height);
									ctx.fillStyle = config.vals.colors.startBoundaryColor;
								}
							});
						}
					}

					// draw preselected boundary
					curEvt = tierDetails.elements[segMId];
					if (curEvt !== undefined && segMId !== undefined && tierDetails.TierName === viewState.getcurMouseLevelName()) {
						posS = Math.round(viewState.getPos(canvas[1].width, curEvt.startSample));
						posE = Math.round(viewState.getPos(canvas[1].width, curEvt.startSample + curEvt.sampleDur + 1));

						ctx.fillStyle = config.vals.colors.selectedBoundaryColor;
						if (viewState.getcurMouseLevelType() === 'seg') {
							ctx.fillRect(posS, 0, 3, canvas[1].height);
						} else {
							xOffset = (sDist / 2);
							ctx.fillRect(posS + xOffset, 0, 3, canvas[1].height);
						}
						ctx.fillStyle = config.vals.colors.startBoundaryColor;
					}
				}
			}
		};
	});