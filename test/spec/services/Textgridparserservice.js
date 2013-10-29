'use strict';

describe('Service: Textgridparserservice', function () {

  // load the service's module
  beforeEach(module('emulvcApp'));

  // instantiate service
  var Textgridparserservice;
  beforeEach(inject(function (_Textgridparserservice_) {
    Textgridparserservice = _Textgridparserservice_;
  }));

  it('should do something', function () {
    expect(!!Textgridparserservice).toBe(true);
  });

});
