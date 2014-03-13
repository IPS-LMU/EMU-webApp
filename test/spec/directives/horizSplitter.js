'use strict';

describe('Directive: horizSplitter', function () {

  // load the directive's module
  beforeEach(module('EMUWebAppApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<horiz-splitter></horiz-splitter>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the horizSplitter directive');
  }));
});
