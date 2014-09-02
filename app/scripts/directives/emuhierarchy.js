'use strict';


angular.module('emuwebApp')
  .directive('emuhierarchy', function ($timeout, fontScaleService) {
    return {
      template: '<div>this the svg directive that uses d3 to draw the emu hierarchy</div>',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {

      }
    };
  });