'use strict';

describe('Service: HistoryService', function () {

  // load the controller's module
  beforeEach(module('emulvcApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));




  it('should do something awesome', function () {
    // scope.openDemoDBbtnClick();
    // expect(scope.connectBtnLabel).toBe('connect');
    // expect(scope.connectBtnLabel).toBe('connect');
  });
});