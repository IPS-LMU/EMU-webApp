'use strict';

angular.module('emulvcApp')
.directive("trackmouseintier", function(){
  return {
    restrict: "A",
    link: function(scope, element){
    
      var elem = element[0];
      //var tierId = scope.this.tier.TierName;
      var ctx = elem.getContext('2d');      
      // the last coordinates before the current move
      var lastX,currentX;
      var lastY,currentY;
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

      
      element.bind('click', function(event){
        setLastMove(event);
        setLastClick(event);
      });
      
      element.bind('contextmenu', function(event){
        event.preventDefault();
        setLastMove(event);
        setLastRightClick(event);
        
      });      
      
      element.bind('dblclick', function(event){
        setLastMove(event);
        setLastDblClick(event);
      });
      
      element.bind('mousemove', function(event){ 
        thisPCM = getX(event) * scope.viewState.getPCMpp(event);
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
            if(event.altKey) {
              scope.viewState.deleteEditArea();
              scope.moveBorder(Math.floor(thisPCM-lastPCM),scope.this.tier);
              lastPCM = thisPCM;
              scope.$apply(); 
            }  
            if(event.shiftKey) {
              scope.viewState.deleteEditArea();
              scope.moveSegment(Math.floor(thisPCM-lastPCM),scope.this.tier);
              lastPCM = thisPCM;
              scope.$apply(); 
            }        
            setLastMove(event);
            break;
        }
      });

      element.bind('mouseup', function(event){
        setLastMove(event);
        scope.history();
      });      

      element.bind('mouseout', function(event){
        setLastMove(event);
      });      
      
      function setLastClick(x) {
        var tierId = element.parent()[0].id;
        thisPCM = getX(x) * scope.viewState.getPCMpp(x);
        scope.viewState.deleteEditArea();
        lastEventClick = scope.getEvent(thisPCM,scope.this.tier);
        lastEventClickId = scope.getEventId(thisPCM,scope.this.tier);
        lastEventRightClick = scope.getEvent(thisPCM,scope.this.tier);
        lastEventRightClickId = scope.getEventId(thisPCM,scope.this.tier);
        scope.viewState.setlasteditArea("_"+lastEventClickId);
        scope.viewState.setcurClickTierName(tierId);
        scope.viewState.setcurClickSegment(lastEventClick,lastEventClickId);
        scope.viewState.setTierLength(scope.this.tier.events.length);
        lastPCM = thisPCM;
        scope.$apply(); 
      } 
      function setLastRightClick(x) {
        var tierId = element.parent()[0].id;
        thisPCM = getX(x) * scope.viewState.getPCMpp(x);
        scope.viewState.deleteEditArea();
        lastEventClick = scope.getEvent(thisPCM,scope.this.tier);
        lastEventClickId = scope.getEventId(thisPCM,scope.this.tier);
        lastEventRightClick = scope.getEvent(thisPCM,scope.this.tier);
        lastEventRightClickId = scope.getEventId(thisPCM,scope.this.tier);
        scope.viewState.setcurClickTierName(tierId);
        scope.viewState.setcurClickSegmentMultiple(lastEventClick,lastEventClickId);
        scope.viewState.setTierLength(scope.this.tier.events.length);
        lastPCM = thisPCM;
        scope.$apply(); 
      } 
      function setLastDblClick(x) {
        var tierId = element.parent()[0].id;
        thisPCM = getX(x) * scope.viewState.getPCMpp(x);
        lastEventClick = scope.getEvent(thisPCM,scope.this.tier);
        lastEventClickId = scope.getEventId(thisPCM,scope.this.tier);
        scope.viewState.setcurClickTierName(tierId);
        scope.viewState.setlasteditArea("_"+lastEventClickId);
        scope.viewState.setcurClickSegment(lastEventClick,lastEventClickId);
        scope.viewState.setEditing(true);
        scope.viewState.setTierLength(scope.this.tier.events.length);
        scope.viewState.openEditArea();
        lastPCM = thisPCM;
        scope.$apply(); 
      }     
      function setLastMove(x) {
        var tierId = element.parent()[0].id;
        thisPCM = getX(x) * scope.viewState.getPCMpp(x);
        lastEventMove = scope.getEvent(thisPCM,scope.this.tier);
        lastEventMoveId = scope.getEventId(thisPCM,scope.this.tier);
        scope.viewState.setcurMouseTierName(tierId);
        scope.viewState.setcurMouseSegment(lastEventMove);
        scope.viewState.setcurMouseSegmentId(lastEventMoveId);
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