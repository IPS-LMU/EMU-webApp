'use strict';

angular.module('emuwebApp')
  .directive('resize', function (LevelService, viewState) {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var elem = element.parent().parent();
        var elemHeight = 0;
        var deleteButton = elem.find(element.parent().children()[0]);
        var resizeButton = elem.find(element.parent().children()[1]);
        var saveButton = elem.find(element.parent().children()[2]);

        element.bind('click', function () {
          LevelService.deleteEditArea();
          viewState.setEditing(false);        
          if (scope.open) {
            scope.open = false;
            elemHeight = elem.css('height');
            elem.css({'height': '25px'});
            if(scope.cps.vals.activeButtons.deleteSingleLevel) {
                deleteButton.hide();
            }
            if(scope.cps.vals.activeButtons.saveSingleLevel) {
                saveButton.hide();
            }
            
          } else {
            scope.open = true;
            elem.css({'height': elemHeight});
            if(scope.cps.vals.activeButtons.deleteSingleLevel) {
                deleteButton.show();
            }
            if(scope.cps.vals.activeButtons.saveSingleLevel) {
                saveButton.show();
            }
          }
          scope.updateView();
        });
      }
    };
  });