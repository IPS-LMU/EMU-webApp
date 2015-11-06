'use strict';

describe('Service: HistoryService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

  var item, cur;

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

  var changeInsertLinkBy1 = {
    'type': 'ANNOT',
    'action': 'INSERTLINKSTO',
    'name': 'Phonetic',
    'id': 1,
    'parentID': 30,
    'childIDs': [1, 2]
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
  it('should check updateCurChangeObj on ssff', inject(function (ConfigProviderService, Ssffdataservice, DataService, HistoryService) {
	Ssffdataservice.data = {};
	spyOn(ConfigProviderService, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'testColumn'});
	var values = [[0]];
	spyOn(Ssffdataservice, 'getColumnOfTrack').and.returnValue({values: values});
	DataService.setData(msajc003_bndl.annotation)
	HistoryService.updateCurChangeObj({
	  'type': 'SSFF',
	  'trackName': 'FORMANTS',
	  'sampleBlockIdx': 0,
	  'sampleIdx': 0,
	  'oldValue': 424,
	  'newValue': 500
	});
	HistoryService.addCurChangeObjToUndoStack();
	expect(HistoryService.getNrOfPossibleUndos()).toEqual(1);
	HistoryService.undo();
	expect(ConfigProviderService.getSsffTrackConfig).toHaveBeenCalledWith('FORMANTS');
	expect(HistoryService.getNrOfPossibleUndos()).toEqual(0);
	HistoryService.redo();
	expect(HistoryService.getNrOfPossibleUndos()).toEqual(1);
  }));

  /**
   *
   */
  it('should check updateCurChangeObj on ANNOT INSERTLINKSTO', inject(function (DataService, HistoryService) {
    DataService.setData(msajc003_bndl.annotation)
    HistoryService.updateCurChangeObj(changeInsertLinkBy1);
    HistoryService.addCurChangeObjToUndoStack();
    expect(HistoryService.getNrOfPossibleUndos()).toEqual(1);
    HistoryService.undo();
    expect(HistoryService.getNrOfPossibleUndos()).toEqual(0);
    HistoryService.redo();
    expect(HistoryService.getNrOfPossibleUndos()).toEqual(1);
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
    expect(viewState.historyActionTxt).toEqual('<i>UNDO</i> &#8594; MOVEBOUNDARY');
    HistoryService.redo();
    expect(viewState.historyActionTxt).toEqual('<i>REDO</i> &#8592; MOVEBOUNDARY');

    HistoryService.addObjToUndoStack(changeObj);
    HistoryService.undo();
    expect(viewState.historyActionTxt).toEqual('<i>UNDO</i> &#8594; RENAMELABEL');
    HistoryService.redo();
    expect(viewState.historyActionTxt).toEqual('<i>REDO</i> &#8592; RENAMELABEL');
  }));

  /**
   *  UNDO stack for MOVESEGMENT
   */
  it('should add object to undo stack: MOVESEGMENT', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'MOVESEGMENT',
	  'name': 'Phonetic',
	  'id': 154,
	  'length': 1,
	  'movedBy': 10
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#MOVESEGMENT#Phonetic#154');
    spyOn(LevelService, 'moveSegment');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; MOVESEGMENT');
    expect(LevelService.moveSegment).toHaveBeenCalledWith(cur.name, cur.id, cur.length, -cur.movedBy);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; MOVESEGMENT');
    expect(LevelService.moveSegment).toHaveBeenCalledWith(cur.name, cur.id, cur.length, cur.movedBy);
  }));

  /**
   *  UNDO stack for MOVEEVENT
   */
  it('should add object to undo stack: MOVEEVENT', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'MOVEEVENT',
	  'name': 'Phonetic',
	  'id': 154,
	  'movedBy': 10
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#MOVEEVENT#Phonetic#154');
    spyOn(LevelService, 'moveEvent');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; MOVEEVENT');
    expect(LevelService.moveEvent).toHaveBeenCalledWith(cur.name, cur.id, -cur.movedBy);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; MOVEEVENT');
    expect(LevelService.moveEvent).toHaveBeenCalledWith(cur.name, cur.id, cur.movedBy);
  }));

  /**
   *  UNDO stack for RENAMELEVEL
   */
  it('should add object to undo stack: RENAMELEVEL', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'RENAMELEVEL',
	  'name': 'Phonetic',
	  'id': 154,
	  'newname': 'PhoneticNew',
	  'curPerspectiveIdx': 0
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#RENAMELEVEL#Phonetic#154');
    spyOn(LevelService, 'renameLevel');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; RENAMELEVEL');
    expect(LevelService.renameLevel).toHaveBeenCalledWith(cur.newname, cur.name, cur.curPerspectiveIdx);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; RENAMELEVEL');
    expect(LevelService.renameLevel).toHaveBeenCalledWith(cur.name, cur.newname, cur.curPerspectiveIdx);
  }));

  /**
   *  UNDO stack for DELETELEVEL
   */
  it('should add object to undo stack: DELETELEVEL', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'DELETELEVEL',
	  'name': 'Phonetic',
	  'id': 154,
	  'level': {},
	  'curPerspectiveIdx': 0
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#DELETELEVEL#Phonetic#154');
    spyOn(LevelService, 'insertLevel');
    spyOn(LevelService, 'deleteLevel');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; DELETELEVEL');
    expect(LevelService.insertLevel).toHaveBeenCalledWith(cur.level, cur.id, cur.curPerspectiveIdx);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; DELETELEVEL');
    expect(LevelService.deleteLevel).toHaveBeenCalledWith(cur.id, cur.curPerspectiveIdx);
  }));

  /**
   *  UNDO stack for DELETEBOUNDARY
   */
  it('should add object to undo stack: DELETEBOUNDARY', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'DELETEBOUNDARY',
	  'name': 'Phonetic',
	  'id': 154,
	  'isFirst': false,
	  'isLast': false,
	  'deletedSegment': {}
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#DELETEBOUNDARY#Phonetic#154');
    spyOn(LevelService, 'deleteBoundary');
    spyOn(LevelService, 'deleteBoundaryInvers');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; DELETEBOUNDARY');
    expect(LevelService.deleteBoundaryInvers).toHaveBeenCalledWith(cur.name, cur.id, cur.isFirst, cur.isLast, cur.deletedSegment);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; DELETEBOUNDARY');
    expect(LevelService.deleteBoundary).toHaveBeenCalledWith(cur.name, cur.id, cur.isFirst, cur.isLast);
  }));

  /**
   *  UNDO stack for DELETESEGMENTS
   */
  it('should add object to undo stack: DELETESEGMENTS', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'DELETESEGMENTS',
	  'name': 'Phonetic',
	  'id': 154,
	  'length': 1,
	  'deletedSegment': {}
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#DELETESEGMENTS#Phonetic#154');
    spyOn(LevelService, 'deleteSegments');
    spyOn(LevelService, 'deleteSegmentsInvers');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; DELETESEGMENTS');
    expect(LevelService.deleteSegmentsInvers).toHaveBeenCalledWith(cur.name, cur.id, cur.length, cur.deletedSegment);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; DELETESEGMENTS');
    expect(LevelService.deleteSegments).toHaveBeenCalledWith(cur.name, cur.id, cur.length);
  }));

  /**
   *  UNDO stack for DELETEEVENT
   */
  it('should add object to undo stack: DELETEEVENT', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'DELETEEVENT',
	  'name': 'Phonetic',
	  'id': 154,
	  'start': 1234,
	  'pointName': 'test'
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#DELETEEVENT#Phonetic#154');
    spyOn(LevelService, 'deleteEvent');
    spyOn(LevelService, 'insertEvent');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; DELETEEVENT');
    expect(LevelService.insertEvent).toHaveBeenCalledWith(cur.name, cur.start, cur.pointName, cur.id);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; DELETEEVENT');
    expect(LevelService.deleteEvent).toHaveBeenCalledWith(cur.name, cur.id);
  }));

  /**
   *  UNDO stack for DELETELINKSTO
   */
  it('should add object to undo stack: DELETELINKSTO', inject(function (HistoryService, viewState, LinkService) {
    cur = {
      'type': 'ANNOT',
      'action': 'DELETELINKSTO',
	  'name': 'Phonetic',
	  'id': 154,
	  'deletedLinks': [{fromID:0, toID:10}]
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#DELETELINKSTO#Phonetic#154');
    spyOn(LinkService, 'deleteLinksTo');
    spyOn(LinkService, 'insertLinksTo');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; DELETELINKSTO');
    expect(LinkService.insertLinksTo).toHaveBeenCalledWith(cur.deletedLinks);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; DELETELINKSTO');
    expect(LinkService.deleteLinksTo).toHaveBeenCalledWith(cur.id);
  }));

  /**
   *  UNDO stack for DELETELINKBOUNDARY
   */
  it('should add object to undo stack: DELETELINKBOUNDARY', inject(function (HistoryService, viewState, LinkService) {
    cur = {
      'type': 'ANNOT',
      'action': 'DELETELINKBOUNDARY',
	  'name': 'Phonetic',
	  'id': 154,
	  'neighbourId': 153,
	  'deletedLinks': [{fromID:0, toID:10}]
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#DELETELINKBOUNDARY#Phonetic#154');
    spyOn(LinkService, 'deleteLinkBoundary');
    spyOn(LinkService, 'deleteLinkBoundaryInvers');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; DELETELINKBOUNDARY');
    expect(LinkService.deleteLinkBoundaryInvers).toHaveBeenCalledWith(cur.deletedLinks);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; DELETELINKBOUNDARY');
    expect(LinkService.deleteLinkBoundary).toHaveBeenCalledWith(cur.id, cur.neighbourId);
  }));

  /**
   *  UNDO stack for DELETELINKSEGMENT
   */
  it('should add object to undo stack: DELETELINKSEGMENT', inject(function (HistoryService, viewState, LinkService) {
    cur = {
      'type': 'ANNOT',
      'action': 'DELETELINKSEGMENT',
	  'name': 'Phonetic',
	  'id': 154,
	  'segments': [{segment: '1'}],
	  'deletedLinks': [{fromID:0, toID:10}]
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#DELETELINKSEGMENT#Phonetic#154');
    spyOn(LinkService, 'deleteLinkSegment');
    spyOn(LinkService, 'deleteLinkSegmentInvers');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; DELETELINKSEGMENT');
    expect(LinkService.deleteLinkSegmentInvers).toHaveBeenCalledWith(cur.deletedLinks);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; DELETELINKSEGMENT');
    expect(LinkService.deleteLinkSegment).toHaveBeenCalledWith(cur.segments);
  }));

  /**
   *  UNDO stack for INSERTLEVEL
   */
  it('should add object to undo stack: INSERTLEVEL', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'INSERTLEVEL',
	  'name': 'Phonetic',
	  'id': 154,
	  'curPerspectiveIdx': 0,
	  'level': {}
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#INSERTLEVEL#Phonetic#154');
    spyOn(LevelService, 'deleteLevel');
    spyOn(LevelService, 'insertLevel');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; INSERTLEVEL');
    expect(LevelService.deleteLevel).toHaveBeenCalledWith(cur.id, cur.curPerspectiveIdx);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; INSERTLEVEL');
    expect(LevelService.insertLevel).toHaveBeenCalledWith(cur.level, cur.id, cur.curPerspectiveIdx);
  }));

  /**
   *  UNDO stack for INSERTSEGMENTS
   */
  it('should add object to undo stack: INSERTSEGMENTS', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'INSERTSEGMENTS',
	  'name': 'Phonetic',
	  'id': 154,
	  'start': 10,
	  'end': 100,
	  'segName': 'newSeg',
	  'ids': [1, 2, 3]
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#INSERTSEGMENTS#Phonetic#154');
    spyOn(LevelService, 'insertSegmentInvers');
    spyOn(LevelService, 'insertSegment');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; INSERTSEGMENTS');
    expect(LevelService.insertSegmentInvers).toHaveBeenCalledWith(cur.name, cur.start, cur.end, cur.segName);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; INSERTSEGMENTS');
    expect(LevelService.insertSegment).toHaveBeenCalledWith(cur.name, cur.start, cur.end, cur.segName, cur.ids);
  }));

  /**
   *  UNDO stack for INSERTEVENT
   */
  it('should add object to undo stack: INSERTEVENT', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'INSERTEVENT',
	  'name': 'Phonetic',
	  'id': 154,
	  'start': 10,
	  'pointName': 'newSeg'
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#INSERTEVENT#Phonetic#154');
    spyOn(LevelService, 'deleteEvent');
    spyOn(LevelService, 'insertEvent');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; INSERTEVENT');
    expect(LevelService.deleteEvent).toHaveBeenCalledWith(cur.name, cur.id);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; INSERTEVENT');
    expect(LevelService.insertEvent).toHaveBeenCalledWith(cur.name, cur.start, cur.pointName, cur.id);
  }));

  /**
   *  UNDO stack for EXPANDSEGMENTS
   */
  it('should add object to undo stack: EXPANDSEGMENTS', inject(function (HistoryService, viewState, LevelService) {
    cur = {
      'type': 'ANNOT',
      'action': 'EXPANDSEGMENTS',
	  'name': 'Phonetic',
	  'id': 154,
	  'rightSide': true,
	  'changeTime': 100,
	  'item': {}
    };
    HistoryService.addObjToUndoStack(cur);
    expect(HistoryService.getCurrentStack().undo.length).toEqual(1);
    expect(HistoryService.getCurrentStack().redo.length).toEqual(0);
    expect(Object.keys(HistoryService.getCurrentStack().undo[0])[0]).toEqual('ANNOT#EXPANDSEGMENTS#Phonetic#154');
    spyOn(LevelService, 'expandSegment');
    HistoryService.undo();
    expect(viewState.historyActionTxt).toBe('<i>UNDO</i> &#8594; EXPANDSEGMENTS');
    expect(LevelService.expandSegment).toHaveBeenCalledWith(cur.rightSide, cur.item, cur.name, -cur.changeTime);
    HistoryService.redo();
    expect(viewState.historyActionTxt).toBe('<i>REDO</i> &#8592; EXPANDSEGMENTS');
    expect(LevelService.expandSegment).toHaveBeenCalledWith(cur.rightSide, cur.item, cur.name, cur.changeTime);
  }));

});
