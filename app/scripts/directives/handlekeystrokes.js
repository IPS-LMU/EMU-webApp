'use strict';

angular.module('emuwebApp')
  .directive('handleglobalkeystrokes', function ($timeout, viewState, dialogService, Soundhandlerservice, ConfigProviderService, HistoryService, LevelService, DataService, LinkService, AnagestService) {
    return {
      restrict: 'A',
      link: function postLink(scope) {

        $(document).bind('keyup', function (e) {
          var code = (e.keyCode ? e.keyCode : e.which);
          if(viewState.isEditing() && !viewState.getcursorInTextField()) {
              applyKeyCodeUp(code, e);
          }
        });
      
        $(document).bind('keydown', function (e) {
          if (!scope.firefox) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 8 || code == 9 || code == 27 || code == 37 || code == 38 || code == 39 || code == 40 || code == 32) {
              applyKeyCode(code, e);
            }
          }
        });
        
        $(document).bind('keypress', function (e) {
          var code = (e.keyCode ? e.keyCode : e.which);
          applyKeyCode(code, e);
        });
        
        function applyKeyCodeUp(code, e) {
          scope.$apply(function () {
            if (code !== ConfigProviderService.vals.keyMappings.esc && code !== ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
				var domElement = $('.' + LevelService.getlasteditArea());
				var str = domElement.val();
				viewState.setSavingAllowed(true);
				var definitions = ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).attributeDefinitions[viewState.getCurAttrIndex(viewState.getcurClickLevelName())];
				// if it is defined then check if characters are ok
				if(definitions.legalLabels !== undefined && str.length > 0) {
					if(definitions.legalLabels.indexOf(str) < 0) {
						viewState.setSavingAllowed(false);
					}
				}
			    if(viewState.isSavingAllowed()) {
				  domElement.css({ "background-color": "rgba(255,255,0,1)"});
			    }
			    else {
				  domElement.css({ "background-color": "rgba(255,0,0,1)"});
			    }  
		     }              
          });
       }        

        function applyKeyCode(code, e) {
          scope.$apply(function () {
            // check if mouse has to be in labeler for key mappings
            if (ConfigProviderService.vals.main.catchMouseForKeyBinding) {
              if (!viewState.mouseInEmuWebApp) {
                return;
              }
            }
            if (viewState.isEditing()) {
              var domElement = $('.' + LevelService.getlasteditArea());
              // preventing new line if saving not allowed
              if(!viewState.isSavingAllowed() && code === ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
                  var definitions = ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName()).attributeDefinitions[viewState.getCurAttrIndex(viewState.getcurClickLevelName())].legalLabels;
                  e.preventDefault();
                  e.stopPropagation(); 
                  LevelService.deleteEditArea();
                  viewState.setEditing(false);                  
                  scope.dials.open('views/error.html', 'ModalCtrl', 'Editing Error: Sorry, characters allowed on this Level are "'+JSON.stringify(definitions)+'"');                  
              }
              // save text on enter if saving is allowed
              if (viewState.isSavingAllowed() && code === ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {   
                  var editingElement = LevelService.getItemFromLevelById(viewState.getcurClickLevelName(), LevelService.getlastID());
                  var attrIndex = viewState.getCurAttrIndex(viewState.getcurClickLevelName());
                  var oldValue = editingElement.labels[attrIndex].value;
                  LevelService.renameLabel(viewState.getcurClickLevelName(), LevelService.getlastID(), viewState.getCurAttrIndex(viewState.getcurClickLevelName()), domElement.val());
                  HistoryService.addObjToUndoStack({
                    'type': 'ANNOT',
                    'action': 'RENAMELABEL',
                    'name': viewState.getcurClickLevelName(),
                    'id': LevelService.getlastID(),
                    'attrIndex': attrIndex,
                    'oldValue': oldValue,
                    'newValue': domElement.val()
                  });
                  LevelService.deleteEditArea();
                  viewState.setEditing(false);
                  viewState.setcurClickItem(LevelService.getItemFromLevelById(viewState.getcurClickLevelName(), LevelService.getlastID()));
              }
              // escape from text if esc
              if (code === ConfigProviderService.vals.keyMappings.esc) {
                LevelService.deleteEditArea();
                viewState.setEditing(false);
              }
              
            } else if (viewState.getcursorInTextField() === false) {
              
              LevelService.deleteEditArea();
              
              // escape from open modal dialog
              if (viewState.curState.permittedActions.length === 0 && code === ConfigProviderService.vals.keyMappings.esc) {
                scope.dials.close();
                if(viewState.isHierarchyOpen()) {
                    viewState.showHierarchy();
                }
              } 

              // delegate keyboard keyMappings according to keyMappings of scope

              // showHierarhy
              if (code === ConfigProviderService.vals.keyMappings.showHierarhy) {
                  if(viewState.curState!==viewState.states.noDBorFilesloaded) {
					  if(!viewState.isHierarchyOpen()) {
						  dialogService.open('views/showHierarchyModal.html', 'ShowhierarchyCtrl');
					  }
					  else {
						  dialogService.close();
					  }
					  viewState.showHierarchy();
                  }
              }

              // rotateHierarhy
              if (code === ConfigProviderService.vals.keyMappings.rotateHierarhy) {
                  viewState.rotateHierarchy();
              }

              // zoomAll
              if (code === ConfigProviderService.vals.keyMappings.zoomAll) {
                if (viewState.getPermission('zoom')) {
                  viewState.setViewPort(0, Soundhandlerservice.wavJSO.Data.length);
                } else {
                  //console.log('zoom all action currently not allowed');
                }
              }

              // zoomIn
              if (code === ConfigProviderService.vals.keyMappings.zoomIn) {
                if (viewState.getPermission('zoom')) {
                  viewState.zoomViewPort(true, LevelService);
                } else {
                  //console.log('action currently not allowed');
                }
              }

              // zoomOut
              if (code === ConfigProviderService.vals.keyMappings.zoomOut) {
                if (viewState.getPermission('zoom')) {
                  viewState.zoomViewPort(false, LevelService);
                } else {
                  //console.log('action currently not allowed');
                }
              }

              // zoomSel
              if (code === ConfigProviderService.vals.keyMappings.zoomSel) {
                if (viewState.getPermission('zoom')) {
                  viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
                } else {
                  //console.log('action currently not allowed');
                }
              }

              // shiftViewPortLeft
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortLeft) {
                if (viewState.getPermission('zoom')) {
                  viewState.shiftViewPort(false);
                } else {
                  //console.log('action currently not allowed');
                }
              }

              // shiftViewPortRight
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortRight) {
                if (viewState.getPermission('zoom')) {
                  viewState.shiftViewPort(true);
                } else {
                  //console.log('action currently not allowed');
                }
              }

              // playEntireFile
              if (code === ConfigProviderService.vals.keyMappings.playEntireFile) {
                if (viewState.getPermission('playaudio')) {
                  if (ConfigProviderService.vals.restrictions.playback) {
                    Soundhandlerservice.playFromTo(0, Soundhandlerservice.wavJSO.Data.length);
                    viewState.animatePlayHead(0, Soundhandlerservice.wavJSO.Data.length);
                  }
                } else {
                  //console.log('action currently not allowed');
                }
              }

              // playAllInView
              if (code === ConfigProviderService.vals.keyMappings.playAllInView) {
                if (viewState.getPermission('playaudio')) {
                  if (ConfigProviderService.vals.restrictions.playback) {
                    Soundhandlerservice.playFromTo(viewState.curViewPort.sS, viewState.curViewPort.eS);
                    viewState.animatePlayHead(viewState.curViewPort.sS, viewState.curViewPort.eS);
                  }
                } else {
                  //console.log('action currently not allowed');
                }
              }

              // playSelected
              if (code === ConfigProviderService.vals.keyMappings.playSelected) {
                if (viewState.getPermission('playaudio')) {
                  if (ConfigProviderService.vals.restrictions.playback) {
                    Soundhandlerservice.playFromTo(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
                    viewState.animatePlayHead(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
                  }
                } else {
                  //console.log('action currently not allowed');
                }
              }

              // selectFirstContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectFirstContourCorrectionTool) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.correctionTool) {
                    viewState.curCorrectionToolNr = 1;
                  }
                }
              }
              // selectSecondContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectSecondContourCorrectionTool) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.correctionTool) {
                    viewState.curCorrectionToolNr = 2;
                  }
                }
              }
              // selectThirdContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectThirdContourCorrectionTool) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.correctionTool) {
                    viewState.curCorrectionToolNr = 3;
                  }
                }
              }
              // selectFourthContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectFourthContourCorrectionTool) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.correctionTool) {
                    viewState.curCorrectionToolNr = 4;
                  }
                }
              }
              // selectNOContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectNoContourCorrectionTool) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.correctionTool) {
                    viewState.curCorrectionToolNr = undefined;
                  }
                }
              }
              // levelUp
              if (code === ConfigProviderService.vals.keyMappings.levelUp) {
                if (viewState.getPermission('labelAction')) {
                  viewState.selectLevel(false, ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order, LevelService); // pass in LevelService to prevent circular deps
                }
              }
              // levelDown
              if (code === ConfigProviderService.vals.keyMappings.levelDown) {
                if (viewState.getPermission('labelAction')) {
                  viewState.selectLevel(true, ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order, LevelService); // pass LevelService to prevent circular deps
                }
              }

              // preselected boundary snap to top
              if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToNearestTopBoundary) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    var mouseSeg = viewState.getcurMouseItem();
                    var levelName = viewState.getcurMouseLevelName();
                    var levelType = viewState.getcurMouseLevelType();
                    var neighbor = viewState.getcurMouseNeighbours();
                    var minDist = LevelService.snapBoundary(true, levelName, mouseSeg, neighbor, levelType);
                    if (minDist === false) {
                      // error msg nothing moved / nothing on top
                    } else {
                      if (levelType === "EVENT") {
                        HistoryService.updateCurChangeObj({
                          'type': 'ANNOT',
                          'action': 'MOVEEVENT',
                          'name': levelName,
                          'id': mouseSeg.id,
                          'movedBy': minDist
                        });
                      } else if (levelType === "SEGMENT") {
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
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    var mouseSeg = viewState.getcurMouseItem();
                    var levelName = viewState.getcurMouseLevelName();
                    var levelType = viewState.getcurMouseLevelType();
                    var neighbor = viewState.getcurMouseNeighbours();
                    var minDist = LevelService.snapBoundary(false, levelName, mouseSeg, neighbor, levelType);
                    if (minDist == false) {
                      // error msg nothing moved / nothing below
                    } else {
                      if (levelType === "EVENT") {
                        HistoryService.updateCurChangeObj({
                          'type': 'ANNOT',
                          'action': 'MOVEEVENT',
                          'name': levelName,
                          'id': mouseSeg.id,
                          'movedBy': minDist
                        });
                      } else if (levelType === "SEGMENT") {
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
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    var dist;
                    if (viewState.getcurMouseLevelType() === 'SEGMENT') {
                      dist = LevelService.calcDistanceToNearestZeroCrossing(viewState.getcurMouseItem().sampleStart);
                    } else {
                      dist = LevelService.calcDistanceToNearestZeroCrossing(viewState.getcurMouseItem().samplePoint);
                    }
                    if (dist !== 0) {
                      var seg = viewState.getcurMouseItem();
                      var neigh = viewState.getcurMouseNeighbours();
                      var levelname = viewState.getcurMouseLevelName();
                      LevelService.moveBoundary(levelname, seg.id, dist, 0);
                      HistoryService.updateCurChangeObj({
                        'type': 'ANNOT',
                        'action': 'MOVEBOUNDARY',
                        'name': levelname,
                        'id': seg.id,
                        'movedBy': dist,
                        'position': 0
                      });
                      HistoryService.addCurChangeObjToUndoStack();
                    }
                  }
                }
              }

              // expand Segments
              if (code === ConfigProviderService.vals.keyMappings.expandSelSegmentsRight) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    if (viewState.getcurClickLevelName() === undefined) {
                      scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segments Error: Please select a Level first');
                    } else {
                      if (viewState.getselected().length === 0) {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segments Error: Please select one or more Segments first');
                      } else {
                        var changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                        if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                          changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (Soundhandlerservice.wavJSO.Data.length / 100);
                        } 
                        LevelService.expandSegment(true, viewState.getcurClickItems(), viewState.getcurClickLevelName(), changeTime);
                        HistoryService.addObjToUndoStack({
                          'type': 'ANNOT',
                          'action': 'EXPANDSEGMENTS',
                          'name': viewState.getcurClickLevelName(),
                          'item': viewState.getcurClickItems(),
                          'rightSide': true,
                          'changeTime': changeTime
                        });
                        viewState.selectBoundary();
                      }
                    }
                  }
                }
              }

              // expand Segment left
              if (code === ConfigProviderService.vals.keyMappings.expandSelSegmentsLeft) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    if (viewState.getcurClickLevelName() === undefined) {
                      scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segments Error: Please select a Level first');
                    } else {
                      if (viewState.getselected().length === 0) {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segments Error: Please select one or more Segments first');
                      } else {
                        if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
                          var changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                        } else if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                          var changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (Soundhandlerservice.wavJSO.Data.length / 100);
                        } else {
                          scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                        }
                        LevelService.expandSegment(false, viewState.getcurClickItems(), viewState.getcurClickLevelName(), changeTime);
                        HistoryService.addObjToUndoStack({
                          'type': 'ANNOT',
                          'action': 'EXPANDSEGMENTS',
                          'name': viewState.getcurClickLevelName(),
                          'item': viewState.getcurClickItems(),
                          'rightSide': false,
                          'changeTime': changeTime
                        });
                        viewState.selectBoundary();
                      }
                    }
                  }
                }
              }

              // shrink Segments Left
              if (code === ConfigProviderService.vals.keyMappings.shrinkSelSegmentsLeft) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    if (viewState.getcurClickLevelName() === undefined) {
                      scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segments Error: Please select a Level first');
                    } else {
                      if (viewState.getselected().length === 0) {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segments Error: Please select one or more Segments first');
                      } else {
                        if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
                          var changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                        } else if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                          var changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (Soundhandlerservice.wavJSO.Data.length / 100);
                        } else {
                          scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                        }
                        LevelService.expandSegment(true, viewState.getcurClickItems(), viewState.getcurClickLevelName(), -changeTime);
                        HistoryService.addObjToUndoStack({
                          'type': 'ANNOT',
                          'action': 'EXPANDSEGMENTS',
                          'name': viewState.getcurClickLevelName(),
                          'item': viewState.getcurClickItems(),
                          'rightSide': true,
                          'changeTime': -changeTime
                        });
                        viewState.selectBoundary();
                      }
                    }
                  }
                }
              }



              // shrink Segments Right
              if (code === ConfigProviderService.vals.keyMappings.shrinkSelSegmentsRight) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    if (viewState.getcurClickLevelName() === undefined) {
                      scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segments Error: Please select a Level first');
                    } else {
                      if (viewState.getselected().length === 0) {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segments Error: Please select one or more Segments first');
                      } else {
                        if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
                          var changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                        } else if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                          var changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (Soundhandlerservice.wavJSO.Data.length / 100);
                        } else {
                          scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                        }
                        LevelService.expandSegment(false, viewState.getcurClickItems(), viewState.getcurClickLevelName(), -changeTime);
                        HistoryService.addObjToUndoStack({
                          'type': 'ANNOT',
                          'action': 'EXPANDSEGMENTS',
                          'name': viewState.getcurClickLevelName(),
                          'item': viewState.getcurClickItems(),
                          'rightSide': false,
                          'changeTime': -changeTime
                        });
                        viewState.selectBoundary();
                      }
                    }
                  }
                }
              }


              // toggleSideBars
              if (code === ConfigProviderService.vals.keyMappings.toggleSideBarLeft) {
                if (viewState.getPermission('toggleSideBars')) {
                  // check if menu button in showing -> if not -> no submenu open
                  if (ConfigProviderService.vals.activeButtons.openMenu) {
                    viewState.togglesubmenuOpen(ConfigProviderService.vals.colors.transitionTime);
                  }
                }
              }

              // toggleSideBars
              if (code === ConfigProviderService.vals.keyMappings.toggleSideBarRight) {
                if (viewState.getPermission('toggleSideBars')) {
                  // check if menu button in showing -> if not -> no submenu open
                  if (ConfigProviderService.vals.activeButtons.openMenu) {
                    viewState.setRightsubmenuOpen(!viewState.getRightsubmenuOpen());
                  }
                }
              }

              // select Segments in viewport selection
              if (code === ConfigProviderService.vals.keyMappings.selectItemsInSelection) {
                if (viewState.getPermission('labelAction')) {
                  if (viewState.getcurClickLevelName() === undefined) {
                    scope.dials.open('views/error.html', 'ModalCtrl', 'Selection Error : Please select a Level first');
                  } else {
                    viewState.selectItemsInSelection(DataService.data.levels);
                  }
                }
              }

              // selPrevItem (arrow key left)
              if (code === ConfigProviderService.vals.keyMappings.selPrevItem) {
                if (viewState.getPermission('labelAction')) {
                  if (viewState.getcurClickItems().length > 0) {
                    var idLeft = viewState.getcurClickItems()[0].id;
                    var idRight = viewState.getcurClickItems()[viewState.getcurClickItems().length - 1].id;
                    var lastNeighboursMove = LevelService.getItemNeighboursFromLevel(viewState.getcurClickLevelName(), idLeft, idRight);
                    if (lastNeighboursMove.left !== undefined) {
                      if (lastNeighboursMove.left.sampleStart !== undefined) {
                        // check if in view
                        if (lastNeighboursMove.left.sampleStart > viewState.curViewPort.sS) {
                          if(e.shiftKey) { // select multiple while shift
                            viewState.setcurClickItemMultiple(lastNeighboursMove.left);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                            viewState.selectBoundary();                          
                          }
                          else {
                            viewState.setcurClickItem(lastNeighboursMove.left);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                          }
                        }
                      } else {
                        // check if in view
                        if (lastNeighboursMove.left.samplePoint > viewState.curViewPort.sS) {
                          if(e.shiftKey) { // select multiple while shift
                            viewState.setcurClickItemMultiple(lastNeighboursMove.left);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                            viewState.selectBoundary();                          
                          }
                          else {
                            viewState.setcurClickItem(lastNeighboursMove.left);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                          }
                        }
                      }
                    }
                  }
                }
              }

              // selNextItem (arrow key right)
              if (code === ConfigProviderService.vals.keyMappings.selNextItem) {
                if (viewState.getPermission('labelAction')) {
                  if (viewState.getcurClickItems().length > 0) {
                    var idLeft = viewState.getcurClickItems()[0].id;
                    var idRight = viewState.getcurClickItems()[viewState.getcurClickItems().length - 1].id;
                    var lastNeighboursMove = LevelService.getItemNeighboursFromLevel(viewState.getcurClickLevelName(), idLeft, idRight);
                      if (lastNeighboursMove.right !== undefined) {
                      // check if in view
                        if ((lastNeighboursMove.right.sampleStart + lastNeighboursMove.right.sampleDur) < viewState.curViewPort.eS) {
                          if(e.shiftKey) { // select multiple while shift
                            viewState.setcurClickItemMultiple(lastNeighboursMove.right);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                            viewState.selectBoundary();
                          }
                          else {
                            
                            viewState.setcurClickItem(lastNeighboursMove.right);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                          }
                        }
                      }
                      else {
                      
                      }
                  }
                }
              }

              // selNextPrevItem (tab key and tab+shift key)
              if (code === ConfigProviderService.vals.keyMappings.selNextPrevItem) {
                if (viewState.getPermission('labelAction')) {
                  if (viewState.getcurClickItems().length > 0) {
                    var idLeft = viewState.getcurClickItems()[0].id;
                    var idRight = viewState.getcurClickItems()[viewState.getcurClickItems().length - 1].id;
                    var lastNeighboursMove = LevelService.getItemNeighboursFromLevel(viewState.getcurClickLevelName(), idLeft, idRight);
                    if (e.shiftKey) {
                      if (lastNeighboursMove.left !== undefined) {
                        if (lastNeighboursMove.left.sampleStart !== undefined) {
                          // check if in view
                          if (lastNeighboursMove.left.sampleStart + lastNeighboursMove.left.sampleDur > viewState.curViewPort.sS) {
                            viewState.setcurClickItem(lastNeighboursMove.left, lastNeighboursMove.left.id);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                          }
                        } else {
                          // check if in view
                          if (lastNeighboursMove.left.samplePoint > viewState.curViewPort.sS) {
                            viewState.setcurClickItem(lastNeighboursMove.left, lastNeighboursMove.left.id);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                          }
                        }
                      }

                    } else {                    
                      if (lastNeighboursMove.right !== undefined) {                      
                        if (lastNeighboursMove.right.sampleStart !== undefined) {                        
                          // check if in view
                          if (lastNeighboursMove.right.sampleStart < viewState.curViewPort.eS) {   
                            viewState.setcurClickItem(lastNeighboursMove.right, lastNeighboursMove.right.id);
                            LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                          }
                        } else {
                          // check if in view
                          if (lastNeighboursMove.right.samplePoint < viewState.curViewPort.eS) {
                            viewState.setcurClickItem(lastNeighboursMove.right, lastNeighboursMove.right.id);
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
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.addItem) {
                    if (viewState.getselectedRange().start === viewState.curViewPort.selectS && viewState.getselectedRange().end === viewState.curViewPort.selectE) {
                      if (viewState.getcurClickItems().length === 1) {
                        // check if in view
                        if (viewState.getselectedRange().start >= viewState.curViewPort.sS && viewState.getselectedRange().end <= viewState.curViewPort.eS) {
                          viewState.setEditing(true);
                          LevelService.openEditArea(viewState.getcurClickItems()[0], LevelService.getlasteditAreaElem(), viewState.getcurClickLevelType());
                          scope.cursorInTextField();
                        }
                      } else {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Modify Error: Please select a single Segment.');
                      }
                    } else {
                      if (viewState.curViewPort.selectE == -1 && viewState.curViewPort.selectS == -1) {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Error : Please select a Segment or Point to modify it\'s name. Or select a level plus a range in the viewport in order to insert a new Segment.');
                      } else {
                        if (viewState.getcurClickLevelType() === 'SEGMENT') {
                          var seg = LevelService.getClosestItem(viewState.curViewPort.selectS, viewState.getcurClickLevelName(), Soundhandlerservice.wavJSO.Data.length).current;
                          if(seg.sampleStart === viewState.curViewPort.selectS && (seg.sampleStart+seg.sampleDur + 1) === viewState.curViewPort.selectE) {
							  viewState.setcurClickLevel(viewState.getcurClickLevelName(), viewState.getcurClickLevelType(), scope.$index);
							  viewState.setcurClickItem(seg.current);
							  LevelService.setlasteditArea('_' + seg.id);
							  viewState.setEditing(true);
							  LevelService.openEditArea(seg, LevelService.getlasteditAreaElem(), viewState.getcurClickLevelType());
							  viewState.setEditing(true);
                          }
                          else {
							  var insSeg = LevelService.insertSegment(viewState.getcurClickLevelName(), viewState.curViewPort.selectS, viewState.curViewPort.selectE, ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
							  if (!insSeg.ret) {
								scope.dials.open('views/error.html', 'ModalCtrl', 'Error : You are not allowed to insert a Segment here.');
							  } else {
								HistoryService.addObjToUndoStack({
								  'type': 'ANNOT',
								  'action': 'INSERTSEGMENTS',
								  'name': viewState.getcurClickLevelName(),
								  'start': viewState.curViewPort.selectS,
								  'end': viewState.curViewPort.selectE,
								  'ids': insSeg.ids,
								  'segName': ConfigProviderService.vals.labelCanvasConfig.newSegmentName
								});
							  }
							}
                        } else {
                          var levelDef = ConfigProviderService.getLevelDefinition(viewState.getcurClickLevelName());
                          if (typeof levelDef.anagestConfig === 'undefined') {
                            var insPoint = LevelService.insertEvent(viewState.getcurClickLevelName(), viewState.curViewPort.selectS, ConfigProviderService.vals.labelCanvasConfig.newEventName);
                            if (insPoint.alreadyExists) {
                              scope.dials.open('views/error.html', 'ModalCtrl', 'Error: You are not allowed to insert a Point here.');
                            } else {
                              HistoryService.addObjToUndoStack({
                                'type': 'ANNOT',
                                'action': 'INSERTEVENT',
                                'name': viewState.getcurClickLevelName(),
                                'start': viewState.curViewPort.selectS,
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
                  } else {}
                }
              }


              // undo
              if (code === ConfigProviderService.vals.keyMappings.undo) {
                if (viewState.getPermission('labelAction')) {
                  HistoryService.undo();
                }
              }


              // redo
              if (code === ConfigProviderService.vals.keyMappings.redo) {
                if (viewState.getPermission('labelAction')) {
                  HistoryService.redo();
                }
              }

              // deletePreselBoundary
              if (code === ConfigProviderService.vals.keyMappings.deletePreselBoundary) {
                if (viewState.getPermission('labelAction')) {
                  e.preventDefault();
				  var seg = viewState.getcurMouseItem();
				  var cseg = viewState.getcurClickItems();
				  var isFirst = viewState.getcurMouseisFirst();
				  var isLast = viewState.getcurMouseisLast();
				  var levelname = viewState.getcurMouseLevelName();
				  var type = viewState.getcurMouseLevelType();
                  if (!e.shiftKey) {
                    if (ConfigProviderService.vals.restrictions.deleteItemBoundary) {
                      if (seg !== undefined) {
                          var neighbour = LevelService.getItemNeighboursFromLevel(levelname, seg.id, seg.id);
                          if (type === "SEGMENT") {
                            var deletedSegment = LevelService.deleteBoundary(levelname, seg.id, isFirst, isLast);
                            HistoryService.updateCurChangeObj({
                              'type': 'ANNOT',
                              'action': 'DELETEBOUNDARY',
                              'name': levelname,
                              'id': seg.id,
                              'isFirst': isFirst,
                              'isLast': isLast,
                              'deletedSegment': deletedSegment
                            });
                            var deletedLinks
                            if(neighbour.left!==undefined) {
                                deletedLinks = LinkService.deleteLinkBoundary(seg.id, neighbour.left.id);
								HistoryService.updateCurChangeObj({
									'type': 'ANNOT',
									'action': 'DELETELINKBOUNDARY',
									'name': levelname,
									'id': seg.id,
									'neighbourId': neighbour.left.id,
									'deletedLinks': deletedLinks
								});
                            }
                            else {
                                deletedLinks = LinkService.deleteLinkBoundary(seg.id, -1);
								HistoryService.updateCurChangeObj({
									'type': 'ANNOT',
									'action': 'DELETELINKBOUNDARY',
									'name': levelname,
									'id': seg.id,
									'neighbourId': -1,
									'deletedLinks': deletedLinks
								});                                
                            }
							HistoryService.addCurChangeObjToUndoStack();
						    var lastEventMove = LevelService.getClosestItem(viewState.getLasPcm() + viewState.curViewPort.sS, levelname, Soundhandlerservice.wavJSO.Data.length);
						    if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
						        var lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
						        viewState.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, viewState.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
						    }
                            viewState.setcurClickItem(deletedSegment.clickSeg);
                          } else {
                            var deletedPoint = LevelService.deleteEvent(levelname, seg.id);
                            if(deletedPoint!==false) {
								HistoryService.updateCurChangeObj({
								  'type': 'ANNOT',
								  'action': 'DELETEEVENT',
								  'name': levelname,
								  'start': deletedPoint.samplePoint,
								  'id': deletedPoint.id,
								  'pointName': deletedPoint.labels[0].value

								});
								HistoryService.addCurChangeObjToUndoStack();
								var lastEventMove = LevelService.getClosestItem(viewState.getLasPcm() + viewState.curViewPort.sS, levelname, Soundhandlerservice.wavJSO.Data.length);
								if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
									var lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
									viewState.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, viewState.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
								}
						    }
						    else {
						        viewState.setcurMouseItem(undefined, undefined, undefined, undefined, undefined);
						    }
                        }
                      } else {
                        // scope.dials.open('views/error.html', 'ModalCtrl', 'Delete Error: Please select a Boundary first.');
                      }
                    }
                  } else {
                    if (ConfigProviderService.vals.restrictions.deleteItem) {
                      if (cseg !== undefined && cseg.length > 0) {
                        if (viewState.getcurClickLevelType() === 'SEGMENT') {
                          var deletedSegment = LevelService.deleteSegments(levelname, cseg[0].id, cseg.length);
                          HistoryService.updateCurChangeObj({
                            'type': 'ANNOT',
                            'action': 'DELETESEGMENTS',
                            'name': levelname,
                            'id': cseg[0].id,
                            'length': cseg.length,
                            'deletedSegment': deletedSegment
                          });
                          var deletedLinks = LinkService.deleteLinkSegment(cseg);
						  HistoryService.updateCurChangeObj({
							'type': 'ANNOT',
							'action': 'DELETELINKSEGMENT',
							'name': levelname,
							'segments': cseg,
							'deletedLinks': deletedLinks
						  });
						  HistoryService.addCurChangeObjToUndoStack();
						  var lastEventMove = LevelService.getClosestItem(viewState.getLasPcm() + viewState.curViewPort.sS, levelname, Soundhandlerservice.wavJSO.Data.length);
						  if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
						    var lastNeighboursMove = LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
						    viewState.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, viewState.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
						  }
                          viewState.setcurClickItem(deletedSegment.clickSeg);
                        } else {
                          scope.dials.open('views/error.html', 'ModalCtrl', 'Delete Error: You can not delete Segments on Point Levels.');
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
        }

        scope.safeApply = function (fn) {
          var phase = this.$root.$$phase;
          if (phase == '$apply' || phase == '$digest') {
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
  });