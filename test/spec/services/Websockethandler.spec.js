'use strict';

describe('Service: Websockethandler', function () {

  // load the service's module
  beforeEach(module('emuwebApp'));

  // instantiate service
  var Websockethandler;
  beforeEach(inject(function (_Websockethandler_) {
    Websockethandler = _Websockethandler_;
  }));

  it('should check if isConnected', function () {
    var res = Websockethandler.isConnected();
    expect(res).toBe(false);
  });
  
  it('should initConnect', function () {
    Websockethandler.initConnect('ws://localhost');
    expect(Websockethandler.isConnected()).toBe(false);
  });  
  
  //todo 

});
