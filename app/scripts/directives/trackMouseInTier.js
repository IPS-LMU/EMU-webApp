'use strict';

angular.module('emulvcApp')
.directive("trackmouseintier", function(){
  return {
    restrict: "A",
    link: function(scope, element){
    
      var elem = element[0];
      var tierId = element.parent().parent()[0].id;
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
        thisPCM = getX(event) * scope.getPCMpp(event);
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
              scope.moveBorder(Math.floor(thisPCM-lastPCM));
              lastPCM = thisPCM;
              scope.$apply(); 
            }  
            if(event.shiftKey) {
              scope.viewState.deleteEditArea();
              scope.moveSegment(Math.floor(thisPCM-lastPCM));
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
        thisPCM = getX(x) * scope.getPCMpp(x);
        scope.viewState.deleteEditArea();
        lastEventClick = scope.getEvent(thisPCM,x);
        
        console.log(lastEventClick);
        
        lastEventClickId = scope.getEventId(thisPCM,x);
        lastEventRightClick = scope.getEvent(thisPCM,x);
        lastEventRightClickId = scope.getEventId(thisPCM,x);
        scope.viewState.setlasteditArea("_"+lastEventClickId);
        scope.viewState.setcurClickTierName(tierId);
        scope.viewState.setcurClickSegment(lastEventClick,lastEventClickId);
        lastPCM = thisPCM;
        scope.$apply(); 
      } 
      function setLastRightClick(x) {
        thisPCM = getX(x) * scope.getPCMpp(x);
        scope.viewState.deleteEditArea();
        lastEventClick = scope.getEvent(thisPCM,x);
        lastEventClickId = scope.getEventId(thisPCM,x);
        lastEventRightClick = scope.getEvent(thisPCM,x);
        lastEventRightClickId = scope.getEventId(thisPCM,x);
        scope.viewState.setcurClickTierName(tierId);
        scope.viewState.setcurClickSegmentMultiple(lastEventClick,lastEventClickId);
        lastPCM = thisPCM;
        scope.$apply(); 
      } 
      function setLastDblClick(x) {
        thisPCM = getX(x) * scope.getPCMpp(x);
        lastEventClick = scope.getEvent(thisPCM,x);
        lastEventClickId = scope.getEventId(thisPCM,x);
        scope.viewState.setcurClickTierName(tierId);
        scope.viewState.setlasteditArea("_"+lastEventClickId);
        scope.viewState.setcurClickSegment(lastEventClick,lastEventClickId);
        scope.viewState.setEditing(true);
        var start = scope.viewState.getPos(x.originalEvent.srcElement.clientWidth,lastEventClick.startSample) + x.originalEvent.srcElement.offsetLeft;
        var end = scope.viewState.getPos(x.originalEvent.srcElement.clientWidth,(lastEventClick.startSample+lastEventClick.sampleDur)) + x.originalEvent.srcElement.offsetLeft;
        var top = x.originalEvent.srcElement.offsetTop;
        var height = x.originalEvent.srcElement.clientHeight;
        var myid = scope.viewState.openEditArea();
        scope.viewState.createSelection($("#"+myid)[0], 0, $("#"+myid).val().length);
        lastPCM = thisPCM;
        scope.$apply(); 
      }     
      function setLastMove(x) {
        thisPCM = getX(x) * scope.getPCMpp(x);
        lastEventMove = scope.getEvent(thisPCM,x);
        lastEventMoveId = scope.getEventId(thisPCM,x);
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