'use strict';

describe('Controller: WsconnectionCtrl', function () {

  // load the controller's module
  beforeEach(module('emulvcApp'));

  var WsconnectionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    WsconnectionCtrl = $controller('WsconnectionCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
