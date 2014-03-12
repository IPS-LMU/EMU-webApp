'use strict';

angular.module('emuwebApp')
  .directive('export', function ($compile) {
    return {
        restrict:'E',
        scope:{ getUrlData:'&getData'},
        link:function (scope, elm, attrs) {
            var url = URL.createObjectURL(scope.getUrlData());
            console.log(attrs);
            elm.append($compile(
                '<a id="dialogExport" download="' + attrs.filename + '" href="' + url + '">Export</a>'
            )(scope));
        }
    };
});