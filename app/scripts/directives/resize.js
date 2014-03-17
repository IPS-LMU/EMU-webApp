'use strict';

angular.module('emuwebApp')
  .directive('resize', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var elem = element.parent().parent();
        var elemHeight = 0;
        var deleteButton = elem.find(element.parent().children()[0]);
        var resizeButton = elem.find(element.parent().children()[1]);
        var saveButton = elem.find(element.parent().children()[2]);
        var open = true;

        element.bind('click', function () {
          if (open) {
            open = false;
            elemHeight = elem.css('height');
            elem.css({'height': '32px'});
            resizeButton.css({'margin-top': '5px'});
            deleteButton.hide();
            saveButton.hide();
          } else {
            open = true;
            elem.css({'height': elemHeight});
            resizeButton.css({'margin-top': '0px'});
            deleteButton.show();
            saveButton.show();
          }
          scope.updateView();

        });
      }
    };
  });