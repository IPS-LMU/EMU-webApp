'use strict';

angular.module('emuwebApp')
  .directive('progressThing', function (viewState) {
    return {
      template: '<div class=progressThing>{{vs.somethingInProgressTxt}}</div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        // element.text('this is the progressThing directive');
      }
    };
  });
