import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('trackMouseInLevel', function ($document, ViewStateService, LevelService, ConfigProviderService, HistoryService, SoundHandlerService) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				levelName: '=',
				levelType: '='
			},
			link: function (scope, element, attr) {
				scope.lastEventClick = undefined;
				scope.lastEventMove = undefined;
				scope.lastNeighboursMove = undefined;
				scope.lastPCM = undefined;
				scope.curMouseSampleNrInView = undefined;
				scope.order = attr.trackMouseInLevel;
				/////////////////////////////
				// Bindings

				//
				element.bind('click', function (event) {
					event.preventDefault();
					scope.setLastMove(event, true);
					scope.setLastClick(event);
				});

				//
				element.bind('contextmenu', function (event) {
					event.preventDefault();
					scope.setLastMove(event, true);
					scope.setLastRightClick(event);
				});

				//
				element.bind('dblclick', function (event) {
					scope.setLastMove(event, true);
					if (ConfigProviderService.vals.restrictions.editItemName) {
						scope.setLastDblClick(event);
					} else {
						scope.setLastClick(event);
					}
				});

				//
				element.bind('mousemove', function (event) {
                    var moveLine, moveBy;
					if (ViewStateService.focusOnEmuWebApp) {
						if (!ViewStateService.getdragBarActive()) {
							moveLine = true;
							var samplesPerPixel = ViewStateService.getSamplesPerPixelVal(event);
							scope.curMouseSampleNrInView = ViewStateService.getX(event) * samplesPerPixel;
							moveBy = (scope.curMouseSampleNrInView - scope.lastPCM);
							if (samplesPerPixel <= 1) {
								var zoomEventMove = LevelService.getClosestItem(scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS, scope.levelName, SoundHandlerService.audioBuffer.length);
								// absolute movement in pcm below 1 pcm per pixel
								if (scope.levelType === 'SEGMENT') {
									if (zoomEventMove.isFirst === true && zoomEventMove.isLast === false) { // before first elem
										moveBy = Math.ceil((scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS) - LevelService.getItemDetails(scope.levelName, 0).sampleStart);
									} else if (zoomEventMove.isFirst === false && zoomEventMove.isLast === true) { // after last elem
										var lastItem = LevelService.getLastItem(scope.levelName);
										moveBy = Math.ceil((scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS) - lastItem.sampleStart - lastItem.sampleDur);
									} else {
										moveBy = Math.ceil((scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS) - LevelService.getItemFromLevelById(scope.levelName, zoomEventMove.nearest.id).sampleStart);
									}
								} else {
									moveBy = Math.ceil((scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS) - LevelService.getItemFromLevelById(scope.levelName, zoomEventMove.nearest.id).samplePoint - 0.5); // 0.5 to break between samples not on
								}
							} else {
								// relative movement in pcm above 1 pcm per pixel
								moveBy = Math.round(scope.curMouseSampleNrInView - scope.lastPCM);
							}
						}

						var mbutton = 0;
						if (event.buttons === undefined) {
							mbutton = event.which;
						} else {
							mbutton = event.buttons;
						}
						switch (mbutton) {
							case 1:
								//console.log('Left mouse button pressed');
								break;
							case 2:
								//console.log('Middle mouse button pressed');
								break;
							case 3:
								//console.log('Right mouse button pressed');
								break;
							default:
								if (!ViewStateService.getdragBarActive()) {
									var curMouseItem = ViewStateService.getcurMouseItem();
                                    var seg;
									if (ConfigProviderService.vals.restrictions.editItemSize && event.shiftKey) {
										LevelService.deleteEditArea();
										if (curMouseItem !== undefined) {
											ViewStateService.movingBoundary = true;
											if (scope.levelType === 'SEGMENT') {
												if (ViewStateService.getcurMouseisFirst() || ViewStateService.getcurMouseisLast()) {
													// before first segment
													if (ViewStateService.getcurMouseisFirst()) {
														seg = LevelService.getItemDetails(scope.levelName, 0);
														ViewStateService.movingBoundarySample = seg.sampleStart + moveBy;
													} else if (ViewStateService.getcurMouseisLast()) {
														seg = LevelService.getLastItem(scope.levelName);
														ViewStateService.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
													}
												} else {
													ViewStateService.movingBoundarySample = curMouseItem.sampleStart + moveBy;
													seg = curMouseItem;
												}
												LevelService.moveBoundary(scope.levelName, seg.id, moveBy, ViewStateService.getcurMouseisFirst(), ViewStateService.getcurMouseisLast());
												HistoryService.updateCurChangeObj({
													'type': 'ANNOT',
													'action': 'MOVEBOUNDARY',
													'name': scope.levelName,
													'id': seg.id,
													'movedBy': moveBy,
													'isFirst': ViewStateService.getcurMouseisFirst(),
													'isLast': ViewStateService.getcurMouseisLast()
												});

											} else {
												seg = curMouseItem;
												ViewStateService.movingBoundarySample = curMouseItem.samplePoint + moveBy;
												LevelService.moveEvent(scope.levelName, seg.id, moveBy);
												HistoryService.updateCurChangeObj({
													'type': 'ANNOT',
													'action': 'MOVEEVENT',
													'name': scope.levelName,
													'id': seg.id,
													'movedBy': moveBy
												});
											}
											scope.lastPCM = scope.curMouseSampleNrInView;
											ViewStateService.setLastPcm(scope.lastPCM);
											ViewStateService.selectBoundary();
											moveLine = false;
										}
									} else if (ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
										LevelService.deleteEditArea();
										if (scope.levelType === 'SEGMENT') {
											seg = ViewStateService.getcurClickItems();
											if (seg[0] !== undefined) {
												LevelService.moveSegment(scope.levelName, seg[0].id, seg.length, moveBy);
												HistoryService.updateCurChangeObj({
													'type': 'ANNOT',
													'action': 'MOVESEGMENT',
													'name': scope.levelName,
													'id': seg[0].id,
													'length': seg.length,
													'movedBy': moveBy
												});
											}
											scope.lastPCM = scope.curMouseSampleNrInView;
											ViewStateService.setLastPcm(scope.lastPCM);
											ViewStateService.selectBoundary();
										}
										else if (scope.levelType === 'EVENT') {
											seg = ViewStateService.getcurClickItems();
											if (seg[0] !== undefined) {
												seg.forEach((s) => {
													LevelService.moveEvent(scope.levelName, s.id, moveBy);
													HistoryService.updateCurChangeObj({
														'type': 'ANNOT',
														'action': 'MOVEEVENT',
														'name': scope.levelName,
														'id': s.id,
														'movedBy': moveBy
													});
												});
											}
											scope.lastPCM = scope.curMouseSampleNrInView;
											ViewStateService.setLastPcm(scope.lastPCM);
											ViewStateService.selectBoundary();
										}
									} else {
										ViewStateService.movingBoundary = false;
									}
								}
								break;
						}
						if (!ViewStateService.getdragBarActive()) {
							scope.setLastMove(event, moveLine);
						}
					}
				});

				//
				element.bind('mousedown', function (event) {
					ViewStateService.movingBoundary = true;
					scope.setLastMove(event, true);
				});

				//
				element.bind('mouseup', function (event) {
					ViewStateService.movingBoundary = false;
					scope.setLastMove(event, true);
				});

				//
				element.bind('mouseout', function (event) {
					ViewStateService.movingBoundary = false;
					scope.setLastMove(event, true);
				});

				//
				/////////////////////////

				/**
				 *
				 */
				scope.setLastClick = function (x) {
					scope.curMouseSampleNrInView = ViewStateService.getX(x) * ViewStateService.getSamplesPerPixelVal(x);
					LevelService.deleteEditArea();
					ViewStateService.setEditing(false);
					scope.lastEventClick = LevelService.getClosestItem(scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS, scope.levelName, SoundHandlerService.audioBuffer.length);
					ViewStateService.setcurClickLevel(scope.levelName, scope.levelType, scope.order);
					if (scope.lastEventClick.current !== undefined && scope.lastEventClick.nearest !== undefined) {
						LevelService.setlasteditArea('_' + scope.lastEventClick.current.id);
						LevelService.setlasteditAreaElem(element.parent());
						ViewStateService.setcurClickItem(scope.lastEventClick.current);
						ViewStateService.selectBoundary();
					}
					scope.lastPCM = scope.curMouseSampleNrInView;
					ViewStateService.setLastPcm(scope.lastPCM);
					scope.$apply();
				};

				/**
				 *
				 */
				scope.setLastRightClick = function (x) {
					if (ViewStateService.getcurClickLevelName() !== scope.levelName) {
						scope.setLastClick(x);
					}
					scope.curMouseSampleNrInView = ViewStateService.getX(x) * ViewStateService.getSamplesPerPixelVal(x);
					LevelService.deleteEditArea();
					scope.lastEventClick = LevelService.getClosestItem(scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS, scope.levelName, SoundHandlerService.audioBuffer.length);
					if (scope.lastEventClick.current !== undefined && scope.lastEventClick.nearest !== undefined) {
						var next = LevelService.getItemInTime(ViewStateService.getcurClickLevelName(), scope.lastEventClick.current.id, true);
						var prev = LevelService.getItemInTime(ViewStateService.getcurClickLevelName(), scope.lastEventClick.current.id, false);
						ViewStateService.setcurClickLevel(scope.levelName, scope.levelType, scope.$index);
						ViewStateService.setcurClickItemMultiple(scope.lastEventClick.current, next, prev);
						ViewStateService.selectBoundary();
					}
					scope.lastPCM = scope.curMouseSampleNrInView;
					ViewStateService.setLastPcm(scope.lastPCM);
					scope.$apply();
				};

				/**
				 *
				 */
				scope.setLastDblClick = function (x) {
					scope.curMouseSampleNrInView = ViewStateService.getX(x) * ViewStateService.getSamplesPerPixelVal(x);
					scope.lastEventClick = LevelService.getClosestItem(scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS, scope.levelName, SoundHandlerService.audioBuffer.length);
					var isOpen = element.parent().css('height') === '25px' ? false : true;
					// expand to full size on dbl click if level is in small size
					if (!isOpen) {
						element.parent().parent().find('div')[3].click();
					}
					if (scope.lastEventClick.current !== undefined && scope.lastEventClick.nearest !== undefined && ViewStateService.getPermission('labelAction')) {
						if (scope.levelType === 'SEGMENT') {
							if (scope.lastEventClick.current.sampleStart >= ViewStateService.curViewPort.sS) {
								if ((scope.lastEventClick.current.sampleStart + scope.lastEventClick.current.sampleDur) <= ViewStateService.curViewPort.eS) {
									ViewStateService.setcurClickLevel(scope.levelName, scope.levelType, scope.$index);
									ViewStateService.setcurClickItem(scope.lastEventClick.current);
									LevelService.setlasteditArea('_' + scope.lastEventClick.current.id);
									LevelService.setlasteditAreaElem(element.parent());
									ViewStateService.setEditing(true);
									LevelService.openEditArea(scope.lastEventClick.current, element.parent(), scope.levelType);
								} else {
									//console.log('Editing out of right bound !');
								}
							} else {
								//console.log('Editing out of left bound !');
							}
						} else {
							ViewStateService.setcurClickLevel(scope.levelName, scope.levelType, scope.$index);
							ViewStateService.setcurClickItem(scope.lastEventClick.current);
							LevelService.setlasteditArea('_' + scope.lastEventClick.current.id);
							LevelService.setlasteditAreaElem(element.parent());
							ViewStateService.setEditing(true);
							LevelService.openEditArea(scope.lastEventClick.current, element.parent(), scope.levelType);
							ViewStateService.setEditing(true);
						}
					}
					scope.lastPCM = scope.curMouseSampleNrInView;
					ViewStateService.setLastPcm(scope.lastPCM);
					scope.$apply();
				};

				/**
				 *
				 */
				scope.setLastMove = function (x, doChange) {
					scope.curMouseSampleNrInView = ViewStateService.getX(x) * ViewStateService.getSamplesPerPixelVal(x);
					scope.lastEventMove = LevelService.getClosestItem(scope.curMouseSampleNrInView + ViewStateService.curViewPort.sS, scope.levelName, SoundHandlerService.audioBuffer.length);
					if (doChange) {
						if (scope.lastEventMove.current !== undefined && scope.lastEventMove.nearest !== undefined) {
							scope.lastNeighboursMove = LevelService.getItemNeighboursFromLevel(scope.levelName, scope.lastEventMove.nearest.id, scope.lastEventMove.nearest.id);
							ViewStateService.setcurMouseItem(scope.lastEventMove.nearest, scope.lastNeighboursMove, ViewStateService.getX(x), scope.lastEventMove.isFirst, scope.lastEventMove.isLast);
						}
					}
					ViewStateService.setcurMouseLevelName(scope.levelName);
					ViewStateService.setcurMouseLevelType(scope.levelType);
					scope.lastPCM = scope.curMouseSampleNrInView;
					ViewStateService.setLastPcm(scope.lastPCM);
					scope.$apply();
				};
			}
		};
	});
