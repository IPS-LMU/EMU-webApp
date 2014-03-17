'use strict';

angular.module('emuwebApp')
  .directive('resize', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var elem = element.parent().parent();
        var elemHeight = 0;
        var canvas = element.parent().parent().find('canvas');
        var deleteButton = elem.find(element.parent().children()[0]);
        var resizeButton = elem.find(element.parent().children()[1]);
        var saveButton = elem.find(element.parent().children()[2]);
        var open = true;

        element.bind('click', function () {
          if (open) {
            open = false;
            elemHeight = canvas.css('height');
            canvas.css({'height': '32px'});
            resizeButton.css({'margin-top': '12px'});
            deleteButton.hide();
            saveButton.hide();
          } else {
            open = true;
            canvas.css({'height': elemHeight});
            resizeButton.css({'margin-top': '0px'});
            deleteButton.show();
            saveButton.show();
          }
          scope.updateView();

        });
      }
    };
  });