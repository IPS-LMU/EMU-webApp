'use strict';

describe('Controller: ErrormodalCtrl', function () {

  // load the controller's module
  beforeEach(module('emulvcApp'));

  var ErrormodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ErrormodalCtrl = $controller('ErrormodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
