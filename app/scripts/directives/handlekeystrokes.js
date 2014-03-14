'use strict';

angular.module('emuwebApp')
  .directive('handleglobalkeystrokes', function (viewState, Soundhandlerservice, ConfigProviderService, HistoryService, Levelservice) {
    return {
      restrict: 'A',
      link: function postLink(scope) {

        $(document).bind('keydown', function (e) {
          var code = (e.keyCode ? e.keyCode : e.which);

          scope.$apply(function () {
            scope.setlastkeycode(code, e.shiftKey);
            if (viewState.focusInTextField) {
              if (code === ConfigProviderService.vals.keyMappings.enter) {
                if (viewState.isEditing()) {
                  var editingElement = Levelservice.getElementDetails(viewState.getcurClickLevelName(),viewState.getlastID());
                  HistoryService.addObjToUndoStack({
                    'type': 'ESPS',
                    'action': 'renameLabel',
                    'name': viewState.getcurClickLevelName(),
                    'itemIdx': viewState.getlastID(),
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
                  viewState.setViewPort(0, viewState.curViewPort.bufferLength);
                } else {
                  console.log('action currently not allowed');
                }
              }

              // zoomIn
              if (code === ConfigProviderService.vals.keyMappings.zoomIn) {
                if (viewState.getPermission('zoom')) {
                  viewState.zoomViewPort(true);
                } else {
                  console.log('action currently not allowed');
                }
              }

              // zoomOut
              if (code === ConfigProviderService.vals.keyMappings.zoomOut) {
                if (viewState.getPermission('zoom')) {
                  viewState.zoomViewPort(false);
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
                if (viewState.getPermission('zoom')) {
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
                if (viewState.getPermission('zoom')) {
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
                if (viewState.getPermission('zoom')) {
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
                if (ConfigProviderService.vals.restrictions.correctionTool) {
                  viewState.curCorrectionToolNr = 1;
                }
              }
              // selectSecondContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectSecondContourCorrectionTool) {
                if (ConfigProviderService.vals.restrictions.correctionTool) {
                  viewState.curCorrectionToolNr = 2;
                }
              }
              // selectThirdContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectThirdContourCorrectionTool) {
                if (ConfigProviderService.vals.restrictions.correctionTool) {
                  viewState.curCorrectionToolNr = 3;
                }
              }
              // selectFourthContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectFourthContourCorrectionTool) {
                if (ConfigProviderService.vals.restrictions.correctionTool) {
                  viewState.curCorrectionToolNr = 4;
                }
              }
              // selectNOContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectNoContourCorrectionTool) {
                if (ConfigProviderService.vals.restrictions.correctionTool) {
                  viewState.curCorrectionToolNr = undefined;
                }
              }


              // LevelUp
              if (code === ConfigProviderService.vals.keyMappings.levelUp) {
                viewState.selectLevel(false);
              }
              // levelDown
              if (code === ConfigProviderService.vals.keyMappings.levelDown) {
                viewState.selectLevel(true);
              }

              // preselected boundary snap to top
              if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToTop) {
                if (ConfigProviderService.vals.restrictions.editItemSize) {
                  var mousSegID = viewState.getcurMouseSegmentId();
                  var levelName = viewState.getcurMouseLevelName();
                  var minDist = Levelservice.snapBoundary(true, viewState.getcurMouseSegment().sampleStart, levelName, mousSegID);
                  scope.hists.addObjToUndoStack({
                    'type': 'ESPS',
                    'action': 'snapBoundary',
                    'levelName': levelName,
                    'itemIdx': mousSegID,
                    'movedBy': minDist
                  });
                }
              }

              // preselected boundary snap to bottom
              if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToBottom) {
                if (ConfigProviderService.vals.restrictions.editItemSize) {
                  var mousSegID = viewState.getcurMouseSegmentId();
                  var levelName = viewState.getcurMouseLevelName();
                  var minDist = Levelservice.snapBoundary(false, viewState.getcurMouseSegment().sampleStart, levelName, mousSegID);
                  scope.hists.addObjToUndoStack({
                    'type': 'ESPS',
                    'action': 'snapBoundary',
                    'levelName': levelName,
                    'itemIdx': mousSegID,
                    'movedBy': minDist
                  });
                }
              }

              // expand Segment
              if (code === ConfigProviderService.vals.keyMappings.plus) {
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
                        var changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (viewState.curViewPort.bufferLength / 100);
                      } else {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                      }
                      scope.hists.addObjToUndoStack({
                        'type': 'ESPS',
                        'action': 'expandSegments',
                        'name': viewState.getcurClickLevelName(),
                        'itemIdx': viewState.getcurClickSegments(),
                        'bufferLength': viewState.curViewPort.bufferLength,
                        'rightSide': true,
                        'changeTime': changeTime
                      });
                      Levelservice.expandSegment(true, viewState.getcurClickSegments(), viewState.getcurClickLevelName(), changeTime);
                    }
                  }
                }
              }

              // expand Segment
              if (code === ConfigProviderService.vals.keyMappings.plusShift) {
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
                        var changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (viewState.curViewPort.bufferLength / 100);
                      } else {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                      }
                      scope.hists.addObjToUndoStack({
                        'type': 'ESPS',
                        'action': 'expandSegments',
                        'name': viewState.getcurClickLevelName(),
                        'itemIdx': viewState.getcurClickSegments(),
                        'rightSide': false,
                        'changeTime': changeTime
                      });
                      Levelservice.expandSegment(false, viewState.getcurClickSegments(), viewState.getcurClickLevelName(), changeTime);
                    }
                  }
                }
              }

              // expand Segment
              if (code === ConfigProviderService.vals.keyMappings.minus) {
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
                        var changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (viewState.curViewPort.bufferLength / 100);
                      } else {
                        scope.dials.open('views/error.html', 'ModalCtrl', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                      }
                      if (e.shiftKey) {
                        scope.hists.addObjToUndoStack({
                          'type': 'ESPS',
                          'action': 'expandSegments',
                          'name': viewState.getcurClickLevelName(),
                          'itemIdx': viewState.getcurClickSegments(),
                          'rightSide': false,
                          'changeTime': 0 - changeTime
                        });
                        Levelservice.expandSegment(false, viewState.getcurClickSegments(), viewState.getcurClickLevelName(), 0 - changeTime);
                      } else {
                        scope.hists.addObjToUndoStack({
                          'type': 'ESPS',
                          'action': 'expandSegments',
                          'name': viewState.getcurClickLevelName(),
                          'itemIdx': viewState.getcurClickSegments(),
                          'rightSide': true,
                          'changeTime': 0 - changeTime
                        });
                        Levelservice.expandSegment(true, viewState.getcurClickSegments(), viewState.getcurClickLevelName(), 0 - changeTime);
                      }
                    }
                  }
                }
              }


              // openSubmenu
              if (code === ConfigProviderService.vals.keyMappings.openSubmenu) {
                if(e.shiftKey) {
                    scope.toggleRightSideMenuHidden();
                }
                else {
                    scope.openSubmenu();
                }
              }
              if (code === ConfigProviderService.vals.keyMappings.openRightSubmenu) {
                scope.openRightSubmenu();
              }              
              // spectroSettings
              if (code === ConfigProviderService.vals.keyMappings.spectroSettings) {
                scope.dials.open('views/spectroSettings.html', 'dialog');
              }
              // select Segments in viewport selection
              if (code === ConfigProviderService.vals.keyMappings.selectSegmentsInSelection) {
                if (viewState.getcurClickLevelName() === undefined) {
                  scope.dials.open('views/error.html', 'ModalCtrl', 'Selection Error : Please select a Level first');
                } else {
                  viewState.selectSegmentsInSelection();
                }
              }

              if (code === ConfigProviderService.vals.keyMappings.left) {
                if (viewState.getcurClickSegments().length > 0) {
                  var idLeft = viewState.getcurClickSegments()[0].id;
                  var idRight = viewState.getcurClickSegments()[viewState.getcurClickSegments().length-1].id;
                  var lastNeighboursMove = Levelservice.getElementNeighbourDetails(viewState.getcurClickLevelName(), idLeft, idRight);
                  if (lastNeighboursMove.left !== undefined) {
                    viewState.setcurClickSegment(lastNeighboursMove.left, lastNeighboursMove.left.id);
                    viewState.setlasteditArea('_' + lastNeighboursMove.left.id);                  
                    
                  } 
                }
              }

              if (code === ConfigProviderService.vals.keyMappings.right) {
                if (viewState.getcurClickSegments().length > 0) {
                  var idLeft = viewState.getcurClickSegments()[0].id;
                  var idRight = viewState.getcurClickSegments()[viewState.getcurClickSegments().length-1].id;
                  var lastNeighboursMove = Levelservice.getElementNeighbourDetails(viewState.getcurClickLevelName(), idLeft, idRight);
                  if (lastNeighboursMove.right !== undefined) {
                      viewState.setcurClickSegment(lastNeighboursMove.right, lastNeighboursMove.right.id);
                      viewState.setlasteditArea('_' + lastNeighboursMove.right.id);                                      
                  } 
                }
              }

              // tab
              if (code === ConfigProviderService.vals.keyMappings.tab) {
                if (viewState.getcurClickSegments().length > 0) {
                  var idLeft = viewState.getcurClickSegments()[0].id;
                  var idRight = viewState.getcurClickSegments()[viewState.getcurClickSegments().length-1].id;
                  var lastNeighboursMove = Levelservice.getElementNeighbourDetails(viewState.getcurClickLevelName(), idLeft, idRight);
                  if (e.shiftKey) {
                    if(lastNeighboursMove.left !== undefined) {
                      viewState.setcurClickSegment(lastNeighboursMove.left, lastNeighboursMove.left.id);
                      viewState.setlasteditArea('_' + lastNeighboursMove.left.id);                  
                    }
                    
                  } else {
                    if (lastNeighboursMove.right !== undefined) {
                      viewState.setcurClickSegment(lastNeighboursMove.right, lastNeighboursMove.right.id);
                      viewState.setlasteditArea('_' + lastNeighboursMove.right.id);                                      
                    } 
                  }
                }
              }

              // enter
              if (code === ConfigProviderService.vals.keyMappings.enter) {
                if (ConfigProviderService.vals.restrictions.addItem) {
                  if (viewState.getselectedRange().start == viewState.curViewPort.selectS && viewState.getselectedRange().end == viewState.curViewPort.selectE) {
                    if (viewState.getcurClickSegments().length == 1) {
                      viewState.setEditing(true);
                      viewState.openEditArea(viewState.getcurClickSegments()[0], viewState.getselected()[0], viewState.getcurClickLevelType());
                      scope.cursorInTextField();
                    } else {
                      scope.dials.open('views/error.html', 'ModalCtrl', 'Modify Error: Please select a single Segment.');
                    }
                  } else {
                    if (viewState.curViewPort.selectE == -1 && viewState.curViewPort.selectS == -1) {
                      scope.dials.open('views/error.html', 'ModalCtrl', 'Error : Please select a Segment or Point to modify it\'s name. Or select a level plus a range in the viewport in order to insert a new Segment.');
                    } else {
                      if (viewState.getcurClickLevelType() == "SEGMENT") {
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
                        var insPoint = Levelservice.insertPoint(viewState.curViewPort.selectS, viewState.getcurClickLevelName(), ConfigProviderService.vals.labelCanvasConfig.newPointName);
                        if (!insPoint) {
                          scope.dials.open('views/error.html', 'ModalCtrl', 'Error : You are not allowed to insert a Point here.');
                        } else {
                          scope.hists.addObjToUndoStack({ // todo 
                            'type': 'ESPS',
                            'action': 'insertPoint',
                            'levelName': viewState.getcurClickLevelName(),
                            'start': viewState.curViewPort.selectS,
                            'pointName': ConfigProviderService.vals.labelCanvasConfig.newPointName
                          });
                        }
                      }
                    }
                  }
                } else {}
              }


              // history
              if (code === ConfigProviderService.vals.keyMappings.history) {
                if (!e.shiftKey) {
                  HistoryService.undo();
                } else {
                  HistoryService.redo();
                }
              }
              // backspace
              if (code === ConfigProviderService.vals.keyMappings.backspace) {
                if (!e.shiftKey) {
                  if (ConfigProviderService.vals.restrictions.deleteItem) {
                    var seg = viewState.getcurMouseSegment();
                    var tn = viewState.getcurMouseLevelName();
                    if (seg !== undefined) {
                      scope.hists.addObjToUndoStack({
                        'type': 'ESPS',
                        'action': 'deleteBoundary',
                        'name': tn,
                        'levelType': viewState.getcurMouseLevelType(),
                        'seg': seg
                      });
                      Levelservice.deleteBoundary(viewState.getcurMouseSegment(), viewState.getcurMouseLevelName(), viewState.getcurMouseLevelType());
                    } else {
                      scope.dials.open('views/error.html', 'ModalCtrl', 'Delete Error: Please select a Boundary first.');
                    }
                  }
                } else {
                  if (ConfigProviderService.vals.restrictions.deleteItem) {
                    var seg = viewState.getcurClickSegments();
                    if (seg !== undefined) {
                      var selected = viewState.getcurClickSegments();
                      var neighbour = Levelservice.getElementNeighbourDetails(viewState.getcurClickLevelName(),selected[0].id,selected[selected.length-1].id);
                      if (viewState.getcurClickLevelType() === 'SEGMENT') {
                        Levelservice.deleteSegments(viewState.getcurClickLevelName(), selected, neighbour);
                        viewState.setcurClickSegment(neighbour.left, neighbour.left.id);
                        scope.hists.addObjToUndoStack({
                          'type': 'ESPS',
                          'action': 'deleteSegments',
                          'name': viewState.getcurClickLevelName(),
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
              console.log(code);
              if (!e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
              }
            }
          });

        });

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