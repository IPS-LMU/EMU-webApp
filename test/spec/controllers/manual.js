'use strict';

describe('Controller: ManualctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('emuWebAppApp'));

  var ManualctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualctrlCtrl = $controller('ManualctrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
