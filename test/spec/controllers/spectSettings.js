'use strict';

describe('Controller: SpectsettingsCtrl', function () {

  // load the controller's module
  beforeEach(module('emulvcApp'));

  var SpectsettingsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SpectsettingsCtrl = $controller('SpectsettingsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
