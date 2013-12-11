'use strict';

describe('Controller: ConfirmmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('emulvcApp'));

  var ConfirmmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ConfirmmodalCtrl = $controller('ConfirmmodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
