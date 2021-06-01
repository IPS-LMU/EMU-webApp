import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

angular.module('emuwebApp')
	.directive('handleglobalkeystrokes', ['$timeout', 'ViewStateService', 'ModalService', 'HierarchyManipulationService', 'SoundHandlerService', 'ConfigProviderService', 'HistoryService', 'LevelService', 'DataService', 'LinkService', 'AnagestService', 'DbObjLoadSaveService', 
		function ($timeout, ViewStateService, ModalService, HierarchyManipulationService, SoundHandlerService, ConfigProviderService, HistoryService, LevelService, DataService, LinkService, AnagestService, DbObjLoadSaveService) {
		return {
			restrict: 'A',
			link: function postLink(scope) {

				$(document).bind('keyup', function (e) {
					var code = (e.keyCode ? e.keyCode : e.which);
					if (ViewStateService.isEditing() && !ViewStateService.getcursorInTextField()) {
						scope.applyKeyCodeUp(code, e);
					}
				});

				$(document).bind('keydown', function (e) {
					if (!scope.firefox) {
						var code = (e.keyCode ? e.keyCode : e.which);
						if (code === 8 || code === 9 || code === 27 || code === 37 || code === 38 || code === 39 || code === 40 || code === 32) {
							scope.applyKeyCode(code, e);
						}
					}
				});

				$(document).bind('keypress', function (e) {
					var code = (e.keyCode ? e.keyCode : e.which);
					scope.applyKeyCode(code, e);
				});

				scope.applyKeyCodeUp = function (code) {
					scope.$apply(function () {
						if (code !== ConfigProviderService.vals.keyMappings.esc && code !== ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
							var domElement = $('.' + LevelService.getlasteditArea()) as any;
							var str = domElement.val();
							ViewStateService.setSavingAllowed(true);
							var curAttrIndex = ViewStateService.getCurAttrIndex(ViewStateService.getcurClickLevelName());
							var lvlDefs = ConfigProviderService.getLevelDefinition(ViewStateService.getcurClickLevelName());
							var definitions = {} as any;
							if (lvlDefs.attributeDefinitions !== undefined && lvlDefs.attributeDefinitions.length > 0) {
								definitions = ConfigProviderService.getLevelDefinition(ViewStateService.getcurClickLevelName()).attributeDefinitions[curAttrIndex];
							}
							// if it is defined then check if characters are ok
							if (definitions.legalLabels !== undefined && str.length > 0) {
								if (definitions.legalLabels.indexOf(str) < 0) {
									ViewStateService.setSavingAllowed(false);
								}
							}
							if (ViewStateService.isSavingAllowed()) {
								domElement.css({
									'background-color': 'rgba(255,255,0,1)'
								});
							} else {
								domElement.css({
									'background-color': 'rgba(255,0,0,1)'
								});
							}
						}
					});
				};

				scope.applyKeyCode = function (code, e) {
					scope.$apply(function () {
						// check if mouse has to be in labeler for key mappings
						if (ConfigProviderService.vals.main.catchMouseForKeyBinding) {
							if (!ViewStateService.mouseInEmuWebApp) {
								return;
							}
						}
						ViewStateService.setlastKeyCode(code);

						var attrIndex, newValue, oldValue, levelName, levelType, neighbor, minDist, mouseSeg;
						var lastNeighboursMove, neighbours, seg, insSeg, lastEventMove, deletedSegment, deletedLinks;

						// Handle key strokes for the hierarchy modal
						if (ViewStateService.hierarchyState.isShown() && ViewStateService.hierarchyState !== undefined) {
							if (ViewStateService.hierarchyState.getInputFocus()) {
								// Commit label change
								if (code === ConfigProviderService.vals.keyMappings.hierarchyCommitEdit) {
									var elementID = ViewStateService.hierarchyState.getContextMenuID();
									var element = LevelService.getItemByID(elementID);
									levelName = LevelService.getLevelName(elementID);
									attrIndex = ViewStateService.getCurAttrIndex(levelName);
									var legalLabels = ConfigProviderService.getLevelDefinition(levelName).attributeDefinitions[attrIndex].legalLabels;
									newValue = ViewStateService.hierarchyState.getEditValue();
									if (element.labels[attrIndex] !== undefined) {
										oldValue = element.labels[attrIndex].value;
									} else {
										oldValue = '';
									}
									if (newValue !== undefined && newValue !== oldValue) {
										// Check if new value is legal
										if (legalLabels === undefined || (newValue.length > 0 && legalLabels.indexOf(newValue) >= 0)) {
											LevelService.renameLabel(levelName, elementID, attrIndex, newValue);
											HistoryService.addObjToUndoStack({
												// Re-Using the already existing ANNOT/RENAMELABEL
												// I could also define HIERARCHY/RENAMELABEL for keeping the logical structure,
												// but it would have the same code
												'type': 'ANNOT',
												'action': 'RENAMELABEL',
												'name': levelName,
												'id': elementID,
												'attrIndex': attrIndex,
												'oldValue': oldValue,
												'newValue': newValue
											});
											ViewStateService.hierarchyState.closeContextMenu();
										}
									} else {
										ViewStateService.hierarchyState.closeContextMenu();
									}
								}
								if (code === ConfigProviderService.vals.keyMappings.hierarchyCancelEdit) {
									ViewStateService.hierarchyState.closeContextMenu();
								}
							} else {
								//if (!e.metaKey && !e.ctrlKey) {
								if (code === ConfigProviderService.vals.keyMappings.hierarchyDeleteLink) {
									e.preventDefault();
								}

								// Play selected item
								if (code === ConfigProviderService.vals.keyMappings.hierarchyPlayback) {
									e.preventDefault();
									ViewStateService.hierarchyState.playing += 1;
									// console.log('hierarchyPlayback');
								}

								// rotateHierarchy
								if (code === ConfigProviderService.vals.keyMappings.hierarchyRotate) {
									ViewStateService.hierarchyState.toggleRotation();
								}

								// Delete link
								if (code === ConfigProviderService.vals.keyMappings.hierarchyDeleteLink) {
									/*
									 This block is currently obsoleted because e.preventDefault() is called above
									 at the beginning of the hierarchy block
									 // This should only be called when certain keys are pressed that are known to trigger some browser behaviour.
									 // But what if the key code is reconfigured (possibly by the user)?
									 e.preventDefault();
									 */

									var pos = LinkService.deleteLink(ViewStateService.hierarchyState.selectedLinkFromID, ViewStateService.hierarchyState.selectedLinkToID);

									if (pos !== -1) {
										HistoryService.addObjToUndoStack({
											type: 'HIERARCHY',
											action: 'DELETELINK',
											fromID: ViewStateService.hierarchyState.selectedLinkFromID,
											toID: ViewStateService.hierarchyState.selectedLinkToID,
											position: pos
										});
									}
								}

								// Delete item
								if (code === ConfigProviderService.vals.keyMappings.hierarchyDeleteItem) {
									var result = LevelService.deleteItemWithLinks(ViewStateService.hierarchyState.selectedItemID);

									if (result.item !== undefined) {
										HistoryService.addObjToUndoStack({
											type: 'HIERARCHY',
											action: 'DELETEITEM',
											item: result.item,
											levelName: result.levelName,
											position: result.position,
											deletedLinks: result.deletedLinks
										});
									}
								}

								// Add item ...
								// ... before the currently selected one
                                var newID;
								if (code === ConfigProviderService.vals.keyMappings.hierarchyAddItemBefore) {
									newID = LevelService.addItem(ViewStateService.hierarchyState.selectedItemID, true);

									if (newID !== -1) {
										HistoryService.addObjToUndoStack({
											type: 'HIERARCHY',
											action: 'ADDITEM',
											newID: newID,
											neighborID: ViewStateService.hierarchyState.selectedItemID,
											before: true
										});
									}
								}
								// ... after the currently selected one
								if (code === ConfigProviderService.vals.keyMappings.hierarchyAddItemAfter) {
									newID = LevelService.addItem(ViewStateService.hierarchyState.selectedItemID, false);

									if (newID !== -1) {
										HistoryService.addObjToUndoStack({
											type: 'HIERARCHY',
											action: 'ADDITEM',
											newID: newID,
											neighborID: ViewStateService.hierarchyState.selectedItemID,
											before: false
										});
									}
								}

								/* Add link
								 if (code === ConfigProviderService.vals.keyMappings.hierarchyAddLink) {
								 if (ViewStateService.hierarchyState.newLinkFromID === undefined) {
								 ViewStateService.hierarchyState.newLinkFromID = ViewStateService.hierarchyState.selectedItemID;
								 } else {
								 var linkObj = HierarchyManipulationService.addLink(ViewStateService.hierarchyState.path, ViewStateService.hierarchyState.newLinkFromID, ViewStateService.hierarchyState.selectedItemID);
								 ViewStateService.hierarchyState.newLinkFromID = undefined;
								 if (linkObj !== null) {
								 HistoryService.addObjToUndoStack({
								 type: 'HIERARCHY',
								 action: 'ADDLINK',
								 link: linkObj
								 });
								 }
								 }
								 }*/

								// levelUp
								if (code === ConfigProviderService.vals.keyMappings.levelUp){
									// console.log("prevPath");
                                    if(ViewStateService.hierarchyState.curPathIdx >= 1) {
										ViewStateService.hierarchyState.curPathIdx = ViewStateService.hierarchyState.curPathIdx - 1;
                                    }
								}
								
								// levelDown
								if (code === ConfigProviderService.vals.keyMappings.levelDown){
									// console.log("nextPath");
									if(ViewStateService.hierarchyState.curPathIdx < ViewStateService.hierarchyState.curNrOfPaths - 1){
                                    	ViewStateService.hierarchyState.curPathIdx = ViewStateService.hierarchyState.curPathIdx + 1;
                                    }
								}


								// undo
								if (code === ConfigProviderService.vals.keyMappings.undo) {
									HistoryService.undo();
								}

								// redo
								if (code === ConfigProviderService.vals.keyMappings.redo) {
									HistoryService.redo();
								}

								// close modal
								if (!e.shiftKey && (code === ConfigProviderService.vals.keyMappings.esc || code === ConfigProviderService.vals.keyMappings.showHierarchy)) {
									ModalService.close();
								}
							}
						} else if (ViewStateService.isEditing()) {
							var domElement = $('.' + LevelService.getlasteditArea());
							// preventing new line if saving not allowed
							if (!ViewStateService.isSavingAllowed() && code === ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
								var definitions = ConfigProviderService.getLevelDefinition(ViewStateService.getcurClickLevelName()).attributeDefinitions[ViewStateService.getCurAttrIndex(ViewStateService.getcurClickLevelName())].legalLabels;
								e.preventDefault();
								e.stopPropagation();
								LevelService.deleteEditArea();
								ViewStateService.setEditing(false);
								ModalService.open('views/error.html', 'Editing Error: Sorry, characters allowed on this Level are "' + JSON.stringify(definitions) + '"');
							}
							// save text on enter if saving is allowed
							if (ViewStateService.isSavingAllowed() && code === ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
								var editingElement = LevelService.getItemFromLevelById(ViewStateService.getcurClickLevelName(), LevelService.getlastID());
								attrIndex = ViewStateService.getCurAttrIndex(ViewStateService.getcurClickLevelName());
								oldValue = '';
                                newValue = '';
								if (editingElement.labels[attrIndex] !== undefined) {
									oldValue = editingElement.labels[attrIndex].value;
								}
								// get new value from dom element or from ViewStateService.largeTextFieldInputFieldCurLabel if it is used
								if(ConfigProviderService.vals.restrictions.useLargeTextInputField){
									newValue = ViewStateService.largeTextFieldInputFieldCurLabel;
								}else{
                                    newValue = domElement.val();
								}

								LevelService.renameLabel(ViewStateService.getcurClickLevelName(), LevelService.getlastID(), ViewStateService.getCurAttrIndex(ViewStateService.getcurClickLevelName()), newValue);
								HistoryService.addObjToUndoStack({
									'type': 'ANNOT',
									'action': 'RENAMELABEL',
									'name': ViewStateService.getcurClickLevelName(),
									'id': LevelService.getlastID(),
									'attrIndex': attrIndex,
									'oldValue': oldValue,
									'newValue': newValue
								});
								LevelService.deleteEditArea();
								ViewStateService.setEditing(false);
								ViewStateService.setcurClickItem(LevelService.getItemFromLevelById(ViewStateService.getcurClickLevelName(), LevelService.getlastID()));
							}
							// escape from text if esc
							if (code === ConfigProviderService.vals.keyMappings.esc) {
								LevelService.deleteEditArea();
								ViewStateService.setEditing(false);
							}
							
							// playAllInView
							if (code === ConfigProviderService.vals.keyMappings.playAllInView && e.altKey) {
								if (ViewStateService.getPermission('playaudio')) {
									if (ConfigProviderService.vals.restrictions.playback) {
										SoundHandlerService.playFromTo(ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS);
										ViewStateService.animatePlayHead(ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS);
									}
								}
							}

							// playSelected
							if (code === 3 && e.altKey) { // ConfigProviderService.vals.keyMappings.playSelected
								if (ViewStateService.getPermission('playaudio')) {
									if (ConfigProviderService.vals.restrictions.playback) {
										SoundHandlerService.playFromTo(ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE);
										ViewStateService.animatePlayHead(ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE);
									}
								}
							}

                            // playEntireFile
                            if (code === ConfigProviderService.vals.keyMappings.playEntireFile && e.altKey) {
                                if (ViewStateService.getPermission('playaudio')) {
                                    if (ConfigProviderService.vals.restrictions.playback) {
                                        SoundHandlerService.playFromTo(0, SoundHandlerService.audioBuffer.length);
                                        ViewStateService.animatePlayHead(0, SoundHandlerService.audioBuffer.length);
                                    }
                                }
                            }


						} else if (ViewStateService.getcursorInTextField() === false) {

							LevelService.deleteEditArea();


							// escape from open modal dialog
							//
							if (ViewStateService.curState.permittedActions.length === 0 &&
								code === ConfigProviderService.vals.keyMappings.esc &&
								ModalService.force === false) {
								ModalService.close();
							}


							// delegate keyboard keyMappings according to keyMappings of scope
							// showHierarchy
							if (code === ConfigProviderService.vals.keyMappings.showHierarchy && ConfigProviderService.vals.activeButtons.showHierarchy) {
								if (ViewStateService.curState !== ViewStateService.states.noDBorFilesloaded) {
									if (ViewStateService.hierarchyState.isShown()) {
										ModalService.close();
									} else {
										ViewStateService.hierarchyState.toggleHierarchy();
										ModalService.open('views/showHierarchyModal.html');
									}
								}
							}

							// zoomAll
							if (code === ConfigProviderService.vals.keyMappings.zoomAll) {
								if (ViewStateService.getPermission('zoom')) {
									ViewStateService.setViewPort(0, SoundHandlerService.audioBuffer.length);
								} else {
									//console.log('zoom all action currently not allowed');
								}
							}

							// zoomIn
							if (code === ConfigProviderService.vals.keyMappings.zoomIn) {
								if (ViewStateService.getPermission('zoom')) {
									ViewStateService.zoomViewPort(true, LevelService);
								} else {
									//console.log('action currently not allowed');
								}
							}

							// zoomOut
							if (code === ConfigProviderService.vals.keyMappings.zoomOut) {
								if (ViewStateService.getPermission('zoom')) {
									ViewStateService.zoomViewPort(false, LevelService);
								} else {
									//console.log('action currently not allowed');
								}
							}

							// zoomSel
							if (code === ConfigProviderService.vals.keyMappings.zoomSel) {
								if (ViewStateService.getPermission('zoom')) {
									ViewStateService.setViewPort(ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE);
								} else {
									//console.log('action currently not allowed');
								}
							}

							// shiftViewPortLeft
							if (code === ConfigProviderService.vals.keyMappings.shiftViewPortLeft) {
								if (ViewStateService.getPermission('zoom')) {
									ViewStateService.shiftViewPort(false);
								} else {
									//console.log('action currently not allowed');
								}
							}

							// shiftViewPortRight
							if (code === ConfigProviderService.vals.keyMappings.shiftViewPortRight) {
								if (ViewStateService.getPermission('zoom')) {
									ViewStateService.shiftViewPort(true);
								} else {
									//console.log('action currently not allowed');
								}
							}

							// playEntireFile
							if (code === ConfigProviderService.vals.keyMappings.playEntireFile) {
								if (ViewStateService.getPermission('playaudio')) {
									if (ConfigProviderService.vals.restrictions.playback) {
										SoundHandlerService.playFromTo(0, SoundHandlerService.audioBuffer.length);
										ViewStateService.animatePlayHead(0, SoundHandlerService.audioBuffer.length);
									}
								} else {
									//console.log('action currently not allowed');
								}
							}

							// playAllInView
							if (code === ConfigProviderService.vals.keyMappings.playAllInView) {
								if (ViewStateService.getPermission('playaudio')) {
									if (ConfigProviderService.vals.restrictions.playback) {
										if(!e.shiftKey){
											SoundHandlerService.playFromTo(ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS);
											ViewStateService.animatePlayHead(ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS);
										}else{
											// playAllInView to end of file and autoscroll
											SoundHandlerService.playFromTo(ViewStateService.curViewPort.sS, SoundHandlerService.audioBuffer.length);
											ViewStateService.animatePlayHead(ViewStateService.curViewPort.sS, SoundHandlerService.audioBuffer.length, true);
										}


									}
								} else {
									//console.log('action currently not allowed');
								}
							}

							// playSelected
							if (code === ConfigProviderService.vals.keyMappings.playSelected) {
								if (ViewStateService.getPermission('playaudio')) {
									if (ConfigProviderService.vals.restrictions.playback) {
										SoundHandlerService.playFromTo(ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE);
										ViewStateService.animatePlayHead(ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE);
									}
								} else {
									//console.log('action currently not allowed');
								}
							}

							// save bundle
							if (code === ConfigProviderService.vals.keyMappings.saveBndl) {
								if (ViewStateService.getPermission('saveBndlBtnClick')) {
                                    DbObjLoadSaveService.saveBundle();
								}
							}


							// selectFirstContourCorrectionTool
							if (code === ConfigProviderService.vals.keyMappings.selectFirstContourCorrectionTool) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.correctionTool) {
										ViewStateService.curCorrectionToolNr = 1;
									}
								}
							}

							// selectSecondContourCorrectionTool
							if (code === ConfigProviderService.vals.keyMappings.selectSecondContourCorrectionTool) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.correctionTool) {
										ViewStateService.curCorrectionToolNr = 2;
									}
								}
							}
							// selectThirdContourCorrectionTool
							if (code === ConfigProviderService.vals.keyMappings.selectThirdContourCorrectionTool) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.correctionTool) {
										ViewStateService.curCorrectionToolNr = 3;
									}
								}
							}
							// selectFourthContourCorrectionTool
							if (code === ConfigProviderService.vals.keyMappings.selectFourthContourCorrectionTool) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.correctionTool) {
										ViewStateService.curCorrectionToolNr = 4;
									}
								}
							}
							// selectFourthContourCorrectionTool
							if (code === ConfigProviderService.vals.keyMappings.selectFifthContourCorrectionTool) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.correctionTool) {
										ViewStateService.curCorrectionToolNr = 5;
									}
								}
							}
							// selectNOContourCorrectionTool
							if (code === ConfigProviderService.vals.keyMappings.selectNoContourCorrectionTool) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.correctionTool) {
										ViewStateService.curCorrectionToolNr = undefined;
									}
								}
							}
							// levelUp
							if (code === ConfigProviderService.vals.keyMappings.levelUp) {
								if (ViewStateService.getPermission('labelAction')) {
									ViewStateService.selectLevel(false, ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].levelCanvases.order, LevelService); // pass in LevelService to prevent circular deps
								}
							}
							// levelDown
							if (code === ConfigProviderService.vals.keyMappings.levelDown) {
								if (ViewStateService.getPermission('labelAction')) {
									ViewStateService.selectLevel(true, ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].levelCanvases.order, LevelService); // pass LevelService to prevent circular deps
								}
							}

							// preselected boundary snap to top
							if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToNearestTopBoundary) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.editItemSize) {
										mouseSeg = ViewStateService.getcurMouseItem();
										levelName = ViewStateService.getcurMouseLevelName();
										levelType = ViewStateService.getcurMouseLevelType();
										neighbor = ViewStateService.getcurMouseNeighbours();
										minDist = LevelService.snapBoundary(true, levelName, mouseSeg, neighbor, levelType);
										if (minDist === false) {
											// error msg nothing moved / nothing on top
										} else {
											if (levelType === 'EVENT') {
												HistoryService.updateCurChangeObj({
													'type': 'ANNOT',
													'action': 'MOVEEVENT',
													'name': levelName,
													'id': mouseSeg.id,
													'movedBy': minDist
												});
											} else if (levelType === 'SEGMENT') {
												HistoryService.updateCurChangeObj({
													'type': 'ANNOT',
													'action': 'MOVEBOUNDARY',
													'name': levelName,
													'id': mouseSeg.id,
													'movedBy': minDist,
													'position': 0
												});
											}
											HistoryService.addCurChangeObjToUndoStack();
										}
									}
								}
							}

							// preselected boundary snap to bottom
							if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToNearestBottomBoundary) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.editItemSize) {
										mouseSeg = ViewStateService.getcurMouseItem();
										levelName = ViewStateService.getcurMouseLevelName();
										levelType = ViewStateService.getcurMouseLevelType();
										neighbor = ViewStateService.getcurMouseNeighbours();
										minDist = LevelService.snapBoundary(false, levelName, mouseSeg, neighbor, levelType);
										if (minDist === false) {
											// error msg nothing moved / nothing below
										} else {
											if (levelType === 'EVENT') {
												HistoryService.updateCurChangeObj({
													'type': 'ANNOT',
													'action': 'MOVEEVENT',
													'name': levelName,
													'id': mouseSeg.id,
													'movedBy': minDist
												});
											} else if (levelType === 'SEGMENT') {
												HistoryService.updateCurChangeObj({
													'type': 'ANNOT',
													'action': 'MOVEBOUNDARY',
													'name': levelName,
													'id': mouseSeg.id,
													'movedBy': minDist,
													'position': 0
												});
											}
											HistoryService.addCurChangeObjToUndoStack();
										}
									}
								}
							}

							// preselected boundary to nearest zero crossing
							if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToNearestZeroCrossing) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.editItemSize) {
										var dist;
										var action;
										if (ViewStateService.getcurMouseLevelType() === 'SEGMENT') {
											if(!ViewStateService.getcurMouseisLast()){
												dist = LevelService.calcDistanceToNearestZeroCrossing(ViewStateService.getcurMouseItem().sampleStart);
											} else {
												dist = LevelService.calcDistanceToNearestZeroCrossing(ViewStateService.getcurMouseItem().sampleStart + ViewStateService.getcurMouseItem().sampleDur + 1);	
											}
										} else {
											dist = LevelService.calcDistanceToNearestZeroCrossing(ViewStateService.getcurMouseItem().samplePoint);
										}
										if (dist !== 0) {
											seg = ViewStateService.getcurMouseItem();
											levelName = ViewStateService.getcurMouseLevelName();
											levelType = ViewStateService.getcurMouseLevelType();
											if(levelType == 'SEGMENT'){
												LevelService.moveBoundary(levelName, seg.id, dist, ViewStateService.getcurMouseisFirst(), ViewStateService.getcurMouseisLast());
												action = 'MOVEBOUNDARY';
											} else {
												LevelService.moveEvent(levelName, seg.id, dist);
												action = 'MOVEEVENT';
											}

											HistoryService.updateCurChangeObj({
												'type': 'ANNOT',
												'action': action,
												'name': levelName,
												'id': seg.id,
												'movedBy': dist,
												'isFirst': ViewStateService.getcurMouseisFirst(),
												'isLast': ViewStateService.getcurMouseisLast()
											});

											HistoryService.addCurChangeObjToUndoStack();
										}
									}
								}
							}

                            var changeTime;
							// expand Segments
							if (code === ConfigProviderService.vals.keyMappings.expandSelSegmentsRight) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.editItemSize) {
										if (ViewStateService.getcurClickLevelName() === undefined) {
											ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
										} else {
											if (ViewStateService.getselected().length === 0) {
												ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
											} else {
												changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
												if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
													changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (SoundHandlerService.audioBuffer.length / 100);
												}
												LevelService.expandSegment(true, ViewStateService.getcurClickItems(), ViewStateService.getcurClickLevelName(), changeTime);
												HistoryService.addObjToUndoStack({
													'type': 'ANNOT',
													'action': 'EXPANDSEGMENTS',
													'name': ViewStateService.getcurClickLevelName(),
													'item': ViewStateService.getcurClickItems(),
													'rightSide': true,
													'changeTime': changeTime
												});
												ViewStateService.selectBoundary();
											}
										}
									}
								}
							}

							// expand Segment left
							if (code === ConfigProviderService.vals.keyMappings.expandSelSegmentsLeft) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.editItemSize) {
										if (ViewStateService.getcurClickLevelName() === undefined) {
											ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
										} else {
											if (ViewStateService.getselected().length === 0) {
												ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
											} else {
												if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
													changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
												} else if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
													changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (SoundHandlerService.audioBuffer.length / 100);
												} else {
													ModalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
												}
												LevelService.expandSegment(false, ViewStateService.getcurClickItems(), ViewStateService.getcurClickLevelName(), changeTime);
												HistoryService.addObjToUndoStack({
													'type': 'ANNOT',
													'action': 'EXPANDSEGMENTS',
													'name': ViewStateService.getcurClickLevelName(),
													'item': ViewStateService.getcurClickItems(),
													'rightSide': false,
													'changeTime': changeTime
												});
												ViewStateService.selectBoundary();
											}
										}
									}
								}
							}

							// shrink Segments Left
							if (code === ConfigProviderService.vals.keyMappings.shrinkSelSegmentsLeft) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.editItemSize) {
										if (ViewStateService.getcurClickLevelName() === undefined) {
											ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
										} else {
											if (ViewStateService.getselected().length === 0) {
												ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
											} else {
												if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
													changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
												} else if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
													changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (SoundHandlerService.audioBuffer.length / 100);
												} else {
													ModalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
												}
												LevelService.expandSegment(true, ViewStateService.getcurClickItems(), ViewStateService.getcurClickLevelName(), -changeTime);
												HistoryService.addObjToUndoStack({
													'type': 'ANNOT',
													'action': 'EXPANDSEGMENTS',
													'name': ViewStateService.getcurClickLevelName(),
													'item': ViewStateService.getcurClickItems(),
													'rightSide': true,
													'changeTime': -changeTime
												});
												ViewStateService.selectBoundary();
											}
										}
									}
								}
							}


							// shrink Segments Right
							if (code === ConfigProviderService.vals.keyMappings.shrinkSelSegmentsRight) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ConfigProviderService.vals.restrictions.editItemSize) {
										if (ViewStateService.getcurClickLevelName() === undefined) {
											ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
										} else {
											if (ViewStateService.getselected().length === 0) {
												ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
											} else {
												if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
													changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
												} else if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
													changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (SoundHandlerService.audioBuffer.length / 100);
												} else {
													ModalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
												}
												LevelService.expandSegment(false, ViewStateService.getcurClickItems(), ViewStateService.getcurClickLevelName(), -changeTime);
												HistoryService.addObjToUndoStack({
													'type': 'ANNOT',
													'action': 'EXPANDSEGMENTS',
													'name': ViewStateService.getcurClickLevelName(),
													'item': ViewStateService.getcurClickItems(),
													'rightSide': false,
													'changeTime': -changeTime
												});
												ViewStateService.selectBoundary();
											}
										}
									}
								}
							}


							// toggleSideBars
							if (code === ConfigProviderService.vals.keyMappings.toggleSideBarLeft) {
								if (ViewStateService.getPermission('toggleSideBars')) {
									// check if menu button in showing -> if not -> no submenu open
									if (ConfigProviderService.vals.activeButtons.openMenu) {
										ViewStateService.toggleBundleListSideBar(styles.animationPeriod);
									}
								}
							}

							// toggleSideBars
							if (code === ConfigProviderService.vals.keyMappings.toggleSideBarRight) {
								if (ViewStateService.getPermission('toggleSideBars')) {
									// check if menu button in showing -> if not -> no submenu open
									if (ConfigProviderService.vals.activeButtons.openMenu) {
										ViewStateService.setPerspectivesSideBarOpen(!ViewStateService.getPerspectivesSideBarOpen());
									}
								}
							}

							// select Segments in viewport selection
							if (code === ConfigProviderService.vals.keyMappings.selectItemsInSelection) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ViewStateService.getcurClickLevelName() === undefined) {
										ModalService.open('views/error.html', 'Selection Error : Please select a Level first');
									} else {
										ViewStateService.curClickItems = [];
										var prev = null;
										ViewStateService.getItemsInSelection(DataService.data.levels).forEach((item) => {
											if(prev === null) {
												ViewStateService.setcurClickItem(item);
											}
											else {
												ViewStateService.setcurClickItemMultiple(item, prev);
											}
											prev = item;
										});
										ViewStateService.selectBoundary();
									}
								}
							}

							// selPrevItem (arrow key left)
							if (code === ConfigProviderService.vals.keyMappings.selPrevItem) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ViewStateService.getcurClickItems().length > 0) {
										lastNeighboursMove = LevelService.getItemNeighboursFromLevel(ViewStateService.getcurClickLevelName(), ViewStateService.getcurClickItems()[0].id, ViewStateService.getcurClickItems()[ViewStateService.getcurClickItems().length - 1].id);
										neighbours = LevelService.getItemNeighboursFromLevel(ViewStateService.getcurClickLevelName(), lastNeighboursMove.left.id, lastNeighboursMove.left.id);
										if (lastNeighboursMove.left !== undefined) {
											if (lastNeighboursMove.left.sampleStart !== undefined) {
												// check if in view
												if (lastNeighboursMove.left.sampleStart > ViewStateService.curViewPort.sS) {
													if (e.shiftKey) { // select multiple while shift
														ViewStateService.setcurClickItemMultiple(lastNeighboursMove.left, neighbours.right);
														LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
													} else {
														ViewStateService.setcurClickItem(lastNeighboursMove.left);
														LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
													}
													ViewStateService.selectBoundary();
												}
											} else {
												// check if in view
												if (lastNeighboursMove.left.samplePoint > ViewStateService.curViewPort.sS) {
													if (e.shiftKey) { // select multiple while shift
														ViewStateService.setcurClickItemMultiple(lastNeighboursMove.left, neighbours.right);
														LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
													} else {
														ViewStateService.setcurClickItem(lastNeighboursMove.left);
														LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
													}
													ViewStateService.selectBoundary();
												}
											}
										}
									}
								}
							}

							

							// selNextItem (arrow key right)
							if (code === ConfigProviderService.vals.keyMappings.selNextItem) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ViewStateService.getcurClickItems().length > 0) {
										lastNeighboursMove = LevelService.getItemNeighboursFromLevel(ViewStateService.getcurClickLevelName(), ViewStateService.getcurClickItems()[0].id, ViewStateService.getcurClickItems()[ViewStateService.getcurClickItems().length - 1].id);
										neighbours = LevelService.getItemNeighboursFromLevel(ViewStateService.getcurClickLevelName(), lastNeighboursMove.right.id, lastNeighboursMove.right.id);
										if (lastNeighboursMove.right !== undefined) {
											if (lastNeighboursMove.right.sampleStart !== undefined) {
												// check if in view
												if (lastNeighboursMove.right.sampleStart +  lastNeighboursMove.right.sampleDur < ViewStateService.curViewPort.eS) {
													if (e.shiftKey) { // select multiple while shift
														ViewStateService.setcurClickItemMultiple(lastNeighboursMove.right, neighbours.left);
														LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
													} else {
														ViewStateService.setcurClickItem(lastNeighboursMove.right);
														LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
													}
													ViewStateService.selectBoundary();
												}
											} else {
												// check if in view
												if (lastNeighboursMove.right.samplePoint < ViewStateService.curViewPort.eS) {
													if (e.shiftKey) { // select multiple while shift
														ViewStateService.setcurClickItemMultiple(lastNeighboursMove.right, neighbours.left);
														LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
													} else {
														ViewStateService.setcurClickItem(lastNeighboursMove.right);
														LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
													}
													ViewStateService.selectBoundary();
												}
											}
										}
									}
								}
							}

							// selNextPrevItem (tab key and tab+shift key)
							if (code === ConfigProviderService.vals.keyMappings.selNextPrevItem) {
								if (ViewStateService.getPermission('labelAction')) {
									if (ViewStateService.getcurClickItems().length > 0) {
										var idLeft = ViewStateService.getcurClickItems()[0].id;
										var idRight = ViewStateService.getcurClickItems()[ViewStateService.getcurClickItems().length - 1].id;
										lastNeighboursMove = LevelService.getItemNeighboursFromLevel(ViewStateService.getcurClickLevelName(), idLeft, idRight);
										if (e.shiftKey) {
											if (lastNeighboursMove.left !== undefined) {
												if (lastNeighboursMove.left.sampleStart !== undefined) {
													// check if in view
													if (lastNeighboursMove.left.sampleStart >= ViewStateService.curViewPort.sS) {
														ViewStateService.setcurClickItem(lastNeighboursMove.left);
														LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
													}
												} else {
													// check if in view
													if (lastNeighboursMove.left.samplePoint >= ViewStateService.curViewPort.sS) {
														ViewStateService.setcurClickItem(lastNeighboursMove.left, lastNeighboursMove.left.id);
														LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
													}
												}
											}
										} else {
											if (lastNeighboursMove.right !== undefined) {
												if (lastNeighboursMove.right.sampleStart !== undefined) {
													// check if in view
													if (lastNeighboursMove.right.sampleStart + lastNeighboursMove.right.sampleDur <= ViewStateService.curViewPort.eS) {
														ViewStateService.setcurClickItem(lastNeighboursMove.right);
														LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
													}
												} else {
													// check if in view
													if (lastNeighboursMove.right.samplePoint < ViewStateService.curViewPort.eS) {
														ViewStateService.setcurClickItem(lastNeighboursMove.right);
														LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
													}
												}
											}
										}
									}
								}
							}

							// createNewItemAtSelection
							if (code === ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
								// auto action in model when open and user presses 'enter'
								if (ModalService.isOpen) {
									if(ModalService.force === false){
										ModalService.confirmContent();
                                    }
								}
								else {
									if (ViewStateService.curClickLevelIndex === undefined) {
										ModalService.open('views/error.html', 'Modify Error: Please select a Segment or Event Level first.');
									}
									else {
										if (ViewStateService.getPermission('labelAction')) {
											if (ConfigProviderService.vals.restrictions.addItem) {
												if (ViewStateService.getselectedRange().start === ViewStateService.curViewPort.selectS && ViewStateService.getselectedRange().end === ViewStateService.curViewPort.selectE) {
													if (ViewStateService.getcurClickItems().length === 1) {
														// check if in view
														if (ViewStateService.getselectedRange().start >= ViewStateService.curViewPort.sS && ViewStateService.getselectedRange().end <= ViewStateService.curViewPort.eS) {
															ViewStateService.setEditing(true);
															LevelService.openEditArea(ViewStateService.getcurClickItems()[0], LevelService.getlasteditAreaElem(), ViewStateService.getcurClickLevelType());
															scope.cursorInTextField();
														}
													} else {
														ModalService.open('views/error.html', 'Modify Error: Please select a single Segment.');
													}
												} else {
													if (ViewStateService.curViewPort.selectE === -1 && ViewStateService.curViewPort.selectS === -1) {
														ModalService.open('views/error.html', 'Error : Please select a Segment or Point to modify it\'s name. Or select a level plus a range in the viewport in order to insert a new Segment.');
													} else {
														seg = LevelService.getClosestItem(ViewStateService.curViewPort.selectS, ViewStateService.getcurClickLevelName(), SoundHandlerService.audioBuffer.length).current;
														if (ViewStateService.getcurClickLevelType() === 'SEGMENT') {
															if (seg === undefined) {
																insSeg = LevelService.insertSegment(ViewStateService.getcurClickLevelName(), ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE, ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
																if (!insSeg.ret) {
																	ModalService.open('views/error.html', 'Error : You are not allowed to insert a Segment here.');
																} else {
																	HistoryService.addObjToUndoStack({
																		'type': 'ANNOT',
																		'action': 'INSERTSEGMENTS',
																		'name': ViewStateService.getcurClickLevelName(),
																		'start': ViewStateService.curViewPort.selectS,
																		'end': ViewStateService.curViewPort.selectE,
																		'ids': insSeg.ids,
																		'segName': ConfigProviderService.vals.labelCanvasConfig.newSegmentName
																	});
																}
															} else {
																if (seg.sampleStart === ViewStateService.curViewPort.selectS && (seg.sampleStart + seg.sampleDur + 1) === ViewStateService.curViewPort.selectE) {
																	LevelService.setlasteditArea('_' + seg.id);
																	LevelService.openEditArea(seg, LevelService.getlasteditAreaElem(), ViewStateService.getcurClickLevelType());
																	ViewStateService.setEditing(true);
																} else {
																	insSeg = LevelService.insertSegment(ViewStateService.getcurClickLevelName(), ViewStateService.curViewPort.selectS, ViewStateService.curViewPort.selectE, ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
																	if (!insSeg.ret) {
																		ModalService.open('views/error.html', 'Error : You are not allowed to insert a Segment here.');
																	} else {
																		HistoryService.addObjToUndoStack({
																			'type': 'ANNOT',
																			'action': 'INSERTSEGMENTS',
																			'name': ViewStateService.getcurClickLevelName(),
																			'start': ViewStateService.curViewPort.selectS,
																			'end': ViewStateService.curViewPort.selectE,
																			'ids': insSeg.ids,
																			'segName': ConfigProviderService.vals.labelCanvasConfig.newSegmentName
																		});
																	}
																}
															}
														} else {
															var levelDef = ConfigProviderService.getLevelDefinition(ViewStateService.getcurClickLevelName());
															if (typeof levelDef.anagestConfig === 'undefined') {
																var insPoint = LevelService.insertEvent(ViewStateService.getcurClickLevelName(), ViewStateService.curViewPort.selectS, ConfigProviderService.vals.labelCanvasConfig.newEventName);
																if (insPoint.alreadyExists) {
																	LevelService.setlasteditArea('_' + seg.id);
																	LevelService.openEditArea(seg, LevelService.getlasteditAreaElem(), ViewStateService.getcurClickLevelType());
																	ViewStateService.setEditing(true);
																} else {
																	HistoryService.addObjToUndoStack({
																		'type': 'ANNOT',
																		'action': 'INSERTEVENT',
																		'name': ViewStateService.getcurClickLevelName(),
																		'start': ViewStateService.curViewPort.selectS,
																		'id': insPoint.id,
																		'pointName': ConfigProviderService.vals.labelCanvasConfig.newEventName
																	});
																}
															} else {
																AnagestService.insertAnagestEvents();
															}
														}
													}
												}
											} else {
											}
										}
									}
								}
							}


							// undo
							if (code === ConfigProviderService.vals.keyMappings.undo) {
								if (ViewStateService.getPermission('labelAction')) {
									HistoryService.undo();
								}
							}


							// redo
							if (code === ConfigProviderService.vals.keyMappings.redo) {
								if (ViewStateService.getPermission('labelAction')) {
									HistoryService.redo();
								}
							}

                            if (e.originalEvent.code === 'Digit1' && e.shiftKey) {
                                ViewStateService.switchPerspective(0, ConfigProviderService.vals.perspectives);
                            }
                            if (e.originalEvent.code === 'Digit2' && e.shiftKey) {
                                ViewStateService.switchPerspective(1, ConfigProviderService.vals.perspectives);
                            }
                            if (e.originalEvent.code === 'Digit3' && e.shiftKey) {
                                ViewStateService.switchPerspective(2, ConfigProviderService.vals.perspectives);
                            }
                            if (e.originalEvent.code === 'Digit4' && e.shiftKey) {
                                ViewStateService.switchPerspective(3, ConfigProviderService.vals.perspectives);
                            }
                            if (e.originalEvent.code === 'Digit5' && e.shiftKey) {
                                ViewStateService.switchPerspective(4, ConfigProviderService.vals.perspectives);
                            }
                            if (e.originalEvent.code === 'Digit6' && e.shiftKey) {
								ViewStateService.switchPerspective(5, ConfigProviderService.vals.perspectives);
                            }
                            if (e.originalEvent.code === 'Digit7' && e.shiftKey) {
                                ViewStateService.switchPerspective(6, ConfigProviderService.vals.perspectives);
                            }
                            if (e.originalEvent.code === 'Digit8' && e.shiftKey) {
                                ViewStateService.switchPerspective(7, ConfigProviderService.vals.perspectives);
                            }
                            if (e.originalEvent.code === 'Digit9' && e.shiftKey) {
                                ViewStateService.switchPerspective(8, ConfigProviderService.vals.perspectives);
                            }

                            // deletePreselBoundary
							if (code === ConfigProviderService.vals.keyMappings.deletePreselBoundary) {
								if (ViewStateService.getPermission('labelAction')) {
									e.preventDefault();
									seg = ViewStateService.getcurMouseItem();
									var cseg = ViewStateService.getcurClickItems();
									var isFirst = ViewStateService.getcurMouseisFirst();
									var isLast = ViewStateService.getcurMouseisLast();
									levelName = ViewStateService.getcurMouseLevelName();
									var type = ViewStateService.getcurMouseLevelType();
									if (!e.shiftKey) {
										if (ConfigProviderService.vals.restrictions.deleteItemBoundary) {
											if (seg !== undefined) {
												var neighbour = LevelService.getItemNeighboursFromLevel(levelName, seg.id, seg.id);
												if (type === 'SEGMENT') {
													deletedSegment = LevelService.deleteBoundary(levelName, seg.id, isFirst, isLast);
													HistoryService.updateCurChangeObj({
														'type': 'ANNOT',
														'action': 'DELETEBOUNDARY',
														'name': levelName,
														'id': seg.id,
														'isFirst': isFirst,
														'isLast': isLast,
														'deletedSegment': deletedSegment
													});
													if (neighbour.left !== undefined) {
														deletedLinks = LinkService.deleteLinkBoundary(seg.id, neighbour.left.id, LevelService);
														HistoryService.updateCurChangeObj({
															'type': 'ANNOT',
															'action': 'DELETELINKBOUNDARY',
															'name': levelName,
															'id': seg.id,
															'neighbourId': neighbour.left.id,
															'deletedLinks': deletedLinks
														});
													} else {
														deletedLinks = LinkService.deleteLinkBoundary(seg.id, -1, LevelService);
														HistoryService.updateCurChangeObj({
															'type': 'ANNOT',
															'action': 'DELETELINKBOUNDARY',
															'name': levelName,
															'id': seg.id,
															'neighbourId': -1,
															'deletedLinks': deletedLinks
														});
													}
													HistoryService.addCurChangeObjToUndoStack();
													lastEventMove = LevelService.getClosestItem(ViewStateService.getLasPcm() + ViewStateService.curViewPort.sS, levelName, SoundHandlerService.audioBuffer.length);
													if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
														lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
														ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
													}
													ViewStateService.setcurClickItem(deletedSegment.clickSeg);
												} else {
													var deletedPoint = LevelService.deleteEvent(levelName, seg.id);
													if (deletedPoint !== false) {
														HistoryService.updateCurChangeObj({
															'type': 'ANNOT',
															'action': 'DELETEEVENT',
															'name': levelName,
															'start': deletedPoint.samplePoint,
															'id': deletedPoint.id,
															'pointName': deletedPoint.labels[0].value

														});
														HistoryService.addCurChangeObjToUndoStack();
														lastEventMove = LevelService.getClosestItem(ViewStateService.getLasPcm() + ViewStateService.curViewPort.sS, levelName, SoundHandlerService.audioBuffer.length);
														if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
															lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
															ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
														}
													} else {
														ViewStateService.setcurMouseItem(undefined, undefined, undefined, undefined, undefined);
													}
												}
											}
										}
									} else {
										if (ConfigProviderService.vals.restrictions.deleteItem) {
											if (cseg !== undefined && cseg.length > 0) {
												if (ViewStateService.getcurClickLevelType() === 'SEGMENT') {
													deletedSegment = LevelService.deleteSegments(levelName, cseg[0].id, cseg.length);
													HistoryService.updateCurChangeObj({
														'type': 'ANNOT',
														'action': 'DELETESEGMENTS',
														'name': levelName,
														'id': cseg[0].id,
														'length': cseg.length,
														'deletedSegment': deletedSegment
													});
													deletedLinks = LinkService.deleteLinkSegment(cseg);
													HistoryService.updateCurChangeObj({
														'type': 'ANNOT',
														'action': 'DELETELINKSEGMENT',
														'name': levelName,
														'segments': cseg,
														'deletedLinks': deletedLinks
													});
													HistoryService.addCurChangeObjToUndoStack();
													lastEventMove = LevelService.getClosestItem(ViewStateService.getLasPcm() + ViewStateService.curViewPort.sS, levelName, SoundHandlerService.audioBuffer.length);
													if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
														lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
														ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
													}
													ViewStateService.setcurClickItem(deletedSegment.clickSeg);
												} else {
													ModalService.open('views/error.html', 'Delete Error: You can not delete Segments on Point Levels.');
												}
											}
										}
									}
								}
							}
							if (!e.metaKey && !e.ctrlKey) {
								e.preventDefault();
								e.stopPropagation();
							}
						}
					});
				};

				scope.safeApply = function (fn) {
					var phase = this.$root.$$phase;
					if (phase === '$apply' || phase === '$digest') {
						if (fn && (typeof (fn) === 'function')) {
							fn();
						}
					} else {
						this.$apply(fn);
					}
				};

				//remove binding on destroy
				scope.$on(
					'$destroy',
					function () {
						$(window).off('keydown');
					}
				);
			}
		};
	}]);
