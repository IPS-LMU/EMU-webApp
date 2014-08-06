'use strict';

describe('Service: uuid', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
 /**
   *
   */
  it('should return new uuid', inject(function (uuid) {
    expect(uuid.new().length).toEqual('00000000-0000-0000-0000-000000000000'.length); 
    expect(uuid.new()).not.toEqual('00000000-0000-0000-0000-000000000000'); 
    expect(uuid.new()[8]).toEqual('-');
    expect(uuid.new()[13]).toEqual('-'); 
    expect(uuid.new()[18]).toEqual('-');
    expect(uuid.new()[23]).toEqual('-');
    expect(uuid.newHash().length).toEqual('00000000-0000-0000-0000-000000000000'.length); 
    expect(uuid.newHash()).not.toEqual('00000000-0000-0000-0000-000000000000'); 
    expect(uuid.newHash()[8]).toEqual('-');
    expect(uuid.newHash()[13]).toEqual('-'); 
    expect(uuid.newHash()[18]).toEqual('-');
    expect(uuid.newHash()[23]).toEqual('-');    
  }));
  
 /**
   *
   */
  it('should return empty uuid', inject(function (uuid) {
    expect(uuid.empty()).toEqual('00000000-0000-0000-0000-000000000000'); 
  }));    

  

});