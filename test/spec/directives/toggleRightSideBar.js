'use strict';

describe('Directive: toggleRightSideBar', function () {

  // load the directive's module
  beforeEach(module('emulvcApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<toggle-right-side-bar></toggle-right-side-bar>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the toggleRightSideBar directive');
  }));
});
