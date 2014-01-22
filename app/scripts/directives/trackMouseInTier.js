'use strict';

angular.module('emulvcApp')
  .directive('trackmouseintier', function (ConfigProviderService, viewState,Levelservice) {
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
              moveBy = Math.floor((thisPCM+viewState.curViewPort.sS) - Levelservice.getElementDetails(scope.this.tier.TierName,viewState.getcurMouseSegmentId()).startSample);
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
                scope.tierDetails.moveBoundry(moveBy, scope.this.tier, viewState.getcurMouseSegmentId());
                // console.log(lastPCM);
                // console.log(scope.this.tier.TierName);
                viewState.selectBoundry();
                viewState.movingBoundary = true;
                scope.hists.updateCurChangeObj({
                  'type': 'ESPS',
                  'action': 'moveBoundary',
                  'tierName': scope.this.tier.TierName,
                  'itemIdx': viewState.getcurMouseSegmentId(),
                  'movedBy': moveBy
                });

                lastPCM = thisPCM;
                scope.$apply();
                moveLine = false;
                // scope.modifTierItems();
              } else if (ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
                viewState.deleteEditArea();
                scope.tierDetails.moveSegment(moveBy, scope.this.tier, viewState.getselected().sort());
                lastPCM = thisPCM;
                viewState.selectBoundry();
                scope.hists.updateCurChangeObj({
                  'type': 'ESPS',
                  'action': 'moveSegment',
                  'tierName': scope.this.tier.TierName,
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
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          viewState.deleteEditArea();
          viewState.setEditing(false);
          viewState.focusInTextField = false;
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier, false);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier, false);
          lastEventRightClick = scope.getEvent(thisPCM, scope.this.tier, false);
          lastEventRightClickId = scope.getEventId(thisPCM, scope.this.tier, false);
          viewState.setlasteditArea('_' + lastEventClickId);
          viewState.setcurClickTierName(tierId);
          viewState.setcurClickTierType(scope.this.tier.type);
          viewState.setcurClickSegment(lastEventClick, lastEventClickId);
          viewState.setTierLength(scope.this.tier.elements.length);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastRightClick(x) {
          var tierId = element.parent().parent().parent()[0].id;
          if (viewState.getcurClickTierName() !== tierId) {
            setLastClick(x);
            //console.log(viewState.getcurClickTierName(),tierId);
          }
          thisPCM = getX(x) * viewState.getPCMpp(x);
          viewState.deleteEditArea();
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier, false);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier, false);
          lastEventRightClick = scope.getEvent(thisPCM, scope.this.tier, false);
          lastEventRightClickId = scope.getEventId(thisPCM, scope.this.tier, false);
          viewState.setcurClickTierName(tierId);
          viewState.setcurClickTierType(scope.this.tier.type);
          viewState.setcurClickSegmentMultiple(lastEventClick, lastEventClickId);
          viewState.setTierLength(scope.this.tier.elements.length);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastDblClick(x) {
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventClick = scope.getEvent(thisPCM, scope.this.tier, false);
          lastEventClickId = scope.getEventId(thisPCM, scope.this.tier, false);
          viewState.setcurClickTierName(tierId);
          viewState.setcurClickTierType(scope.this.tier.type);
          viewState.setlasteditArea('_' + lastEventClickId);
          viewState.setcurClickSegment(lastEventClick, lastEventClickId);
          viewState.setEditing(true);
          viewState.setTierLength(scope.this.tier.elements.length);
          viewState.openEditArea(lastEventClick, lastEventClickId, scope.this.tier.type);
          scope.cursorInTextField();
          lastPCM = thisPCM;
          scope.$apply();
        }

        function setLastMove(x, doChange) {
          var tierId = element.parent().parent().parent()[0].id;
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventMove = scope.getEvent(thisPCM, scope.this.tier, true);
          lastEventMoveId = scope.getNearest(thisPCM, scope.this.tier, true);
          viewState.setcurMouseTierName(tierId);
          if (doChange) {
            viewState.setcurMouseSegment(lastEventMove);
            viewState.setcurMouseSegmentId(lastEventMoveId);
          }
          viewState.setcurMouseTierName(tierId);
          viewState.setcurMouseTierType(scope.this.tier.type);
          lastPCM = thisPCM;
          scope.$apply();
        }

        function getX(e) {
          return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
        }
      }
    };
  });