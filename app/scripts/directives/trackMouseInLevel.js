'use strict';

angular.module('emuwebApp')
  .directive('trackmouseinlevel', function () {
    return {
      restrict: 'A',
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

        element.bind('click', function (event) {
          setLastMove(event, true);
          setLastClick(event);
        });

        element.bind('contextmenu', function (event) {
          event.preventDefault();
          setLastMove(event, true);
          setLastRightClick(event);
        });

        element.bind('dblclick', function (event) {
          setLastMove(event, true);
          if (scope.cps.vals.restrictions.editItemName) {
            setLastDblClick(event);
          } else {
            setLastClick(event);
          }
        });

        element.bind('mousemove', function (event) {
          if (!scope.vs.getdragBarActive()) {
            var moveLine = true;
            var zoom = scope.vs.getPCMpp(event);
            thisPCM = getX(event) * zoom;
            var moveBy = (thisPCM - lastPCM);

            if (zoom <= 1) {
              // absolute movement in pcm below 1 pcm per pixel
              moveBy = Math.floor((thisPCM + scope.vs.curViewPort.sS) - scope.tds.getElementDetails(scope.this.level.name, scope.vs.getcurMouseSegment().id).sampleStart);
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

            if (!scope.vs.getdragBarActive()) {
              if (scope.cps.vals.restrictions.editItemSize && event.shiftKey) {
                scope.vs.deleteEditArea();
                if (scope.vs.getcurMouseSegment() !== undefined) {
                  scope.vs.movingBoundary = true;
                  if (scope.this.level.type == 'SEGMENT') {
                    scope.vs.movingBoundarySample = scope.vs.getcurMouseSegment().sampleStart + moveBy;
                    scope.tds.moveBoundry(moveBy, scope.this.level.name, scope.vs.getcurMouseSegment(), scope.vs.getcurMouseNeighbours());
                    scope.hists.updateCurChangeObj({
                      'type': 'ESPS',
                      'action': 'moveBoundary',
                      'levelName': scope.this.level.name,
                      'neighbours': scope.vs.getcurMouseNeighbours(),
                      'item': scope.vs.getcurMouseSegment(),
                      'movedBy': moveBy
                    });
                  } else {
                    scope.vs.movingBoundarySample = scope.vs.getcurMouseSegment().samplePoint + moveBy;
                    scope.tds.movePoint(moveBy, scope.this.level.name, scope.vs.getcurMouseSegment());
                    scope.hists.updateCurChangeObj({
                      'type': 'ESPS',
                      'action': 'movePoint',
                      'levelName': scope.this.level.name,
                      'item': scope.vs.getcurMouseSegment(),
                      'movedBy': moveBy
                    });
                  }
                  lastPCM = thisPCM;
                  moveLine = false;
                }
              } else if (scope.cps.vals.restrictions.editItemSize && event.altKey) {
                scope.vs.deleteEditArea();
                if (scope.this.level.type == 'SEGMENT') {
                  var neighbours = scope.tds.getElementNeighbourDetails(scope.this.level.name, scope.vs.getcurClickSegments()[0].id, scope.vs.getcurClickSegments()[scope.vs.getcurClickSegments().length - 1].id);
                  scope.tds.moveSegment(moveBy, scope.this.level.name, scope.vs.getcurClickSegments(), neighbours);
                  scope.hists.updateCurChangeObj({
                    'type': 'ESPS',
                    'action': 'moveSegment',
                    'levelName': scope.this.level.name,
                    'neighbours': neighbours,
                    'item': scope.vs.getcurClickSegments(),
                    'movedBy': moveBy
                  });
                  lastPCM = thisPCM;
                }
              } else {
                scope.vs.movingBoundary = false;
              }
            }
            break;
          }
          if (!scope.vs.getdragBarActive()) {
            setLastMove(event, moveLine);
          }
        });

        element.bind('mousedown', function (event) {
          scope.vs.movingBoundary = true;
          setLastMove(event, true);
        });


        element.bind('mouseup', function (event) {
          scope.vs.movingBoundary = false;
          setLastMove(event, true);
        });

        element.bind('mouseout', function (event) {
          scope.vs.movingBoundary = false;
          setLastMove(event, true);
        });
        //levelID

        function setLastClick(x) {
          thisPCM = getX(x) * scope.vs.getPCMpp(x);
          scope.vs.deleteEditArea();
          scope.vs.setEditing(false);
          scope.vs.focusInTextField = false;
          lastEventClick = scope.tds.getEvent(thisPCM + scope.vs.curViewPort.sS, scope.this.level, scope.vs.curViewPort.bufferLength);
          console.log(element.parent());
          scope.vs.setlasteditArea('_' + lastEventClick.evtr.id);
          scope.vs.setlasteditAreaElem(element.parent());
          scope.vs.setcurClickLevel(levelID, levelType, scope.$index, scope.this.level.items.length);
          scope.vs.setcurClickSegment(lastEventClick.evtr);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastRightClick(x) {
          if (scope.vs.getcurClickLevelName() !== levelID) {
            setLastClick(x);
          }
          thisPCM = getX(x) * scope.vs.getPCMpp(x);
          scope.vs.deleteEditArea();
          lastEventClick = scope.tds.getEvent(thisPCM + scope.vs.curViewPort.sS, scope.this.level, scope.vs.curViewPort.bufferLength);
          scope.vs.setcurClickLevel(levelID, levelType, scope.$index, scope.this.level.items.length);
          scope.vs.setcurClickSegmentMultiple(lastEventClick.evtr);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastDblClick(x) {
          thisPCM = getX(x) * scope.vs.getPCMpp(x);
          lastEventClick = scope.tds.getEvent(thisPCM + scope.vs.curViewPort.sS, scope.this.level, scope.vs.curViewPort.bufferLength);
          scope.vs.setcurClickLevel(levelID, levelType, scope.$index, scope.this.level.items.length);
          scope.vs.setcurClickSegment(lastEventClick.evtr);
          scope.vs.setlasteditArea('_' + lastEventClick.evtr.id);
          scope.vs.setlasteditAreaElem(element.parent());
          scope.vs.setEditing(true);
          scope.vs.openEditArea(lastEventClick.evtr, element.parent(), levelType);
          scope.cursorInTextField();
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastMove(x, doChange) {
          thisPCM = getX(x) * scope.vs.getPCMpp(x);
          lastEventMove = scope.tds.getEvent(thisPCM + scope.vs.curViewPort.sS, scope.this.level, scope.vs.curViewPort.bufferLength);
          if (doChange) {
            lastNeighboursMove = scope.tds.getElementNeighbourDetails(scope.this.level.name, lastEventMove.nearest.id, lastEventMove.nearest.id);
            scope.vs.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove);
          }
          scope.vs.setcurMouseLevelName(levelID);
          scope.vs.setcurMouseLevelType(levelType);
          scope.vs.selectBoundry();
          lastPCM = thisPCM;
          scope.$apply();
        }

        function getX(e) {
          return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
        }
      }
    };
  });