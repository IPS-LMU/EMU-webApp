'use strict';

describe('Service: websocketHandler', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var websocketHandler;
  beforeEach(inject(function (_websocketHandler_) {
    websocketHandler = _websocketHandler_;
  }));

  it('should do something', function () {
    expect(!!websocketHandler).toBe(true);
  });

});
