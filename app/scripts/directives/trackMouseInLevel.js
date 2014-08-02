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
        var thisPCM;
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
            var zoom = viewState.getPCMpp(event);
            thisPCM = getX(event) * zoom;
            var moveBy = (thisPCM - lastPCM);
            if (zoom <= 1) {
              var zoomEventMove = LevelService.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
              // absolute movement in pcm below 1 pcm per pixel
              if (scope.this.level.type === 'SEGMENT') {
                if(zoomEventMove.nearest === false) { // before first elem
                    moveBy = Math.floor((thisPCM + viewState.curViewPort.sS) - LevelService.getElementDetails(scope.this.level.name, 0).sampleStart);
                }
                else if(zoomEventMove.nearest === true) { // after last elem
                    moveBy = Math.floor((thisPCM + viewState.curViewPort.sS) - LevelService.getLastElement(scope.this.level.name).sampleStart);
                }
                else {
                    moveBy = Math.floor((thisPCM + viewState.curViewPort.sS) - LevelService.getElementDetailsById(scope.this.level.name, zoomEventMove.nearest.id).sampleStart);
                }
              } else {
                moveBy = Math.floor((thisPCM + viewState.curViewPort.sS) - LevelService.getElementDetailsById(scope.this.level.name, zoomEventMove.nearest.id).samplePoint);
              }
            } else {
              // relative movement in pcm above 1 pcm per pixel
              moveBy = Math.round(thisPCM - lastPCM);
            }
          }  
          var mbutton = 0;
          if(event.buttons===undefined) {
              mbutton = event.which;
          }
		  else {
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
                  var position = 0;
                  if (scope.this.level.type === 'SEGMENT') {
                    if (typeof viewState.getcurMouseSegment() === 'boolean') {
                      var seg, leftMost, rightB;
                      // before first segment
                      if (viewState.getcurMouseSegment() === false) {
                        seg = LevelService.getElementDetails(scope.this.level.name, 0);
                        viewState.movingBoundarySample = seg.sampleStart + moveBy;
                        position = -1;
                      } else {
                        seg = LevelService.getLastElement(scope.this.level.name);
                        viewState.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
                        position = 1;
                      }
                    } else {
                      viewState.movingBoundarySample = viewState.getcurMouseSegment().sampleStart + moveBy;
                      seg = viewState.getcurMouseSegment();
                    }
                    LevelService.moveBoundary(scope.this.level.name, seg.id, moveBy, position);
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
                    LevelService.movePoint(scope.this.level.name, seg.id, moveBy);
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
                LevelService.deleteEditArea();
                if (scope.this.level.type == 'SEGMENT') {
                  seg = viewState.getcurClickSegments()
                  LevelService.moveSegment(scope.this.level.name, seg[0].id, seg.length, moveBy);
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
          if(lastEventMove.nearest!==undefined) {
            viewState.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove,lastPCM);
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
          LevelService.deleteEditArea();
          viewState.setEditing(false);
          viewState.focusInTextField = false;
          lastEventClick = LevelService.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if(lastEventClick.evtr !== undefined && lastEventClick.nearest !== undefined) {
            LevelService.setlasteditArea('_' + lastEventClick.evtr.id);
            LevelService.setlasteditAreaElem(element.parent());
            viewState.setcurClickLevel(levelID, levelType, scope.$index);
            viewState.setcurClickSegment(lastEventClick.evtr);          
          }
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
          LevelService.deleteEditArea();
          lastEventClick = LevelService.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if(lastEventClick.evtr !== undefined && lastEventClick.nearest !== undefined) {
            viewState.setcurClickLevel(levelID, levelType, scope.$index);
            viewState.setcurClickSegmentMultiple(lastEventClick.evtr);
            viewState.selectBoundry();    
          }
          lastPCM = thisPCM;
          scope.$apply();
        }

        /**
         *
         */
        function setLastDblClick(x) {
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventClick = LevelService.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if(lastEventClick.evtr !== undefined && lastEventClick.nearest !== undefined) {
              if(levelType==="SEGMENT") {
                  if(lastEventClick.evtr.sampleStart >= viewState.curViewPort.sS) {
                      if((lastEventClick.evtr.sampleStart+lastEventClick.evtr.sampleDur) <= viewState.curViewPort.eS) {
                          viewState.setcurClickLevel(levelID, levelType, scope.$index);
                          viewState.setcurClickSegment(lastEventClick.evtr);
                          LevelService.setlasteditArea('_' + lastEventClick.evtr.id);
                          LevelService.setlasteditAreaElem(element.parent());
                          viewState.setEditing(true);
                          LevelService.openEditArea(lastEventClick.evtr, element.parent(), levelType);
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
                LevelService.setlasteditArea('_' + lastEventClick.evtr.id);
                LevelService.setlasteditAreaElem(element.parent());
                viewState.setEditing(true);
                LevelService.openEditArea(lastEventClick.evtr, element.parent(), levelType);
                viewState.focusInTextField = true;              
              }
          }  
          lastPCM = thisPCM;
          scope.$apply();
        }

        /**
         *
         */
        function setLastMove(x, doChange) {
          thisPCM = getX(x) * viewState.getPCMpp(x);
          lastEventMove = LevelService.getEvent(thisPCM + viewState.curViewPort.sS, scope.this.level.name, Soundhandlerservice.wavJSO.Data.length);
          if (doChange) {
            if(lastEventMove.evtr !== undefined && lastEventMove.nearest !== undefined) {
              lastNeighboursMove = LevelService.getElementNeighbourDetails(scope.this.level.name, lastEventMove.nearest.id, lastEventMove.nearest.id);
              viewState.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove, lastPCM);            
            }
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
          return (e.offsetX || e.originalEvent.layerX) * (e.originalEvent.target.width / e.originalEvent.target.clientWidth);
        }
      }
    };
  });