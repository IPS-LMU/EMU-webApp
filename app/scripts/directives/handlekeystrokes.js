'use strict';

angular.module('emuwebApp')
  .directive('handleglobalkeystrokes', function ($timeout, viewState, Soundhandlerservice, ConfigProviderService, HistoryService, Levelservice) {
    return {
      restrict: 'A',
      link: function postLink(scope) {

        $(document).bind('keydown', function (e) {
          var code = (e.keyCode ? e.keyCode : e.which);


          scope.$apply(function () {
            // check if mouse has to be in labeler for key mappings
            if (ConfigProviderService.vals.main.catchMouseForKeyBinding) {
              if (!viewState.mouseInEmuWebApp) {
                return;
              }
            }
            scope.setlastkeycode(code, e.shiftKey);
            if (viewState.focusInTextField) {
              if (code === ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
                if (viewState.isEditing()) {
                  var editingElement = Levelservice.getElementDetailsById(viewState.getcurClickLevelName(), viewState.getlastID());
                  HistoryService.addObjToUndoStack({
                    'type': 'ESPS',
                    'action': 'renameLabel',
                    'levelName': viewState.getcurClickLevelName(),
                    'item': viewState.getlastID(),
                    'oldValue': editingElement.labels[0].value,
                    'newValue': $('.' + viewState.getlasteditArea()).val()
                  });

                  Levelservice.renameLabel(viewState.getcurClickLevelName(), viewState.getlastID(), $('.' + viewState.getlasteditArea()).val());
                  viewState.deleteEditArea();
                  viewState.focusInTextField = false;
                }
              }
              if (code === ConfigProviderService.vals.keyMappings.esc) {
                viewState.focusInTextField = false;
                viewState.deleteEditArea();
              }
              if (code === 13) {
                e.preventDefault();
                e.stopPropagation();
              }
              //}


            } else {

              viewState.deleteEditArea();

              // delegate keyboard keyMappings according to keyMappings of scope

              // zoomAll
              if (code === ConfigProviderService.vals.keyMappings.zoomAll) {
                if (viewState.getPermission('zoom')) {
                  viewState.setViewPort(0, Soundhandlerservice.wavJSO.Data.length);
                } else {
                  console.log('action currently not allowed');
                }
              }

              // zoomIn
              if (code === ConfigProviderService.vals.keyMappings.zoomIn) {
                if (viewState.getPermission('zoom')) {
                  viewState.zoomViewPort(true, Levelservice);
                } else {
                  console.log('action currently not allowed');
                }
              }

              // zoomOut
              if (code === ConfigProviderService.vals.keyMappings.zoomOut) {
                if (viewState.getPermission('zoom')) {
                  viewState.zoomViewPort(false, Levelservice);
                } else {
                  console.log('action currently not allowed');
                }
              }

              // shiftViewPortLeft
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortLeft) {
                if (viewState.getPermission('zoom')) {
                  viewState.shiftViewPort(false);
                } else {
                  console.log('action currently not allowed');
                }
              }

              // shiftViewPortRight
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortRight) {
                if (viewState.getPermission('zoom')) {
                  viewState.shiftViewPort(true);
                } else {
                  console.log('action currently not allowed');
                }
              }

              // zoomSel
              if (code === ConfigProviderService.vals.keyMappings.zoomSel) {
                if (viewState.getPermission('zoom')) {
                  viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
                } else {
                  console.log('action currently not allowed');
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
                  console.log('action currently not allowed');
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
                  console.log('action currently not allowed');
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
                  console.log('action currently not allowed');
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
                  viewState.selectLevel(false, ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order, Levelservice); // pass in Levelservice to prevent circular deps
                }
              }
              // levelDown
              if (code === ConfigProviderService.vals.keyMappings.levelDown) {
                if (viewState.getPermission('labelAction')) {
                  viewState.selectLevel(true, ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order, Levelservice); // pass Levelservice to prevent circular deps
                }
              }

              // preselected boundary snap to top
              if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToNearestTopBoundary) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    var mouseSeg = viewState.getcurMouseSegment();
                    var levelName = viewState.getcurMouseLevelName();
                    var levelType = viewState.getcurMouseLevelType();
                    var neighbor = viewState.getcurMouseNeighbours();
                    var minDist = Levelservice.snapBoundary(true, levelName, mouseSeg, neighbor, levelType);
                    if (minDist === false) {
                      // error msg nothing moved / nothing on top
                      console.log('error msg nothing moved / nothing on top');
                    } else {
                      if(levelType === "EVENT") {
                        HistoryService.updateCurChangeObj({
                          'type': 'ESPS',
                          'action': 'movePoint',
                          'levelName': levelName,
                          'segID': mouseSeg.id,
                          'movedBy': minDist
                        });
                        console.log('POINT', levelName, mouseSeg.id, minDist);
                      }
                      else if(levelType === "SEGMENT") {
                        HistoryService.updateCurChangeObj({
                          'type': 'ESPS',
                          'action': 'moveBoundary',
                          'levelName': levelName,
                          'neighbours': neighbor,
                          'segID': mouseSeg.id,
                          'movedBy': minDist
                        }); 
                        console.log('SEGMENT', levelName, mouseSeg.id, minDist, neighbor);                 
                      }
                    }
                  }
                }
              }

              // preselected boundary snap to bottom
              if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToNearestBottomBoundary) {
                if (viewState.getPermission('labelAction')) {
                  if (ConfigProviderService.vals.restrictions.editItemSize) {
                    var mouseSeg = viewState.getcurMouseSegment();
                    var levelName = viewState.getcurMouseLevelName();
                    var levelType = viewState.getcurMouseLevelType();
                    var neighbor = viewState.getcurMouseNeighbours();
                    var minDist = Levelservice.snapBoundary(false, levelName, mouseSeg, neighbor, levelType);
                    if (minDist == false) {
                      // error msg nothing moved / nothing below
                    } else {
                      if(levelType === "EVENT") {
                        HistoryService.updateCurChangeObj({
                          'type': 'ESPS',
                          'action': 'movePoint',
                          'levelName': levelName,
                          'segID': mouseSeg.id,
                          'movedBy': minDist
                        });
                        console.log('POINT', levelName, mouseSeg.id, minDist);
                      }
                      else if(levelType === "SEGMENT") {
                        HistoryService.updateCurChangeObj({
                          'type': 'ESPS',
                          'action': 'moveBoundary',
                          'levelName': levelName,
                          'neighbours': neighbor,
                          'segID': mouseSeg.id,
                          'movedBy': minDist
                        }); 
                        console.log('SEGMENT', levelName, mouseSeg.id, minDist, neighbor);                                  
                      }

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
                      dist = Levelservice.calcDistanceToNearesZeroCrossing(viewState.getcurMouseSegment().sampleStart);
                    } else {
                      dist = Levelservice.calcDistanceToNearesZeroCrossing(viewState.getcurMouseSegment().samplePoint);
                    }
                    if (dist !== 0) {
                      var seg = viewState.getcurMouseSegment();
                      var neigh = viewState.getcurMouseNeighbours();
                      var levelname = viewState.getcurMouseLevelName();
                      Levelservice.moveBoundry(dist, name, seg.id, neigh);
                      HistoryService.updateCurChangeObj({
                          'type': 'ESPS',
                          'action': 'moveBoundary',
                          'levelName': levelname,
                          'neighbours': neigh,
                          'segID': seg.id,
                          'movedBy': dist
                      });
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
                        if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
                          var changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                        } else if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                          var changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (Soundhandlerservice.wavJSO.Data.length / 100);
                        } else {
                          scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                        }

                        Levelservice.expandSegment(true, viewState.getcurClickSegments(), viewState.getcurClickLevelName(), changeTime);
                        scope.hists.addObjToUndoStack({
                          'type': 'ESPS',
                          'action': 'expandSegments',
                          'levelName': viewState.getcurClickLevelName(),
                          'item': viewState.getcurClickSegments(),
                          'rightSide': true,
                          'changeTime': changeTime
                        });
                        var l = viewState.getcurClickSegments().length;
                        if (l == 1) {
                          viewState.select(viewState.getcurClickSegments()[0].sampleStart, viewState.getcurClickSegments()[0].sampleStart + viewState.getcurClickSegments()[0].sampleDur);
                        } else {
                          viewState.select(viewState.getcurClickSegments()[0].sampleStart, viewState.getcurClickSegments()[l - 1].sampleStart + viewState.getcurClickSegments()[l - 1].sampleDur);
                        }
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
                        Levelservice.expandSegment(false, viewState.getcurClickSegments(), viewState.getcurClickLevelName(), changeTime);
                        scope.hists.addObjToUndoStack({
                          'type': 'ESPS',
                          'action': 'expandSegments',
                          'levelName': viewState.getcurClickLevelName(),
                          'item': viewState.getcurClickSegments(),
                          'rightSide': false,
                          'changeTime': changeTime
                        });
                        var l = viewState.getcurClickSegments().length;
                        if (l == 1) {
                          viewState.select(viewState.getcurClickSegments()[0].sampleStart, viewState.getcurClickSegments()[0].sampleStart + viewState.getcurClickSegments()[0].sampleDur);
                        } else {
                          viewState.select(viewState.getcurClickSegments()[0].sampleStart, viewState.getcurClickSegments()[l - 1].sampleStart + viewState.getcurClickSegments()[l - 1].sampleDur);
                        }
                      }
                    }
                  }
                }
              }

              // shrink Segments
              if (code === ConfigProviderService.vals.keyMappings.shrinkSelSegmentsLeftRight) {
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
                        if (e.shiftKey) {
                          scope.hists.addObjToUndoStack({
                            'type': 'ESPS',
                            'action': 'expandSegments',
                            'levelName': viewState.getcurClickLevelName(),
                            'item': viewState.getcurClickSegments(),
                            'rightSide': false,
                            'changeTime': -changeTime
                          });
                          Levelservice.expandSegment(false, viewState.getcurClickSegments(), viewState.getcurClickLevelName(), -changeTime);
                          var l = viewState.getcurClickSegments().length;
                          if (l == 1) {
                            viewState.select(viewState.getcurClickSegments()[0].sampleStart, viewState.getcurClickSegments()[0].sampleStart + viewState.getcurClickSegments()[0].sampleDur);
                          } else {
                            viewState.select(viewState.getcurClickSegments()[0].sampleStart, viewState.getcurClickSegments()[l - 1].sampleStart + viewState.getcurClickSegments()[l - 1].sampleDur);
                          }
                        } else {
                          scope.hists.addObjToUndoStack({
                            'type': 'ESPS',
                            'action': 'expandSegments',
                            'levelName': viewState.getcurClickLevelName(),
                            'item': viewState.getcurClickSegments(),
                            'rightSide': true,
                            'changeTime': -changeTime
                          });
                          Levelservice.expandSegment(true, viewState.getcurClickSegments(), viewState.getcurClickLevelName(), -changeTime);
                          var l = viewState.getcurClickSegments().length;
                          if (l == 1) {
                            viewState.select(viewState.getcurClickSegments()[0].sampleStart, viewState.getcurClickSegments()[0].sampleStart + viewState.getcurClickSegments()[0].sampleDur);
                          } else {
                            viewState.select(viewState.getcurClickSegments()[0].sampleStart, viewState.getcurClickSegments()[l - 1].sampleStart + viewState.getcurClickSegments()[l - 1].sampleDur);
                          }
                        }
                      }
                    }
                  }
                }
              }


              // toggleSideBars
              if (code === ConfigProviderService.vals.keyMappings.toggleSideBars) {
                if (viewState.getPermission('toggleSideBars')) {
                  // check if menu button in showing -> if not -> no submenu open
                  if (ConfigProviderService.vals.activeButtons.openMenu) {
                    if (e.shiftKey) {
                      scope.toggleRightSideMenuHidden();
                    } else {
                      scope.openSubmenu();
                    }
                  }
                }
              }

              // select Segments in viewport selection
              if (code === ConfigProviderService.vals.keyMappings.selectSegmentsInSelection) {
                if (viewState.getPermission('labelAction')) {
                  if (viewState.getcurClickLevelName() === undefined) {
                    scope.dials.open('views/error.html', 'ModalCtrl', 'Selection Error : Please select a Level first');
                  } else {
                    viewState.selectSegmentsInSelection(Levelservice.data.levels);
                  }
                }
              }

              // selPrevItem
              if (code === ConfigProviderService.vals.keyMappings.selPrevItem) {
                if (viewState.getPermission('labelAction')) {
                  if (viewState.getcurClickSegments().length > 0) {
                    var idLeft = viewState.getcurClickSegments()[0].id;
                    var idRight = viewState.getcurClickSegments()[viewState.getcurClickSegments().length - 1].id;
                    var lastNeighboursMove = Levelservice.getElementNeighbourDetails(viewState.getcurClickLevelName(), idLeft, idRight);
                    if (lastNeighboursMove.left !== undefined) {
                      if (lastNeighboursMove.left.sampleStart !== undefined) {
                        // check if in view
                        if (lastNeighboursMove.left.sampleStart + lastNeighboursMove.left.sampleDur > viewState.curViewPort.sS) {
                          viewState.setcurClickSegment(lastNeighboursMove.left, lastNeighboursMove.left.id);
                          viewState.setlasteditArea('_' + lastNeighboursMove.left.id);
                        }
                      } else {
                        // check if in view
                        if (lastNeighboursMove.left.samplePoint > viewState.curViewPort.sS) {
                          viewState.setcurClickSegment(lastNeighboursMove.left, lastNeighboursMove.left.id);
                          viewState.setlasteditArea('_' + lastNeighboursMove.left.id);
                        }
                      }
                    }
                  }
                }
              }

              // selNextItem
              if (code === ConfigProviderService.vals.keyMappings.selNextItem) {
                if (viewState.getPermission('labelAction')) {
                  if (viewState.getcurClickSegments().length > 0) {
                    var idLeft = viewState.getcurClickSegments()[0].id;
                    var idRight = viewState.getcurClickSegments()[viewState.getcurClickSegments().length - 1].id;
                    var lastNeighboursMove = Levelservice.getElementNeighbourDetails(viewState.getcurClickLevelName(), idLeft, idRight);
                    if (lastNeighboursMove.right.sampleStart !== undefined) {
                      // check if in view
                      if (lastNeighboursMove.right.sampleStart < viewState.curViewPort.eS) {
                        viewState.setcurClickSegment(lastNeighboursMove.right, lastNeighboursMove.right.id);
                        viewState.setlasteditArea('_' + lastNeighboursMove.right.id);
                      }
                    } else {
                      // check if in view
                      if (lastNeighboursMove.right.samplePoint < viewState.curViewPort.eS) {
                        viewState.setcurClickSegment(lastNeighboursMove.right, lastNeighboursMove.right.id);
                        viewState.setlasteditArea('_' + lastNeighboursMove.right.id);
                      }
                    }

                  }
                }
              }

              // selNextPrevItem
              if (code === ConfigProviderService.vals.keyMappings.selNextPrevItem) {
                if (viewState.getPermission('labelAction')) {
                  if (viewState.getcurClickSegments().length > 0) {
                    var idLeft = viewState.getcurClickSegments()[0].id;
                    var idRight = viewState.getcurClickSegments()[viewState.getcurClickSegments().length - 1].id;
                    var lastNeighboursMove = Levelservice.getElementNeighbourDetails(viewState.getcurClickLevelName(), idLeft, idRight);
                    if (e.shiftKey) {
                      if (lastNeighboursMove.left !== undefined) {
                        if (lastNeighboursMove.left.sampleStart !== undefined) {
                          // check if in view
                          if (lastNeighboursMove.left.sampleStart + lastNeighboursMove.left.sampleDur > viewState.curViewPort.sS) {
                            viewState.setcurClickSegment(lastNeighboursMove.left, lastNeighboursMove.left.id);
                            viewState.setlasteditArea('_' + lastNeighboursMove.left.id);
                          }
                        } else {
                          // check if in view
                          if (lastNeighboursMove.left.samplePoint > viewState.curViewPort.sS) {
                            viewState.setcurClickSegment(lastNeighboursMove.left, lastNeighboursMove.left.id);
                            viewState.setlasteditArea('_' + lastNeighboursMove.left.id);
                          }
                        }
                      }

                    } else {
                      if (lastNeighboursMove.right !== undefined) {
                        if (lastNeighboursMove.right.sampleStart !== undefined) {
                          // check if in view
                          if (lastNeighboursMove.right.sampleStart < viewState.curViewPort.eS) {
                            viewState.setcurClickSegment(lastNeighboursMove.right, lastNeighboursMove.right.id);
                            viewState.setlasteditArea('_' + lastNeighboursMove.right.id);
                          }
                        } else {
                          // check if in view
                          if (lastNeighboursMove.right.samplePoint < viewState.curViewPort.eS) {
                            viewState.setcurClickSegment(lastNeighboursMove.right, lastNeighboursMove.right.id);
                            viewState.setlasteditArea('_' + lastNeighboursMove.right.id);
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
                      if (viewState.getcurClickSegments().length === 1) {
                        // check if in view
                        if (viewState.getselectedRange().start >= viewState.curViewPort.sS && viewState.getselectedRange().end <= viewState.curViewPort.eS) {
                          viewState.setEditing(true);
                          viewState.openEditArea(viewState.getcurClickSegments()[0], viewState.getlasteditAreaElem(), viewState.getcurClickLevelType());
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
                          var insSeg = Levelservice.insertSegment(viewState.curViewPort.selectS, viewState.curViewPort.selectE, viewState.getcurClickLevelName(), ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
                          if (!insSeg) {
                            scope.dials.open('views/error.html', 'ModalCtrl', 'Error : You are not allowed to insert a Segment here.');
                          } else {
                            scope.hists.addObjToUndoStack({
                              'type': 'ESPS',
                              'action': 'insertSegments',
                              'levelName': viewState.getcurClickLevelName(),
                              'start': viewState.curViewPort.selectS,
                              'end': viewState.curViewPort.selectE,
                              'segname': ConfigProviderService.vals.labelCanvasConfig.newSegmentName
                            });
                          }
                        } else {
                          var insPoint = Levelservice.insertPoint(viewState.curViewPort.selectS, viewState.getcurClickLevelName(), ConfigProviderService.vals.labelCanvasConfig.newEventName);
                          if (!insPoint) {
                            scope.dials.open('views/error.html', 'ModalCtrl', 'You are not allowed to insert a Point here.');
                          } else {
                            scope.hists.addObjToUndoStack({ // todo 
                              'type': 'ESPS',
                              'action': 'insertPoint',
                              'levelName': viewState.getcurClickLevelName(),
                              'start': viewState.curViewPort.selectS,
                              'pointName': ConfigProviderService.vals.labelCanvasConfig.newEventName
                            });
                          }
                        }
                      }
                    }
                  } else {}
                }
              }


              // undoRedo
              if (code === ConfigProviderService.vals.keyMappings.undoRedo) {
                if (viewState.getPermission('labelAction')) {
                  if (!e.shiftKey) {
                    HistoryService.undo();
                  } else {
                    HistoryService.redo();
                  }
                  
                }
              }

              // deletePreselBoundary
              if (code === ConfigProviderService.vals.keyMappings.deletePreselBoundary) {
                if (viewState.getPermission('labelAction')) {
                  if (!e.shiftKey) {
                    if (ConfigProviderService.vals.restrictions.deleteItemBoundary) {
                      var seg = viewState.getcurMouseSegment();
                      var tn = viewState.getcurMouseLevelName();
                      if (seg !== undefined) {
                        var order = Levelservice.deleteBoundary(viewState.getcurMouseSegment(), viewState.getcurMouseLevelName());
                        scope.hists.addObjToUndoStack({
                          'type': 'ESPS',
                          'action': 'deleteBoundary',
                          'levelName': tn,
                          'order': order,
                          'seg': seg
                        });

                      } else {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Delete Error: Please select a Boundary first.');
                      }
                    }
                  } else {
                    if (ConfigProviderService.vals.restrictions.deleteItem) {
                      var seg = viewState.getcurClickSegments();
                      if (seg !== undefined) {
                        var selected = viewState.getcurClickSegments();
                        var neighbour = Levelservice.getElementNeighbourDetails(viewState.getcurClickLevelName(), selected[0].id, selected[selected.length - 1].id);
                        if (viewState.getcurClickLevelType() === 'SEGMENT') {
                          Levelservice.deleteSegments(viewState.getcurClickLevelName(), selected, neighbour);
                          viewState.setcurClickSegment(neighbour.left, neighbour.left.id);
                          scope.hists.addObjToUndoStack({
                            'type': 'ESPS',
                            'action': 'deleteSegments',
                            'levelName': viewState.getcurClickLevelName(),
                            'selected': selected,
                            'neighbours': neighbour
                          });
                        } else {
                          scope.dials.open('views/error.html', 'ModalCtrl', 'Delete Error: You can not delete Segments on Point Levels.');
                        }
                      }
                    }
                  }
                }
              }
              // console.log("Hit key code: " + code);
              if (!e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
              }
            }
          });

        });

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