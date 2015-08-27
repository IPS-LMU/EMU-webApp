'use strict';

angular.module('emuwebApp')
	.directive('level', function ($timeout, $animate, viewState, ConfigProviderService, Drawhelperservice, HistoryService, fontScaleService, modalService, LevelService, loadedMetaDataService) {
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
				scope.modal = modalService;
				scope.lmds = loadedMetaDataService;
				var levelCanvasContainer = element.find('div');
				scope.levelDef = ConfigProviderService.getLevelDefinition(scope.level.name);
				scope.backgroundCanvas = {
					'background': ConfigProviderService.design.color.lightGrey
				};

				///////////////
				// watches

				scope.$watch('vs.lastUpdate', function (newValue, oldValue) {
					if(newValue != oldValue) {
						scope.redraw();
					}
				});

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
					if(scope.level.name === scope.vs.curMouseLevelName){
						scope.drawLevelDetails();
					}
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
				scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
					if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
						scope.drawLevelDetails();
						scope.drawLevelMarkup();
					}
				}, true);

				//
				/////////////////

				scope.redraw = function () {
					scope.drawLevelDetails();
					scope.drawLevelMarkup();
				};

				/**
				 *
				 */
				scope.changeCurAttrDef = function (attrDefName, index) {
					var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);
					if (curAttrDef !== attrDefName) {
						// curAttrDef = attrDefName;
						scope.vs.setCurAttrDef(scope.level.name, attrDefName, index);

						if (!element.hasClass('emuwebapp-level-animation')) {
							scope.vs.setEditing(false);
							LevelService.deleteEditArea();
							$animate.addClass(levelCanvasContainer, 'emuwebapp-level-animation').then(function () {
								$animate.removeClass(levelCanvasContainer, 'emuwebapp-level-animation');
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

					var fontSize = ConfigProviderService.design.font.small.size.slice(0, -2) * 1;
					var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);
					var isOpen = element.parent().css('height') === '25px' ? false : true;

					if ($.isEmptyObject(scope.level)) {
						//console.log('undef levelDetails');
						return;
					}
					if ($.isEmptyObject(scope.vs)) {
						//console.log('undef viewState');
						return;
					}
					if ($.isEmptyObject(scope.cps)) {
						//console.log('undef config');
						return;
					}
					if (!isOpen) {
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
					    if(isOpen) {
    						fontScaleService.getTextImageTwoLines(ctx, scope.level.name, '(' + scope.level.type + ')', fontSize, ConfigProviderService.design.font.small.family, 0, ctx.canvas.height / 2 - fontSize * scaleY, ConfigProviderService.design.color.black, true);
    					}
    					else {
								fontScaleService.getTextImage(ctx, scope.level.name, fontSize, ConfigProviderService.design.font.small.family, 0, ctx.canvas.height / 2 - fontSize * scaleY, ConfigProviderService.design.color.black);
    					}
					} else {
						fontScaleService.getTextImageTwoLines(ctx, scope.level.name + ':' + curAttrDef, '(' + scope.level.type + ')', fontSize, ConfigProviderService.design.font.small.family, 0, ctx.canvas.height / 2 - fontSize * scaleY, ConfigProviderService.design.color.black, true);
					}

					var segMId = scope.vs.getcurMouseItem();
					var segCId = scope.vs.getcurClickItems();
					var levelId = scope.vs.getcurClickLevelName();
					var curID = -1;

					// calculate generic max with of single char (m char used)
					//var mTxtImg = fontScaleService.getTextImage(ctx, 'm', fontSize - 2, ConfigProviderService.design.font.small.family, ConfigProviderService.design.color.black);
					var mTxtImgWidth = ctx.measureText('m').width * fontScaleService.scaleX;

					// calculate generic max with of single digit (0 digit used)
					//var zeroTxtImg = fontScaleService.getTextImage(ctx, '0', fontSize - 4, ConfigProviderService.design.font.small.family, ConfigProviderService.design.color.black);
					var zeroTxtImgWidth = ctx.measureText('0').width * fontScaleService.scaleX;

					console.log(mTxtImgWidth);
					console.log(zeroTxtImgWidth);

					if (scope.level.type === 'SEGMENT') {
						ctx.fillStyle = ConfigProviderService.design.color.black;
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

								ctx.fillStyle = ConfigProviderService.design.color.black;
								ctx.fillRect(posS, 0, 2, canvas[0].height / 2);

								//draw segment end
								ctx.fillStyle = ConfigProviderService.design.color.grey;
								ctx.fillRect(posE, canvas[0].height / 2, 2, canvas[0].height);

								ctx.font = (fontSize - 2 + 'px' + ' ' + ConfigProviderService.design.font.small.family);

								//check for enough space to stroke text
								if ((curLabVal !== undefined) && posE - posS > (mTxtImgWidth * curLabVal.length)) {
									if (isOpen) {
										fontScaleService.getTextImage(ctx, curLabVal, fontSize - 2, ConfigProviderService.design.font.small.family, posS + (posE - posS) / 2 - ctx.measureText(curLabVal).width / 2, (canvas[0].height / 2) - (fontSize - 2), ConfigProviderService.design.color.black);
									} else {
										fontScaleService.getTextImage(ctx, curLabVal, fontSize - 2, ConfigProviderService.design.font.small.family, posS + (posE - posS) / 2 - ctx.measureText(curLabVal).width / 2, (canvas[0].height / 2) - fontSize, ConfigProviderService.design.color.black);
									}
								}

								//draw helper lines
								if (scope.open && curLabVal !== undefined && curLabVal.length !== 0) { // only draw if label is not empty
									var labelCenter = posS + (posE - posS) / 2;

									var hlY = canvas[0].height / 4;
									// start helper line
									ctx.strokeStyle = ConfigProviderService.design.color.black;
									ctx.beginPath();
									ctx.moveTo(posS, hlY);
									ctx.lineTo(labelCenter, hlY);
									ctx.lineTo(labelCenter, hlY + 5);
									ctx.stroke();

									hlY = canvas[0].height / 4 * 3;
									// end helper line
									ctx.strokeStyle = ConfigProviderService.design.color.grey;
									ctx.beginPath();
									ctx.moveTo(posE, hlY);
									ctx.lineTo(labelCenter, hlY);
									ctx.lineTo(labelCenter, hlY - 5);
									ctx.stroke();
								}


								// draw sampleStart numbers
								//check for enough space to stroke text
								if (posE - posS > zeroTxtImgWidth * curEvt.sampleStart.toString().length && isOpen) {
									fontScaleService.getTextImage(ctx, curEvt.sampleStart, fontSize - 2, ConfigProviderService.design.font.small.family, posS + 3, 0, ConfigProviderService.design.color.grey);
								}

								// draw sampleDur numbers.
								var durtext = 'dur: ' + curEvt.sampleDur + ' ';
								//check for enough space to stroke text
								if (posE - posS > zeroTxtImgWidth * durtext.length && isOpen) {
									fontScaleService.getTextImage(ctx, durtext, fontSize - 2, ConfigProviderService.design.font.small.family, posE - (ctx.measureText(durtext).width * fontScaleService.scaleX) , canvas[0].height / 4 * 3, ConfigProviderService.design.color.grey);
								}
							}
						});
					} else if (scope.level.type === 'EVENT') {
						ctx.fillStyle = ConfigProviderService.design.color.black;
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

								ctx.fillStyle = ConfigProviderService.design.color.black;
								ctx.fillRect(perc, 0, 1, canvas[0].height / 2 - canvas[0].height / 10);
								ctx.fillRect(perc, canvas[0].height / 2 + canvas[0].height / 10, 1, canvas[0].height / 2 - canvas[0].height / 10);
								fontScaleService.getTextImage(ctx, curLabVal, fontSize - 2, ConfigProviderService.design.font.small.family, perc - 5, canvas[0].height / 3, ConfigProviderService.design.color.black);
								fontScaleService.getTextImage(ctx, curEvt.samplePoint, fontSize - 4, ConfigProviderService.design.font.small.family, perc + 5, 0, ConfigProviderService.design.color.grey);
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
						ctx.fillStyle = ConfigProviderService.design.color.transparent.grey;
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
									ctx.fillStyle = ConfigProviderService.design.color.transparent.yellow;
									ctx.fillRect(posS, 0, posE - posS, canvas[0].height);
									ctx.fillStyle = ConfigProviderService.design.color.black;
								}
							});
						}
					}



					// draw preselected boundary
					curEvt = scope.vs.getcurMouseItem();
					if (scope.level.items.length > 0 && curEvt !== undefined && segMId !== undefined && scope.level.name === scope.vs.getcurMouseLevelName()) {
						ctx.fillStyle = ConfigProviderService.design.color.blue;
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
						ctx.fillStyle = ConfigProviderService.design.color.black;

					}
				}
			}
		};
	});
