'use strict';

angular.module('emuwebApp')
	.service('HierarchyManipulationService', function HierarchyManipulationService($q, HierarchyLayoutService, DataService, LevelService, ConfigProviderService, ArrayHelperService) {
		// shared service object
		var sServObj = {};

		/**
		 * Add a new link if it is valid and goes along the specfied path
		 *
		 * If the specified link is invalid but its reverse is valid,
		 * the reverse is added.
		 *
		 * @param path The current path through the hierarchy
		 * @param from ID of the source item
		 * @param to ID of the target item
		 *
		 * @return the link object that was added ({fromID: x, toID: y})
		 * @return null if no link was added
		 */
		sServObj.addLink = function (path, from, to) {
			var validity = sServObj.checkLinkValidity(path, from, to);

			if (validity.valid) {
				var obj = {fromID: from, toID: to};
				DataService.insertLinkData(obj);
				return obj;
			} else {
				console.debug('Not adding invalid link:', from, '->', to, ' (Error code:', validity.reason, ')');
				if (validity.reason === 3) {
					validity = sServObj.checkLinkValidity(path, to, from);
					if (validity.valid) {
						console.debug('Adding reverse link instead');
						var obj = {fromID: to, toID: from};
						DataService.insertLinkData(obj);
						return obj;
					} else {
						return null;
					}
				} else {
					return null;
				}
			}
		};

		/**
		 * Test whether a link to be added would be valid
		 *
		 * Requirements for validity:
		 * - No cross-over links
		 * - Meet limitations defined by DBconfig.linkDefinitions
		 * -- Only along the hierarchy's direction
		 * - Only within the currently selected (and visualised) path
		 * - No multiply defined links
		 *
		 * @param path Currently selected path (form: [..., 'level2name', 'level1name'])
		 * @param from ID of the source item
		 * @param to ID of the target item
		 *
		 * @return object with state and reason properties
		 * reason may be one of:
		 * 0: no error
		 * 1: from and to are the same
		 * 2: link already exists
		 * 3: link does not meet the requirements of DBconfig.linkDefinitions (no link between its levels)
		 * 4: link does not meet the requirements of DBconfig.linkDefinitions (link type not satisified)
		 * 5: link would cross another link
		 **/
		sServObj.checkLinkValidity = function (path, from, to) {
			var result = {valid: true, reason: 0};
			var links = DataService.getLinkData();

			// This case (from === to)  would also be caught below
			// during linkDefinitions check. I treat it separately
			// anyway because the current GUI implementation kindly
			// facilitates this kind of error and I can therefore
			// offer a 0.0000001 % increase in speed here :-)
			if (from === to) {
				result.valid = false;
				result.reason = 1;
				return result;
			}


			// Check whether link already exists
			for (var i = 0; i < links.length; ++i) {
				if (links[i].fromID === from && links[i].toID === to) {
					result.valid = false;
					result.reason = 2;
					return result;
				}
			}

			// Check whether link is within the currently selected
			// path (which implies that the DBconfig.linkDefinitions
			// are met, apart from the link type that is specified
			// there
			var superlevelName = LevelService.getLevelName(from);
			var sublevelName = LevelService.getLevelName(to);
			var superlevelIndex = path.indexOf(superlevelName);
			if (path[superlevelIndex - 1] !== sublevelName) {
				result.valid = false;
				result.reason = 3;
				return result;
			}

			// Check link type
			var linkType;
			for (var i = 0; i < ConfigProviderService.curDbConfig.linkDefinitions.length; ++i) {
				if (ConfigProviderService.curDbConfig.linkDefinitions[i].sublevelName === sublevelName &&
					ConfigProviderService.curDbConfig.linkDefinitions[i].superlevelName === superlevelName) {
					linkType = ConfigProviderService.curDbConfig.linkDefinitions[i].type;
				}
			}
			if (linkType === undefined) {
				consle.debug('LIKELY A BUG: link to be added (', from, '->', to, ') has been found to be a part of the currently selected path but the link between the respective levels could not be found.');
				result.valid = false;
				result.reason = 3;
				return result;
			}
			// Type can be one of 'MANY_TO_MANY', 'ONE_TO_MANY', 'ONE_TO_ONE'
			// this is defined in schemaFiles/DBconfigFileSchema.json
			//
			// In case it is MANY_TO_MANY, the link is always valid
			//
			if (linkType === 'ONE_TO_MANY' || linkType === 'ONE_TO_ONE') {
				var toElement = LevelService.getItemByID(to);
				if (toElement._parents.length > 0) {
					result.valid = false;
					result.reason = 4;
					return result;
				}
			}
			if (linkType === 'ONE_TO_ONE') {
				var fromElement = LevelService.getItemByID(from);
				var children = HierarchyLayoutService.findChildren(fromElement, path);
				if (children.length > 0) {
					result.valid = false;
					result.reason = 4;
					return result;
				}
			}


			//////
			// Check for crossover links
			//
			// We'll try to find the first and last position in the sublevel
			// where the supposed link's parent can have children.
			//
			// First, we'll check the preceding sibling of that parent node.
			// Its last child node is the first one that can be a child of the
			// supposed parent node.
			// Note that if the sibling has no children, we have to skip it and
			// check the next sibling.
			//
			// Next, we'll chek the siblings that come after the supposed
			// parent node. Their first child is the last one that can be a
			// child of the supposed parent.
			//

			var firstAllowedChildIndex = undefined;
			var lastAllowedChildIndex = undefined;

			var superlevel = LevelService.getLevelAndItem(from).level;
			var sublevel = LevelService.getLevelAndItem(to).level;
			var parentOrder = LevelService.getOrderById(superlevelName, from);
			var childOrder = LevelService.getOrderById(sublevelName, to);


			var siblingRelativeIndex = 0;
			var sibling;

			while (firstAllowedChildIndex === undefined) {
				siblingRelativeIndex -= 1;
				sibling = superlevel.items[parentOrder + siblingRelativeIndex];

				if (sibling === undefined) {
					firstAllowedChildIndex = 0;
					break;
				}

				var children = HierarchyLayoutService.findChildren(sibling, path);

				for (var i = 0; i < children.length; ++i) {
					var index = LevelService.getOrderById(sublevelName, children[i].id);
					if (firstAllowedChildIndex === undefined || index > firstAllowedChildIndex) {
						firstAllowedChildIndex = index;
					}
				}
			}

			siblingRelativeIndex = 0;

			while (lastAllowedChildIndex === undefined) {
				siblingRelativeIndex += 1;
				sibling = superlevel.items[parentOrder + siblingRelativeIndex];

				if (sibling === undefined) {
					lastAllowedChildIndex = sublevel.items.length - 1;
					break;
				}

				var children = HierarchyLayoutService.findChildren(sibling, path);
				if (children.length === 0) {
					continue;
				}

				for (var i = 0; i < children.length; ++i) {
					var index = LevelService.getOrderById(sublevelName, children[i].id);
					if (lastAllowedChildIndex === undefined || index < lastAllowedChildIndex) {
						lastAllowedChildIndex = index;
					}
				}
			}

			if (childOrder < firstAllowedChildIndex || childOrder > lastAllowedChildIndex) {
				result.valid = false;
				result.reason = 5;
				return result;
			}

			// No error found - returning success object
			return result;
		};

		return sServObj;
	});
