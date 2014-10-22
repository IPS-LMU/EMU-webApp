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
    //      1234
    //     / | | \
    //    1  2 3  4    
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
    //      1234
    //     / | | \
    //    1  2 3  4    
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
    //     1 2 3 4
    //     \ | | /
    //      1234    
    LinkService.insertLinksFrom(parentIDs, childID);
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
    //     1 2 3 4
    //     \ | | /
    //      1234       
    LinkService.insertLinksFrom(parentIDs, childID);
    expect(LevelService.data.links.length).toEqual(4);
    // then remove
    LinkService.deleteLinksFrom(parentIDs, childID);
    expect(LevelService.data.links.length).toEqual(0);
  }));
  
  /**
   *
   */
  it('should get Links from ID', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentIDs = [1, 2, 3, 4];
    var childID = 1234;
    //     1 2 3 4
    //     \ | | /
    //      1234       
    LinkService.insertLinksFrom(parentIDs, childID);
    expect(LevelService.data.links.length).toEqual(4);
    expect(LinkService.getLinksFrom(1)).toEqual([{ link : { fromID : 1, toID : 1234 }, order : 0 }]);
    expect(LinkService.getLinksFrom(2)).toEqual([{ link : { fromID : 2, toID : 1234 }, order : 1 }]);
    expect(LinkService.getLinksFrom(3)).toEqual([{ link : { fromID : 3, toID : 1234 }, order : 2 }]);
    expect(LinkService.getLinksFrom(4)).toEqual([{ link : { fromID : 4, toID : 1234 }, order : 3 }]);
  }));
  
  /**
   *
   */
  it('should get Links to ID', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var childIDs = [1, 2, 3, 4];
    var parentID = 1234;
    //      1234
    //     / | | \
    //    1  2 3  4    
    LinkService.insertLinksTo(parentID, childIDs);
    expect(LevelService.data.links.length).toEqual(4);
    expect(LinkService.getLinksTo(1)).toEqual([{ link : { fromID : 1234, toID : 1 }, order : 0 }]);
    expect(LinkService.getLinksTo(2)).toEqual([{ link : { fromID : 1234, toID : 2 }, order : 1 }]);
    expect(LinkService.getLinksTo(3)).toEqual([{ link : { fromID : 1234, toID : 3 }, order : 2 }]);
    expect(LinkService.getLinksTo(4)).toEqual([{ link : { fromID : 1234, toID : 4 }, order : 3 }]);
  }));

  /**
   *
   */
  it('should change link from', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1];
    //      1234
    //        |
    //        1    
    LinkService.insertLinksTo(parentID, childIDs);
    LinkService.changeLinkFrom(1234, 1, 4321);
    //      4321
    //        |
    //        1    
    expect(LevelService.data.links).toEqual([ { fromID : 4321, toID : 1 } ]);
  }));

  /**
   *
   */
  it('should change link to', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1];
    //      1234
    //        |
    //        1
    LinkService.insertLinksTo(parentID, childIDs);
    LinkService.changeLinkTo(1234, 1, 2);
    //      1234
    //        |
    //        2
    expect(LevelService.data.links).toEqual([ { fromID : 1234, toID : 2 } ]);
  }));

  /**
   *
   */
  it('should deleteLinkBoundary', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1, 2, 3];
    //      1234
    //     /  |  \
    //    1   2   3
    LinkService.insertLinksTo(parentID, childIDs);
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1234, toID : 2 }, 
        { fromID : 1234, toID : 3 }
    ]);
    // now delete boundary between 1 and 2
    LinkService.deleteLinkBoundary(2, 1);
    // should be 
    //      1234
    //     /    \
    //    1      3   
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1234, toID : 3 }
    ]);
    // now delete boundary between 1 and 3 
    LinkService.deleteLinkBoundary(3, 1);       
    // should be 
    //      1234
    //       |
    //       1
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }
    ]);    
  }));
  
 /**
   *
   */
  it('should deleteLinkBoundary inverse', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1, 2, 3, 4, 5];
    //       1234
    //    / | | | \
    //   1  2 3 4  5
    LinkService.insertLinksTo(parentID, childIDs);
    expect(LevelService.data.links.length).toEqual(5);
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1234, toID : 2 }, 
        { fromID : 1234, toID : 3 },
        { fromID : 1234, toID : 4 },
        { fromID : 1234, toID : 5 }
    ]);
    // now delete boundary between 2 and 3
    var deleted1 = LinkService.deleteLinkBoundary(3, 2);
    //       1234
    //    / |  | \
    //   1  2  4  5    
    // now delete boundary between 2 and 4
    var deleted2 = LinkService.deleteLinkBoundary(4, 2);
    //     1234
    //    / | \
    //   1  4  5     
    // inverse it
    LinkService.deleteLinkBoundaryInvers(deleted2);
    LinkService.deleteLinkBoundaryInvers(deleted1);
    
    expect(LevelService.data.links.length).toEqual(5);
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1234, toID : 2 }, 
        { fromID : 1234, toID : 3 },
        { fromID : 1234, toID : 4 },
        { fromID : 1234, toID : 5 }
    ]);
  
  }));  

  /**
   *
   */
  it('should deleteLinkBoundary with children', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1, 2];
    var childchildIDs = [3, 4];
    //      1234
    //     /    \
    //    1      2
    //          / \
    //         3   4
    LinkService.insertLinksTo(parentID, childIDs);
    LinkService.insertLinksTo(childIDs[1], childchildIDs);
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1234, toID : 2 }, 
        { fromID : 2, toID : 3 }, 
        { fromID : 2, toID : 4 }
    ]);
    // now delete boundary between 1 and 2
    LinkService.deleteLinkBoundary(2, 1);
    // should be 
    //      1234
    //        |
    //        1
    //       / \
    //      3   4    
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1, toID : 3 }, 
        { fromID : 1, toID : 4 } 
    ]);
  }));
     

  /**
   *
   */
  it('should deleteLinkBoundary with children inverse', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1, 2];
    var childchildIDs = [3, 4];
    //      1234
    //     /    \
    //    1      2
    //          / \
    //         3   4
    LinkService.insertLinksTo(parentID, childIDs);
    LinkService.insertLinksTo(childIDs[1], childchildIDs);
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1234, toID : 2 }, 
        { fromID : 2, toID : 3 }, 
        { fromID : 2, toID : 4 }
    ]);
    // now delete boundary between 1 and 2
    var deleted1 = LinkService.deleteLinkBoundary(2, 1);
    // should be 
    //      1234
    //        |
    //        1
    //       / \
    //      3   4   
    // now delete boundary between 3 and 4
   var deleted2 = LinkService.deleteLinkBoundary(4, 3);
    // should be 
    //      1234
    //        |
    //        1
    //        |
    //        3   
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1, toID : 3 }
    ]);  
    LinkService.deleteLinkBoundaryInvers(deleted2);     
    // should be 
    //      1234
    //        |
    //        1
    //       / \
    //      3   4     
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1, toID : 3 },
        { fromID : 1, toID : 4 }
    ]); 
    console.log(deleted1.linksTo);
    console.log(deleted1.linksFrom);
    
    LinkService.deleteLinkBoundaryInvers(deleted1);          
    // should be 
    //      1234
    //     /    \
    //    1      2
    //          / \
    //         3   4   
    expect(LevelService.data.links).toEqual([ 
        { fromID : 1234, toID : 1 }, 
        { fromID : 1234, toID : 2 }, 
        { fromID : 2, toID : 3 }, 
        { fromID : 2, toID : 4 }
    ]);
     
  }));
    

  /**
   *
   */
  it('should delete links (whole segment)', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1, 2, 3, 4];
    //      1234
    //     / | | \
    //    1  2 3  4
    var segments = [{id:3},{id:4}];
    LinkService.insertLinksTo(parentID, childIDs);
    expect(LevelService.data.links.length).toEqual(4);
    // then remove 3 & 4
    //      1234
    //     / | 
    //    1  2    
    LinkService.deleteLinkSegment(segments);
    expect(LevelService.data.links.length).toEqual(2);
    expect(LinkService.getLinksTo(1)).toEqual([{ link : { fromID : 1234, toID : 1 }, order : 0 }]);
    expect(LinkService.getLinksTo(2)).toEqual([{ link : { fromID : 1234, toID : 2 }, order : 1 }]);    
  }));

  /**
   *
   */
  it('should delete links (whole segment) inverse', inject(function (LevelService, LinkService) {
    // first add
    LevelService.setData(msajc003_bndl.annotation);
    LevelService.data.links = [];
    var parentID = 1234;
    var childIDs = [1, 2, 3, 4];
    //      1234
    //     / | | \
    //    1  2 3  4
    var segments = [{id:3},{id:4}];
    LinkService.insertLinksTo(parentID, childIDs);
    expect(LevelService.data.links.length).toEqual(4);
    // delete:
    //      1234
    //     / |
    //    1  2
    // invers:
    //      1234
    //     / | | \
    //    1  2 3  4    
    LinkService.deleteLinkSegmentInvers(LinkService.deleteLinkSegment(segments));
    expect(LevelService.data.links.length).toEqual(4);
    expect(LinkService.getLinksTo(1)).toEqual([{ link : { fromID : 1234, toID : 1 }, order : 0 }]);
    expect(LinkService.getLinksTo(2)).toEqual([{ link : { fromID : 1234, toID : 2 }, order : 1 }]);    
    expect(LinkService.getLinksTo(3)).toEqual([{ link : { fromID : 1234, toID : 3 }, order : 2 }]);
    expect(LinkService.getLinksTo(4)).toEqual([{ link : { fromID : 1234, toID : 4 }, order : 3 }]);    
  }));
  
});