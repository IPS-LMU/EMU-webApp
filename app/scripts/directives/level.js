'use strict';


angular.module('emuwebApp')
	.directive('level', function () {
		return {
			templateUrl: 'views/level.html',
			restrict: 'E',
			link: function postLink(scope, element, attr) {
				// select the needed DOM items from the template
				var canvas = element.find('canvas');

				scope.open = attr.open;

				///////////////
				// watches

				scope.$watchCollection('vs.curViewPort', function (newValue, oldValue) {
					if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS || oldValue.windowWidth !== newValue.windowWidth) {
						drawLevelDetails(scope.level, scope.vs, scope.cps);
						drawLevelMarkup(scope.level, scope.vs, scope.cps);
					} else {
						// console.log(scope.vs.curViewPort)
						drawLevelMarkup(scope.level, scope.vs, scope.cps);
					}
				}, true);

				scope.$watch('vs.curMouseSegment', function (newValue, oldValue) {
					// only repaint if mouse over current level
					if (scope.vs.getcurMouseLevelName() === scope.level.name) {
						if (!oldValue || !newValue || newValue.id !== oldValue.id) {
							drawLevelMarkup(scope.level, scope.vs, scope.cps);
						} else {
							drawLevelDetails(scope.level, scope.vs, scope.cps);
							drawLevelMarkup(scope.level, scope.vs, scope.cps);
						}
					}
				}, true);

				scope.$watch('vs.movingBoundarySample', function () {
					drawLevelMarkup(scope.level, scope.vs, scope.cps);
				}, true);

				scope.$watch('vs.movingBoundary', function () {
					drawLevelMarkup(scope.level, scope.vs, scope.cps);
				}, true);


				scope.$watch('hists.movesAwayFromLastSave', function () {
					drawLevelDetails(scope.level, scope.vs, scope.cps);
					drawLevelMarkup(scope.level, scope.vs, scope.cps);
				}, true);

				///////////////
				// bindings

				// on mouse leave reset viewState.
				element.bind('mouseleave', function () {
					scope.vs.setcurMouseSegment(undefined);
					drawLevelMarkup(scope.level, scope.vs, scope.cps);
				});

				//
				///////////////////////


				/**
				 * draw level details
				 * @param levelDetails
				 * @param viewState
				 * @param cps
				 */
				function drawLevelDetails(levelDetails, viewState, config) {

					var fontSize = config.vals.font.fontPxSize;

					if ($.isEmptyObject(levelDetails)) {
						//console.log("undef levelDetails");
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
					if (!scope.open) {
						fontSize -= 1;
					}
					var ctx = canvas[0].getContext('2d');
					ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);

					//predef vars
					var sDist, posS, posE, horizontalText;

					sDist = viewState.getSampleDist(canvas[0].width);

					// draw name of level and type
					var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

					horizontalText = scope.fontImage.getTextImageTwoLines(ctx, levelDetails.name, '(' + levelDetails.type + ')', fontSize, config.vals.font.fontType, config.vals.colors.labelColor, true);
					ctx.drawImage(horizontalText, 0, ctx.canvas.height / 2 - fontSize * scaleY);

					var segMId = viewState.getcurMouseSegment();
					var segCId = viewState.getcurClickSegments();
					var levelId = viewState.getcurClickLevelName();
					var curID = -1;

					if (levelDetails.type === 'SEGMENT') {
						ctx.fillStyle = config.vals.colors.startBoundaryColor;
						// draw segments
						var e = levelDetails.items;

						e.forEach(function (curEvt) {
							++curID;

							if (curEvt.sampleStart >= viewState.curViewPort.sS &&
								curEvt.sampleStart <= viewState.curViewPort.eS || //within segment
								curEvt.sampleStart + curEvt.sampleDur > viewState.curViewPort.sS &&
								curEvt.sampleStart + curEvt.sampleDur < viewState.curViewPort.eS || //end in segment
								curEvt.sampleStart < viewState.curViewPort.sS &&
								curEvt.sampleStart + curEvt.sampleDur > viewState.curViewPort.eS // within sample
							) {
								// get label
								var curLabVal;
								curEvt.labels.forEach(function (lab) {
									if (lab.name === levelDetails.name) {
										curLabVal = lab.value;
									}
								});

								// draw segment start
								//posS = Math.round(viewState.getPos(canvas[0].width, curEvt.sampleStart));
								//posE = Math.round(viewState.getPos(canvas[0].width, curEvt.sampleStart + curEvt.sampleDur+1));
								posS = viewState.getPos(canvas[0].width, curEvt.sampleStart);
								posE = viewState.getPos(canvas[0].width, curEvt.sampleStart + curEvt.sampleDur);

								ctx.fillStyle = config.vals.colors.startBoundaryColor;
								ctx.fillRect(posS, 0, 2, canvas[0].height / 2);

								//draw segment end
								ctx.fillStyle = config.vals.colors.endBoundaryColor;
								ctx.fillRect(posE, canvas[0].height / 2, 2, canvas[0].height);

								horizontalText = scope.fontImage.getTextImage(ctx, curLabVal, fontSize - 2, config.vals.font.fontType, config.vals.colors.labelColor);
								var tW = scope.fontImage.getLastImageWidth();
								var tX = posS + (posE - posS) / 2 - tW / 2;

								//check for enough space to stroke text
								if (posE - posS > (tW)) {
									if (scope.open) {
										ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, tX, (canvas[0].height / 2) - (fontSize - 2), horizontalText.width, horizontalText.height);
									} else {
										ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, tX, 0, horizontalText.width, horizontalText.height);
									}
								}

								var horizontalSubText1 = scope.fontImage.getTextImage(ctx, curEvt.sampleStart, fontSize - 4, config.vals.font.fontType, config.vals.colors.endBoundaryColor);
								var hst1 = scope.fontImage.getLastImageWidth();
								var tX1 = posS + (posE - posS) / 2 - hst1 / 2;
								var horizontalSubText2 = scope.fontImage.getTextImage(ctx, 'dur: ' + curEvt.sampleDur, fontSize - 4, config.vals.font.fontType, config.vals.colors.endBoundaryColor);
								var hst2 = scope.fontImage.getLastImageWidth();
								// var tX2 = posS + (posE - posS) / 2 - hst2 / 2;
								//draw helper lines

								if (scope.open) {
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
								}

								if (posE - posS <= tW) {

									ctx.strokeStyle = config.vals.colors.startBoundaryColor;
									ctx.beginPath();
									ctx.moveTo(tX1 + hst1 / 2, canvas[0].height / 4 + 10);
									ctx.lineTo(tX1 + hst1 / 2, canvas[0].height / 4 + 30);
									ctx.stroke();
								}

								// draw sampleStart numbers
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
									ctx.drawImage(horizontalSubText2, 0, 0, horizontalText.width, horizontalText.height, posE - hst2, canvas[0].height / 4 * 3, horizontalText.width, horizontalText.height);
									//ctx.fillText('dur: ' + curEvt.sampleDur, posE - sDtW, canvas[0].height - canvas[0].height / 12);
								}
							}
						});
					} else if (levelDetails.type === 'EVENT') {
						ctx.fillStyle = config.vals.colors.startBoundaryColor;
						// predef. vars
						var perc;

						levelDetails.items.forEach(function (curEvt) {
							if (curEvt.samplePoint > viewState.curViewPort.sS && curEvt.samplePoint < viewState.curViewPort.eS) {
								perc = Math.round(viewState.getPos(canvas[0].width, curEvt.samplePoint) + (sDist / 2));
								// get label
								var curLabVal;
								curEvt.labels.forEach(function (lab) {
									if (lab.name === levelDetails.name) {
										curLabVal = lab.value;
									}
								});

								//if (segMId !=== undefined && levelDetails.name === viewState.curMouseMoveLevelName && segMId.id === viewState.curMouseMoveSegmentName) {
								//console.log('this is the selected boundary');
								// 		ctx.fillStyle = config.vals.colors.selectedBoundaryColor;
								// 		ctx.fillRect(perc, 0, 8, canvas[0].height / 2 - canvas[0].height / 10);
								// 		ctx.fillRect(perc, canvas[0].height / 2 + canvas[0].height / 10, 8, canvas[0].height / 2 - canvas[0].height / 10);
								// 		tW = ctx.measureText(levelDetails.items[k].label).width;
								// 		ctx.fillStyle = this.params.labelColor;
								// 		ctx.fillText(levelDetails.items[k].label, perc - tW / 2 + 1, canvas[0].height / 2);
								//} else {
								ctx.fillStyle = config.vals.colors.startBoundaryColor;
								ctx.fillRect(perc, 0, 1, canvas[0].height / 2 - canvas[0].height / 10);
								ctx.fillRect(perc, canvas[0].height / 2 + canvas[0].height / 10, 1, canvas[0].height / 2 - canvas[0].height / 10);
								horizontalText = scope.fontImage.getTextImage(ctx, curLabVal, fontSize - 2, config.vals.font.fontType, config.vals.colors.labelColor);
								ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, perc - 5, canvas[0].height / 3, horizontalText.width, horizontalText.height);
								//}

								horizontalText = scope.fontImage.getTextImage(ctx, curEvt.samplePoint, fontSize - 4, config.vals.font.fontType, config.vals.colors.endBoundaryColor);
								ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, perc + 5, 0, horizontalText.width, horizontalText.height);


							}
						});
					}
					// draw cursor/selected area
				}

				/**
				 *
				 */
				function drawLevelMarkup(levelDetails, viewState, config) {
					var ctx = canvas[1].getContext('2d');
					ctx.clearRect(0, 0, canvas[1].width, canvas[1].height);
					if (levelDetails.name === viewState.getcurClickLevelName()) {
						ctx.fillStyle = config.vals.colors.selectedLevelColor;
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


					var segMId = viewState.getcurMouseSegment();
					var segCId = viewState.getcurClickSegments();
					var levelId = viewState.getcurClickLevelName();
					if (segCId !== undefined) {
						// draw clicked on selected areas
						if (levelDetails.name === levelId && segCId.length > 0) {
							segCId.forEach(function (entry) {
								if (entry !== undefined) {
									posS = Math.round(viewState.getPos(canvas[0].width, entry.sampleStart));
									posE = Math.round(viewState.getPos(canvas[0].width, entry.sampleStart + entry.sampleDur));
									ctx.fillStyle = config.vals.colors.selectedSegmentColor;
									ctx.fillRect(posS, 0, posE - posS, canvas[0].height);
									ctx.fillStyle = config.vals.colors.startBoundaryColor;
								}
							});
						}
					}



					// draw preselected boundary
					curEvt = viewState.getcurMouseSegment();
					if (curEvt !== undefined && segMId !== undefined && levelDetails.name === viewState.getcurMouseLevelName()) {
						ctx.fillStyle = config.vals.colors.selectedBoundaryColor;
						if (segMId === false) { // before first segment
							if (viewState.getcurMouseLevelType() === 'SEGMENT') {
								curEvt = levelDetails.items[0];
								posS = Math.round(viewState.getPos(canvas[1].width, curEvt.sampleStart));
								ctx.fillRect(posS, 0, 3, canvas[1].height);
							}
						} else if (segMId === true) { // after last segment
							if (viewState.getcurMouseLevelType() === 'SEGMENT') {
								curEvt = levelDetails.items[levelDetails.items.length - 1];
								posS = Math.round(viewState.getPos(canvas[1].width, (curEvt.sampleStart + curEvt.sampleDur)));
								ctx.fillRect(posS, 0, 3, canvas[1].height);
							}
						} else { // in the middle
							if (viewState.getcurMouseLevelType() === 'SEGMENT') {
								posS = Math.round(viewState.getPos(canvas[1].width, curEvt.sampleStart));
								ctx.fillRect(posS, 0, 3, canvas[1].height);
							} else {
								posS = Math.round(viewState.getPos(canvas[1].width, curEvt.samplePoint));
								xOffset = (sDist / 2);
								ctx.fillRect(posS + xOffset, 0, 3, canvas[1].height);
							}
						}
						ctx.fillStyle = config.vals.colors.startBoundaryColor;

					}
				}
			}
		};
	});