'use strict';

angular.module('emuwebApp')
	.service('LinkService', function LinkService(LevelService) {
		// shared service object
		var sServObj = {};
		sServObj.data = LevelService.data;

		/**
		 * adds single links to sServObj.data.links 
		 * by pairing all childIds with the parent 
		 * id (form=={'fromID':fromID, 'toID':toID})
		 */
		sServObj.insertLink = function (fromID, toID) {
			sServObj.data.links.push({
				'fromID': fromID,
				'toID': toID
			});
		};

		/**
		 * removes single link from sServObj.data.links 
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteLink = function (fromID, toID) {
			angular.forEach(sServObj.data.links, function (link, linkIdx) {
				if(link.fromID === fromID && link.toID === toID){
					sServObj.data.links.splice(linkIdx, 1);
        		};
			});
		};
		
		/**
		 * adds multiple links to sServObj.data.links 
		 * by pairing all childIds with the parent 
		 * id (form=={'fromID':fromID, 'toID':childId})
		 */
		sServObj.insertLinksTo = function (fromID, toIDs) {
			angular.forEach(toIDs, function (toID) {
				sServObj.insertLink(fromID, toID);
			});
		};

		/**
		 * removes multiple links to children from sServObj.data.links 
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteLinksTo = function (fromID, toIDs) {
		    var ret = [];
			angular.forEach(toIDs, function (toID) {
			    sServObj.deleteLink(fromID, toID)
				ret.push({fromID:fromID, toID:toID});
			});
			return ret;
		};
		
		/**
		 * adds multiple links to sServObj.data.links 
		 * by pairing all parentIds with the child 
		 * id (form=={'fromID':fromID, 'toID':childId})
		 */
		sServObj.insertLinksFrom = function (fromIDs, toID) {
			angular.forEach(fromIDs, function (fromID) {
				sServObj.insertLink(fromID, toID);
			});
		};

		/**
		 * removes multiple links to parents from sServObj.data.links 
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteLinksFrom = function (fromIDs, toID) {
		    var ret = [];
			angular.forEach(fromIDs, function (fromID) {
				ret.push({fromID:fromID, toID:toID});
				sServObj.deleteLink(fromID, toID);
			});
			return ret;
		};	

		/**
		 * returns all links
		 * that match the form {'toID':toID}
		 */
		sServObj.getLinksTo = function (toID) {
		    var ret = [];
			angular.forEach(sServObj.data.links, function (link, linkOrder) {
			    if(link.toID === toID) {
				    ret.push({link: link, order:linkOrder});
				}
			});
			return ret;
		};		

		/**
		 * returns all links
		 * that match the form {'toID':toID}
		 */
		sServObj.getLinksFrom = function (fromID) {
		    var ret = [];
			angular.forEach(sServObj.data.links, function (link, linkOrder) {
			    if(link.fromID === fromID) {
				    ret.push({link: link, order:linkOrder});
				}
			});
			return ret;
		};		

		/**
		 * change a Link (form=={'fromID':fromID, 'toID':toID}) 
		 * to (to=={'fromID':fromID, 'toID':toNewID}) 
		 */
		sServObj.changeLinkTo = function (fromID, toID, toNewID) {
		    angular.forEach(sServObj.data.links, function (link, linkOrder) {
			    if(link.fromID === fromID && link.toID === toID) {
				    sServObj.data.links[linkOrder].toID = toNewID;
				}
			});

		};		

		/**
		 * change a Link (form=={'fromID':fromID, 'toID':toID}) 
		 * to (to=={'fromID':fromID, 'toID':toNewID}) 
		 */
		sServObj.changeLinkFrom = function (fromID, toID, fromNewID) {
		    angular.forEach(sServObj.data.links, function (link, linkOrder) {
			    if(link.fromID === fromID && link.toID === toID) {
				    sServObj.data.links[linkOrder].fromID = fromNewID;
				}
			});
		};		

		/**
		 * removes multiple links from and to ID 
		 */
		sServObj.deleteLinkSegment = function (name, segments) {
		    var linksTo = [];
		    var linksFrom = [];
		    angular.forEach(segments, function (segment) {
				angular.forEach(sServObj.getLinksTo(segment.id), function (found) {
					linksTo.push({fromID:found.link.fromID, toID:found.link.toID});
					sServObj.deleteLink(found.link.fromID, found.link.toID);
				});
				angular.forEach(sServObj.getLinksFrom(segment.id), function (found) {
					linksFrom.push({fromID:found.link.fromID, toID:found.link.toID});
					sServObj.deleteLink(found.link.fromID, found.link.toID);
				});
		    });
		    return {linksTo:linksTo, linksFrom:linksFrom};
		};			


		/**
		 * removes multiple links from and to ID 
		 */
		sServObj.deleteLinkSegmentInvers = function (deleted) {
		    angular.forEach(deleted.linksTo, function (found) {
		        sServObj.insertLink(found.fromID, found.toID);
		    });
		    angular.forEach(deleted.linksFrom, function (found) {
		        sServObj.insertLink(found.fromID, found.toID);
		    });
		};					

		/**
		 * removes multiple links from and to ID 
		 */
		sServObj.deleteLinkBoundary = function (ID, neighbourID) {
		    var linksTo = [];
		    var linksFrom = [];
		    angular.forEach(sServObj.getLinksTo(ID), function (found) {
		        linksTo.push({fromID:found.link.fromID, toID:found.link.toID, newID:neighbourID});
		        sServObj.changeLinkTo(found.link.fromID, found.link.toID, neighbourID);
		    });
		    angular.forEach(sServObj.getLinksFrom(ID), function (found) {
		        linksFrom.push({fromID:found.link.fromID, toID:found.link.toID, newID:neighbourID});
		        sServObj.changeLinkFrom(found.link.fromID, found.link.toID, neighbourID);
		    });
		    return {linksTo:linksTo, linksFrom:linksFrom};
		};			

		/**
		 * removes multiple links from and to ID 
		 */
		sServObj.deleteLinkBoundaryInvers = function (deleted) {
		    angular.forEach(deleted.linksTo, function (found) {
		        sServObj.changeLinkTo(found.fromID, found.newID, found.toID);
		    });
		    angular.forEach(deleted.linksFrom, function (found) {
		        sServObj.changeLinkFrom(found.newID, found.toID, found.fromID);
		    });
		};					

		return sServObj;
	});