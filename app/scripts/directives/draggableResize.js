'use strict';

angular.module("emulvcApp")
  .directive('drag', function() {
    return {
      restrict: "A",
      link: function(scope, element) {
      
        var originalHeight = $(".TimelineCtrl").height();

        element.draggable({ 
            axis: "y",
            cursor: "move", 
            scroll: false,
            handle: "div",
            containment: "body",
		
			drag: function(e, ui) {
			    scope.vs.setscroll(ui.offset.top);
			    scope.$apply();
			},	            
        });
      
      
    }
  };
});