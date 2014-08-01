'use strict';

describe('Controller: AttrdefCtrl', function () {

  // load the controller's module
  beforeEach(module('EMUWebAppApp'));

  var AttrdefCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AttrdefCtrl = $controller('AttrdefCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
