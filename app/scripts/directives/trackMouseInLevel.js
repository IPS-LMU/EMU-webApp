'use strict';

angular.module('emuwebApp')
  .directive('trackMouseInLevel', function ($document, viewState, LevelService, ConfigProviderService, HistoryService, Soundhandlerservice) {
    return {
      restrict: 'A',
      replace:true,
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
        if(viewState.focusOnEmuWebApp) {
          if (!viewState.getdragBarActive()) {
            var moveLine = true;
            var samplesPerPixel = viewState.getSamplesPerPixelVal(event);
            scope.curMouseSampleNrInView = viewState.getX(event) * samplesPerPixel;
            var moveBy = (scope.curMouseSampleNrInView - scope.lastPCM);
            if (samplesPerPixel <= 1) {
              var zoomEventMove = LevelService.getClosestItem(scope.curMouseSampleNrInView + viewState.curViewPort.sS, scope.levelName, Soundhandlerservice.wavJSO.Data.length);
              // absolute movement in pcm below 1 pcm per pixel
              if (scope.levelType === 'SEGMENT') {
                if (zoomEventMove.isFirst === true && zoomEventMove.isLast === false) { // before first elem
                  moveBy = Math.ceil((scope.curMouseSampleNrInView + viewState.curViewPort.sS) - LevelService.getItemDetails(scope.levelName, 0).sampleStart);
                } else if (zoomEventMove.isFirst === false && zoomEventMove.isLast === true) { // after last elem
                  var lastItem = LevelService.getLastItem(scope.levelName);
                  moveBy = Math.ceil((scope.curMouseSampleNrInView + viewState.curViewPort.sS) - lastItem.sampleStart - lastItem.sampleDur);
                } else {
                  moveBy = Math.ceil((scope.curMouseSampleNrInView + viewState.curViewPort.sS) - LevelService.getItemFromLevelById(scope.levelName, zoomEventMove.nearest.id).sampleStart);
                }
              } else {
                moveBy = Math.ceil((scope.curMouseSampleNrInView + viewState.curViewPort.sS) - LevelService.getItemFromLevelById(scope.levelName, zoomEventMove.nearest.id).samplePoint - 0.5); // 0.5 to break between samples not on
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
            if (!viewState.getdragBarActive()) {
              var curMouseItem = viewState.getcurMouseItem();
              if (ConfigProviderService.vals.restrictions.editItemSize && event.shiftKey) {
                LevelService.deleteEditArea();
                if (curMouseItem !== undefined) {
                  viewState.movingBoundary = true;
                  if (scope.levelType === 'SEGMENT') {
                    if (viewState.getcurMouseisFirst() || viewState.getcurMouseisLast()) {
                      var seg, leftMost, rightB;
                      // before first segment
                      if (viewState.getcurMouseisFirst()) {
                        seg = LevelService.getItemDetails(scope.levelName, 0);
                        viewState.movingBoundarySample = seg.sampleStart + moveBy;
                      } else if(viewState.getcurMouseisLast()){
                        seg = LevelService.getLastItem(scope.levelName);
                        viewState.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
                      }
                    } else {
                      viewState.movingBoundarySample = curMouseItem.sampleStart + moveBy;
                      seg = curMouseItem;
                    }
                    LevelService.moveBoundary(scope.levelName, seg.id, moveBy, viewState.getcurMouseisFirst(), viewState.getcurMouseisLast());
                    HistoryService.updateCurChangeObj({
                      'type': 'ANNOT',
                      'action': 'MOVEBOUNDARY',
                      'name': scope.levelName,
                      'id': seg.id,
                      'movedBy': moveBy,
                      'isFirst': viewState.getcurMouseisFirst(),
                      'isLast': viewState.getcurMouseisLast()
                    });

                  } else {
                    seg = curMouseItem;
                    viewState.movingBoundarySample = curMouseItem.samplePoint + moveBy;
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
                  viewState.setLastPcm(scope.lastPCM);
                  viewState.selectBoundary();
                  moveLine = false;
                }
              } else if (ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
                LevelService.deleteEditArea();
                if (scope.levelType == 'SEGMENT') {
                  seg = viewState.getcurClickItems();
                  if(seg[0] !== undefined) {
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
                  viewState.setLastPcm(scope.lastPCM);
                  viewState.selectBoundary();
                }
                else if (scope.levelType == 'EVENT') {
                  seg = viewState.getcurClickItems();
                  if(seg[0] !== undefined) {
                    angular.forEach(seg, function (s) {
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
                  viewState.setLastPcm(scope.lastPCM);
                  viewState.selectBoundary();
                }
              } else {
                viewState.movingBoundary = false;
              }
            }
            break;
          }
          if (!viewState.getdragBarActive()) {
            scope.setLastMove(event, moveLine);
          }
          }
        });

        //
        element.bind('mousedown', function (event) {
          viewState.movingBoundary = true;
          scope.setLastMove(event, true);
        });

        //
        element.bind('mouseup', function (event) {
          viewState.movingBoundary = false;
          scope.setLastMove(event, true);
        });

        //
        element.bind('mouseout', function (event) {
          viewState.movingBoundary = false;
          scope.setLastMove(event, true);
        });

        //
        /////////////////////////

        /**
         *
         */
        scope.setLastClick = function (x) {
          scope.curMouseSampleNrInView = viewState.getX(x) * viewState.getSamplesPerPixelVal(x);
          LevelService.deleteEditArea();
          viewState.setEditing(false);
          scope.lastEventClick = LevelService.getClosestItem(scope.curMouseSampleNrInView + viewState.curViewPort.sS, scope.levelName, Soundhandlerservice.wavJSO.Data.length);
          viewState.setcurClickLevel(scope.levelName, scope.levelType, scope.order);
          if (scope.lastEventClick.current !== undefined && scope.lastEventClick.nearest !== undefined) {
            LevelService.setlasteditArea('_' + scope.lastEventClick.current.id);
            LevelService.setlasteditAreaElem(element.parent());
            viewState.setcurClickItem(scope.lastEventClick.current);
            viewState.selectBoundary();
          }
          scope.lastPCM = scope.curMouseSampleNrInView;
          viewState.setLastPcm(scope.lastPCM);
          scope.$apply();
        }

        /**
         *
         */
        scope.setLastRightClick = function (x) {
          if (viewState.getcurClickLevelName() !== scope.levelName) {
            scope.setLastClick(x);
          }
          scope.curMouseSampleNrInView = viewState.getX(x) * viewState.getSamplesPerPixelVal(x);
          LevelService.deleteEditArea();
          scope.lastEventClick = LevelService.getClosestItem(scope.curMouseSampleNrInView + viewState.curViewPort.sS, scope.levelName, Soundhandlerservice.wavJSO.Data.length);
          if (scope.lastEventClick.current !== undefined && scope.lastEventClick.nearest !== undefined) {
            var next = LevelService.getItemInTime(viewState.getcurClickLevelName(), scope.lastEventClick.current.id, true);
            var prev = LevelService.getItemInTime(viewState.getcurClickLevelName(), scope.lastEventClick.current.id, false);
            viewState.setcurClickLevel(scope.levelName, scope.levelType, scope.$index);
            viewState.setcurClickItemMultiple(scope.lastEventClick.current, next, prev);
            viewState.selectBoundary();
          }
          scope.lastPCM = scope.curMouseSampleNrInView;
          viewState.setLastPcm(scope.lastPCM);
          scope.$apply();
        }

        /**
         *
         */
        scope.setLastDblClick = function (x) {
          scope.curMouseSampleNrInView = viewState.getX(x) * viewState.getSamplesPerPixelVal(x);
          scope.lastEventClick = LevelService.getClosestItem(scope.curMouseSampleNrInView + viewState.curViewPort.sS, scope.levelName, Soundhandlerservice.wavJSO.Data.length);
          var isOpen = element.parent().css('height') === '25px' ? false : true;
          // expand to full size on dbl click if level is in small size
          if(!isOpen) {
              element.parent().parent().find('div')[3].click();
          }
          if (scope.lastEventClick.current !== undefined && scope.lastEventClick.nearest !== undefined  && viewState.getPermission('labelAction')) {
            if (scope.levelType === 'SEGMENT') {
              if (scope.lastEventClick.current.sampleStart >= viewState.curViewPort.sS) {
                if ((scope.lastEventClick.current.sampleStart + scope.lastEventClick.current.sampleDur) <= viewState.curViewPort.eS) {
                  viewState.setcurClickLevel(scope.levelName, scope.levelType, scope.$index);
                  viewState.setcurClickItem(scope.lastEventClick.current);
                  LevelService.setlasteditArea('_' + scope.lastEventClick.current.id);
                  LevelService.setlasteditAreaElem(element.parent());
                  viewState.setEditing(true);
                  LevelService.openEditArea(scope.lastEventClick.current, element.parent(), scope.levelType);
                } else {
                  //console.log('Editing out of right bound !');
                }
              } else {
                //console.log('Editing out of left bound !');
              }
            } else {
              viewState.setcurClickLevel(scope.levelName, scope.levelType, scope.$index);
              viewState.setcurClickItem(scope.lastEventClick.current);
              LevelService.setlasteditArea('_' + scope.lastEventClick.current.id);
              LevelService.setlasteditAreaElem(element.parent());
              viewState.setEditing(true);
              LevelService.openEditArea(scope.lastEventClick.current, element.parent(), scope.levelType);
              viewState.setEditing(true);
            }
          }
          scope.lastPCM = scope.curMouseSampleNrInView;
          viewState.setLastPcm(scope.lastPCM);
          scope.$apply();
        }

        /**
         *
         */
        scope.setLastMove = function (x, doChange) {
          scope.curMouseSampleNrInView = viewState.getX(x) * viewState.getSamplesPerPixelVal(x);
          scope.lastEventMove = LevelService.getClosestItem(scope.curMouseSampleNrInView + viewState.curViewPort.sS, scope.levelName, Soundhandlerservice.wavJSO.Data.length);
          if (doChange) {
            if (scope.lastEventMove.current !== undefined && scope.lastEventMove.nearest !== undefined) {
              scope.lastNeighboursMove = LevelService.getItemNeighboursFromLevel(scope.levelName, scope.lastEventMove.nearest.id, scope.lastEventMove.nearest.id);
              viewState.setcurMouseItem(scope.lastEventMove.nearest, scope.lastNeighboursMove, scope.lastPCM, scope.lastEventMove.isFirst, scope.lastEventMove.isLast);
            }
          }
          viewState.setcurMouseLevelName(scope.levelName);
          viewState.setcurMouseLevelType(scope.levelType);
          scope.lastPCM = scope.curMouseSampleNrInView;
          viewState.setLastPcm(scope.lastPCM);
          scope.$apply();
        }
      }
    };
  });
