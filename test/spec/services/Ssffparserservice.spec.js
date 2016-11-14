'use strict';

describe('Service: Ssffparserservice', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(inject(function (_$rootScope_, $q) {
     scope = _$rootScope_;
     deferred = $q.defer();
  }));

  // removed original tests as they where completely circular i.e. tested themselves... (spyon -> call -> got called?)


});