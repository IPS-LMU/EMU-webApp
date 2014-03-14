'use strict';

angular.module('emuwebApp')
  .directive('resize', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {

        var elem = element.parent().parent();
        var canvas = elem.find('canvas');
        var del = element.parent().children()[0];
        var sav = element.parent().children()[2];
        var bDelete = elem.find(del);
        var bSave = elem.find(sav);
        var open = true;
        var cssLevel = 'Level';
        var cssSmallLevel = 'smallLevel';
        var cssLevelCanvas = 'LevelCanvas';
        var cssLevelMarkupCanvas = 'LevelMarkupCanvas';
        var cssSmallCanvas = 'smallCanvas';

        element.bind('click', function () {
          if (open) {
            open = false;
            var small = {'height': '32px'};
            elem.css(small)

            // elem.parent().parent()[0].className = cssSmallLevel + ' ng-scope';
            // canvas[0].className = cssLevelCanvas + ' ' + cssSmallCanvas;
            // canvas[1].className = cssLevelMarkupCanvas + ' ' + cssSmallCanvas;
            // if (scope.config.vals.activeButtons.deleteSingleLevel) {
            //   bDelete.hide();
            // }
            // if (scope.config.vals.activeButtons.saveSingleLevel) {
            //   bSave.hide();
            // }
          } else {
            open = true;
            var big = {'height': '64px'};
            elem.css(big)
            // console.log(elem);


            // elem.parent().parent()[0].className = cssLevel + ' ng-scope';
            // canvas[0].className = cssLevelCanvas;
            // canvas[1].className = cssLevelMarkupCanvas;
            // if (scope.config.vals.activeButtons.deleteSingleLevel) {
            //   bDelete.show();
            // }
            // if (scope.config.vals.activeButtons.saveSingleLevel) {
            //   bSave.show();
            // }
          }
          scope.updateView();

        });
      }
    };
  });