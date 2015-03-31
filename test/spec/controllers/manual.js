'use strict';

describe('Controller: ManualctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('emuWebApp'));

  var ManualctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualCtrl = $controller('ManualCtrl', {
      $scope: scope
    });
  }));

});
