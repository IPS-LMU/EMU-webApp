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
		    var ret = [];
			angular.forEach(sServObj.data.links, function (link, linkIdx) {
				if(link.fromID === fromID && link.toID === toID){
					ret = link;
					sServObj.data.links.splice(linkIdx);
										
        		};
			});
			return ret;
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
				ret.push(sServObj.deleteLink(fromID, toID));
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
				ret.push(sServObj.deleteLink(fromID, toID));
			});
			return ret;
		};	

		/**
		 * returns all links
		 * that match the form {'toID':toID}
		 */
		sServObj.getLinksTo = function (toID) {
		    var ret = [];
			angular.forEach(sServObj.data.links, function (link) {
			    if(link.toID === toID) {
				    ret.push(link);
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
			angular.forEach(sServObj.data.links, function (link) {
			    if(link.fromID === fromID) {
				    ret.push(link);
				}
			});
			return ret;
		};		

		/**
		 * removes multiple links to parents from sServObj.data.links 
		 * that match the form {'fromID':fromID, 'toID':toID}
		 */
		sServObj.deleteLink = function (ID) {
		    console.log(sServObj.getLinksTo(ID));
		    console.log(sServObj.getLinksTo(ID));
		};		


		return sServObj;
	});