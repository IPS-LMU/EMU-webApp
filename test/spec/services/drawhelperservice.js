'use strict';

describe('Service: drawhelperservice', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var drawhelperservice;
  beforeEach(inject(function (_drawhelperservice_) {
    drawhelperservice = _drawhelperservice_;
  }));

  it('should do something', function () {
    expect(!!drawhelperservice).toBe(true);
  });

});
