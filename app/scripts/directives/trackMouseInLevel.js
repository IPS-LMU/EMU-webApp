'use strict';

angular.module('emulvcApp')
  .directive('trackmouseinlevel', function (ConfigProviderService, viewState,Levelservice) {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var lastEventClick;
        var lastEventClickId;
        var lastEventRightClick;
        var lastEventRightClickId;
        var lastEventMove;
        var lastEventMoveId;
        var lastPCM;
        var thisPCM;

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
          if (ConfigProviderService.vals.restrictions.editItemName) {
            setLastDblClick(event);
          }
          else {
            setLastClick(event);
          }
        });

        element.bind('mousemove', function (event) {
          var moveLine = true;
          var zoom = viewState.getPCMpp(event);
          thisPCM = getX(event) * zoom;
          var moveBy = (thisPCM - lastPCM);
          
          if (zoom<= 1) {
              // ansolute movement in pcm below 1 pcm per pixel
              moveBy = Math.floor((thisPCM+viewState.curViewPort.sS) - Levelservice.getElementDetails(scope.this.level.LevelName,viewState.getcurMouseSegmentId()).startSample);
          } else {
            // relative movement in pcm above 1 pcm per pixel
            moveBy = Math.round(thisPCM - lastPCM);
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
            if (viewState.getdragBarActive() === false) {
              if (ConfigProviderService.vals.restrictions.editItemSize && event.shiftKey) {
                viewState.deleteEditArea();
                scope.levelDetails.moveBoundry(moveBy, scope.this.level, viewState.getcurMouseSegmentId());
                // console.log(lastPCM);
                // console.log(scope.this.level.LevelName);
                viewState.selectBoundry();
                viewState.movingBoundary = true;
                scope.hists.updateCurChangeObj({
                  'type': 'ESPS',
                  'action': 'moveBoundary',
                  'levelName': scope.this.level.LevelName,
                  'itemIdx': viewState.getcurMouseSegmentId(),
                  'movedBy': moveBy
                });

                lastPCM = thisPCM;
                scope.$apply();
                moveLine = false;
              } else if (ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
                viewState.deleteEditArea();
                scope.levelDetails.moveSegment(moveBy, scope.this.level, viewState.getselected().sort());
                lastPCM = thisPCM;
                viewState.selectBoundry();
                scope.hists.updateCurChangeObj({
                  'type': 'ESPS',
                  'action': 'moveSegment',
                  'levelName': scope.this.level.LevelName,
                  'itemIdx': viewState.getselected().sort(),
                  'movedBy': moveBy
                });

                scope.$apply();
              } else {
                viewState.movingBoundary = false;
              }
            }
            break;
          }
          setLastMove(event, moveLine);
        });

        element.bind('mousedown', function (event) {
          setLastMove(event, true);
        });


        element.bind('mouseup', function (event) {
          setLastMove(event, true);
        });

        element.bind('mouseout', function (event) {
          viewState.movingBoundary = false;
          setLastMove(event, true);
        });

        function setLastClick(x) {
          var levelId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          viewState.deleteEditArea();
          viewState.setEditing(false);
          viewState.focusInTextField = false;
          lastEventClick = scope.getEvent(thisPCM, scope.this.level, false);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.level, false);
          lastEventRightClick = scope.getEvent(thisPCM, scope.this.level, false);
          lastEventRightClickId = scope.getEventId(thisPCM, scope.this.level, false);
          viewState.setlasteditArea('_' + lastEventClickId);
          viewState.setcurClickLevelName(levelId);
          viewState.setcurClickLevelType(scope.this.level.type);
          viewState.setcurClickSegment(lastEventClick, lastEventClickId);
          viewState.setLevelLength(scope.this.level.elements.length);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastRightClick(x) {
          var levelId = element.parent().parent().parent()[0].id;
          if (viewState.getcurClickLevelName() !== levelId) {
            setLastClick(x);
          }
          thisPCM = getX(x) * viewState.getPCMpp(x);
          viewState.deleteEditArea();
          lastEventClick = scope.getEvent(thisPCM, scope.this.level, false);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.level, false);
          lastEventRightClick = scope.getEvent(thisPCM, scope.this.level, false);
          lastEventRightClickId = scope.getEventId(thisPCM, scope.this.level, false);
          viewState.setcurClickLevelName(levelId);
          viewState.setcurClickLevelType(scope.this.level.type);
          viewState.setcurClickSegmentMultiple(lastEventClick, lastEventClickId);
          viewState.setLevelLength(scope.this.level.elements.length);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastDblClick(x) {
          var levelId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventClick = scope.getEvent(thisPCM, scope.this.level, false);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.level, false);
          viewState.setcurClickLevelName(levelId);
          viewState.setcurClickLevelType(scope.this.level.type);
          viewState.setlasteditArea('_' + lastEventClickId);
          viewState.setcurClickSegment(lastEventClick, lastEventClickId);
          viewState.setEditing(true);
          viewState.setLevelLength(scope.this.level.elements.length);
          viewState.openEditArea(lastEventClick, lastEventClickId, scope.this.level.type);
          scope.cursorInTextField();
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastMove(x, doChange) {
          var levelId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventMove = scope.getEvent(thisPCM, scope.this.level, true);
          lastEventMoveId = scope.getNearest(thisPCM, scope.this.level, true);
          viewState.setcurMouseLevelName(levelId);
          if (doChange) {
            viewState.setcurMouseSegment(lastEventMove);
            viewState.setcurMouseSegmentId(lastEventMoveId);
          }
          viewState.setcurMouseLevelName(levelId);
          viewState.setcurMouseLevelType(scope.this.level.type);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function getX(e) {
          return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
        }
      }
    };
  });