'use strict';

angular.module('emulvcApp')
  .directive("trackmouseintier", function(ConfigProviderService, viewState, HistoryService) {
    return {
      restrict: "A",
      link: function(scope, element) {

        var elem = element[0];
        //var tierId = scope.this.tier.TierName;
        var ctx = elem.getContext('2d');
        // the last coordinates before the current move
        var lastX, currentX;
        var lastY, currentY;
        // the last event before the current move
        var lastEventClick;
        var lastEventClickId;
        var lastEventRightClick;
        var lastEventRightClickId;
        var lastEventMove;
        var lastEventMoveId;
        var lastPCM;
        var thisPCM;
        var message;


        element.bind('click', function(event) {
          setLastMove(event, true);
          setLastClick(event);
        });

        element.bind('contextmenu', function(event) {
          event.preventDefault();
          setLastMove(event, true);
          setLastRightClick(event);

        });

        element.bind('dblclick', function(event) {
          setLastMove(event, true);
          if (ConfigProviderService.vals.restrictions.editItemName) {
            setLastDblClick(event);
          }
        });

        element.bind('mousemove', function(event) {
          var moveLine = true;
          thisPCM = getX(event) * viewState.getPCMpp(event);
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
                  scope.moveBorder(Math.floor(thisPCM - lastPCM), scope.this.tier);
                  lastPCM = thisPCM;
                  viewState.selectBoundry();
                  viewState.movingBoundary = true;
                  scope.$apply();
                  moveLine = false;
                } else {
                  viewState.movingBoundary = false;
                }
                if (ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
                  viewState.deleteEditArea();
                  scope.moveSegment(Math.floor(thisPCM - lastPCM), scope.this.tier);
                  lastPCM = thisPCM;
                  viewState.selectBoundry();
                  scope.$apply();
                }
              }
              break;
          }
          setLastMove(event, moveLine);
        });

        element.bind('mousedown', function(event) {
          setLastMove(event, true);
        });


        element.bind('mouseup', function(event) {
          setLastMove(event, true);
        });

        element.bind('mouseout', function(event) {
          viewState.movingBoundary = false;
          setLastMove(event, true);
        });

        function setLastClick(x) {
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          viewState.deleteEditArea();
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier);
          lastEventRightClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventRightClickId = scope.getEventId(thisPCM, scope.this.tier);
          viewState.setlasteditArea("_" + lastEventClickId);
          viewState.setcurClickTierName(tierId);
          viewState.setcurClickSegment(lastEventClick, lastEventClickId);
          viewState.setTierLength(scope.this.tier.events.length);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastRightClick(x) {
          var tierId = element.parent().parent().parent()[0].id;
          if (viewState.getcurClickTierName() != tierId) {
            setLastClick(x);
            //console.log(viewState.getcurClickTierName(),tierId);
          }
          thisPCM = getX(x) * viewState.getPCMpp(x);
          viewState.deleteEditArea();
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier);
          lastEventRightClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventRightClickId = scope.getEventId(thisPCM, scope.this.tier);
          viewState.setcurClickTierName(tierId);
          viewState.setcurClickSegmentMultiple(lastEventClick, lastEventClickId);
          viewState.setTierLength(scope.this.tier.events.length);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastDblClick(x) {
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier);
          viewState.setcurClickTierName(tierId);
          viewState.setlasteditArea("_" + lastEventClickId);
          viewState.setcurClickSegment(lastEventClick, lastEventClickId);
          viewState.setEditing(true);
          viewState.setTierLength(scope.this.tier.events.length);
          viewState.openEditArea();
          scope.cursorInTextField();
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastMove(x, doChange) {
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventMove = scope.getEvent(thisPCM, scope.this.tier);
          lastEventMoveId = scope.getNearest(thisPCM, scope.this.tier);
          viewState.setcurMouseTierName(tierId);
          if (doChange) {
            viewState.setcurMouseSegment(lastEventMove);
            viewState.setcurMouseSegmentId(lastEventMoveId);
          }
          lastPCM = thisPCM;
          scope.$apply();
        }

        function getX(e) {
          return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
        }

        function getY(e) {
          return e.offsetY * (e.originalEvent.srcElement.height / e.originalEvent.srcElement.clientHeight);
        }
      }
    };
  });