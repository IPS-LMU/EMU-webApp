'use strict';

angular.module('emulvcApp')
  .directive('export', function ($compile) {
    return {
        restrict:'E',
        scope:{ getUrlData:'&getData'},
        link:function (scope, elm, attrs) {
            var url = URL.createObjectURL(scope.getUrlData());
            elm.append($compile(
                '<a class="mini-btn-dialog" download="export.txt"' +
                    'href="' + url + '">' +
                    'Export' +
                    '</a>'
            )(scope));
        }
    };
});