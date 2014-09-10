'use strict';

angular.module('emuwebApp')
  .directive('trackmouseinlevel', function (viewState, LevelService, ConfigProviderService, HistoryService, Soundhandlerservice) {
    return {
      restrict: 'A',
      scope: {
        level: '='
      },
      link: function (scope, element, attr) {
        var lastEventClick;
        var lastEventClickId;
        var lastEventRightClick;
        var lastEventRightClickId;
        var lastEventMove;
        var lastEventMoveId;
        var lastNeighbours;
        var lastNeighboursMove;
        var lastPCM;
        var curMouseSampleNrInView;
        var levelID = scope.level.name;
        var levelType = scope.level.type;


        /////////////////////////////
        // Bindings

        //
        element.bind('click', function (event) {
          event.preventDefault();
          setLastMove(event, true);
          setLastClick(event);
        });

        //
        element.bind('contextmenu', function (event) {
          event.preventDefault();
          setLastMove(event, true);
          setLastRightClick(event);
        });

        //
        element.bind('dblclick', function (event) {
          setLastMove(event, true);
          if (ConfigProviderService.vals.restrictions.editItemName) {
            setLastDblClick(event);
          } else {
            setLastClick(event);
          }
        });

        //
        element.bind('mousemove', function (event) {
          if (!viewState.getdragBarActive()) {
            var moveLine = true;
            var samplesPerPixel = viewState.getSamplesPerPixelVal(event);
            curMouseSampleNrInView = getX(event) * samplesPerPixel;
            var moveBy = (curMouseSampleNrInView - lastPCM);
            if (samplesPerPixel <= 1) {
              var zoomEventMove = LevelService.getClosestItem(curMouseSampleNrInView + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
              // absolute movement in pcm below 1 pcm per pixel
              if (scope.this.level.type === 'SEGMENT') {
                if (zoomEventMove.isFirst === true && zoomEventMove.isLast === false) { // before first elem
                  moveBy = Math.ceil((curMouseSampleNrInView + viewState.curViewPort.sS) - LevelService.getItemDetails(scope.this.level.name, 0).sampleStart);
                } else if (zoomEventMove.isFirst === false && zoomEventMove.isLast === true) { // after last elem
                  var lastItem = LevelService.getLastItem(scope.this.level.name);
                  moveBy = Math.ceil((curMouseSampleNrInView + viewState.curViewPort.sS) - lastItem.sampleStart - lastItem.sampleDur);
                } else {
                  moveBy = Math.ceil((curMouseSampleNrInView + viewState.curViewPort.sS) - LevelService.getItemFromLevelById(scope.this.level.name, zoomEventMove.nearest.id).sampleStart);
                }
              } else {
                moveBy = Math.ceil((curMouseSampleNrInView + viewState.curViewPort.sS) - LevelService.getItemFromLevelById(scope.this.level.name, zoomEventMove.nearest.id).samplePoint - 0.5); // 0.5 to break between samples not on
              }
            } else {
              // relative movement in pcm above 1 pcm per pixel
              moveBy = Math.round(curMouseSampleNrInView - lastPCM);
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
              if (ConfigProviderService.vals.restrictions.editItemSize && event.shiftKey) {
                LevelService.deleteEditArea();
                if (viewState.getcurMouseSegment() !== undefined) {
                  viewState.movingBoundary = true;
                  if (scope.this.level.type === 'SEGMENT') {
                    if (viewState.getcurMouseisFirst() || viewState.getcurMouseisLast()) {
                      var seg, leftMost, rightB;
                      // before first segment
                      if (viewState.getcurMouseisFirst()) {
                        seg = LevelService.getItemDetails(scope.this.level.name, 0);
                        viewState.movingBoundarySample = seg.sampleStart + moveBy;
                      } else if(viewState.getcurMouseisLast()){
                        seg = LevelService.getLastItem(scope.this.level.name);
                        viewState.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
                      }
                    } else {
                      viewState.movingBoundarySample = viewState.getcurMouseSegment().sampleStart + moveBy;
                      seg = viewState.getcurMouseSegment();
                    }
                    LevelService.moveBoundary(scope.this.level.name, seg.id, moveBy, viewState.getcurMouseisFirst(), viewState.getcurMouseisLast());
                    HistoryService.updateCurChangeObj({
                      'type': 'ESPS',
                      'action': 'MOVEBOUNDARY',
                      'name': scope.this.level.name,
                      'id': seg.id,
                      'movedBy': moveBy,
                      'isFirst': viewState.getcurMouseisFirst(),
                      'isLast': viewState.getcurMouseisLast()
                    });

                  } else {
                    seg = viewState.getcurMouseSegment();
                    viewState.movingBoundarySample = viewState.getcurMouseSegment().samplePoint + moveBy;
                    LevelService.movePoint(scope.this.level.name, seg.id, moveBy);
                    HistoryService.updateCurChangeObj({
                      'type': 'ESPS',
                      'action': 'MOVEPOINT',
                      'name': scope.this.level.name,
                      'id': seg.id,
                      'movedBy': moveBy
                    });
                  }
                  lastPCM = curMouseSampleNrInView;
                  viewState.selectBoundry();
                  moveLine = false;
                }
              } else if (ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
                LevelService.deleteEditArea();
                if (scope.this.level.type == 'SEGMENT') {
                  seg = viewState.getcurClickSegments()
                  LevelService.moveSegment(scope.this.level.name, seg[0].id, seg.length, moveBy);
                  HistoryService.updateCurChangeObj({
                    'type': 'ESPS',
                    'action': 'MOVESEGMENT',
                    'name': scope.this.level.name,
                    'id': seg[0].id,
                    'length': seg.length,
                    'movedBy': moveBy
                  });
                  lastPCM = curMouseSampleNrInView;
                  viewState.selectBoundry();
                }
              } else {
                viewState.movingBoundary = false;
              }
            }
            break;
          }
          if (!viewState.getdragBarActive()) {
            setLastMove(event, moveLine);
          }
          if (lastEventMove.nearest !== undefined) {
            viewState.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove, lastPCM, lastEventMove.isFirst, lastEventMove.isLast);
          }
        });

        //
        element.bind('mousedown', function (event) {
          viewState.movingBoundary = true;
          setLastMove(event, true);
        });

        //
        element.bind('mouseup', function (event) {
          viewState.movingBoundary = false;
          setLastMove(event, true);
        });

        //
        element.bind('mouseout', function (event) {
          viewState.movingBoundary = false;
          setLastMove(event, true);
        });

        //
        /////////////////////////

        /**
         *
         */
        function setLastClick(x) {
          curMouseSampleNrInView = getX(x) * viewState.getSamplesPerPixelVal(x);
          LevelService.deleteEditArea();
          viewState.setEditing(false);
          viewState.focusInTextField = false;
          lastEventClick = LevelService.getClosestItem(curMouseSampleNrInView + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if (lastEventClick.current !== undefined && lastEventClick.nearest !== undefined) {
            LevelService.setlasteditArea('_' + lastEventClick.current.id);
            LevelService.setlasteditAreaElem(element.parent());
            viewState.setcurClickLevel(levelID, levelType, scope.$index);
            viewState.setcurClickSegment(lastEventClick.current);
          }
          lastPCM = curMouseSampleNrInView;
          scope.$apply();
        }

        /**
         *
         */
        function setLastRightClick(x) {
          if (viewState.getcurClickLevelName() !== levelID) {
            setLastClick(x);
          }
          curMouseSampleNrInView = getX(x) * viewState.getSamplesPerPixelVal(x);
          LevelService.deleteEditArea();
          lastEventClick = LevelService.getClosestItem(curMouseSampleNrInView + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if (lastEventClick.current !== undefined && lastEventClick.nearest !== undefined) {
            viewState.setcurClickLevel(levelID, levelType, scope.$index);
            viewState.setcurClickSegmentMultiple(lastEventClick.current);
            viewState.selectBoundry();
          }
          lastPCM = curMouseSampleNrInView;
          scope.$apply();
        }

        /**
         *
         */
        function setLastDblClick(x) {
          curMouseSampleNrInView = getX(x) * viewState.getSamplesPerPixelVal(x);
          lastEventClick = LevelService.getClosestItem(curMouseSampleNrInView + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if (lastEventClick.current !== undefined && lastEventClick.nearest !== undefined) {
            if (levelType === 'SEGMENT') {
              if (lastEventClick.current.sampleStart >= viewState.curViewPort.sS) {
                if ((lastEventClick.current.sampleStart + lastEventClick.current.sampleDur) <= viewState.curViewPort.eS) {
                  viewState.setcurClickLevel(levelID, levelType, scope.$index);
                  viewState.setcurClickSegment(lastEventClick.current);
                  LevelService.setlasteditArea('_' + lastEventClick.current.id);
                  LevelService.setlasteditAreaElem(element.parent());
                  viewState.setEditing(true);
                  LevelService.openEditArea(lastEventClick.current, element.parent(), levelType);
                  viewState.focusInTextField = true;
                } else {
                  console.log('Editing out of right bound !');
                }
              } else {
                console.log('Editing out of left bound !');
              }
            } else {
              viewState.setcurClickLevel(levelID, levelType, scope.$index);
              viewState.setcurClickSegment(lastEventClick.current);
              LevelService.setlasteditArea('_' + lastEventClick.current.id);
              LevelService.setlasteditAreaElem(element.parent());
              viewState.setEditing(true);
              LevelService.openEditArea(lastEventClick.current, element.parent(), levelType);
              viewState.focusInTextField = true;
            }
          }
          lastPCM = curMouseSampleNrInView;
          scope.$apply();
        }

        /**
         *
         */
        function setLastMove(x, doChange) {
          curMouseSampleNrInView = getX(x) * viewState.getSamplesPerPixelVal(x);
          lastEventMove = LevelService.getClosestItem(curMouseSampleNrInView + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if (doChange) {
            if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
              lastNeighboursMove = LevelService.getItemNeighboursFromLevel(scope.this.level.name, lastEventMove.nearest.id, lastEventMove.nearest.id);
              viewState.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove, lastPCM, lastEventMove.isFirst, lastEventMove.isLast);
            }
          }
          viewState.setcurMouseLevelName(levelID);
          viewState.setcurMouseLevelType(levelType);
          lastPCM = curMouseSampleNrInView;
          scope.$apply();
        }

        /**
         *
         */
        function getX(e) {
          return (e.offsetX ||  e.originalEvent.layerX) * (e.originalEvent.target.width / e.originalEvent.target.clientWidth);
        }
      }
    };
  });