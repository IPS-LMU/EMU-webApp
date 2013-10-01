'use strict';

angular.module('emulvcApp')
.directive("resize", function(){
  return {
    restrict: "A",
    link: function(scope, element){

      var elem = element.parent().parent();    
      var canvas = elem.find("canvas");
      var del = $("div.delete")[0];
      var sav = $("div.save")[0];
      var b_delete = elem.find(del);
      var b_save = elem.find(sav);
      var open = true;

      element.bind('click', function(event){
        if(open) {
          open = false;
          canvas[0].height /= 3;
          b_delete.hide();
          b_save.hide();
        }
        else {
          open = true;
          canvas[0].height *= 3;        
          b_delete.show();
          b_save.show();
        }
        scope.updateView();
      });
    }
  };
});