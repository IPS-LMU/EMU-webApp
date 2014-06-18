'use strict';

describe('Directive: splitPaneView', function () {

  // load the directive's module
  beforeEach(module('emuwebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<split-pane-view></split-pane-view>');
    element = $compile(element)(scope);
    //expect(element.text()).toBe('this is the splitPaneView directive');
  }));
});
