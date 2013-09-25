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
      
      var editAreaName = "#label_edit_textarea";
      
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
        deleteEditArea();
        lastEventClick = getEvent(perX,x);
        lastEventClickId = getEventId(perX,x);
        lastEventRightClick = getEvent(perX,x);
        lastEventRightClickId = getEventId(perX,x);
        scope.viewState.setcurClickTierName(id);
        scope.viewState.setcurClickSegment(lastEventClick,lastEventClickId);
        scope.$digest(); 
      } 
      function setLastRightClick(x) {
        var perX = getX(x);
        deleteEditArea();
        lastEventClick = getEvent(perX,x);
        lastEventClickId = getEventId(perX,x);
        lastEventRightClick = getEvent(perX,x);
        lastEventRightClickId = getEventId(perX,x);
        scope.viewState.setcurClickTierName(id);
        scope.viewState.setcurClickSegmentMultiple(lastEventClick,lastEventClickId);
        scope.$digest(); 
      } 
      function setLastDblClick(x) {
        lastEventClick = getEvent(getX(x),x);
        lastEventClickId = getEventId(getX(x),x);
        scope.viewState.setcurClickTierName(id);
        var start = scope.viewState.getPos(x.originalEvent.srcElement.clientWidth,lastEventClick.startSample);
        var end = scope.viewState.getPos(x.originalEvent.srcElement.clientWidth,(lastEventClick.startSample+lastEventClick.sampleDur));
        var top = x.originalEvent.srcElement.offsetTop;
        var height = x.originalEvent.srcElement.clientHeight;
        createEditArea(start,top,end-start,height,lastEventClick.label);
        createSelection(document.querySelector(editAreaName), 0, $(editAreaName).val().length);
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
        lastEventMove = getEvent(getX(x),x);
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
      function createEditArea(x,y,width,height,label) {
        $("#"+id).prepend($("<textarea>").attr({
			id: editAreaName.substr(1), 
			"autofocus":"true",
			"class": editAreaName.substr(1)
		}).css({
		    "position": "absolute",
			"top": y+1 + "px",
			"left": x+2 + "px",
			"width": width-1 + "px",
			"height": height + "px",
			"max-height": height-(height/3) + "px",
			"padding-top": (height/3) + "px"
		}).text(label).focus());
      }
      function deleteEditArea() {
        $("#label_edit_textarea").remove();
      }
      function getPCMpp(event) {
        var lastStart = scope.tierDetails.events[scope.tierDetails.events.length-1].startSample;
        var length = lastStart + scope.tierDetails.events[scope.tierDetails.events.length-1].sampleDur;
        return length/event.originalEvent.srcElement.width;      
      }
      function getEventId(x,event) {
        var pcm = x * getPCMpp(event); 
        var id = 0;
        var ret = 0;
        angular.forEach(scope.tierDetails.events, function(evt) {
          if(pcm>=evt.startSample && pcm <= (evt.startSample+evt.sampleDur)) {
		      ret=id;
		  }
		  ++id;
		});      
		return ret;
      }
      function getEvent(x,event) {
        var pcm = x * getPCMpp(event); 
        var evtr = null;
		angular.forEach(scope.tierDetails.events, function(evt) {
		  if(pcm>=evt.startSample && pcm <= (evt.startSample+evt.sampleDur)) {
		      evtr=evt;
		  }
		});      
        return evtr;
      }
    }
  };
});