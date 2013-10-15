'use strict';

describe('Directive: correctiontool', function () {

  // load the directive's module
  beforeEach(module('emulvcApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<correctiontool></correctiontool>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the correctiontool directive');
  }));
});
