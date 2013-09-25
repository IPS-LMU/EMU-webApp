'use strict';

angular.module('emulvcApp')
.directive("trackmouseintier", function(){
  return {
    restrict: "A",
    link: function(scope, element){
      var ctx = element[0].getContext('2d');      
      // variable that decides if something should be drawn on mousemove
      var drawing = false;     
      // the last coordinates before the current move
      var lastX,currentX;
      var lastY,currentY;
      element.bind('mousedown', function(event){        
          currentX = getX(event);
          currentY = getY(event);
        // begins new line
        ctx.beginPath();        
        drawing = true;
      });
      
      element.bind('dblclick', function(event){ 
          currentX = getX(event);
          currentY = getY(event);             
          alert("dblclick at "+currentX+" "+currentY);
      });
      
      element.bind('mousemove', function(event){
        if(drawing){
          // get current mouse position
          currentX = getX(event);
          currentY = getY(event);

          draw(lastX, lastY, currentX, currentY);

          // set current coordinates to last one
          currentX = getX(event);
          currentY = getY(event);
        }   
        var getE = getEvent(getX(event),event);
        console.log(getE);
      });
      element.bind('mouseup', function(event){
        // stop drawing
        drawing = false;
      });      
      element.bind('mouseout', function(event){
        $("*").css("cursor", "auto");
      });              
      // canvas reset
      function reset(){
       element[0].width = element[0].width; 
      }       
      function getX(e) {
        return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
      }  
      function getY(e) {
        return e.offsetY * (e.originalEvent.srcElement.height / e.originalEvent.srcElement.clientHeight);
      }
      function draw(lX, lY, cX, cY){
        // line from
        ctx.moveTo(lX,lY);
        // to
        ctx.lineTo(cX,cY);
        // color
        ctx.strokeStyle = "#f00";
        // draw it
        ctx.stroke();
      }
      function getEvent(x,event) {
        var pcmpp = 128085/event.originalEvent.srcElement.width;
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