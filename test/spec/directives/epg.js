'use strict';

describe('Directive: epg', function () {

  // load the directive's module
  beforeEach(module('emuwebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<epg></epg>');
    element = $compile(element)(scope);
  }));
});
