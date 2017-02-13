'use strict';

angular.module('emuwebApp')
	.service('LinkService', function LinkService(DataService) {
		// shared service object
		var sServObj = {};

		/**
		 * adds single links by pairing all childIds
		 * with the parent id (form=={'fromID':fromID, 'toID':toID})
		 * @param fromID father node
		 * @param toID child node
		 */
		sServObj.insertLink = function (fromID, toID) {
			DataService.insertLinkData({
				'fromID': fromID,
				'toID': toID
			});
		};

		/**
		 * adds single links to DataService
		 * by pairing all childIds with the parent
		 * at a given position
		 * @param fromID father node
		 * @param toID child node
		 * @param order position of the node pair
		 */
		sServObj.insertLinkAt = function (fromID, toID, order) {
			DataService.insertLinkDataAt(order, {
				'fromID': fromID,
				'toID': toID
			});
		};

		/**
		 * removes single link from DataService
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteLink = function (fromID, toID) {
			var ret = -1;
			angular.forEach(DataService.getLinkData(), function (link, linkIdx) {
				if (link.fromID === fromID && link.toID === toID) {
					DataService.deleteLinkDataAt(linkIdx);
					ret = linkIdx;
				}
				;
			});
			return ret;
		};

		/**
		 * checks if a given link exists
		 * that matches the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.linkExists = function (fromID, toID) {
			var ret = false;
			angular.forEach(DataService.getLinkData(), function (link, linkIdx) {
				if (link.fromID === fromID && link.toID === toID) {
					ret = true;
				}
				;
			});
			return ret;
		};

		/**
		 * checks if a given node has parents
		 * @param ID node to check
		 */
		sServObj.hasParents = function (ID) {
			var ret = false;
			angular.forEach(DataService.getLinkData(), function (link, linkIdx) {
				if (link.toID === ID) {
					ret = true;
				}
				;
			});
			return ret;
		};

		/**
		 * checks if a given node has children
		 * @param ID node to check
		 */
		sServObj.hasChildren = function (ID) {
			var ret = false;
			angular.forEach(DataService.getLinkData(), function (link, linkIdx) {
				if (link.fromID === ID) {
					ret = true;
				}
				;
			});
			return ret;
		};

		/**
		 * checks if a given node has parents or children
		 * @param ID node to check
		 */
		sServObj.isLinked = function (ID) {
			return (sServObj.hasChildren(ID) || sServObj.hasParents(ID));
		};

		/**
		 * adds multiple links to DataService
		 * by pairing all childIds with the parent
		 * id (form=={'fromID':fromID, 'toID':childId})
		 */
		sServObj.insertLinksTo = function (fromID, toIDs) {
			angular.forEach(toIDs, function (toID) {
				sServObj.insertLink(fromID, toID);
			});
		};

		/**
		 * removes multiple links to children from DataService
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteLinksTo = function (fromID, toIDs) {
			var ret = [];
			angular.forEach(toIDs, function (toID) {
				sServObj.deleteLink(fromID, toID)
				ret.push({fromID: fromID, toID: toID});
			});
			return ret;
		};

		/**
		 * adds multiple links to DataService
		 * by pairing all parentIds with the child
		 * id (form=={'fromID':fromID, 'toID':childId})
		 */
		sServObj.insertLinksFrom = function (fromIDs, toID) {
			angular.forEach(fromIDs, function (fromID) {
				sServObj.insertLink(fromID, toID);
			});
		};

		/**
		 * removes multiple links to parents from DataService
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteLinksFrom = function (fromIDs, toID) {
			var ret = [];
			angular.forEach(fromIDs, function (fromID) {
				ret.push({fromID: fromID, toID: toID});
				sServObj.deleteLink(fromID, toID);
			});
			return ret;
		};

		/**
		 * Returns two hash maps with item IDs as keys and arrays of links
		 * as values.
		 *
		 * The returned object has two properties, to and from, which
		 * represent the two hash maps.
		 *
		 * Each hash map is keyed with item IDs, and the values are arrays
		 * of objects like this:
		 * {
		 *  link: { fromID: number, toID: number },
		 *  order: number
		 * }
		 *
		 * @returns {{to: {}, from: {}}}
		 */
		sServObj.getHashMapIDLinks = function () {
			var	result = {
				to: {},
				from: {}
			};

			var links = DataService.getLinkData();
			for (var i = 0; i < links.length; ++i) {
				if (!result.to.hasOwnProperty(links[i].toID)) {
					result.to[links[i].toID] = [{
						link: links[i],
						order: i
					}];
				} else {
					result.to[links[i].toID].push({
						link: links[i],
						order: i
					});
				}

				if (!result.from.hasOwnProperty(links[i].fromID)) {
					result.from[links[i].fromID] = [{
						link: links[i],
						order: i
					}];
				} else {
					result.from[links[i].fromID].push({
						link: links[i],
						order: i
					});
				}
			}

			return result;
		};

		/**
		 * returns all links
		 * that match the form {'toID':toID}
		 */
		sServObj.getLinksTo = function (toID) {
			var ret = [];
			var links = DataService.getLinkData();
			for (var i = 0; i < links.length; ++i) {
				if (links[i].toID === toID) {
					ret.push({link: links[i], order: i});
				}
			}
			return ret;
		};

		/**
		 * returns all links
		 * that match the form {'toID':toID}
		 */
		sServObj.getLinksFrom = function (fromID) {
			var ret = [];
			var links = DataService.getLinkData();
			for (var i = 0; i < links.length; ++i) {
				if (links[i].fromID === fromID) {
					ret.push({link: links[i], order: i});
				}
			}
			return ret;
		};

		/**
		 * change a Link (form=={'fromID':fromID, 'toID':toID})
		 * to (to=={'fromID':fromID, 'toID':toNewID})
		 */
		sServObj.changeLinkTo = function (fromID, toID, toNewID) {
			angular.forEach(DataService.getLinkData(), function (link, linkOrder) {
				if (link.fromID === fromID && link.toID === toID) {
					DataService.changeLinkDataAt(linkOrder, fromID, toNewID);
				}
			});

		};

		/**
		 * change a Link (form=={'fromID':fromID, 'toID':toID})
		 * to (to=={'fromID':fromID, 'toID':toNewID})
		 */
		sServObj.changeLinkFrom = function (fromID, toID, fromNewID) {
			angular.forEach(DataService.getLinkData(), function (link, linkOrder) {
				if (link.fromID === fromID && link.toID === toID) {
					DataService.changeLinkDataAt(linkOrder, fromNewID, toID);
				}
			});
		};

		/**
		 * removes multiple links from and to ID
		 */
		sServObj.deleteLinkSegment = function (segments) {
			var linksTo = [];
			var linksFrom = [];
			angular.forEach(segments, function (segment) {
				angular.forEach(sServObj.getLinksTo(segment.id), function (found) {
					linksTo.push({fromID: found.link.fromID, toID: found.link.toID});
					sServObj.deleteLink(found.link.fromID, found.link.toID);
				});
				angular.forEach(sServObj.getLinksFrom(segment.id), function (found) {
					linksFrom.push({fromID: found.link.fromID, toID: found.link.toID});
					sServObj.deleteLink(found.link.fromID, found.link.toID);
				});
			});
			return {linksTo: linksTo, linksFrom: linksFrom};
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
		 * reorganizes multiple links from and to ID
		 * if a boundary between two items is deleted
		 */
		sServObj.deleteLinkBoundary = function (ID, neighbourID) {
			var linksTo = [];
			var linksFrom = [];
			var ord = 0;
			if (neighbourID > 0) { // if not first item
				angular.forEach(sServObj.getLinksTo(ID), function (found) {
					if (sServObj.linkExists(found.link.fromID, neighbourID)) {
						ord = sServObj.deleteLink(found.link.fromID, ID);
						linksTo.push({fromID: found.link.fromID, toID: ID, deleted: true, order: ord, neighbourID: 0});
					}
					else {
						sServObj.changeLinkTo(found.link.fromID, ID, neighbourID);
						linksTo.push({
							fromID: found.link.fromID,
							toID: ID,
							deleted: false,
							order: ord,
							neighbourID: neighbourID
						});
					}
				});
				angular.forEach(sServObj.getLinksFrom(ID), function (found) {
					if (sServObj.linkExists(neighbourID, found.link.toID)) {
						ord = sServObj.deleteLink(ID, found.link.toID);
						linksFrom.push({fromID: ID, toID: found.link.toID, deleted: true, order: ord, neighbourID: 0});
					}
					else {
						sServObj.changeLinkFrom(ID, found.link.toID, neighbourID);
						linksFrom.push({
							fromID: ID,
							toID: found.link.toID,
							deleted: false,
							order: ord,
							neighbourID: neighbourID
						});
					}

				});
			}
			else {
				angular.forEach(sServObj.getLinksTo(ID), function (found) {
					ord = sServObj.deleteLink(found.link.fromID, ID);
					linksTo.push({fromID: found.link.fromID, toID: ID, deleted: true, order: ord, neighbourID: 0});
				});
				angular.forEach(sServObj.getLinksFrom(ID), function (found) {
					ord = sServObj.deleteLink(ID, found.link.toID);
					linksFrom.push({fromID: ID, toID: found.link.toID, deleted: true, order: ord, neighbourID: 0});
				});
			}
			return {linksTo: linksTo, linksFrom: linksFrom};
		};

		/**
		 * removes multiple links from and to ID
		 */
		sServObj.deleteLinkBoundaryInvers = function (deleted) {
			angular.forEach(deleted.linksTo, function (found) {
				if (found.deleted) {
					sServObj.insertLinkAt(found.fromID, found.toID, found.order);
				}
				else {
					sServObj.changeLinkTo(found.fromID, found.neighbourID, found.toID);
				}
			});
			angular.forEach(deleted.linksFrom, function (found) {
				if (found.deleted) {
					sServObj.insertLinkAt(found.fromID, found.toID, found.order);
				}
				else {
					sServObj.changeLinkFrom(found.neighbourID, found.toID, found.fromID);
				}
			});
		};

		return sServObj;
	});