'use strict';

describe('Service: modalService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var scope;

  //Initialize the controller and a mock scope
  beforeEach(inject(function ($rootScope, modalService, viewState) {
    scope = $rootScope.$new();
    scope.modal = modalService;
    scope.vs = viewState;
  }));

  /**
   *
   */
  it('should confirmContent', function () {
    scope.modal.open();
    spyOn(scope.vs, 'setEditing');
    spyOn(scope.vs, 'setState');
    scope.modal.confirmContent();
    expect(scope.vs.setEditing).toHaveBeenCalled();
    expect(scope.vs.setState).toHaveBeenCalled();
  });
  
  /**
   *
   */
  it('should open', function () {
    spyOn(scope.vs, 'setState');
    scope.modal.open('template','dataIn','dataExport');
    expect(scope.modal.dataIn).toEqual('dataIn');
    expect(scope.modal.dataExport).toEqual('dataExport');
    expect(scope.modal.templateUrl).toEqual('template');
    expect(scope.vs.setState).toHaveBeenCalled();    
  });
  
  /**
   *
   */
  it('should confirm', function () {
    scope.modal.open();
    spyOn(scope.vs, 'setEditing');
    spyOn(scope.vs, 'setState');
    scope.modal.confirm();
    expect(scope.vs.setEditing).toHaveBeenCalled();
    expect(scope.vs.setState).toHaveBeenCalled();
  });
  
  /**
   *
   */
  it('should do error', function () {
    scope.modal.open();
    spyOn(scope.vs, 'setState');
    scope.modal.error('1');
    expect(scope.vs.setState).toHaveBeenCalled();
    expect(scope.modal.dataIn).toEqual('1');
  });
  
  /**
   *
   */
  it('should close', function () {
    scope.modal.open();
    spyOn(scope.vs, 'setEditing');
    spyOn(scope.vs, 'setState');
    scope.modal.close();
    expect(scope.vs.setEditing).toHaveBeenCalled();
    expect(scope.vs.setState).toHaveBeenCalled();
    expect(scope.modal.isOpen).toEqual(false);
  });  


});