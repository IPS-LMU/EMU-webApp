'use strict';

angular.module('emulvcApp')
  .directive('handleglobalkeystrokes', function (viewState, Soundhandlerservice, ConfigProviderService, HistoryService) {
    return {
      restrict: 'A',
      link: function postLink(scope) {

        // bind all keydown events
        $(document).bind('keydown', function (e) {
          var code = (e.keyCode ? e.keyCode : e.which);

          scope.$apply(function () {
            scope.setlastkeycode(code, e.shiftKey);
            if (viewState.focusInTextField) {
              // disable keys when focus is in comment text filed

              // enable enter and escape when in editing mode
              if (viewState.isEditing()) {
                if (code === ConfigProviderService.vals.keyMappings.enter) {
                  $('#HandletiersCtrl').scope().renameLabel();
                }
                if (code === ConfigProviderService.vals.keyMappings.esc) {
                  $('#HandletiersCtrl').scope().deleteEditArea();
                }
                if (code === 13) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }


            } else {

              $('#HandletiersCtrl').scope().deleteEditArea();

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


              // tierUp
              if (code === ConfigProviderService.vals.keyMappings.tierUp) {
                $('#HandletiersCtrl').scope().selectTier(false);
              }
              // tierDown
              if (code === ConfigProviderService.vals.keyMappings.tierDown) {
                $('#HandletiersCtrl').scope().selectTier(true);
              }

              // preselected boundary snap to top
              if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToTop) {
                if (ConfigProviderService.vals.restrictions.editItemSize) {
                  $('#HandletiersCtrl').scope().snapBoundary(true);
                }
              }

              // preselected boundary snap to bottom
              if (code === ConfigProviderService.vals.keyMappings.snapBoundaryToBottom) {
                if (ConfigProviderService.vals.restrictions.editItemSize) {
                  $('#HandletiersCtrl').scope().snapBoundary(false);
                }
              }

              // expand Segment
              if (code === ConfigProviderService.vals.keyMappings.plus) {
                if (ConfigProviderService.vals.restrictions.editItemSize) {
                  $('#HandletiersCtrl').scope().expandSegment(true, true);
                }
              }

              // expand Segment
              if (code === ConfigProviderService.vals.keyMappings.plusShift) {
                if (ConfigProviderService.vals.restrictions.editItemSize) {
                  $('#HandletiersCtrl').scope().expandSegment(true, false);
                }
              }

              // expand Segment
              if (code === ConfigProviderService.vals.keyMappings.minus) {
                if (ConfigProviderService.vals.restrictions.editItemSize) {
                  if (e.shiftKey) {
                    $('#HandletiersCtrl').scope().expandSegment(false, false);
                  } else {
                    $('#HandletiersCtrl').scope().expandSegment(false, true);
                  }
                }
              }


              // openSubmenu
              if (code === ConfigProviderService.vals.keyMappings.openSubmenu) {
                scope.openSubmenu();
              }
              // spectroSettings
              if (code === ConfigProviderService.vals.keyMappings.spectroSettings) {
                scope.openModal('views/spectroSettings.html', 'dialog');
              }
              // select Segments in viewport selection
              if (code === ConfigProviderService.vals.keyMappings.selectSegmentsInSelection) {
                $('#HandletiersCtrl').scope().selectSegmentsInSelection();
              }

              // tab
              if (code === ConfigProviderService.vals.keyMappings.tab) {
                if (e.shiftKey) {
                  $('#HandletiersCtrl').scope().tabNext(true);
                } else {
                  $('#HandletiersCtrl').scope().tabNext(false);
                }
              }
              // history
              if (code === ConfigProviderService.vals.keyMappings.history) {
                if (HistoryService.goBackHistory() === false) {
                  if (viewState.getmodalOpen() === false) {
                    scope.openModal('views/error.html', 'dialogSmall', false, 'History Error', 'No more history saved');
                  }

                }

              }
              // backspace
              if (code === ConfigProviderService.vals.keyMappings.backspace) {
                if (e.shiftKey) {
                  if (ConfigProviderService.vals.restrictions.deleteItem) {
                    var seg = viewState.getcurMouseSegment();
                    var tn = viewState.getcurMouseTierName();
                    if (seg !== undefined) {
                      scope.openModal('views/deleteBoundry.html', 'dialogSmall', false, 'Really Delete', seg.startSample + ' on Tier ' + tn);
                    } else {
                      scope.openModal('views/error.html', 'dialogSmall', false, 'Delete Error', 'Please select a Boundary first.');
                    }
                  }
                } else {
                  if (ConfigProviderService.vals.restrictions.deleteItem) {
                    var seg = viewState.getcurClickSegments();
                    if (seg !== undefined) {
                      var toDelete = '';
                      for (var i = 0; i < seg.length; i++) {
                        toDelete += seg[i].label + ',';
                      }
                      toDelete = toDelete.substring(0, toDelete.length - 1);
                      console.log(toDelete);
                      if (viewState.getcurClickTierType() === 'seg') {
                        scope.openModal('views/deleteSegment.html', 'dialogSmall', false, 'Really Delete', toDelete);
                      } else {
                        scope.openModal('views/error.html', 'dialogSmall', false, 'Delete Error', 'You can not delete Segments on Point Tiers.');
                      }
                    }
                  }
                }
              }

              if (!e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
              }

              // console.log(code);

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