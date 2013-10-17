'use strict';

angular.module("emulvcApp")
  .directive('drag', function() {
    return {
      restrict: "A",
      link: function(scope, element) {
      
        var start = 80;
        
        element.draggable({ 
            axis: "y",
            cursor: "move", 
            cursorAt: { bottom: 8 },
            handle: "div",
            containment: "parent",
		
			drag: function(e, ui) {
			    var add = ui.offset.top / 2;
			    var osci = $(".osci canvas").css("height");
			    var spectro = $(".spectro canvas").css("height");
			    this.start = parseInt(osci.substr(0,osci.length-2),10);
			    $(".osci canvas").css("height",(start+(add))+"px");
			    $(".spectro canvas").css("height",(start+(add))+"px");
			    $(".osci canvas").css("margin-bottom",add+"px");
			    $(".spectro canvas").css("margin-top","-"+add+"px");

			    //console.log();
			    //$(".OsciCanvas").css("height",(osci.substr(0,osci.length-2) + add)+"px");
			    
			},	            
        });
      
      
    }
  };
});