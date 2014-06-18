'use strict';

describe('Directive: emuwebapp', function () {

  // load the directive's module
  beforeEach(module('emuwebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  //it('should make hidden element visible', inject(function ($compile) {
  //  element = angular.element('<emuwebapp></emuwebapp>');
  //  element = $compile(element)(scope);
  //  expect(element.text()).toBe('this is the emuwebapp directive');
  //}));  
  
});
