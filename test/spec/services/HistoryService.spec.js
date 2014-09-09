'use strict';

describe('Service: HistoryService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

  // NOTE: the ID used here has to be present int msajc003_bundle.annotation
  var changeObj = {
    'type': 'ESPS',
    'action': 'RENAMELABEL',
    'name': 'Phonetic',
    'id': 154,
    'oldValue': 'xxx',
    'newValue': 'yyy'
  };

  var changeObjmoveBy1 = {
    'type': 'ESPS',
    'action': 'MOVEBOUNDARY',
    'name': 'Phonetic',
    'id': 0,
    'movedBy': 40,
    'position': 0
  };

  var changeObjmoveBy2 = {
    'type': 'ESPS',
    'action': 'MOVEBOUNDARY',
    'name': 'Phonetic',
    'id': 1,
    'movedBy': -40,
    'position': 0
  };

  var changeObjmoveBy3 = {
    'type': 'ESPS',
    'action': 'MOVEBOUNDARY',
    'name': 'Phonetic',
    'id': 1,
    'movedBy': 30,
    'position': 0
  };

  var mockEpgdorsalJDR10 = {
    "name": "JDR10",
    "annotates": "0000_ses/JDR10_bndl/JDR10.wav",
    "sampleRate": 16000,
    "levels": [{
      "name": "Word",
      "type": "ITEM",
      "items": [{
        "id": 2,
        "labels": [{
          "name": "Word",
          "value": "rockinskiweg"
        }, {
          "name": "Kommentar",
          "value": ""
        }]
      }]
    }, {
      "name": "Phonetic",
      "type": "SEGMENT",
      "items": [{
        "id": 3,
        "sampleStart": 87710,
        "sampleDur": 929,
        "labels": [{
          "name": "Phonetic",
          "value": "O"
        }]
      }, {
        "id": 0,
        "sampleStart": 88639,
        "sampleDur": 1642,
        "labels": [{
          "name": "Phonetic",
          "value": "k"
        }]
      }, {
        "id": 1,
        "sampleStart": 90281,
        "sampleDur": 761,
        "labels": [{
          "name": "Phonetic",
          "value": "H"
        }]
      }, {
        "id": 4,
        "sampleStart": 91042,
        "sampleDur": 553,
        "labels": [{
          "name": "Phonetic",
          "value": "I"
        }]
      }]
    }],
    "links": [{
      "fromID": 2,
      "toID": 0
    }, {
      "fromID": 2,
      "toID": 1
    }, {
      "fromID": 2,
      "toID": 3
    }, {
      "fromID": 2,
      "toID": 4
    }]
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
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ESPS#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should remove object from undo stack by undoing', inject(function (HistoryService, viewState, LevelService) {
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    LevelService.setData(msajc003_bndl.annotation)
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(1);
    expect(Object.keys(HistoryService.getCurrentStack().redo[0])[0]).toEqual('ESPS#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should add object again to undo stack by undoing / redoing', inject(function (HistoryService, viewState, LevelService) {
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    LevelService.setData(msajc003_bndl.annotation)
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    HistoryService.redo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ESPS#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should remove object again from undo stack by undoing / redoing / undoing', inject(function (HistoryService, viewState, LevelService) {
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    LevelService.setData(msajc003_bndl.annotation)
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    HistoryService.redo();
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(1);
    expect(Object.keys(HistoryService.getCurrentStack().redo[0])[0]).toEqual('ESPS#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should undo and redo 2 steps', inject(function (HistoryService, viewState, LevelService) {
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    LevelService.setData(msajc003_bndl.annotation)
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    HistoryService.undo();
    HistoryService.redo();
    HistoryService.redo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(2);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ESPS#RENAMELABEL#Phonetic#154');
    expect(Object.keys(HistoryService.getCurrentStack().undo[1])[0]).toEqual('ESPS#RENAMELABEL#Phonetic#154');
  }));

  /**
   *
   */
  it('should do and undo and redo 2 steps (moveBoundary) on real data', inject(function (LevelService, HistoryService) {
    LevelService.setData(mockEpgdorsalJDR10);
    HistoryService.addObjToUndoStack(changeObjmoveBy1);
    HistoryService.addObjToUndoStack(changeObjmoveBy2);
    HistoryService.undo();
    HistoryService.redo();
    HistoryService.undo();
    HistoryService.redo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(2);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ESPS#MOVEBOUNDARY#Phonetic#0');
    expect(Object.keys(HistoryService.getCurrentStack().undo[1])[0]).toEqual('ESPS#MOVEBOUNDARY#Phonetic#1');
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(1);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ESPS#MOVEBOUNDARY#Phonetic#0');
    expect(Object.keys(HistoryService.getCurrentStack().redo[0])[0]).toEqual('ESPS#MOVEBOUNDARY#Phonetic#1');
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(2);
    expect(Object.keys(HistoryService.getCurrentStack().redo[0])[0]).toEqual('ESPS#MOVEBOUNDARY#Phonetic#1');
    expect(Object.keys(HistoryService.getCurrentStack().redo[1])[0]).toEqual('ESPS#MOVEBOUNDARY#Phonetic#0');
  }));


  /**
   *
   */
  it('should do and undo 2 steps (moveBoundary) on real data', inject(function (LevelService, HistoryService) {
    LevelService.setData(mockEpgdorsalJDR10);
    LevelService.moveBoundary(changeObjmoveBy1.name, changeObjmoveBy1.id, changeObjmoveBy1.movedBy, changeObjmoveBy1.position);
    HistoryService.addObjToUndoStack(changeObjmoveBy1);
    LevelService.moveBoundary(changeObjmoveBy2.name, changeObjmoveBy2.id, changeObjmoveBy2.movedBy, changeObjmoveBy2.position);
    HistoryService.addObjToUndoStack(changeObjmoveBy2);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(2);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    // changed values : id1 += 40; id0 -= 40 
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(87710);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(969);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(88679);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(1562);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(90241);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(801);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(91042);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(553);
    HistoryService.undo();
    HistoryService.undo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(0);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(2);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(87710);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(929);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(88639);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(1642);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(90281);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(761);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(91042);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(553);
    HistoryService.redo();
    HistoryService.redo();
    expect(HistoryService.getCurrentStack().undo.length).toEqual(2);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(87710);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(969);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(88679);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(1562);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(90241);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(801);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(91042);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(553);
  }));

  /**
   *
   */
  it('should do and update 2 steps (moveBoundary) on currentChange Object based on real data', inject(function (LevelService, HistoryService) {
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(87710);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(929);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(88639);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(1642);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(90281);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(761);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(91042);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(553);
    LevelService.moveBoundary(changeObjmoveBy3.name, changeObjmoveBy3.id, changeObjmoveBy3.movedBy, changeObjmoveBy3.position);
    HistoryService.addObjToUndoStack(changeObjmoveBy3);
    LevelService.moveBoundary(changeObjmoveBy2.name, changeObjmoveBy2.id, changeObjmoveBy2.movedBy, changeObjmoveBy2.position);
    HistoryService.updateCurChangeObj(changeObjmoveBy2);
    HistoryService.addCurChangeObjToUndoStack();
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleStart).toEqual(87710);
    expect(LevelService.getItemFromLevelById('Phonetic', 3).sampleDur).toEqual(929);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleStart).toEqual(88639);
    expect(LevelService.getItemFromLevelById('Phonetic', 0).sampleDur).toEqual(1632);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleStart).toEqual(90271);
    expect(LevelService.getItemFromLevelById('Phonetic', 1).sampleDur).toEqual(771);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleStart).toEqual(91042);
    expect(LevelService.getItemFromLevelById('Phonetic', 4).sampleDur).toEqual(553);

  }));

  /**
   *
   */
  it('should return 2 possible undos', inject(function (HistoryService) {
    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.addObjToUndoStack(changeObj);
    expect(HistoryService.getNrOfPossibleUndos()).toEqual(2);
  }));

});