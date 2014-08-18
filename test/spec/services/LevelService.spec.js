'use strict';

describe('Service: LevelService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

  /**
   *
   */
  it('should set level data and max Element id', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.data).toEqual(JDR10_bndl.annotation);
    expect(LevelService.maxElementID).toEqual(4);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.maxElementID).toEqual(42);
  }));

  /**
   *
   */
  it('should raise max Element id', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    LevelService.raiseId(1);
    expect(LevelService.maxElementID).toEqual(5);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    LevelService.raiseId(1);
    expect(LevelService.maxElementID).toEqual(43);
  }));

  /**
   *
   */
  it('should lower max Element id', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    LevelService.lowerId(1);
    expect(LevelService.maxElementID).toEqual(3);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    LevelService.lowerId(1);
    expect(LevelService.maxElementID).toEqual(41);
  }));

  /**
   *
   */
  it('should return level details', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.name).toEqual('Phonetic');
    expect(LevelService.getLevelDetails('Phonetic').level.type).toEqual('SEGMENT');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getLevelDetails('TB').level.name).toEqual('TB');
    expect(LevelService.getLevelDetails('TB').level.type).toEqual('SEGMENT');
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2);
  }));

  /**
   *
   */
  it('should return element order by passing id', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getOrderById('Phonetic', 3)).toEqual(0);
    expect(LevelService.getOrderById('Phonetic', 0)).toEqual(1);
    expect(LevelService.getOrderById('Phonetic', 1)).toEqual(2);
    expect(LevelService.getOrderById('Phonetic', 4)).toEqual(3);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getOrderById('TB', 40)).toEqual(0);
    expect(LevelService.getOrderById('TB', 41)).toEqual(1);
  }));

  /**
   *
   */
  it('should return element id by passing order', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getIdByOrder('Phonetic', 0)).toEqual(3);
    expect(LevelService.getIdByOrder('Phonetic', 1)).toEqual(0);
    expect(LevelService.getIdByOrder('Phonetic', 2)).toEqual(1);
    expect(LevelService.getIdByOrder('Phonetic', 3)).toEqual(4);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getIdByOrder('TB', 0)).toEqual(40);
    expect(LevelService.getIdByOrder('TB', 1)).toEqual(41);
  }));

  /**
   *
   */
  it('should get element (segment) details by passing name and order', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getElementDetails('Phonetic', 0).id).toEqual(3);
    expect(LevelService.getElementDetails('Phonetic', 0).sampleStart).toEqual(87710);
    expect(LevelService.getElementDetails('Phonetic', 0).sampleDur).toEqual(929);
    expect(LevelService.getElementDetails('Phonetic', 0).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getElementDetails('Phonetic', 0).labels[0].value).toEqual('O');


    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getElementDetails('TB', 0).id).toEqual(40);
    expect(LevelService.getElementDetails('TB', 0).sampleStart).toEqual(29609);
    expect(LevelService.getElementDetails('TB', 0).sampleDur).toEqual(2695);
    expect(LevelService.getElementDetails('TB', 0).labels[0].name).toEqual('TB');
    expect(LevelService.getElementDetails('TB', 0).labels[0].value).toEqual('raise');
  }));

  /**
   *
   */
  it('should get last element details by passing name', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getLastElement('Phonetic').id).toEqual(4);
    expect(LevelService.getLastElement('Phonetic').sampleStart).toEqual(91042);
    expect(LevelService.getLastElement('Phonetic').sampleDur).toEqual(553);
    expect(LevelService.getLastElement('Phonetic').labels[0].name).toEqual('Phonetic');
    expect(LevelService.getLastElement('Phonetic').labels[0].value).toEqual('I');


    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getLastElement('TB').id).toEqual(41);
    expect(LevelService.getLastElement('TB').sampleStart).toEqual(32304);
    expect(LevelService.getLastElement('TB').sampleDur).toEqual(2028);
    expect(LevelService.getLastElement('TB').labels[0].name).toEqual('TB');
    expect(LevelService.getLastElement('TB').labels[0].value).toEqual('lower');
  }));

  /**
   *
   */
  it('should get next element details by passing name and id', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getNextElement('Phonetic', 1).id).toEqual(4);
    expect(LevelService.getNextElement('Phonetic', 1).sampleStart).toEqual(91042);
    expect(LevelService.getNextElement('Phonetic', 1).sampleDur).toEqual(553);
    expect(LevelService.getNextElement('Phonetic', 1).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getNextElement('Phonetic', 1).labels[0].value).toEqual('I');


    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getNextElement('TB', 40).id).toEqual(41);
    expect(LevelService.getNextElement('TB', 40).sampleStart).toEqual(32304);
    expect(LevelService.getNextElement('TB', 40).sampleDur).toEqual(2028);
    expect(LevelService.getNextElement('TB', 40).labels[0].name).toEqual('TB');
    expect(LevelService.getNextElement('TB', 40).labels[0].value).toEqual('lower');
  }));

  /**
   *
   */
  it('should get element details by passing name and id', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getElementDetailsById('Phonetic', 3).id).toEqual(3);
    expect(LevelService.getElementDetailsById('Phonetic', 3).sampleStart).toEqual(87710);
    expect(LevelService.getElementDetailsById('Phonetic', 3).sampleDur).toEqual(929);
    expect(LevelService.getElementDetailsById('Phonetic', 3).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getElementDetailsById('Phonetic', 3).labels[0].value).toEqual('O');


    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getElementDetailsById('TB', 40).id).toEqual(40);
    expect(LevelService.getElementDetailsById('TB', 40).sampleStart).toEqual(29609);
    expect(LevelService.getElementDetailsById('TB', 40).sampleDur).toEqual(2695);
    expect(LevelService.getElementDetailsById('TB', 40).labels[0].name).toEqual('TB');
    expect(LevelService.getElementDetailsById('TB', 40).labels[0].value).toEqual('raise');
  }));

  /**
   *
   */
  it('should set and get lasteditAreaElem', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setlasteditAreaElem('a');
    expect(LevelService.getlasteditAreaElem()).toEqual('a');
  }));

  /**
   *
   */
  it('should set and get lasteditArea', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    LevelService.setlasteditArea('_1');
    expect(LevelService.getlasteditArea()).toEqual('_1');
    expect(LevelService.getlastID()).toEqual('1');
  }));

  /**
   *
   */
  it('should insert a new element on level', inject(function (LevelService, viewState, ConfigProviderService) {
    // test on JDR10_bndl.annotation
    ConfigProviderService.curDbConfig = epgdorsalDbConfig;
    viewState.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
    LevelService.setData(JDR10_bndl.annotation);
    LevelService.insertElementDetails(5, 'Phonetic', 0, 'test', 87610, 100);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(5);
    expect(LevelService.getElementDetails('Phonetic', 0).id).toEqual(5);
    expect(LevelService.getElementDetails('Phonetic', 0).sampleStart).toEqual(87610);
    expect(LevelService.getElementDetails('Phonetic', 0).sampleDur).toEqual(100);
    expect(LevelService.getElementDetails('Phonetic', 0).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getElementDetails('Phonetic', 0).labels[0].value).toEqual('test');
    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    ConfigProviderService.curDbConfig = emaDbConfig;
    viewState.setCurLevelAttrDefs(emaDbConfig.levelDefinitions);
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    LevelService.insertElementDetails(42, 'TB', 0, 'test', 29509, 100);
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(3);
    expect(LevelService.getElementDetails('TB', 0).id).toEqual(42);
    expect(LevelService.getElementDetails('TB', 0).sampleStart).toEqual(29509);
    expect(LevelService.getElementDetails('TB', 0).sampleDur).toEqual(100);
    expect(LevelService.getElementDetails('TB', 0).labels[0].name).toEqual('TB');
    expect(LevelService.getElementDetails('TB', 0).labels[0].value).toEqual('test');
  }));

  /**
   *
   */
  it('should change element (segment) details on level based on name and id', inject(function (LevelService, viewState) {
    // test on JDR10_bndl.annotation
    viewState.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
    LevelService.setData(JDR10_bndl.annotation);
    LevelService.setElementDetails('Phonetic', 3, 'test', 0, 87700, 939);
    expect(LevelService.getElementDetails('Phonetic', 0).id).toEqual(3);
    expect(LevelService.getElementDetails('Phonetic', 0).sampleStart).toEqual(87700);
    expect(LevelService.getElementDetails('Phonetic', 0).sampleDur).toEqual(939);
    expect(LevelService.getElementDetails('Phonetic', 0).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getElementDetails('Phonetic', 0).labels[0].value).toEqual('test');

    // // test on dfgspp_mo1_prosody_0024_bndl.annotation
    viewState.setCurLevelAttrDefs(emaDbConfig.levelDefinitions);
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    LevelService.setElementDetails('TB', 40, 'test', 0, 29604, 2700);
    expect(LevelService.getElementDetails('TB', 0).id).toEqual(40);
    expect(LevelService.getElementDetails('TB', 0).sampleStart).toEqual(29604);
    expect(LevelService.getElementDetails('TB', 0).sampleDur).toEqual(2700);
    expect(LevelService.getElementDetails('TB', 0).labels[0].name).toEqual('TB');
    expect(LevelService.getElementDetails('TB', 0).labels[0].value).toEqual('test');
  }));

  /**
   *
   */
  it('should change element (point) details on level based on name and id', inject(function (LevelService) {
    // test on msajc003_bndl.annotation
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.setPointDetails('Tone', 181, 'test', 100);
    expect(LevelService.getElementDetails('Tone', 0).id).toEqual(181);
    expect(LevelService.getElementDetails('Tone', 0).samplePoint).toEqual(100);
    expect(LevelService.getElementDetails('Tone', 0).labels[0].name).toEqual('Tone');
    expect(LevelService.getElementDetails('Tone', 0).labels[0].value).toEqual('test');
  }));

  /**
   *
   */
  it('should get element neightbour details', inject(function (LevelService) {
    // test on JDR10_bndl.annotation
    // should return neighbours "O" and "I"
    LevelService.setData(JDR10_bndl.annotation);
    var neigh = LevelService.getElementNeighbourDetails('Phonetic', 0, 1);
    expect(neigh.left.id).toEqual(3);
    expect(neigh.right.id).toEqual(4);
    expect(neigh.left.labels[0].value).toEqual('O');
    expect(neigh.right.labels[0].value).toEqual('I');

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    // should return neighbours undefined and "lower"
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    var neigh = LevelService.getElementNeighbourDetails('TB', 40, 40);
    expect(neigh.left).toEqual(undefined);
    expect(neigh.right.id).toEqual(41);
    expect(neigh.right.labels[0].value).toEqual('lower');

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    // should return neighbours "raise" and undefined
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    var neigh = LevelService.getElementNeighbourDetails('TB', 41, 41);
    expect(neigh.left.id).toEqual(40);
    expect(neigh.left.labels[0].value).toEqual('raise');
    expect(neigh.right).toEqual(undefined);

    // test on msajc003_bndl.annotation
    // should return neighbours "V" and "l"
    LevelService.setData(msajc003_bndl.annotation);
    var neigh = LevelService.getElementNeighbourDetails('Phonetic', 148, 179);
    expect(neigh.left.id).toEqual(147);
    expect(neigh.left.labels[0].value).toEqual('V');
    expect(neigh.right.id).toEqual(180);
    expect(neigh.right.labels[0].value).toEqual('l');

    // test on msajc003_bndl.annotation
    // should return neighbours undefined and undefined
    LevelService.setData(msajc003_bndl.annotation);
    var neigh = LevelService.getElementNeighbourDetails('Phonetic', 147, 180);
    expect(neigh.left).toEqual(undefined);
    expect(neigh.right).toEqual(undefined);
  }));

  /**
   *
   */
  it('should getEvent (surrounding details) at given pcm position', inject(function (LevelService) {
    // test on msajc003_bndl.annotation
    LevelService.setData(msajc003_bndl.annotation);
    // Soundhandlerservice.wavJSO.Data.length = 58089 
    // before any element nearest should be false
    expect(LevelService.getEvent(10, 'Phonetic', 58089).nearest).toEqual(false);
    // after any element nearest should be true
    expect(LevelService.getEvent(58088, 'Phonetic', 58089).nearest).toEqual(true);
    // in the middle nearest should be element
    // nearest left
    expect(LevelService.getEvent(20650, 'Phonetic', 58089).nearest.sampleStart).toEqual(20640);
    // nearest right
    expect(LevelService.getEvent(23900, 'Phonetic', 58089).nearest.sampleStart).toEqual(23920);
    // evtr should be actual element
    expect(LevelService.getEvent(20650, 'Phonetic', 58089).evtr.sampleStart).toEqual(20640);
    expect(LevelService.getEvent(23900, 'Phonetic', 58089).evtr.sampleStart).toEqual(20640);
    // before first -> evtr should be first element
    expect(LevelService.getEvent(10, 'Phonetic', 58089).evtr.sampleStart).toEqual(3750);
    // after last -> evtr should be first element
    expect(LevelService.getEvent(58088, 'Phonetic', 58089).evtr.sampleStart).toEqual(50126);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    // Soundhandlerservice.wavJSO.Data.length = 96002  
    // before any element nearest should be false
    expect(LevelService.getEvent(10, 'TT', 96002).nearest).toEqual(false);
    // after any element nearest should be true
    expect(LevelService.getEvent(96000, 'TT', 96002).nearest).toEqual(true);
    // in the middle nearest should be element
    // nearest left
    expect(LevelService.getEvent(30980, 'TT', 96002).nearest.sampleStart).toEqual(30970);
    // nearest right
    expect(LevelService.getEvent(32700, 'TT', 96002).nearest.sampleStart).toEqual(32707);
    // evtr should be actual element
    expect(LevelService.getEvent(30980, 'TT', 96002).evtr.sampleStart).toEqual(30970);
    expect(LevelService.getEvent(32700, 'TT', 96002).evtr.sampleStart).toEqual(30970);
    // before first -> evtr should be first element
    expect(LevelService.getEvent(10, 'TT', 96002).evtr.sampleStart).toEqual(30970);
    // after last -> evtr should be first element
    expect(LevelService.getEvent(96000, 'TT', 96002).evtr.sampleStart).toEqual(32707);

    //test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    // Soundhandlerservice.wavJSO.Data.length = 112000 
    // before any element nearest should be false
    expect(LevelService.getEvent(10, 'Phonetic', 112000).nearest).toEqual(false);
    // after any element nearest should be true
    expect(LevelService.getEvent(111998, 'Phonetic', 112000).nearest).toEqual(true);
    // in the middle nearest should be element
    // nearest left
    expect(LevelService.getEvent(87720, 'Phonetic', 112000).nearest.sampleStart).toEqual(87710);
    // nearest right
    expect(LevelService.getEvent(88630, 'Phonetic', 112000).nearest.sampleStart).toEqual(88639);
    // evtr should be actual element
    expect(LevelService.getEvent(87720, 'Phonetic', 112000).evtr.sampleStart).toEqual(87710);
    expect(LevelService.getEvent(88630, 'Phonetic', 112000).evtr.sampleStart).toEqual(87710);
    // before first -> evtr should be first element
    expect(LevelService.getEvent(10, 'Phonetic', 112000).evtr.sampleStart).toEqual(87710);
    // after last -> evtr should be first element
    expect(LevelService.getEvent(111998, 'Phonetic', 112000).evtr.sampleStart).toEqual(91042);
  }));

  /**
   *
   */
  it('should delete a level', inject(function (LevelService, ConfigProviderService) {
    // test on msajc003_bndl.annotation
    ConfigProviderService.setVals(defaultEmuwebappConfig);
    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.data.levels.length).toEqual(9);
    LevelService.deleteLevel(0, 0);
    expect(LevelService.data.levels.length).toEqual(8);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.data.levels.length).toEqual(4);
    LevelService.deleteLevel(2, 0);
    expect(LevelService.data.levels.length).toEqual(3);

    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.data.levels.length).toEqual(2);
    LevelService.deleteLevel(1, 0);
    expect(LevelService.data.levels.length).toEqual(1);
  }));

  /**
   *
   */
  it('should add a level', inject(function (LevelService, ConfigProviderService) {
    // test on msajc003_bndl.annotation
    ConfigProviderService.setVals(defaultEmuwebappConfig);
    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.data.levels.length).toEqual(9);
    LevelService.addLevel({
      "items": [{
        "id": 150,
        "sampleStart": 0,
        "sampleDur": 90932,
        "labels": [{
          "name": "levelNr0",
          "value": ""
        }]
      }],
      "name": "levelNr0",
      "type": "SEGMENT"
    }, 0, 0);
    expect(LevelService.data.levels.length).toEqual(10);
    expect(LevelService.data.levels[0].items[0].id).toEqual(150);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.data.levels.length).toEqual(4);
    LevelService.addLevel({
      "items": [{
        "id": 151,
        "sampleStart": 0,
        "sampleDur": 90932,
        "labels": [{
          "name": "levelNr0",
          "value": ""
        }]
      }],
      "name": "levelNr0",
      "type": "SEGMENT"
    }, 2, 0);
    expect(LevelService.data.levels.length).toEqual(5);
    expect(LevelService.data.levels[2].items[0].id).toEqual(151);

    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.data.levels.length).toEqual(2);
    LevelService.addLevel({
      "items": [{
        "id": 152,
        "sampleStart": 0,
        "sampleDur": 90932,
        "labels": [{
          "name": "levelNr0",
          "value": ""
        }]
      }],
      "name": "levelNr0",
      "type": "SEGMENT"
    }, 1, 0);
    expect(LevelService.data.levels.length).toEqual(3);
    expect(LevelService.data.levels[1].items[0].id).toEqual(152);
  }));

  /**
   *
   */
  it('should rename an element', inject(function (LevelService, viewState) {

    // test on msajc003_bndl.annotation
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.renameLabel('Phonetic', 147, 'test');
    expect(LevelService.getElementDetailsById('Phonetic', 147).labels[0].value).toEqual('test');

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    viewState.setCurLevelAttrDefs(emaDbConfig.levelDefinitions);
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    LevelService.renameLabel('TB', 40, 'test');
    expect(LevelService.getElementDetailsById('TB', 40).labels[0].value).toEqual('test');

    // test on JDR10_bndl.annotation
    viewState.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
    LevelService.setData(JDR10_bndl.annotation);
    LevelService.renameLabel('Phonetic', 3, 'test');
    expect(LevelService.getElementDetailsById('Phonetic', 3).labels[0].value).toEqual('test');
  }));

  /**
   *
   */
  it('should rename a level', inject(function (LevelService, ConfigProviderService) {
    // test on msajc003_bndl.annotation
    LevelService.setData(msajc003_bndl.annotation);
    ConfigProviderService.setVals(defaultEmuwebappConfig);
    expect(LevelService.getLevelDetails('Phonetic').id).toEqual(6);
    LevelService.renameLevel('Phonetic', 'test', 0);
    expect(LevelService.getLevelDetails('test').id).toEqual(6);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getLevelDetails('TB').id).toEqual(3);
    LevelService.renameLevel('TB', 'test', 0);
    expect(LevelService.getLevelDetails('test').id).toEqual(3);

    // test on JDR10_bndl.annotation
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').id).toEqual(1);
    LevelService.renameLevel('Phonetic', 'test', 0);
    expect(LevelService.getLevelDetails('test').id).toEqual(1);
  }));

  /**
   *
   */
  it('should deleteSegments', inject(function (LevelService) {
    // test on msajc003_bndl.annotation
    // 2 elements in the middle
    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);
    LevelService.deleteSegments('Phonetic', 148, 2);
    // check new length 34-2=32
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(32);
    // check new sampleDur and sampleStart
    expect(LevelService.getElementDetailsById('Phonetic', 147).sampleDur).toEqual(3088);
    expect(LevelService.getElementDetailsById('Phonetic', 150).sampleStart).toEqual(6838);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    // 1 elements on left side
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2);
    LevelService.deleteSegments('TB', 41, 1);
    // check new length 2-1=1  
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(1);
    // check new sampleDur     
    expect(LevelService.getElementDetailsById('TB', 40).sampleDur).toEqual(3709);

    // test on JDR10_bndl.annotation
    // 1 elements on right side
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4);
    LevelService.deleteSegments('Phonetic', 4, 1);
    // check new length 4-1=3  
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(3);
    // check new sampleDur and sampleStart        
    expect(LevelService.getElementDetailsById('Phonetic', 1).sampleDur).toEqual(1037);
  }));

  /**
   *
   */
  it('should deleteSegmentsInvers', inject(function (LevelService, viewState) {
    // test on msajc003_bndl.annotation
    // delete and deleteSegmentsInvers 2 segments
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions)
    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);
    var deleted = LevelService.deleteSegments('Phonetic', 148, 2);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(32);
    LevelService.deleteSegmentsInvers('Phonetic', 148, 2, deleted);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    // 1 elements on left side
    viewState.setCurLevelAttrDefs(emaDbConfig.levelDefinitions)
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2);
    var deleted = LevelService.deleteSegments('TB', 41, 1);
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(1);
    LevelService.deleteSegmentsInvers('TB', 41, 1, deleted);
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2);

    // test on JDR10_bndl.annotation
    // 1 elements on right side
    viewState.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions)
    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4);
    var deleted = LevelService.deleteSegments('Phonetic', 4, 1);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(3);
    LevelService.deleteSegmentsInvers('Phonetic', 4, 1, deleted);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4);
  }));

  /**
   *
   */
  it('should insertSegment', inject(function (LevelService, viewState, ConfigProviderService) {
    // test on msajc003_bndl.annotation
    // delete and deleteSegmentsInvers 2 segments
    ConfigProviderService.curDbConfig = aeDbConfig;
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);


    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);
    // insert 1 new segment on the left side
    var ret1 = LevelService.insertSegment('Phonetic', 100, 100, 'test1');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(35);
    // insert 2 new segments on the left side
    var ret2 = LevelService.insertSegment('Phonetic', 10, 50, 'test2');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(37);
    expect(LevelService.getElementDetailsById('Phonetic', ret1.ids[0]).labels[0].value).toEqual('test1');
    expect(LevelService.getElementDetailsById('Phonetic', ret2.ids[0]).labels[0].value).toEqual('test2');
    expect(LevelService.getElementDetailsById('Phonetic', ret2.ids[1]).labels[0].value).toEqual('test2');

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    ConfigProviderService.curDbConfig = emaDbConfig;
    viewState.setCurLevelAttrDefs(emaDbConfig.levelDefinitions);

    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2);
    // insert 1 new segment on the right side    
    var ret1 = LevelService.insertSegment('TB', 58000, 58000, 'test1');
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(3);
    // insert 2 new segments on the left side
    var ret2 = LevelService.insertSegment('TB', 58100, 58200, 'test2');
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(5);
    expect(LevelService.getElementDetailsById('TB', ret1.ids[0]).labels[0].value).toEqual('test1');
    expect(LevelService.getElementDetailsById('TB', ret2.ids[0]).labels[0].value).toEqual('test2');
    expect(LevelService.getElementDetailsById('TB', ret2.ids[1]).labels[0].value).toEqual('test2');

    // test on JDR10_bndl.annotation
    ConfigProviderService.curDbConfig = epgdorsalDbConfig;
    viewState.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);

    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4);
    // insert 1 new segment in the middle   
    var ret1 = LevelService.insertSegment('Phonetic', 90000, 90000, 'test1');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(5);
    // insert 2 new segments in the middle
    var ret2 = LevelService.insertSegment('Phonetic', 89000, 89500, 'test2');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(7);
    expect(LevelService.getElementDetailsById('Phonetic', ret1.ids[0]).labels[0].value).toEqual('test1');
    expect(LevelService.getElementDetailsById('Phonetic', ret2.ids[0]).labels[0].value).toEqual('test2');
    expect(LevelService.getElementDetailsById('Phonetic', ret2.ids[1]).labels[0].value).toEqual('test2');
  }));

  /**
   *
   */
  it('should insertSegmentInvers', inject(function (LevelService, viewState, ConfigProviderService) {
    // test on msajc003_bndl.annotation
    // delete and deleteSegmentsInvers 2 segments
    ConfigProviderService.curDbConfig = aeDbConfig;
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);

    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);
    // insert 1 new segment on the left side
    LevelService.insertSegment('Phonetic', 100, 100, 'test1');
    LevelService.insertSegmentInvers('Phonetic', 100, 100, 'test1');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);
    // insert 2 new segments on the left side
    LevelService.insertSegment('Phonetic', 10, 50, 'test2');
    LevelService.insertSegmentInvers('Phonetic', 10, 50, 'test2');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    ConfigProviderService.curDbConfig = emaDbConfig;
    viewState.setCurLevelAttrDefs(emaDbConfig.levelDefinitions);

    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2);
    // insert 1 new segment on the right side    
    LevelService.insertSegment('TB', 58000, 58000, 'test1');
    LevelService.insertSegmentInvers('TB', 58000, 58000, 'test1');
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2);
    // insert 2 new segments on the left side
    LevelService.insertSegment('TB', 58100, 58200, 'test2');
    LevelService.insertSegmentInvers('TB', 58100, 58200, 'test2');
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2);

    // test on JDR10_bndl.annotation
    ConfigProviderService.curDbConfig = epgdorsalDbConfig;
    viewState.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);

    LevelService.setData(JDR10_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4);
    // insert 1 new segment in the middle   
    LevelService.insertSegment('Phonetic', 90000, 90000, 'test1');
    LevelService.insertSegmentInvers('Phonetic', 90000, 90000, 'test1');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4);
    // insert 2 new segments in the middle
    LevelService.insertSegment('Phonetic', 89000, 89500, 'test2');
    LevelService.insertSegmentInvers('Phonetic', 89000, 89500, 'test2');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4);
  }));

  /**
   *
   */
  it('should insertPoint', inject(function (LevelService, viewState, ConfigProviderService) {
    // test on msajc003_bndl.annotation
    // delete and deleteSegmentsInvers 2 segments
    ConfigProviderService.curDbConfig = aeDbConfig;
    viewState.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);

    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.getLevelDetails('Tone').level.items.length).toEqual(7);
    // insert 1 new point
    var ret = LevelService.insertPoint('Tone', 100, 'test');
    expect(LevelService.getLevelDetails('Tone').level.items.length).toEqual(8);
    expect(LevelService.getElementDetailsById('Tone', ret.id).labels[0].value).toEqual('test');
  }));

  /**
   *
   */
  it('should deletePoint', inject(function (LevelService) {
    // test on msajc003_bndl.annotation
    // delete and deleteSegmentsInvers 2 segments
    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.getLevelDetails('Tone').level.items.length).toEqual(7);
    // delete 1 point
    var ret = LevelService.deletePoint('Tone', 181);
    expect(LevelService.getLevelDetails('Tone').level.items.length).toEqual(6);
  }));

  /**
   *
   */
  it('should deleteBoundary', inject(function (LevelService) {
    // test on msajc003_bndl.annotation
    // delete and deleteSegmentsInvers 2 segments
    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);
    // delete 1 boundary
    var ret = LevelService.deleteBoundary('Phonetic', 148);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(33);
    expect(LevelService.getElementDetailsById('Phonetic', 147).labels[0].value).toEqual('Vm');
    expect(LevelService.getElementDetailsById('Phonetic', 147).sampleDur).toEqual(3055);
  }));

  /**
   *
   */
  it('should deleteBoundaryInvers', inject(function (LevelService) {
    // test on msajc003_bndl.annotation
    // delete and deleteSegmentsInvers 2 segments
    LevelService.setData(msajc003_bndl.annotation);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);
    // delete 1 boundary
    var ret = LevelService.deleteBoundary('Phonetic', 148);
    // undo delete 1 boundary
    LevelService.deleteBoundaryInvers('Phonetic', 148, ret);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);
    expect(LevelService.getElementDetailsById('Phonetic', 147).labels[0].value).toEqual('V');
    expect(LevelService.getElementDetailsById('Phonetic', 147).sampleDur).toEqual(1390);
  }));

  /**
   *
   */
  it('should snapBoundary', inject(function (LevelService, Soundhandlerservice) {
    // test on msajc003_bndl.annotation
    // snap Boundary
    LevelService.setData(msajc003_bndl.annotation);
    Soundhandlerservice.wavJSO.Data = new Array(58089);
    // snap point to boundary above
    var ret = LevelService.snapBoundary(true,
      'Tone', {
        "id": 181,
        "samplePoint": 8382,
        "labels": [{
          "name": "Tone",
          "value": "H*"
        }]
      }, {
        "right": {
          "id": 182,
          "samplePoint": 18632,
          "labels": [{
            "name": "Tone",
            "value": "H*"
          }]
        }
      },
      'EVENT');
    expect(ret).toEqual(153);
  }));


  /**
   *
   */
  it('should moveBoundary', inject(function (LevelService, Soundhandlerservice) {

    // test on msajc003_bndl.annotation
    // move Boundary
    LevelService.setData(msajc003_bndl.annotation);
    // move middle (0) boundary of segment with id 158 on level 'Phonetic' by 100000 samples -> should not change anything
    LevelService.moveBoundary('Phonetic', 158, 100000, 0);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleStart).toEqual(19000);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleDur).toEqual(1640);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280);
    // move middle (0) boundary of segment with id 158 on level 'Phonetic' by 10 samples
    LevelService.moveBoundary('Phonetic', 158, 10, 0);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleStart).toEqual(19000);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleDur).toEqual(1640 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280 - 10);
    // move left most (-1) boundary of segment with id 147 on level 'Phonetic' by 10 samples   
    LevelService.moveBoundary('Phonetic', 147, 10, -1);
    expect(LevelService.getElementDetailsById('Phonetic', 147).sampleStart).toEqual(3750 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 147).sampleDur).toEqual(1390 - 10);
    // move right most (1) boundary of segment with id 180 on level 'Phonetic' by 10 samples 
    Soundhandlerservice.wavJSO.Data = new Array(58089);
    LevelService.moveBoundary('Phonetic', 180, 10, 1);
    expect(LevelService.getElementDetailsById('Phonetic', 180).sampleStart).toEqual(50126);
    expect(LevelService.getElementDetailsById('Phonetic', 180).sampleDur).toEqual(1964 + 10);

    // test on dfgspp_mo1_prosody_0024_bndl.annotation
    // move Boundary
    LevelService.setData(dfgspp_mo1_prosody_0024_bndl.annotation);
    // move middle (0) boundary of segment with id 2 on level 'Segment' by 100000 samples -> should not change anything
    LevelService.moveBoundary('Segment', 2, 100000, 0);
    expect(LevelService.getElementDetailsById('Segment', 1).sampleStart).toEqual(8640);
    expect(LevelService.getElementDetailsById('Segment', 1).sampleDur).toEqual(6240);
    expect(LevelService.getElementDetailsById('Segment', 2).sampleStart).toEqual(14880);
    expect(LevelService.getElementDetailsById('Segment', 2).sampleDur).toEqual(2640);
    // move middle (0) boundary of segment with id 2 on level 'Segment' by 10 samples
    LevelService.moveBoundary('Segment', 2, 10, 0);
    expect(LevelService.getElementDetailsById('Segment', 1).sampleStart).toEqual(8640);
    expect(LevelService.getElementDetailsById('Segment', 1).sampleDur).toEqual(6240 + 10);
    expect(LevelService.getElementDetailsById('Segment', 2).sampleStart).toEqual(14880 + 10);
    expect(LevelService.getElementDetailsById('Segment', 2).sampleDur).toEqual(2640 - 10);
    // move left most (-1) boundary of segment with id 0 on level 'Segment' by 10 samples   
    LevelService.moveBoundary('Segment', 0, 10, -1);
    expect(LevelService.getElementDetailsById('Segment', 0).sampleStart).toEqual(0 + 10);
    expect(LevelService.getElementDetailsById('Segment', 0).sampleDur).toEqual(8640 - 10);
    // move right most (1) boundary of segment with id 180 on level 'Phonetic' by 10 samples 
    Soundhandlerservice.wavJSO.Data = new Array(96002);
    LevelService.moveBoundary('Segment', 37, 10, 1);
    expect(LevelService.getElementDetailsById('Segment', 37).sampleStart).toEqual(94560);
    expect(LevelService.getElementDetailsById('Segment', 37).sampleDur).toEqual(1200 + 10);

    // test on JDR10_bndl.annotation
    // move Boundary
    LevelService.setData(JDR10_bndl.annotation);
    // move middle (0) boundary of segment with id 1 on level 'Phonetic' by 100000 samples -> should not change anything
    LevelService.moveBoundary('Phonetic', 1, 100000, 0);
    expect(LevelService.getElementDetailsById('Phonetic', 0).sampleStart).toEqual(88639);
    expect(LevelService.getElementDetailsById('Phonetic', 0).sampleDur).toEqual(1642);
    expect(LevelService.getElementDetailsById('Phonetic', 1).sampleStart).toEqual(90281);
    expect(LevelService.getElementDetailsById('Phonetic', 1).sampleDur).toEqual(761);
    // move middle (0) boundary of segment with id 1 on level 'Phonetic' by 10 samples
    LevelService.moveBoundary('Phonetic', 1, 10, 0);
    expect(LevelService.getElementDetailsById('Phonetic', 0).sampleStart).toEqual(88639);
    expect(LevelService.getElementDetailsById('Phonetic', 0).sampleDur).toEqual(1642 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 1).sampleStart).toEqual(90281 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 1).sampleDur).toEqual(761 - 10);
    // move left most (-1) boundary of segment with id 0 on level 'Phonetic' by 10 samples   
    LevelService.moveBoundary('Phonetic', 3, 10, -1);
    expect(LevelService.getElementDetailsById('Phonetic', 3).sampleStart).toEqual(87710 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 3).sampleDur).toEqual(929 - 10);
    // move right most (1) boundary of segment with id 180 on level 'Phonetic' by 10 samples 
    Soundhandlerservice.wavJSO.Data = new Array(112000);
    LevelService.moveBoundary('Phonetic', 4, 10, 1);
    expect(LevelService.getElementDetailsById('Phonetic', 4).sampleStart).toEqual(91042);
    expect(LevelService.getElementDetailsById('Phonetic', 4).sampleDur).toEqual(553 + 10);

  }));


  /**
   *
   */
  it('should movePoint', inject(function (LevelService, Soundhandlerservice) {
    // test on msajc003_bndl.annotation
    // delete and deleteSegmentsInvers 2 segments
    LevelService.setData(msajc003_bndl.annotation);
    Soundhandlerservice.wavJSO.Data = new Array(58089);
    // move point with id 181 on level 'Tone' by 100000000000 samples -> should not change anything
    LevelService.movePoint('Tone', 181, 100000000000);
    expect(LevelService.getElementDetailsById('Tone', 181).samplePoint).toEqual(8382);
    // move point with id 181 on level 'Tone' by 10 samples
    LevelService.movePoint('Tone', 181, 10);
    expect(LevelService.getElementDetailsById('Tone', 181).samplePoint).toEqual(8382 + 10);
    // move point with id 181 on level 'Tone' back by 10 samples
    LevelService.movePoint('Tone', 181, -10);
    expect(LevelService.getElementDetailsById('Tone', 181).samplePoint).toEqual(8382);
  }));


  /**
   *
   */
  it('should moveSegment', inject(function (LevelService, Soundhandlerservice) {
    // test on msajc003_bndl.annotation
    // move segment
    LevelService.setData(msajc003_bndl.annotation);
    Soundhandlerservice.wavJSO.Data = new Array(58089);
    // move single segment with id 158 on level 'Phonetic' by 100000000000 samples -> should not change anything
    LevelService.moveSegment('Phonetic', 158, 1, 100000000000);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleStart).toEqual(19000);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleDur).toEqual(1640);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleStart).toEqual(23920);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleDur).toEqual(1870);
    // move single segment with id 158 on level 'Phonetic' by 10 samples
    LevelService.moveSegment('Phonetic', 158, 1, 10);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleStart).toEqual(19000);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleDur).toEqual(1640 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleStart).toEqual(23920 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleDur).toEqual(1870 - 10);
    // undo made changes
    LevelService.moveSegment('Phonetic', 158, 1, -10);
    // move two segments beginning with id 158 on level 'Phonetic' by 10 samples
    LevelService.moveSegment('Phonetic', 158, 2, 10);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleStart).toEqual(19000);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleDur).toEqual(1640 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleStart).toEqual(23920 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleDur).toEqual(1870);
    expect(LevelService.getElementDetailsById('Phonetic', 160).sampleStart).toEqual(25790 + 10);
    expect(LevelService.getElementDetailsById('Phonetic', 160).sampleDur).toEqual(2610 - 10);
  }));



  /**
   *
   */
  it('should expandSegment', inject(function (LevelService) {
    // test on msajc003_bndl.annotation
    // expand segment
    LevelService.setData(msajc003_bndl.annotation);
    // expand segment with id 158 on level 'Phonetic' on RIGHT side
    LevelService.expandSegment(true, [{
        "id": 158,
        "sampleStart": 20640,
        "sampleDur": 3280,
        "labels": [{
          "name": "Phonetic",
          "value": "n"
        }]
      }],
      'Phonetic',
      750);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280 + 750);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleStart).toEqual(23920 + 750);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleDur).toEqual(1870 - 750);

    // shrink segment with id 158 on level 'Phonetic' on RIGHT side
    LevelService.expandSegment(true, [{
        "id": 158,
        "sampleStart": 20640,
        "sampleDur": (3280 + 750),
        "labels": [{
          "name": "Phonetic",
          "value": "n"
        }]
      }],
      'Phonetic', -750);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleStart).toEqual(23920);
    expect(LevelService.getElementDetailsById('Phonetic', 159).sampleDur).toEqual(1870);

    // expand segment with id 158 on level 'Phonetic' on LEFT side
    LevelService.expandSegment(false, [{
        "id": 158,
        "sampleStart": 20640,
        "sampleDur": 3280,
        "labels": [{
          "name": "Phonetic",
          "value": "n"
        }]
      }],
      'Phonetic',
      750);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleStart).toEqual(19000);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleDur).toEqual(1640 - 750);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640 - 750);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280 + 750);

    // shrink segment with id 158 on level 'Phonetic' on LEFT side
    LevelService.expandSegment(false, [{
        "id": 158,
        "sampleStart": (20640 - 750),
        "sampleDur": (3280 + 750),
        "labels": [{
          "name": "Phonetic",
          "value": "n"
        }]
      }],
      'Phonetic', -750);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleStart).toEqual(19000);
    expect(LevelService.getElementDetailsById('Phonetic', 157).sampleDur).toEqual(1640);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleStart).toEqual(20640);
    expect(LevelService.getElementDetailsById('Phonetic', 158).sampleDur).toEqual(3280);

  }));

  // calcDistanceToNearestZeroCrossing
  // TODO openEditArea && deleteEditArea && createSelection && createEditArea 
  // --> maybe move to directive in order to make it testable   


});