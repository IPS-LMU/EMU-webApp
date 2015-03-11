'use strict';

describe('Service: mathHelperService', function () {

  // load the service's module
  beforeEach(module('emuwebApp'));

  // instantiate service
  var mathHelperService;
  beforeEach(inject(function (_mathHelperService_) {
    mathHelperService = _mathHelperService_;
  }));

  //
  it('should calculate closest power of 2 correctly', function () {
    expect(!!mathHelperService).toBe(true);
    var res = mathHelperService.calcClosestPowerOf2Gt(5);
    expect(res).toBe(8);
    var res = mathHelperService.calcClosestPowerOf2Gt(9);
    expect(res).toBe(16);
    var res = mathHelperService.calcClosestPowerOf2Gt(255);
    expect(res).toBe(256);

  });

  //
  it('should roundToNdigitsAfterDecPoint correctly', function () {
    var res = mathHelperService.roundToNdigitsAfterDecPoint(2.12345, 2);
    expect(res).toBe(2.12);
    res = mathHelperService.roundToNdigitsAfterDecPoint(2.12345, 1);
    expect(res).toBe(2.1);
    res = mathHelperService.roundToNdigitsAfterDecPoint(2.12345, 4);
    expect(res).toBe(2.1235);

  });

});
