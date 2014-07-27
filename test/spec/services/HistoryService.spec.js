'use strict';

describe('Service: HistoryService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

  var changeObj = {
    'type': 'ESPS',
    'action': 'renameLabel',
    'name': 'Phonetic',
    'id': 12,
    'order': 10,
    'oldValue': 'xxx',
    'newValue': 'yyy'
  };

  /**
   *
   */
  it('undo stack should be empty at statup', inject(function (HistoryService) {
    expect(HistoryService.getNrOfPossibleUndos()).toEqual(0);
  }));

  /**
   *
   */
  it('check init state of both stacks', inject(function (HistoryService) {
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
  }));


  /**
   *
   */
  it('should add object to undo stack', inject(function (HistoryService) {
    HistoryService.addObjToUndoStack(changeObj);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ESPS#renameLabel#Phonetic#12#10');
  }));



});