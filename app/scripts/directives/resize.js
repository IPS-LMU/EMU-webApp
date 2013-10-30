'use strict';

angular.module('emulvcApp')
.directive("resize", function(){
  return {
    restrict: "A",
    link: function(scope, element){

      var elem = element.parent().parent();    
      var canvas = elem.find("canvas");
      var del = element.parent().children()[0];
      var sav = element.parent().children()[2];
      var b_delete = elem.find(del);
      var b_save = elem.find(sav);
      var open = true;
      var orignalSize;

      element.bind('click', function(event){
        if(open) {
          open = false;
          orignalSize = canvas[0].height;
          canvas[0].setAttribute("height", orignalSize/3+ "px", false);
          canvas[1].setAttribute("height", orignalSize/3+ "px", false);
          //canvas[0].height = orignalSize/3;
          //canvas[1].height = orignalSize/3;
          b_delete.hide();
          b_save.hide();
        }
        else {
          open = true;
          canvas[0].height = orignalSize;        
          canvas[1].height = orignalSize;        
          b_delete.show();
          b_save.show();
        }
        scope.updateView();
      });
    }
  };
});