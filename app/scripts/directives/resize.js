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
      var cssTier = "Tier";
      var cssSmallTier = "smallTier";
      var cssTierCanvas = "TierCanvas";
      var cssTierMarkupCanvas = "TierMarkupCanvas";
      var cssSmallCanvas = "smallCanvas";

      element.bind('click', function(event){
        if(open) {
          open = false;
          elem.parent().parent()[0].className =  cssSmallTier + " ng-scope";
          canvas[0].className = cssTierCanvas + " " + cssSmallCanvas;
          canvas[1].className = cssTierMarkupCanvas + " " + cssSmallCanvas;
          b_delete.hide();
          b_save.hide();
        }
        else {
          open = true;
          elem.parent().parent()[0].className =  cssTier + " ng-scope";
          canvas[0].className = cssTierCanvas;
          canvas[1].className = cssTierMarkupCanvas;
          b_delete.show();
          b_save.show();
        }
        scope.updateView();
      });
    }
  };
});