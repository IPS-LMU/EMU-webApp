'use strict';


angular.module('emuwebApp')
	.directive('level', function ($animate, viewState, ConfigProviderService, Drawhelperservice, HistoryService, fontScaleService, dialogService, LevelService) {
		return {
			templateUrl: 'views/level.html',
			restrict: 'E',
			scope: {
				level: '=',
				idx: '='
			},
			link: function postLink(scope, element, attr) {
				// select the needed DOM items from the template
				var canvas = element.find('canvas');
				scope.open = attr.open;
				scope.vs = viewState;
				scope.hists = HistoryService;
				scope.cps = ConfigProviderService;
				scope.dials = dialogService;
				var levelCanvasContainer = element.find('div');
				scope.levelDef = ConfigProviderService.getLevelDefinition(scope.level.name);

				scope.backgroundCanvas = {
					'background': ConfigProviderService.vals.colors.levelColor
				};

				// on broadcast msg from main ctrl openSubmenu refresh timeline
				scope.$on('refreshTimeline', function () {
					scope.drawLevelDetails();
					scope.drawLevelMarkup();
				});


				///////////////
				// watches

				//
				scope.$watch('vs.curViewPort', function (newValue, oldValue) {
					if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS || oldValue.windowWidth !== newValue.windowWidth) {
						scope.drawLevelDetails();
						scope.drawLevelMarkup();
					} else {
						scope.drawLevelMarkup();
					}
				}, true);

				//
				scope.$watch('vs.curMouseX', function (newValue, oldValue) {
					// only repaint if mouse over current level
					if (scope.vs.getcurMouseLevelName() === scope.level.name) {
						scope.drawLevelDetails();
						scope.drawLevelMarkup();
						//}
					}
				}, true);

				//
				scope.$watch('vs.curClickLevelName', function (newValue, oldValue) {
					if (newValue !== undefined) {
						scope.drawLevelMarkup();
					}
				}, true);

				//
				scope.$watch('vs.movingBoundarySample', function () {
					scope.drawLevelDetails();
					scope.drawLevelMarkup();
				}, true);

				//
				scope.$watch('vs.movingBoundary', function () {
					scope.drawLevelMarkup();
				}, true);

				//
				scope.$watch('hists.movesAwayFromLastSave', function () {
					scope.drawLevelDetails();
					scope.drawLevelMarkup();

				}, true);

				//
				/////////////////

				/**
				 *
				 */
				scope.changeCurAttrDef = function (attrDefName, index) {
					var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);
					if (curAttrDef !== attrDefName) {
						// curAttrDef = attrDefName;
						scope.vs.setCurAttrDef(scope.level.name, attrDefName, index);

						if (!element.hasClass('emuwebapp-levelCanvasContainer-animate')) {
							scope.vs.setEditing(false);
							LevelService.deleteEditArea();
							$animate.addClass(levelCanvasContainer, 'emuwebapp-levelCanvasContainer-animate').then(function () {
								$animate.removeClass(levelCanvasContainer, 'emuwebapp-levelCanvasContainer-animate');
								// redraw
								scope.drawLevelDetails();
								scope.drawLevelMarkup();
							});
						}
					}
				};

				/**
				 *
				 */
				scope.getAttrDefBtnColor = function (attrDefName) {
					var curColor;
					var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);
					if (attrDefName === curAttrDef) {
						curColor = {
							'background': '-webkit-radial-gradient(50% 50%, closest-corner, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 60%)'
						};
					} else {
						curColor = {
							'background-color': 'white',
						};
					}
					return curColor;
				};

				scope.updateView = function () {
					if ($.isEmptyObject(scope.cps)) {
						return;
					}
					scope.drawLevelDetails();
				};


				///////////////
				// bindings

				// on mouse leave reset viewState.
				element.bind('mouseleave', function () {
					scope.vs.setcurMouseItem(undefined, undefined, undefined);
					scope.drawLevelMarkup();
				});

				/**
				 * draw level details
				 * @param levelDetails
				 */
				scope.drawLevelDetails = function () {
				    
					var fontSize = scope.cps.vals.font.fontPxSize;
					var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);

					if ($.isEmptyObject(scope.level)) {
						console.log('undef levelDetails');
						return;
					}
					if ($.isEmptyObject(scope.vs)) {
						console.log('undef viewState');
						return;
					}
					if ($.isEmptyObject(scope.cps)) {
						console.log('undef config');
						return;
					}
					if (!scope.open) {
						fontSize -= 1;
					}
					var ctx = canvas[0].getContext('2d');
					ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);


					//predef vars
					var sDist, posS, posE, horizontalText;

					sDist = scope.vs.getSampleDist(canvas[0].width);

					// draw name of level and type
					var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

					if (scope.level.name === curAttrDef) {
						horizontalText = fontScaleService.getTextImageTwoLines(ctx, scope.level.name, '(' + scope.level.type + ')', fontSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor, true);
					} else {
						horizontalText = fontScaleService.getTextImageTwoLines(ctx, scope.level.name + ':' + curAttrDef, '(' + scope.level.type + ')', fontSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor, true);
					}
					ctx.drawImage(horizontalText, 0, ctx.canvas.height / 2 - fontSize * scaleY);

					var segMId = scope.vs.getcurMouseItem();
					var segCId = scope.vs.getcurClickItems();
					var levelId = scope.vs.getcurClickLevelName();
					var curID = -1;

					// calculate generic max with of single char (m char used)
					var mTxtImg = fontScaleService.getTextImage(ctx, 'm', fontSize - 2, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor);
					var mTxtImgWidth = fontScaleService.getLastImageWidth();

					// calculate generic max with of single digit (0 digit used)
					var zeroTxtImg = fontScaleService.getTextImage(ctx, '0', fontSize - 4, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
					var zeroTxtImgWidth = fontScaleService.getLastImageWidth();

					if (scope.level.type === 'SEGMENT') {
						ctx.fillStyle = scope.cps.vals.colors.startBoundaryColor;
						// draw segments
						var e = scope.level.items;

						e.forEach(function (curEvt) {
							++curID;

							if (curEvt.sampleStart >= scope.vs.curViewPort.sS &&
								curEvt.sampleStart <= scope.vs.curViewPort.eS || //within segment
								curEvt.sampleStart + curEvt.sampleDur > scope.vs.curViewPort.sS &&
								curEvt.sampleStart + curEvt.sampleDur < scope.vs.curViewPort.eS || //end in segment
								curEvt.sampleStart < scope.vs.curViewPort.sS &&
								curEvt.sampleStart + curEvt.sampleDur > scope.vs.curViewPort.eS // within sample
							) {
								// get label
								var curLabVal;
								curEvt.labels.forEach(function (lab) {
									if (lab.name === curAttrDef) {
										curLabVal = lab.value;
									}
								});

								// draw segment start
								posS = scope.vs.getPos(canvas[0].width, curEvt.sampleStart);
								posE = scope.vs.getPos(canvas[0].width, curEvt.sampleStart + curEvt.sampleDur + 1);

								ctx.fillStyle = scope.cps.vals.colors.startBoundaryColor;
								ctx.fillRect(posS, 0, 2, canvas[0].height / 2);

								//draw segment end
								ctx.fillStyle = scope.cps.vals.colors.endBoundaryColor;
								ctx.fillRect(posE, canvas[0].height / 2, 2, canvas[0].height);


								//check for enough space to stroke text
								if ((curLabVal !== undefined) && posE - posS > (mTxtImgWidth * curLabVal.length)) {
									horizontalText = fontScaleService.getTextImage(ctx, curLabVal, fontSize - 2, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor);
									var tW = fontScaleService.getLastImageWidth();
									var tX = posS + (posE - posS) / 2 - tW / 2;
									if (scope.open) {
										ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, tX, (canvas[0].height / 2) - (fontSize - 2), horizontalText.width, horizontalText.height);
									} else {
										ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, tX, 0, horizontalText.width, horizontalText.height);
									}
								}

								//draw helper lines
								if (scope.open && curLabVal.length !== 0) { // only draw if label is not empty
									var labelCenter = posS + (posE - posS) / 2;

									var hlY = canvas[0].height / 4;
									// start helper line
									ctx.strokeStyle = scope.cps.vals.colors.startBoundaryColor;
									ctx.beginPath();
									ctx.moveTo(posS, hlY);
									ctx.lineTo(labelCenter, hlY);
									ctx.lineTo(labelCenter, hlY + 5);
									ctx.stroke();

									hlY = canvas[0].height / 4 * 3;
									// end helper line
									ctx.strokeStyle = scope.cps.vals.colors.endBoundaryColor;
									ctx.beginPath();
									ctx.moveTo(posE, hlY);
									ctx.lineTo(labelCenter, hlY);
									ctx.lineTo(labelCenter, hlY - 5);
									ctx.stroke();
								}


								// draw sampleStart numbers
								//check for enough space to stroke text
								if (posE - posS > zeroTxtImgWidth * curEvt.sampleStart.toString().length) {
									var horizontalSubText1 = fontScaleService.getTextImage(ctx, curEvt.sampleStart, fontSize - 4, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
									ctx.drawImage(horizontalSubText1, 0, 0, horizontalText.width, horizontalText.height, posS + 3, 0, horizontalText.width, horizontalText.height);
								}

								// draw sampleDur numbers.

								//check for enough space to stroke text
								if (posE - posS > zeroTxtImgWidth * (5 + curEvt.sampleDur.toString().length)) {
									var horizontalSubText2 = fontScaleService.getTextImage(ctx, 'dur: ' + curEvt.sampleDur, fontSize - 4, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
									var hst2 = fontScaleService.getLastImageWidth();
									ctx.drawImage(horizontalSubText2, 0, 0, horizontalText.width, horizontalText.height, posE - hst2, canvas[0].height / 4 * 3, horizontalText.width, horizontalText.height);
								}
							}
						});
					} else if (scope.level.type === 'EVENT') {
						ctx.fillStyle = scope.cps.vals.colors.startBoundaryColor;
						// predef. vars
						var perc;

						scope.level.items.forEach(function (curEvt) {
							if (curEvt.samplePoint > scope.vs.curViewPort.sS && curEvt.samplePoint < scope.vs.curViewPort.eS) {
								perc = Math.round(scope.vs.getPos(canvas[0].width, curEvt.samplePoint) + (sDist / 2));
								// get label
								var curLabVal;
								curEvt.labels.forEach(function (lab) {
									if (lab.name === curAttrDef) {
										curLabVal = lab.value;
									}
								});

								ctx.fillStyle = scope.cps.vals.colors.startBoundaryColor;
								ctx.fillRect(perc, 0, 1, canvas[0].height / 2 - canvas[0].height / 10);
								ctx.fillRect(perc, canvas[0].height / 2 + canvas[0].height / 10, 1, canvas[0].height / 2 - canvas[0].height / 10);
								horizontalText = fontScaleService.getTextImage(ctx, curLabVal, fontSize - 2, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor);
								ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, perc - 5, canvas[0].height / 3, horizontalText.width, horizontalText.height);

								horizontalText = fontScaleService.getTextImage(ctx, curEvt.samplePoint, fontSize - 4, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
								ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, perc + 5, 0, horizontalText.width, horizontalText.height);


							}
						});
					}
					// draw cursor/selected area
				};

				/**
				 *
				 */
				scope.drawLevelMarkup = function () {
					var ctx = canvas[1].getContext('2d');
					ctx.clearRect(0, 0, canvas[1].width, canvas[1].height);
					if (scope.level.name === scope.vs.getcurClickLevelName()) {
						ctx.fillStyle = scope.cps.vals.colors.selectedLevelColor;
						ctx.fillRect(0, 0, canvas[0].width, canvas[0].height);
					}

					// draw moving boundary line if moving
					Drawhelperservice.drawMovingBoundaryLine(ctx);

					// draw current viewport selected
					Drawhelperservice.drawCurViewPortSelected(ctx);


					var posS, posE, sDist, xOffset, curEvt;
					posS = scope.vs.getPos(canvas[1].width, scope.vs.curViewPort.selectS);
					posE = scope.vs.getPos(canvas[1].width, scope.vs.curViewPort.selectE);
					sDist = scope.vs.getSampleDist(canvas[1].width);


					var segMId = scope.vs.getcurMouseItem();
					var isFirst = scope.vs.getcurMouseisFirst();
					var isLast = scope.vs.getcurMouseisLast();
					var clickedSegs = scope.vs.getcurClickItems();
					var levelId = scope.vs.getcurClickLevelName();
					if (clickedSegs !== undefined) {
						// draw clicked on selected areas
						if (scope.level.name === levelId && clickedSegs.length > 0) {
							clickedSegs.forEach(function (cs) {
								if (cs !== undefined) {
									// check if segment or event level
									if (cs.sampleStart !== undefined) {
										posS = Math.round(scope.vs.getPos(canvas[0].width, cs.sampleStart));
										posE = Math.round(scope.vs.getPos(canvas[0].width, cs.sampleStart + cs.sampleDur + 1));
									} else {
										posS = Math.round(scope.vs.getPos(canvas[0].width, cs.samplePoint) + sDist / 2);
										posS = posS - 5;
										posE = posS + 10;
									}
									ctx.fillStyle = scope.cps.vals.colors.selectedSegmentColor;
									ctx.fillRect(posS, 0, posE - posS, canvas[0].height);
									ctx.fillStyle = scope.cps.vals.colors.startBoundaryColor;
								}
							});
						}
					}



					// draw preselected boundary
					curEvt = scope.vs.getcurMouseItem();
					if (scope.level.items.length > 0 && curEvt !== undefined && segMId !== undefined && scope.level.name === scope.vs.getcurMouseLevelName()) {
						ctx.fillStyle = scope.cps.vals.colors.selectedBoundaryColor;
						if (isFirst === true) { // before first segment
							if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
								curEvt = scope.level.items[0];
								posS = Math.round(scope.vs.getPos(canvas[1].width, curEvt.sampleStart));
								ctx.fillRect(posS, 0, 3, canvas[1].height);
							}
						} else if (isLast === true) { // after last segment
							if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
								curEvt = scope.level.items[scope.level.items.length - 1];
								posS = Math.round(scope.vs.getPos(canvas[1].width, (curEvt.sampleStart + curEvt.sampleDur + 1))); // +1 because boundaries are drawn on sampleStart
								ctx.fillRect(posS, 0, 3, canvas[1].height);
							}
						} else { // in the middle
							if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
								posS = Math.round(scope.vs.getPos(canvas[1].width, curEvt.sampleStart));
								ctx.fillRect(posS, 0, 3, canvas[1].height);
							} else {
								posS = Math.round(scope.vs.getPos(canvas[1].width, curEvt.samplePoint));
								xOffset = (sDist / 2);
								ctx.fillRect(posS + xOffset, 0, 3, canvas[1].height);

							}
						}
						ctx.fillStyle = scope.cps.vals.colors.startBoundaryColor;

					}
				}
			}
		};
	});