'use strict';

/**
 * This service aims to provide functions for laying out the hierarchy of a
 * bundle (ie, calculating the positions of the nodes). The actual drawing is
 * done in a directive, the manipulation of the hierarchy is done in another
 * service.
 *
 * While the DBConfig allows for a complex network of levels, the visualisation
 * is always limited to one straight path of levels. This path has to be passed
 * in to the individual functions that expect a selectedPath parameter.
 *
 * A selection menu shall be offered comprising all possible paths through the
 * hierarchy. Therefore, this service offers the function findPaths() to return
 * all possible paths.
 */

angular.module('emuwebApp')
	.service('HierarchyLayoutService', function (viewState, ConfigProviderService, LevelService, DataService, LinkService) {
		// shared service object
		var sServObj = {};

		sServObj.hashMapIDChildren = {};
		sServObj.hashMapIDItem = {};
		sServObj.hashMapIDLevelName = {};
		sServObj.hashMapIDLinks = {
			to: {},
			from: {}
		};

		/////////////////////
		// public API

		/**
		 * Recursively find all paths through the hierarchy of levels.
		 * This is done bottom-up because there is no explicit root element in the levelDefinitions.
		 *
		 * @param startLevel The name of the level from which to start
		 * @param path An array of levels' names that form a path to startLevel (optional; shouldn't be an empty array)
		 */
		sServObj.findPaths = function (startLevel, path) {
			if (typeof path === 'undefined') {
				var path = [startLevel];
			} else {
				path = path.concat([startLevel]);
			}

			// Find all parents of startLevel
			var parents = this.findParentLevels(startLevel);

			// If we have no more parents, we're at the end of the
			// path and thus returning it
			if (parents.length === 0) {
				return [path];
			}

			// If, on the other hand, there are parents, we start
			// recursion to find all paths
			var paths = [];
			for (var i = 0; i < parents.length; ++i) {
				paths = paths.concat(sServObj.findPaths(parents[i], path));
			}

			return paths;
		};

		/**
		 * Find all parent levels of a given level by iterating through the
		 * current database's linkDefinitions.
		 *
		 * @param childLevel The name of the level whose parents to find
		 * @returns An array of names of childLevel's parent levels
		 */
		sServObj.findParentLevels = function (childLevel) {
			var parents = [];
			for (var i = 0; i < ConfigProviderService.curDbConfig.linkDefinitions.length; ++i) {
				if (ConfigProviderService.curDbConfig.linkDefinitions[i].sublevelName === childLevel) {
					parents.push(ConfigProviderService.curDbConfig.linkDefinitions[i].superlevelName);
				}
			}
			return parents;
		};

		/**
		 * Calculate the weights (size within their level) of all
		 * nodes bottom-up.
		 *
		 * This is most likely rather slow and -definitely needs- could
		 * use some tweaking
		 */
		sServObj.calculateWeightsBottomUp = function (selectedPath) {
			var i, ii, iii;

			sServObj.hashMapIDItem = LevelService.getHashMapIDItem();
			sServObj.hashMapIDLevelName = LevelService.getHashMapIDLevelName();
			sServObj.hashMapIDLinks = LinkService.getHashMapIDLinks();
			sServObj.rebuildPartialData(selectedPath, viewState.curViewPort.sS, viewState.curViewPort.eS);
			sServObj.hashMapIDChildren = {};
			sServObj.findChildren(selectedPath);

			/////
			// Make sure all items have proper _parents and
			// _visibile attributes
			sServObj.findParents(selectedPath);
			sServObj.findVisibility(selectedPath);

			/////
			// Iterate through levels bottom-up
			for (i = 0; i < selectedPath.length; ++i) {
				var level = sServObj.getLevelDetails(selectedPath[i]);

				// This will be the total of the weights of all
				// items on this level
				level._weight = 0;

				//////
				// Iterate through items to calculate their
				// _weight and the level's _weight
				for (ii = 0; ii < level.items.length; ++ii) {
					if (level.items[ii]._visible === false) {
						level.items[ii]._weight = 0.35;
					} else {
						level.items[ii]._weight = 1;
					}

					// Calculate weight of the level
					level._weight += level.items[ii]._weight;
				}

				/////
				// Iterate through items again to calculate
				// their _posInLevel and _depth.
				// This is done in a new for loop because it
				// depends on the correctness of level._weight
				var posInLevel = 0;
				for (ii = 0; ii < level.items.length; ++ii) {
					level.items[ii]._posInLevel = (posInLevel + level.items[ii]._weight / 2) / level._weight;
					posInLevel += level.items[ii]._weight;
					level.items[ii]._depth = selectedPath.length - i - 1;

					//////
					// Additionally, calculate link positions
					var linksToHere = sServObj.hashMapIDLinks.to[level.items[ii].id];
					var linksFromHere = sServObj.hashMapIDLinks.from[level.items[ii].id];
					if (linksToHere === undefined) {
						linksToHere = [];
					}
					if (linksFromHere === undefined) {
						linksFromHere = [];
					}

					for (var l = 0; l < linksToHere.length; ++l) {
						linksToHere[l].link._toPosInLevel = level.items[ii]._posInLevel;
						linksToHere[l].link._toDepth = level.items[ii]._depth;
					}

					for (var l = 0; l < linksFromHere.length; ++l) {
						linksFromHere[l].link._fromPosInLevel = level.items[ii]._posInLevel;
						linksFromHere[l].link._fromDepth = level.items[ii]._depth;
					}
				}
			}
		};

		/**
		 * Find all children of all nodes that are part of the currently
		 * selected path through the hierarchy, and store them in a hash map.
		 */
		sServObj.findChildren = function (selectedPath) {
			for (var i = 0; i < selectedPath.length; ++i) {
				var level = sServObj.getLevelDetails(selectedPath[i]);

				for (var j = 0; j < level.items.length; ++j) {
					var item = level.items[j];

					// On the bottom level along the selected path, there can
					// be no children
					if (i === 0) {
						sServObj.hashMapIDChildren[item.id] = [];
						break;
					}

					// On all other levels, we have to look for children
					var children = [];
					var links = sServObj.hashMapIDLinks.from[item.id];
					if (links === undefined) {
						sServObj.hashMapIDChildren[item.id] = [];
						break;
					}
					for (var k = 0; k < links.length; ++k) {
						var linkTarget = sServObj.hashMapIDItem[links[k].link.toID];
						var targetLevel = sServObj.hashMapIDLevelName[linkTarget.id];
						if (targetLevel === selectedPath[i - 1]) {
							children.push(linkTarget);
						}
					}
					sServObj.hashMapIDChildren[item.id] = children;
				}
			}
		};

		sServObj.getChildren = function (id) {
			var result = sServObj.hashMapIDChildren[id];
			if (result === undefined) {
				return [];
			} else {
				return result;
			}
		};

		/**
		 * This function aims to find and store the parents of every
		 * node (along the selected path).
		 *
		 * First clears the _parents attribute from all item and then
		 * re-calculates them.
		 *
		 * All items on the currently selected path will then have a
		 * _parents property that is either an empty array (if it has
		 * no parents) or an array containing its parents.
		 */
		sServObj.findParents = function (selectedPath) {
			var i, ii, c;

			//////
			// Clear _parents from all items
			for (var id in sServObj.hashMapIDItem) {
				sServObj.hashMapIDItem[id]._parents = [];
			}

			/////
			// Iterate through levels
			var level;
			for (i = 0; i < selectedPath.length; ++i) {
				level = sServObj.getLevelDetails(selectedPath[i]);

				// Iterate through the current level's items
				// And save them as _parents in their children
				for (ii = 0; ii < level.items.length; ++ii) {
					var children = sServObj.getChildren(level.items[ii].id);

					for (c = 0; c < children.length; ++c) {
						children[c]._parents.push (level.items[ii]);
					}
				}
			}
		};


		/**
		 * Find out, which paths ought to be drawn because they are not
		 * collapsed.
		 *
		 * Will add a boolean attribute _visible to all items on the
		 * currently selected path.
		 */
		sServObj.findVisibility = function (selectedPath) {
			// Root nodes are all nodes that have no parents and
			// thus form a sub-graph.
			//
			// Note that some descendants of a given root node
			// might also be the descendant of another root node.
			// thus "connecting" the different sub-graphs. If this
			// were a real connection, the different sub-graphs
			// would actually be one graph. But it is not a real
			// connection since the whole graph is directed and the
			// connections can never be along the direction of an
			// edge.

			if (selectedPath !== undefined && selectedPath.length > 0) {
				var rootLevelItems = [];

				// Traverse every node along the selected path, marking all
				// of them invisible and keeping a reference to all of those
				// that are root nodes as defined above.
				var level;
				for (var i = 0; i < selectedPath.length; ++i) {
					level = sServObj.getLevelDetails(selectedPath[i]);

					for (var ii = 0; ii < level.items.length; ++ii) {
						level.items[ii]._visible = false;

						if (level.items[ii]._parents.length === 0) {
							rootLevelItems.push(level.items[ii].id);
						}
					}
				}

				// Now all nodes on the selectedPath have been set
				// invisible. Try and find those that must be visible,
				// i.e. either they are a root node or there is an
				// uncollapsed path to them from a root node.

				var currentID;
				var items = rootLevelItems;
				while (items.length > 0) {
					currentID = items.pop();
					if (!viewState.hierarchyState.getCollapsed(currentID)) {
						var children = sServObj.getChildren(currentID);
						for (var i = 0; i < children.length; ++i) {
							items.push(children[i].id);
						}
					}
					sServObj.hashMapIDItem[currentID]._visible = true;
				}
			}
		};

		/**
		 * Toggle the state of a single item with its subtree
		 */
		sServObj.toggleCollapse = function (d, selectedPath) {

			// Find out whether we're collapsing or decollapsing
			var isCollapsing = !viewState.hierarchyState.getCollapsed (d.id);
			viewState.hierarchyState.setCollapsed (d.id, isCollapsing);

			// Traverse sub-tree and change each item's number of collapsed parents
			//
			// Set each item's collapsePosition as well
			// collapsePosition is the coordinate where they fade out to or fade in from

			var currentDescendant;
			var descendants = sServObj.getChildren(d.id);
			while (descendants.length > 0) {
				currentDescendant = descendants.pop();
				descendants = descendants.concat(sServObj.getChildren(currentDescendant.id));

				var num = viewState.hierarchyState.getNumCollapsedParents(currentDescendant.id);

				if (isCollapsing) {
					viewState.hierarchyState.setNumCollapsedParents(currentDescendant.id, num + 1);
				} else {
					viewState.hierarchyState.setNumCollapsedParents(currentDescendant.id, num - 1);
				}

				viewState.hierarchyState.setCollapsePosition(currentDescendant.id, [d._x, d._y]);
			}
		};

		sServObj.partialDataLevels = [];
		sServObj.partialDataLinks = [];

		sServObj.rebuildPartialData = function (selectedPath, start, end) {
			if (start === -1) {
				sServObj.partialDataLevels = DataService.getLevelData();
				sServObj.partialDataLinks = DataService.getLinkData();
				return;
			}

			sServObj.partialDataLevels = [];
			sServObj.partialDataLinks = [];

			var i;
			for (i = 0; i < selectedPath.length; ++i) {
				var level = LevelService.getLevelDetails(selectedPath[i]);
				if (level.type === 'EVENT') {
					sServObj.copyEventLevel(level.name, start, end);
				} else if (level.type === 'SEGMENT') {
					sServObj.copySegmentLevel(level.name, start, end);
				} else {
					sServObj.copyItemLevel(level.name, sServObj.partialDataLevels[sServObj.partialDataLevels.length - 1]);
				}
			}
		};

		sServObj.copyEventLevel = function (levelName, start, end) {
			var i;
			var origLevel = LevelService.getLevelDetails(levelName);
			var level = {
				name: origLevel.name,
				type: origLevel.type,
				items: []
			};
			var firstIndex = -1, lastIndex = -1;

			for (i = 0; i < origLevel.items.length; ++i) {
				if (origLevel.items[i].samplePoint >= start) {
					firstIndex = i;
					break;
				}
			}

			for (i = origLevel.items.length - 1; i >= 0; --i) {
				if (origLevel.items[i].samplePoint <= end) {
					lastIndex = i;
					break;
				}
			}

			if (firstIndex !== -1 && lastIndex !== -1) {
				level.items = origLevel.items.slice(firstIndex, lastIndex + 1);
			}

			sServObj.partialDataLevels.push(level);
		};

		sServObj.copySegmentLevel = function (levelName, start, end) {
			var i;
			var origLevel = LevelService.getLevelDetails(levelName);
			var level = {
				name: origLevel.name,
				type: origLevel.type,
				items: []
			};
			var firstIndex = -1, lastIndex = -1;

			for (i = 0; i < origLevel.items.length; ++i) {
				var sampleEnd = origLevel.items[i].sampleStart + origLevel.items[i].sampleDur - 1;

				if (sampleEnd >= start) {
					firstIndex = i;
					break;
				}
			}

			for (i = origLevel.items.length - 1; i >= 0; --i) {
				if (origLevel.items[i].sampleStart <= end) {
					lastIndex = i;
					break;
				}
			}

			if (firstIndex !== -1 && lastIndex !== -1) {
				level.items = origLevel.items.slice(firstIndex, lastIndex + 1);
			}

			sServObj.partialDataLevels.push(level);
		};

		sServObj.copyItemLevel = function (levelName, referenceLevel) {
			var i;
			var origLevel = LevelService.getLevelDetails(levelName);
			var level = {
				name: origLevel.name,
				type: origLevel.type,
				items: []
			};
			var firstParents = null, lastParents = null;

			for (i = 0; i < referenceLevel.items.length; ++i) {
				var parents = sServObj.getParentsOnLevel(referenceLevel.items[i], levelName);
				if (parents.length > 0) {
					firstParents = parents;
					break;
				}
			}

			for (i = referenceLevel.items.length - 1; i >= 0; --i) {
				var parents = sServObj.getParentsOnLevel(referenceLevel.items[i], levelName);
				if (parents.length > 0) {
					lastParents = parents;
					break;
				}
			}

			if (firstParents === null || lastParents === null) {
				sServObj.partialDataLevels.push(level);
				return;
			}

			var firstIndex = -1, lastIndex = -1;
			for (i = 0; i < origLevel.items.length; ++i) {
				if (firstParents.indexOf(origLevel.items[i].id) !== -1) {
					firstIndex = i;
					break;
				}
			}

			for (i = origLevel.items.length - 1; i >= 0; --i) {
				if (lastParents.indexOf(origLevel.items[i].id) !== -1) {
					lastIndex = i;
					break;
				}
			}

			if (firstIndex === -1 || lastIndex === -1) {
				sServObj.partialDataLevels.push(level);
				return;
			}

			level.items = origLevel.items.slice(firstIndex, lastIndex + 1);
			sServObj.partialDataLevels.push(level);
		};

		sServObj.getParentsOnLevel = function (item, parentLevelName) {
			var result = [];
			var links = sServObj.hashMapIDLinks.to[item.id];
			if (links === undefined) {
				return result;
			}
			for (var i = 0; i < links.length; ++i) {
				if (sServObj.hashMapIDLevelName[links[i].link.fromID] === parentLevelName) {
					result.push(links[i].link.fromID);
				}
			}
			return result;
		};

		// basically a copy of LevelService's function, but operating on
		// sServObj.partialDataLevels rather than DataService.levels
		sServObj.getLevelDetails = function (levelName) {
			for (var i = 0; i < sServObj.partialDataLevels.length; ++i) {
				if (sServObj.partialDataLevels[i].name === levelName) {
					return sServObj.partialDataLevels[i];
				}
			}
			return null;
		};

		sServObj.getItemByID = function (id) {
			return sServObj.hashMapIDItem[id];
		};

		sServObj.getLevelName = function (id) {
			if (sServObj.hashMapIDLevelName.hasOwnProperty(id)) {
				return sServObj.hashMapIDLevelName[id];
			} else {
				return null;
			}
		};

		sServObj.idItemMap = {};


		return sServObj;
	});
