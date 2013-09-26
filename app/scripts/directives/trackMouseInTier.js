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
        setLastMove(event);
      });

      element.bind('mouseup', function(event){
        setLastMove(event);
      });      

      element.bind('mouseout', function(event){
        setLastMove(event);
      });      
      
      function setLastClick(x) {
        var perX = getX(x);
        scope.viewState.deleteEditArea();
        lastEventClick = scope.getEvent(perX,x);
        lastEventClickId = scope.getEventId(perX,x);
        lastEventRightClick = scope.getEvent(perX,x);
        lastEventRightClickId = scope.getEventId(perX,x);
        scope.viewState.setcurClickTierName(id);
        scope.viewState.setcurClickSegment(lastEventClick,lastEventClickId);
        scope.$digest(); 
      } 
      function setLastRightClick(x) {
        var perX = getX(x);
        scope.viewState.deleteEditArea();
        lastEventClick = scope.getEvent(perX,x);
        lastEventClickId = scope.getEventId(perX,x);
        lastEventRightClick = scope.getEvent(perX,x);
        lastEventRightClickId = scope.getEventId(perX,x);
        scope.viewState.setcurClickTierName(id);
        scope.viewState.setcurClickSegmentMultiple(lastEventClick,lastEventClickId);
        scope.$digest(); 
      } 
      function setLastDblClick(x) {
        lastEventClick = scope.getEvent(getX(x),x);
        lastEventClickId = scope.getEventId(getX(x),x);
        scope.viewState.setcurClickTierName(id);
        var start = scope.viewState.getPos(x.originalEvent.srcElement.clientWidth,lastEventClick.startSample);
        var end = scope.viewState.getPos(x.originalEvent.srcElement.clientWidth,(lastEventClick.startSample+lastEventClick.sampleDur));
        var top = x.originalEvent.srcElement.offsetTop;
        var height = x.originalEvent.srcElement.clientHeight;
        var myid = createEditArea(start,top,end-start,height,lastEventClick.label,lastEventClickId);
        createSelection($("#"+myid)[0], 0, $("#"+myid).val().length);
        scope.$digest(); 
      }  
      function createSelection(field, start, end) {
		if (field.createTextRange) {
			var selRange = field.createTextRange();
			selRange.collapse(true);
			selRange.moveStart('character', start);
			selRange.moveEnd('character', end);
			selRange.select();
		} else if (field.setSelectionRange) {
			field.setSelectionRange(start, end);
		} else if (field.selectionStart) {
			field.selectionStart = start;
			field.selectionEnd = end;
		}
		field.focus();
      }      
      function setLastMove(x) {
        lastEventMove = scope.getEvent(getX(x),x);
        scope.viewState.setcurMouseTierName(id);
        scope.viewState.setcurMouseSegment(lastEventMove);
        scope.$digest(); 
      }               
      function getX(e) {
        return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
      }  
      function getY(e) {
        return e.offsetY * (e.originalEvent.srcElement.height / e.originalEvent.srcElement.clientHeight);
      }
      function createEditArea(x,y,width,height,label,labelid) {
          var myid = labelid+"__"+label;
          scope.$apply(function() {
              scope.viewState.setlasteditArea(myid);
          });
        $("#"+id).append($("<textarea>").attr({
			id: myid,
			"autofocus":"true",
			"class": myid + " Label_Edit",
			"ng-model":"message"
		}).css({
		    "position": "absolute",
			"top": y+1 + "px",
			"left": x+2 + "px",
			"width": width-1 + "px",
			"height": height + "px",
			"max-height": height-(height/3) + "px",
			"padding-top": (height/3) + "px"
		}).text(label).focus());
		return myid;
      }
    }
  };
});