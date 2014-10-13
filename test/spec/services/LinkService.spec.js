'use strict';

describe('Service: LinkService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var item;
  
  /**
   *
   */
  it('should add links to parent', inject(function (LevelService, LinkService) {
    // set according data
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1, 2, 3, 4];
    LinkService.insertLinksTo(parentID, childIDs);
    expect(LevelService.data.links.length).toEqual(4);
    expect(LevelService.data.links[0].fromID).toEqual(1234);
    expect(LevelService.data.links[0].toID).toEqual(1);
    expect(LevelService.data.links[1].fromID).toEqual(1234);
    expect(LevelService.data.links[1].toID).toEqual(2);
    expect(LevelService.data.links[2].fromID).toEqual(1234);
    expect(LevelService.data.links[2].toID).toEqual(3);
    expect(LevelService.data.links[3].fromID).toEqual(1234);
    expect(LevelService.data.links[3].toID).toEqual(4);
  }));

  /**
   *
   */
  it('should remove links to parent', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1, 2, 3, 4];
    LinkService.insertLinksTo(parentID, childIDs);
    expect(LevelService.data.links.length).toEqual(4);
    // then remove
    LinkService.deleteLinksTo(parentID, childIDs);
    expect(LevelService.data.links.length).toEqual(0);
  }));
  
  /**
   *
   */
  it('should add links to children', inject(function (LevelService, LinkService) {
    // set according data
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentIDs = [1, 2, 3, 4];
    var childID = 1234;
    LinkService.insertLinksFrom(parentIDs, childID);
    expect(LevelService.data.links.length).toEqual(4);
    expect(LevelService.data.links[0].fromID).toEqual(1);
    expect(LevelService.data.links[0].toID).toEqual(1234);
    expect(LevelService.data.links[1].fromID).toEqual(2);
    expect(LevelService.data.links[1].toID).toEqual(1234);
    expect(LevelService.data.links[2].fromID).toEqual(3);
    expect(LevelService.data.links[2].toID).toEqual(1234);
    expect(LevelService.data.links[3].fromID).toEqual(4);
    expect(LevelService.data.links[3].toID).toEqual(1234);
  }));

  /**
   *
   */
  it('should remove links to children', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentIDs = [1, 2, 3, 4];
    var childID = 1234;
    LinkService.insertLinksFrom(parentIDs, childID);
    expect(LevelService.data.links.length).toEqual(4);
    // then remove
    LinkService.deleteLinksFrom(parentIDs, childID);
    expect(LevelService.data.links.length).toEqual(0);
  }));
  
});