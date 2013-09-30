'use strict';

angular.module('emulvcApp')
.directive("trackmouseintier", function(){
  return {
    restrict: "A",
    link: function(scope, element){
    
      var elem = element[0];
      var id = element.parent().parent()[0].id;
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
            if(event.altKey) {
              scope.viewState.deleteEditArea();
              console.log('move border');
            }
            
            if(event.shiftKey) {
              scope.viewState.deleteEditArea();
              scope.moveSegment(Math.floor(thisPCM-lastPCM));
              lastPCM = thisPCM;
              scope.$digest(); 
            }
            break;
        case 2:
            //console.log('Middle mouse button pressed');
            break;
        case 3:
            //console.log('Right mouse button pressed');
            break;
        default:
            setLastMove(event);
            break;
        }

        
      });

      element.bind('mouseup', function(event){
        setLastMove(event);
      });      

      element.bind('mouseout', function(event){
        setLastMove(event);
      });      
      
      function setLastClick(x) {
        thisPCM = getX(x) * scope.getPCMpp(x);
        scope.viewState.deleteEditArea();
        lastEventClick = scope.getEvent(thisPCM,x);
        lastEventClickId = scope.getEventId(thisPCM,x);
        lastEventRightClick = scope.getEvent(thisPCM,x);
        lastEventRightClickId = scope.getEventId(thisPCM,x);
        scope.viewState.setlasteditArea("_"+lastEventClickId);
        scope.viewState.setcurClickTierName(id);
        scope.viewState.setcurClickSegment(lastEventClick,lastEventClickId);
        lastPCM = thisPCM;
        scope.$digest(); 
      } 
      function setLastRightClick(x) {
        thisPCM = getX(x) * scope.getPCMpp(x);
        scope.viewState.deleteEditArea();
        lastEventClick = scope.getEvent(thisPCM,x);
        lastEventClickId = scope.getEventId(thisPCM,x);
        lastEventRightClick = scope.getEvent(thisPCM,x);
        lastEventRightClickId = scope.getEventId(thisPCM,x);
        scope.viewState.setcurClickTierName(id);
        scope.viewState.setcurClickSegmentMultiple(lastEventClick,lastEventClickId);
        lastPCM = thisPCM;
        scope.$digest(); 
      } 
      function setLastDblClick(x) {
        thisPCM = getX(x) * scope.getPCMpp(x);
        lastEventClick = scope.getEvent(thisPCM,x);
        lastEventClickId = scope.getEventId(thisPCM,x);
        scope.viewState.setcurClickTierName(id);
        scope.viewState.setlasteditArea("_"+lastEventClickId);
        scope.viewState.setcurClickSegment(lastEventClick,lastEventClickId);
        scope.viewState.setEditing(true);
        var start = scope.viewState.getPos(x.originalEvent.srcElement.clientWidth,lastEventClick.startSample) + x.originalEvent.srcElement.offsetLeft;
        var end = scope.viewState.getPos(x.originalEvent.srcElement.clientWidth,(lastEventClick.startSample+lastEventClick.sampleDur)) + x.originalEvent.srcElement.offsetLeft;
        var top = x.originalEvent.srcElement.offsetTop;
        var height = x.originalEvent.srcElement.clientHeight;
        var myid = scope.createEditArea(id, start,top,end-start,height,lastEventClick.label,lastEventClickId);
        scope.createSelection($("#"+myid)[0], 0, $("#"+myid).val().length);
        lastPCM = thisPCM;
        scope.$digest(); 
      }     
      function setLastMove(x) {
        thisPCM = getX(x) * scope.getPCMpp(x);
        lastEventMove = scope.getEvent(thisPCM,x);
        scope.viewState.setcurMouseTierName(id);
        scope.viewState.setcurMouseSegment(lastEventMove);
        lastPCM = thisPCM;
        scope.$digest(); 
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