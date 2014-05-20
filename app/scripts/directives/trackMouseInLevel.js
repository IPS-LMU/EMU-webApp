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
              var zoomEventMove = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level, Soundhandlerservice.wavJSO.Data.length);
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
                  if (scope.this.level.type === 'SEGMENT') {
                    if (typeof viewState.getcurMouseSegment() === 'boolean') {
                      var seg;
                      // before first segment
                      if (viewState.getcurMouseSegment() === false) {
                        seg = Levelservice.getElementDetails(scope.this.level.name, 0);
                        viewState.movingBoundarySample = seg.sampleStart + moveBy;
                      } else {
                        seg = Levelservice.getLastElement(scope.this.level.name);
                        viewState.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
                      }
                    } else {
                      viewState.movingBoundarySample = viewState.getcurMouseSegment().sampleStart + moveBy;
                      seg = viewState.getcurMouseSegment();
                    }
                    var neigh = viewState.getcurMouseNeighbours();
                    Levelservice.moveBoundry(moveBy, scope.this.level.name, seg.id, neigh);
                    HistoryService.updateCurChangeObj({
                      'type': 'ESPS',
                      'action': 'moveBoundary',
                      'levelName': scope.this.level.name,
                      'neighbours': neigh,
                      'segID': seg.id,
                      'movedBy': moveBy
                    });
                    
                  } else {
                    seg = viewState.getcurMouseSegment();
                    viewState.movingBoundarySample = viewState.getcurMouseSegment().samplePoint + moveBy;
                    Levelservice.movePoint(moveBy, scope.this.level.name, seg.id);
                    HistoryService.updateCurChangeObj({
                      'type': 'ESPS',
                      'action': 'movePoint',
                      'levelName': scope.this.level.name,
                      'segID': seg.id,
                      'movedBy': moveBy
                    });
                  }
                  lastPCM = thisPCM;
                  moveLine = false;
                }
              } else if (ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
                viewState.deleteEditArea();
                if (scope.this.level.type == 'SEGMENT') {
                  var neighbours = Levelservice.getElementNeighbourDetails(scope.this.level.name, viewState.getcurClickSegments()[0].id, viewState.getcurClickSegments()[viewState.getcurClickSegments().length - 1].id);
                  Levelservice.moveSegment(moveBy, scope.this.level.name, viewState.getcurClickSegments(), neighbours);
                  HistoryService.updateCurChangeObj({
                    'type': 'ESPS',
                    'action': 'moveSegment',
                    'levelName': scope.this.level.name,
                    'neighbours': neighbours,
                    'item': viewState.getcurClickSegments(),
                    'segID': viewState.getfirstClickSegment().id,
                    'movedBy': moveBy
                  });
                  lastPCM = thisPCM;
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
          lastEventClick = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level, Soundhandlerservice.wavJSO.Data.length);
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
          lastEventClick = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level, Soundhandlerservice.wavJSO.Data.length);
          viewState.setcurClickLevel(levelID, levelType, scope.$index);
          viewState.setcurClickSegmentMultiple(lastEventClick.evtr);
          lastPCM = thisPCM;
          scope.$apply();
        }

        /**
         *
         */
        function setLastDblClick(x) {
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventClick = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level, Soundhandlerservice.wavJSO.Data.length);
          viewState.setcurClickLevel(levelID, levelType, scope.$index);
          viewState.setcurClickSegment(lastEventClick.evtr);
          viewState.setlasteditArea('_' + lastEventClick.evtr.id);
          viewState.setlasteditAreaElem(element.parent());
          viewState.setEditing(true);
          viewState.openEditArea(lastEventClick.evtr, element.parent(), levelType);
          viewState.focusInTextField = true;
          lastPCM = thisPCM;
          scope.$apply();
        }

        /**
         *
         */
        function setLastMove(x, doChange) {
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventMove = Levelservice.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level, Soundhandlerservice.wavJSO.Data.length);
          if (doChange) {
            lastNeighboursMove = Levelservice.getElementNeighbourDetails(scope.this.level.name, lastEventMove.nearest.id, lastEventMove.nearest.id);
            viewState.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove);
          }
          console.log(lastNeighboursMove);
          viewState.setcurMouseLevelName(levelID);
          viewState.setcurMouseLevelType(levelType);
          viewState.selectBoundry();
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