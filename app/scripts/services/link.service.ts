import * as angular from 'angular';

angular.module('emuwebApp')
	.service('LinkService', function LinkService(DataService, ConfigProviderService) {

		/**
		 * adds single links by pairing all childIds
		 * with the parent id (form=={'fromID':fromID, 'toID':toID})
		 * @param fromID father node
		 * @param toID child node
		 */
		this.insertLink = function (fromID, toID) {
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
		this.insertLinkAt = function (fromID, toID, order) {
			DataService.insertLinkDataAt(order, {
				'fromID': fromID,
				'toID': toID
			});
		};

		/**
		 * removes single link from DataService
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		this.deleteLink = function (fromID, toID) {
			var ret = -1;
			DataService.getLinkData().forEach((link, linkIdx) => {
				if (link.fromID === fromID && link.toID === toID) {
					DataService.deleteLinkDataAt(linkIdx);
					ret = linkIdx;
				}
			});
			return ret;
		};

		/**
		 * checks if a given link exists
		 * that matches the form {'fromID':fromID, 'toID':toID}
		 */
		this.linkExists = function (fromID, toID) {
			var ret = false;
			DataService.getLinkData().forEach((link) => {
				if (link.fromID === fromID && link.toID === toID) {
					ret = true;
				}
			});
			return ret;
		};

		/**
		 * checks if a given node has parents
		 * @param ID node to check
		 */
		this.hasParents = function (ID) {
			var ret = false;
			DataService.getLinkData().forEach((link) => {
				if (link.toID === ID) {
					ret = true;
				}
			});
			return ret;
		};

		/**
		 * checks if a given node has children
		 * @param ID node to check
		 */
		this.hasChildren = function (ID) {
			var ret = false;
			DataService.getLinkData().forEach((link) => {
				if (link.fromID === ID) {
					ret = true;
				}
			});
			return ret;
		};

		/**
		 * checks if a given node has parents or children
		 * @param ID node to check
		 */
		this.isLinked = function (ID) {
			return (this.hasChildren(ID) || this.hasParents(ID));
		};

		/**
		 * adds multiple links to DataService
		 * by pairing all childIds with the parent
		 * id (form=={'fromID':fromID, 'toID':childId})
		 */
		this.insertLinksTo = function (fromID, toIDs) {
			toIDs.forEach((toID) => {
				this.insertLink(fromID, toID);
			});
		};

		/**
		 * removes multiple links to children from DataService
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		this.deleteLinksTo = function (fromID, toIDs) {
			var ret = [];
			toIDs.forEach((toID) => {
				this.deleteLink(fromID, toID);
				ret.push({fromID: fromID, toID: toID});
			});
			return ret;
		};

		/**
		 * adds multiple links to DataService
		 * by pairing all parentIds with the child
		 * id (form=={'fromID':fromID, 'toID':childId})
		 */
		this.insertLinksFrom = function (fromIDs, toID) {
			fromIDs.forEach((fromID) => {
				this.insertLink(fromID, toID);
			});
		};

		/**
		 * removes multiple links to parents from DataService
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		this.deleteLinksFrom = function (fromIDs, toID) {
			var ret = [];
			fromIDs.forEach((fromID) => {
				ret.push({fromID: fromID, toID: toID});
				this.deleteLink(fromID, toID);
			});
			return ret;
		};

		/**
		 * returns all links
		 * that match the form {'toID':toID}
		 */
		this.getLinksTo = function (toID) {
			var ret = [];
			DataService.getLinkData().forEach((link, linkOrder) => {
				if (link.toID === toID) {
					ret.push({link: link, order: linkOrder});
				}
			});
			return ret;
		};

		/**
		 * returns all links
		 * that match the form {'toID':toID}
		 */
		this.getLinksFrom = function (fromID) {
			var ret = [];
			DataService.getLinkData().forEach((link, linkOrder) => {
				if (link.fromID === fromID) {
					ret.push({link: link, order: linkOrder});
				}
			});
			return ret;
		};

		/**
		 * change a Link (form=={'fromID':fromID, 'toID':toID})
		 * to (to=={'fromID':fromID, 'toID':toNewID})
		 */
		this.changeLinkTo = function (fromID, toID, toNewID) {
			DataService.getLinkData().forEach((link, linkOrder) => {
				if (link.fromID === fromID && link.toID === toID) {
					DataService.changeLinkDataAt(linkOrder, fromID, toNewID);
				}
			});

		};

		/**
		 * change a Link (form=={'fromID':fromID, 'toID':toID})
		 * to (to=={'fromID':fromID, 'toID':toNewID})
		 */
		this.changeLinkFrom = function (fromID, toID, fromNewID) {
			DataService.getLinkData().forEach((link, linkOrder) => {
				if (link.fromID === fromID && link.toID === toID) {
					DataService.changeLinkDataAt(linkOrder, fromNewID, toID);
				}
			});
		};

		/**
		 * removes multiple links from and to ID
		 */
		this.deleteLinkSegment = function (segments) {
			var linksTo = [];
			var linksFrom = [];
			segments.forEach((segment) => {
				this.getLinksTo(segment.id).forEach((found) => {
					linksTo.push({fromID: found.link.fromID, toID: found.link.toID});
					this.deleteLink(found.link.fromID, found.link.toID);
				});
				this.getLinksFrom(segment.id).forEach((found) => {
					linksFrom.push({fromID: found.link.fromID, toID: found.link.toID});
					this.deleteLink(found.link.fromID, found.link.toID);
				});
			});
			return {linksTo: linksTo, linksFrom: linksFrom};
		};


		/**
		 * removes multiple links from and to ID
		 */
		this.deleteLinkSegmentInvers = function (deleted) {
			deleted.linksTo.forEach((found) => {
				this.insertLink(found.fromID, found.toID);
			});
			deleted.linksFrom.forEach((found) => {
				this.insertLink(found.fromID, found.toID);
			});
		};

		/**
		 * reorganizes multiple links from and to ID
		 * if a boundary between two items is deleted
		 */
		this.deleteLinkBoundary = function (ID, neighbourID, LevelService) {
			var linksTo = [];
			var linksFrom = [];
			var ord = 0;
			var levelName = LevelService.getLevelName(neighbourID);

			var onlyInM2m = true; // only in MANY_TO_MANY relationships
            ConfigProviderService.curDbConfig.linkDefinitions.forEach((linkDef) => {
				if(linkDef.superlevelName === levelName || linkDef.sublevelName === levelName){
					if(linkDef.type !== 'MANY_TO_MANY'){
						onlyInM2m = false;
					}
				}
            });


			if (neighbourID >= 0) { // if not first item (neighbourID is -1 if it is the first item)
				this.getLinksTo(ID).forEach((found) => {
					if (this.linkExists(found.link.fromID, neighbourID)) {
						ord = this.deleteLink(found.link.fromID, ID);
						linksTo.push({fromID: found.link.fromID, toID: ID, deleted: true, order: ord, neighbourID: 0});
					}
					else {
						if(onlyInM2m){ // only relink in MANY_TO_MANY relationships
							this.changeLinkTo(found.link.fromID, ID, neighbourID);
							linksTo.push({
								fromID: found.link.fromID,
								toID: ID,
								deleted: false,
								order: ord,
								neighbourID: neighbourID
							});
						}
					}
				});
				this.getLinksFrom(ID).forEach((found) => {
					if (this.linkExists(neighbourID, found.link.toID)) {
						ord = this.deleteLink(ID, found.link.toID);
						linksFrom.push({fromID: ID, toID: found.link.toID, deleted: true, order: ord, neighbourID: 0});
					}
					else {
						this.changeLinkFrom(ID, found.link.toID, neighbourID);
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
				this.getLinksTo(ID).forEach((found) => {
					ord = this.deleteLink(found.link.fromID, ID);
					linksTo.push({fromID: found.link.fromID, toID: ID, deleted: true, order: ord, neighbourID: 0});
				});
				this.getLinksFrom(ID).forEach((found) => {
					ord = this.deleteLink(ID, found.link.toID);
					linksFrom.push({fromID: ID, toID: found.link.toID, deleted: true, order: ord, neighbourID: 0});
				});
			}
			return {linksTo: linksTo, linksFrom: linksFrom};
		};

		/**
		 * removes multiple links from and to ID
		 */
		this.deleteLinkBoundaryInvers = function (deleted) {
			deleted.linksTo.forEach((found) => {
				if (found.deleted) {
					this.insertLinkAt(found.fromID, found.toID, found.order);
				}
				else {
					this.changeLinkTo(found.fromID, found.neighbourID, found.toID);
				}
			});
			deleted.linksFrom.forEach((found) => {
				if (found.deleted) {
					this.insertLinkAt(found.fromID, found.toID, found.order);
				}
				else {
					this.changeLinkFrom(found.neighbourID, found.toID, found.fromID);
				}
			});
		};
	});