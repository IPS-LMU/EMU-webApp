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
		sServObj.addLinkToParent = function (fromID, toID) {
			sServObj.data.links.push({
				'fromID': fromID,
				'toID': toID
			});
		};
		
		/**
		 * adds multiple links to sServObj.data.links 
		 * by pairing all childIds with the parent 
		 * id (form=={'fromID':fromID, 'toID':childId})
		 */
		sServObj.addMultipleLinksToParent = function (fromID, toIDs) {
			angular.forEach(toIDs, function (toID) {
				sServObj.addLinkToParent(fromID, toID);
			});
		};


		/**
		 * removes single link from sServObj.data.links 
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteLinkToParent = function (fromID, toID) {
			angular.forEach(sServObj.data.links, function (link, linkIdx) {
				if(link.fromID === fromID && link.toID === toID){
					sServObj.data.links.splice(linkIdx);					
        		};
			});
		};

		/**
		 * removes single link from sServObj.data.links 
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteMultipleLinksToParent = function (fromID, toIDs) {
			angular.forEach(toIDs, function (toID) {
				sServObj.deleteLinkToParent(fromID, toID);
			});
		};

		/**
		 * removes all links from sServObj.data.links 
		 * that match the form 'fromID': ID OR 'toID': ID
		 */
		sServObj.deleteMultipleLinks = function (ID) {
		    var deleted = [];
			angular.forEach(sServObj.data.links, function (link, linkIdx) {
				if(link.fromID === ID || link.toID === ID){
				    deleted.push(link);
					sServObj.data.links.splice(linkIdx);					
				};
			});
			return deleted;
		};

		/**
		 * add all deleted links back 
		 */
		sServObj.addMultipleLinks = function (deletedLinks) {
			angular.forEach(deletedLinks, function (link) {
				sServObj.addLinkToParent(link.fromID, link.toID);
			});
		};

		return sServObj;
	});