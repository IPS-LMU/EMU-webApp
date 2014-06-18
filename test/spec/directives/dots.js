'use strict';

describe('Directive: dots', function () {

  // load the directive's module
  beforeEach(module('emuwebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<dots></dots>');
    element = $compile(element)(scope);
    expect(element.find('canvas').attr('width')).toBe('512');
    expect(element.find('canvas').attr('height')).toBe('512');
  }));
});
