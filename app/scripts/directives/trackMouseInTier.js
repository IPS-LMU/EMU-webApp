'use strict';

angular.module('emulvcApp')
  .directive("trackmouseintier", function() {
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
          setLastMove(event);
          setLastClick(event);
        });

        element.bind('contextmenu', function(event) {
          event.preventDefault();
          setLastMove(event);
          setLastRightClick(event);

        });

        element.bind('dblclick', function(event) {
          setLastMove(event);
          setLastDblClick(event);
        });

        element.bind('mousemove', function(event) {
          thisPCM = getX(event) * scope.vs.getPCMpp(event);
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
              if (event.shiftKey) {
                scope.vs.deleteEditArea();
                scope.moveBorder(Math.floor(thisPCM - lastPCM), scope.this.tier);
                lastPCM = thisPCM;
                scope.vs.selectBoundry();
                scope.$apply();
              }
              if (event.altKey) {
                scope.vs.deleteEditArea();
                scope.moveSegment(Math.floor(thisPCM - lastPCM), scope.this.tier);
                lastPCM = thisPCM;
                scope.vs.selectBoundry();
                scope.$apply();
              }
              setLastMove(event);
              break;
          }
        });

        element.bind('mousedown', function(event) {
          setLastMove(event);
          scope.history();
        });
        

        element.bind('mouseup', function(event) {
          setLastMove(event);
          scope.history();
        });
        
        element.bind('mouseout', function(event) {
          setLastMove(event);
        });

        function setLastClick(x) {
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * scope.vs.getPCMpp(x);
          scope.vs.deleteEditArea();
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier);
          lastEventRightClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventRightClickId = scope.getEventId(thisPCM, scope.this.tier);
          scope.vs.setlasteditArea("_" + lastEventClickId);
          scope.vs.setcurClickTierName(tierId);
          console.log(tierId);
          scope.vs.setcurClickSegment(lastEventClick, lastEventClickId);
          scope.vs.setTierLength(scope.this.tier.events.length);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastRightClick(x) {
          var tierId = element.parent().parent().parent()[0].id;
          if(scope.vs.getcurClickTierName()!=tierId) {
              setLastClick(x);
              //console.log(scope.vs.getcurClickTierName(),tierId);
          }
          thisPCM = getX(x) * scope.vs.getPCMpp(x);
          scope.vs.deleteEditArea();
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier);
          lastEventRightClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventRightClickId = scope.getEventId(thisPCM, scope.this.tier);
          scope.vs.setcurClickTierName(tierId);
          scope.vs.setcurClickSegmentMultiple(lastEventClick, lastEventClickId);
          scope.vs.setTierLength(scope.this.tier.events.length);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastDblClick(x) {
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * scope.vs.getPCMpp(x);
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier);
          scope.vs.setcurClickTierName(tierId);
          scope.vs.setlasteditArea("_" + lastEventClickId);
          scope.vs.setcurClickSegment(lastEventClick, lastEventClickId);
          scope.vs.setEditing(true);
          scope.vs.setTierLength(scope.this.tier.events.length);
          scope.vs.openEditArea();
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastMove(x) {
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * scope.vs.getPCMpp(x);
          lastEventMove = scope.getEvent(thisPCM, scope.this.tier);
          lastEventMoveId = scope.getNearest(thisPCM, scope.this.tier);
          scope.vs.setcurMouseTierName(tierId);
          scope.vs.setcurMouseSegment(lastEventMove);
          scope.vs.setcurMouseSegmentId(lastEventMoveId);
          // console.log(lastEventMoveId);
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