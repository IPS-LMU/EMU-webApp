'use strict';

describe('Controller: ShowhierarchyCtrl', function () {

  // load the controller's module
  beforeEach(module('EMUWebAppApp'));

  var ShowhierarchyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ShowhierarchyCtrl = $controller('ShowhierarchyCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
