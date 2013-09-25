'use strict';

angular.module('emulvcApp')
.directive("trackmouseintier", function(){
  return {
    restrict: "A",
    link: function(scope, element){
      var ctx = element[0].getContext('2d');      
      // the last coordinates before the current move
      var lastX,currentX;
      var lastY,currentY;
      // the last event before the current move
      var lastEvent;
      
      element.bind('mousedown', function(event){
          lastEvent = getEvent(getX(event),event);
      });
      
      element.bind('dblclick', function(event){
          lastEvent = getEvent(getX(event),event);
          alert("dblclick at "+lastEvent.label);
      });
      
      element.bind('mousemove', function(event){ 
        lastEvent = getEvent(getX(event),event);
      });

      element.bind('mouseup', function(event){
      });      

      element.bind('mouseout', function(event){
        $("*").css("cursor", "auto");
      });              

      function getX(e) {
        return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
      }  
      function getY(e) {
        return e.offsetY * (e.originalEvent.srcElement.height / e.originalEvent.srcElement.clientHeight);
      }
      function getEvent(x,event) {
        var lastStart = scope.tierDetails.events[scope.tierDetails.events.length-1].startSample;
        var length = lastStart + scope.tierDetails.events[scope.tierDetails.events.length-1].sampleDur;
        var pcmpp = length/event.originalEvent.srcElement.width;
        var pcm = x * pcmpp; 
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