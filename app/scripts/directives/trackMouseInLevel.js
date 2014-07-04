'use strict';

angular.module('emuwebApp')
  .directive('trackmouseinlevel', function (viewState, Levelservice, ConfigProviderService, HistoryService, Soundhandlerservice) {
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
        var thisPCM;
        var levelID = scope.level.name;
        var levelType = scope.level.type;



        /////////////////////////////
        // Bindings

        //
        element.bind('click', function (event) {
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
            var zoom = viewState.getPCMpp(event);
            thisPCM = getX(event) * zoom;
            var moveBy = (thisPCM - lastPCM);
            if (zoom <= 1) {
              var zoomEventMove = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
              // absolute movement in pcm below 1 pcm per pixel
              if (scope.this.level.type === 'SEGMENT') {
                moveBy = Math.floor((thisPCM + viewState.curViewPort.sS) - Levelservice.getElementDetailsById(scope.this.level.name, zoomEventMove.nearest.id).sampleStart);
              } else {
                moveBy = Math.floor((thisPCM + viewState.curViewPort.sS) - Levelservice.getElementDetailsById(scope.this.level.name, zoomEventMove.nearest.id).samplePoint);
              }
            } else {
              // relative movement in pcm above 1 pcm per pixel
              moveBy = Math.round(thisPCM - lastPCM);
            }
          }
          switch (event.which) {
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
                viewState.deleteEditArea();
                if (viewState.getcurMouseSegment() !== undefined) {
                  viewState.movingBoundary = true;
                  var position = 0;
                  if (scope.this.level.type === 'SEGMENT') {
                    if (typeof viewState.getcurMouseSegment() === 'boolean') {
                      var seg, leftMost, rightB;
                      // before first segment
                      if (viewState.getcurMouseSegment() === false) {
                        seg = Levelservice.getElementDetails(scope.this.level.name, 0);
                        viewState.movingBoundarySample = seg.sampleStart + moveBy;
                        position = -1;
                      } else {
                        seg = Levelservice.getLastElement(scope.this.level.name);
                        viewState.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
                        position = 1;
                      }
                    } else {
                      viewState.movingBoundarySample = viewState.getcurMouseSegment().sampleStart + moveBy;
                      seg = viewState.getcurMouseSegment();
                    }
                    console.log(position);
                    //lastEventMove = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
                    //neigh = Levelservice.getElementNeighbourDetails(scope.this.level.name, lastEventMove.nearest.id, lastEventMove.nearest.id);
                    Levelservice.moveBoundry(scope.this.level.name, seg.id, moveBy, position);
                    HistoryService.updateCurChangeObj({
                      'type': 'ESPS',
                      'action': 'moveBoundary',
                      'name': scope.this.level.name,
                      'id': seg.id,
                      'movedBy': moveBy,
                      'position': position
                    });
                    
                  } else {
                    seg = viewState.getcurMouseSegment();
                    viewState.movingBoundarySample = viewState.getcurMouseSegment().samplePoint + moveBy;
                    Levelservice.movePoint(scope.this.level.name, seg.id, moveBy);
                    HistoryService.updateCurChangeObj({
                      'type': 'ESPS',
                      'action': 'movePoint',
                      'name': scope.this.level.name,
                      'id': seg.id,
                      'movedBy': moveBy
                    });
                  }
                  lastPCM = thisPCM;
                  viewState.selectBoundry();
                  moveLine = false;
                }
              } else if (ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
                viewState.deleteEditArea();
                if (scope.this.level.type == 'SEGMENT') {
                  seg = viewState.getcurClickSegments()
                  Levelservice.moveSegment(scope.this.level.name, seg[0].id, seg.length, moveBy);
                  HistoryService.updateCurChangeObj({
                    'type': 'ESPS',
                    'action': 'moveSegment',
                    'name': scope.this.level.name,
                    'id': seg[0].id,
                    'length': seg.length,
                    'movedBy': moveBy
                  });
                  lastPCM = thisPCM;
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
          viewState.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove);
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
          thisPCM = getX(x) * viewState.getPCMpp(x);
          viewState.deleteEditArea();
          viewState.setEditing(false);
          viewState.focusInTextField = false;
          lastEventClick = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          // console.log(element.parent());
          viewState.setlasteditArea('_' + lastEventClick.evtr.id);
          viewState.setlasteditAreaElem(element.parent());
          viewState.setcurClickLevel(levelID, levelType, scope.$index);
          viewState.setcurClickSegment(lastEventClick.evtr);
          lastPCM = thisPCM;
          scope.$apply();
        }

        /**
         *
         */
        function setLastRightClick(x) {
          if (viewState.getcurClickLevelName() !== levelID) {
            setLastClick(x);
          }
          thisPCM = getX(x) * viewState.getPCMpp(x);
          viewState.deleteEditArea();
          lastEventClick = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          viewState.setcurClickLevel(levelID, levelType, scope.$index);
          viewState.setcurClickSegmentMultiple(lastEventClick.evtr);
          viewState.selectBoundry();
          lastPCM = thisPCM;
          scope.$apply();
        }

        /**
         *
         */
        function setLastDblClick(x) {
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventClick = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if(levelType==="SEGMENT") {
              if(lastEventClick.evtr.sampleStart >= viewState.curViewPort.sS) {
                  if((lastEventClick.evtr.sampleStart+lastEventClick.evtr.sampleDur) <= viewState.curViewPort.eS) {
                      viewState.setcurClickLevel(levelID, levelType, scope.$index);
                      viewState.setcurClickSegment(lastEventClick.evtr);
                      viewState.setlasteditArea('_' + lastEventClick.evtr.id);
                      viewState.setlasteditAreaElem(element.parent());
                      viewState.setEditing(true);
                      viewState.openEditArea(lastEventClick.evtr, element.parent(), levelType);
                      viewState.focusInTextField = true;              
                  }
                  else {
                      console.log('Editing out of right bound !');
                  }
              }
              else {
                  console.log('Editing out of left bound !');
              }
          }
          else {
            viewState.setcurClickLevel(levelID, levelType, scope.$index);
            viewState.setcurClickSegment(lastEventClick.evtr);
            viewState.setlasteditArea('_' + lastEventClick.evtr.id);
            viewState.setlasteditAreaElem(element.parent());
            viewState.setEditing(true);
            viewState.openEditArea(lastEventClick.evtr, element.parent(), levelType);
            viewState.focusInTextField = true;              
          }
          lastPCM = thisPCM;
          scope.$apply();
        }

        /**
         *
         */
        function setLastMove(x, doChange) {
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventMove = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if (doChange) {
            lastNeighboursMove = Levelservice.getElementNeighbourDetails(scope.this.level.name, lastEventMove.nearest.id, lastEventMove.nearest.id);
            viewState.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove);
          }
          viewState.setcurMouseLevelName(levelID);
          viewState.setcurMouseLevelType(levelType);
          lastPCM = thisPCM;
          scope.$apply();
        }
        
        /**
         *
         */
        function getX(e) {
          return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
        }
      }
    };
  });