'use strict';

describe('Directive: drawcrosshairs', function () {

  // load the directive's module
  beforeEach(module('emulvcApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<drawcrosshairs></drawcrosshairs>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the drawcrosshairs directive');
  }));
});
