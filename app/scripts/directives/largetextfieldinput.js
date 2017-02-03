'use strict';

/**
 * @ngdoc directive
 * @name emuwebApp.directive:largeTextFieldInput
 * @description
 * # largeTextFieldInput
 */
angular.module('emuwebApp')
  .directive('largeTextFieldInput', function () {
    return {
      template: '<div class="emuwebapp-largetextinputfield" ng-show="vs.largeTextFieldInputFieldVisable" ng-focus="vs.largeTextFieldInputFieldVisable"><textarea ng-model="vs.largeTextFieldInputFieldCurLabel"></textarea></div>',
      restrict: 'E',
        replace: true,
      link: function postLink(scope, element, attrs) {
        // element.text('this is the largeTextFieldInput directive');
      }
    };
  });
