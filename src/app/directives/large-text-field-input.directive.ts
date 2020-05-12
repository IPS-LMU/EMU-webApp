import * as angular from 'angular';

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
      replace: true
    };
  });
