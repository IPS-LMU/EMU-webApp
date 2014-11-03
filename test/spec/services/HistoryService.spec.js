'use strict';

describe('Service: HistoryService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

  var item;

  // NOTE: the ID used here has to be present int msajc003_bundle.annotation
  var changeObj = {
    'type': 'ANNOT',
    'action': 'RENAMELABEL',
    'name': 'Phonetic',
    'id': 154,
    'attrIndex': 0,
    'oldValue': 'xxx',
    'newValue': 'yyy'
  };

  var changeObjmoveBy1 = {
    'type': 'ANNOT',
    'action': 'MOVEBOUNDARY',
    'name': 'Phonetic',
    'id': 0,
    'movedBy': 40,
    'position': 0
  };

  var changeObjmoveBy2 = {
    'type': 'ANNOT',
    'action': 'MOVEBOUNDARY',
    'name': 'Phonetic',
    'id': 1,
    'movedBy': -40,
    'position': 0
  };

  var changeObjmoveBy3 = {
    'type': 'ANNOT',
    'action': 'MOVEBOUNDARY',
    'name': 'Phonetic',
    'id': 1,
    'movedBy': 30,
    'position': 0
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
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should remove object from undo stack by undoing', inject(function (HistoryService, viewState, DataService) {
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    DataService.setData(msajc003_bndl.annotation)
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(1);
    expect(Object.keys(HistoryService.getCurrentStack().redo[0])[0]).toEqual('ANNOT#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should add object again to undo stack by undoing / redoing', inject(function (HistoryService, viewState, DataService) {
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    DataService.setData(msajc003_bndl.annotation)
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    HistoryService.redo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should remove object again from undo stack by undoing / redoing / undoing', inject(function (HistoryService, viewState, DataService) {
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    DataService.setData(msajc003_bndl.annotation)
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    HistoryService.redo();
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(1);
    expect(Object.keys(HistoryService.getCurrentStack().redo[0])[0]).toEqual('ANNOT#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should undo and redo 2 steps', inject(function (HistoryService, viewState, DataService) {
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    DataService.setData(msajc003_bndl.annotation)
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    HistoryService.undo();
    HistoryService.redo();
    HistoryService.redo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(2);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#RENAMELABEL#Phonetic#154');
    expect(Object.keys(HistoryService.getCurrentStack().undo[1])[0]).toEqual('ANNOT#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should do and undo and redo 2 steps (moveBoundary) on real data', inject(function (DataService, HistoryService) {
    DataService.setData(JDR10_bndl.annotation);
    HistoryService.addObjToUndoStack(changeObjmoveBy1);
    HistoryService.addObjToUndoStack(changeObjmoveBy2);
    HistoryService.undo();
    HistoryService.redo();
    HistoryService.undo();
    HistoryService.redo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(2);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#MOVEBOUNDARY#Phonetic#0');
    expect(Object.keys(HistoryService.getCurrentStack().undo[1])[0]).toEqual('ANNOT#MOVEBOUNDARY#Phonetic#1');
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(1);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#MOVEBOUNDARY#Phonetic#0');
    expect(Object.keys(HistoryService.getCurrentStack().redo[0])[0]).toEqual('ANNOT#MOVEBOUNDARY#Phonetic#1');
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(2);
    expect(Object.keys(HistoryService.getCurrentStack().redo[0])[0]).toEqual('ANNOT#MOVEBOUNDARY#Phonetic#1');
    expect(Object.keys(HistoryService.getCurrentStack().redo[1])[0]).toEqual('ANNOT#MOVEBOUNDARY#Phonetic#0');
  }));


  /**
   *
   */
  it('should do and undo 2 steps (moveBoundary) on real data', inject(function (DataService, LevelService, HistoryService) {
    DataService.setData(JDR10_bndl.annotation);
    LevelService.moveBoundary(changeObjmoveBy1.name, changeObjmoveBy1.id, changeObjmoveBy1.movedBy, changeObjmoveBy1.position);
    HistoryService.addObjToUndoStack(changeObjmoveBy1);
    LevelService.moveBoundary(changeObjmoveBy2.name, changeObjmoveBy2.id, changeObjmoveBy2.movedBy, changeObjmoveBy2.position);
    HistoryService.addObjToUndoStack(changeObjmoveBy2);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(2);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    // changed values : id1 += 40; id0 -= 40 
    item = getItemFromJSON(JDR10_bndl.annotation, 3);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(item.sampleDur + 40);
    item = getItemFromJSON(JDR10_bndl.annotation, 0);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(item.sampleStart + 40);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(item.sampleDur - 40 - 40);
    item = getItemFromJSON(JDR10_bndl.annotation, 1);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(item.sampleStart - 40);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(item.sampleDur + 40);
    item = getItemFromJSON(JDR10_bndl.annotation, 4);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(item.sampleDur);
    HistoryService.undo();
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(2);
    item = getItemFromJSON(JDR10_bndl.annotation, 3);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(item.sampleDur);
    item = getItemFromJSON(JDR10_bndl.annotation, 0);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(item.sampleDur);
    item = getItemFromJSON(JDR10_bndl.annotation, 1);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(item.sampleDur);
    item = getItemFromJSON(JDR10_bndl.annotation, 4);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(item.sampleDur);
    HistoryService.redo();
    HistoryService.redo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(2);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    item = getItemFromJSON(JDR10_bndl.annotation, 3);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(item.sampleDur + 40);
    item = getItemFromJSON(JDR10_bndl.annotation, 0);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(item.sampleStart + 40);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(item.sampleDur - 40 - 40);
    item = getItemFromJSON(JDR10_bndl.annotation, 1);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(item.sampleStart - 40);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(item.sampleDur + 40);
    item = getItemFromJSON(JDR10_bndl.annotation, 4);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(item.sampleDur);

  }));

  /**
   *
   */
  it('should do and update 2 steps (moveBoundary) on currentChange Object based on real data', inject(function (DataService, LevelService, HistoryService) {
    DataService.setData(JDR10_bndl.annotation);
    item = getItemFromJSON(JDR10_bndl.annotation, 3);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(item.sampleDur);
    item = getItemFromJSON(JDR10_bndl.annotation, 0);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(item.sampleDur);
    item = getItemFromJSON(JDR10_bndl.annotation, 1);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(item.sampleDur);
    item = getItemFromJSON(JDR10_bndl.annotation, 4);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(item.sampleDur);
    LevelService.moveBoundary(changeObjmoveBy3.name, changeObjmoveBy3.id, changeObjmoveBy3.movedBy, changeObjmoveBy3.position);
    HistoryService.addObjToUndoStack(changeObjmoveBy3);
    LevelService.moveBoundary(changeObjmoveBy2.name, changeObjmoveBy2.id, changeObjmoveBy2.movedBy, changeObjmoveBy2.position);
    HistoryService.updateCurChangeObj(changeObjmoveBy2);
    HistoryService.addCurChangeObjToUndoStack();
    // -40 + 30 = -10
    item = getItemFromJSON(JDR10_bndl.annotation, 3);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(item.sampleDur);
    item = getItemFromJSON(JDR10_bndl.annotation, 0);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(item.sampleDur - 10);
    item = getItemFromJSON(JDR10_bndl.annotation, 1);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(item.sampleStart - 10);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(item.sampleDur + 10);
    item = getItemFromJSON(JDR10_bndl.annotation, 4);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(item.sampleStart);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(item.sampleDur);
  }));

  /**
   *
   */
  it('should return 2 possible undos', inject(function (HistoryService) {
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.addObjToUndoStack(changeObj);
    expect(HistoryService.getNrOfPossibleUndos()).toEqual(2);
  }));

  /**
   *
   */
  it('should set selected viewState.historyActionTexts 2 the correct actions', inject(function (DataService, LevelService, HistoryService, viewState) {
    DataService.setData(JDR10_bndl.annotation);
    LevelService.moveBoundary(changeObjmoveBy3.name, changeObjmoveBy3.id, changeObjmoveBy3.movedBy, changeObjmoveBy3.position);
    HistoryService.addObjToUndoStack(changeObjmoveBy3);
    expect(viewState.historyActionTxt).toEqual('');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toEqual('UNDO: MOVEBOUNDARY');
    HistoryService.redo();
    expect(viewState.historyActionTxt).toEqual('REDO: MOVEBOUNDARY');

    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    expect(viewState.historyActionTxt).toEqual('UNDO: RENAMELABEL');
    HistoryService.redo();
    expect(viewState.historyActionTxt).toEqual('REDO: RENAMELABEL');
  }));

});