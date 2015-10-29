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
	.service('HierarchyLayoutService', function (viewState, ConfigProviderService, LevelService, DataService) {
		// shared service object
		var sServObj = {};

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

			/////
			// Make sure all items have proper _parents and
			// _visibile attributes
			sServObj.findParents(selectedPath);
			sServObj.findVisibility(selectedPath);

			/////
			// Iterate through levels bottom-up
			for (i = 0; i < selectedPath.length; ++i) {
				var level = LevelService.getLevelDetails(selectedPath[i]);

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
					level.items[ii]._posInLevel = (posInLevel + level.items[ii]._weight/2) / level._weight;
					posInLevel += level.items[ii]._weight;
					level.items[ii]._depth = selectedPath.length - i - 1;

					//////
					// Additionally, calculate link positions
					var links = DataService.getData().links;
					for (var l=0; l<links.length; ++l) {
						if (links[l].toID === level.items[ii].id) {
							links[l]._toPosInLevel = level.items[ii]._posInLevel;
							links[l]._toDepth = level.items[ii]._depth;
						}
						if (links[l].fromID === level.items[ii].id) {
							links[l]._fromPosInLevel = level.items[ii]._posInLevel;
							links[l]._fromDepth = level.items[ii]._depth;
						}
					}
				}
			}
		};

		/**
		 * Find all children of a node d that are part of the currently selected
		 * path through the hierarchy
		 *
		 * @return an array of children nodes
		 * @return empty array if there are no children (previously would return null due to a d3 dependency that no longer exists)
		 */
		sServObj.findChildren = function (d, selectedPath) {
			var children = [];

			// Find the level that d is a part of
			// Return empty array if that fails (which shouldn't happen at all)
			var currentLevel = LevelService.getLevelName(d.id);
			if (currentLevel === null) {
				console.log('Likely a bug: failed to find a node\'s level', d)
				return [];
			}

			// Find the child level
			var childLevel = null;
			for (var i = 0; i < selectedPath.length - 1; ++i) {
				if (selectedPath[i + 1] === currentLevel) {
					childLevel = selectedPath[i];
					break;
				}
			}
			if (childLevel === null) {
				return [];
			}

			// Iterate over links to find children
			for (var li = 0; li < DataService.getData().links.length; ++li) {
				if (DataService.getData().links[li].fromID === d.id) {
					// Iterate over levels to find the object corresponding to d.id
					for (var l = 0; l < DataService.getData().levels.length; ++l) {
						if (DataService.getData().levels[l].name !== childLevel) {
							continue;
						}

						for (var it = 0; it < DataService.getData().levels[l].items.length; ++it) {
							if (DataService.getData().levels[l].items[it].id === DataService.getData().links[li].toID) {
								children.push(DataService.getData().levels[l].items[it]);
							}
						}
					}
				}
			}

			return children;
		}


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
			var level;
			for (i = 0; i < selectedPath.length; ++i) {
				level = LevelService.getLevelDetails(selectedPath[i]);

				for (ii=0; ii < level.items.length; ++ii) {
					level.items[ii]._parents = [];
				}
			}


			/////
			// Iterate through levels
			for (i = 0; i < selectedPath.length; ++i) {
				level = LevelService.getLevelDetails(selectedPath[i]);

				// Iterate through the current level's items
				// And save them as _parents in their children
				for (ii = 0; ii < level.items.length; ++ii) {
					var children = sServObj.findChildren(level.items[ii], selectedPath);

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

				var level;
				for (var i=0; i < selectedPath.length; ++i) {
					level = LevelService.getLevelDetails(selectedPath[i]);

					for (var ii=0; ii < level.items.length; ++ii) {
						if (level.items[ii]._parents.length === 0) {
							rootLevelItems.push(level.items[ii]);
						}
					}
				}


				// First, set all nodes invisible. Later we will search
				// all paths and if we find one uncollasped path to a
				// node, that node will be set visible.

				var currentItem;
				var items = [];
				items = items.concat(rootLevelItems);

				while (items.length > 0) {
					currentItem = items.pop();
					items = items.concat(sServObj.findChildren(currentItem, selectedPath));
					currentItem._visible = false;
				}

				// Now all nodes on the selectedPath have been set
				// invisible. Try and find those that must be visible,
				// i.e. either they are a root node or there is an
				// uncollapsed path to them from a root node.

				items = [];
				items = items.concat(rootLevelItems);

				while (items.length > 0) {
					currentItem = items.pop();
					if (! viewState.getCollapsed(currentItem.id)) {
						items = items.concat(sServObj.findChildren(currentItem, selectedPath));
					}

					currentItem._visible = true;
				}
			}
		};

		/**
		 * Toggle the state of a single item with its subtree
		 */
		sServObj.toggleCollapse = function (d, selectedPath) {

			// Find out whether we're collapsing or decollapsing
			var isCollapsing = !viewState.getCollapsed (d.id);
			viewState.setCollapsed (d.id, isCollapsing);

			// Traverse sub-tree and change each item's number of collapsed parents
			//
			// Set each item's collapsePosition as well
			// collapsePosition is the coordinate where they fade out to or fade in from

			var currentDescendant;
			var descendants = sServObj.findChildren(d, selectedPath);
			while (descendants.length > 0) {
				currentDescendant = descendants.pop();
				descendants = descendants.concat(sServObj.findChildren(currentDescendant, selectedPath));

				var num = viewState.getNumCollapsedParents(currentDescendant.id);

				if (isCollapsing) {
					viewState.setNumCollapsedParents(currentDescendant.id, num + 1);
				} else {
					viewState.setNumCollapsedParents(currentDescendant.id, num - 1);
				}

				viewState.setCollapsePosition(currentDescendant.id, [d._x, d._y]);
			}
		}

		return sServObj;
	});
