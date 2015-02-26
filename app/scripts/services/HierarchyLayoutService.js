'use strict';

/**
 * This service aims to provide functions for laying out the hierarchy of a
 * bundle (ie, calculating the positions of the nodes). The actual drawing is
 * done in a directive, the manipulation of the hierarchy is done in another
 * service.
 *
 * While the DBConfig allows for a complex network of levels, the visualisation
 * is always limited to one straight path of levels. Set this path via the
 * public function setPath(p).
 *
 * A selection menu shall be offered comprising all possible paths through the
 * hierarchy.
 */

angular.module('emuwebApp')
	.service('HierarchyLayoutService', function (ConfigProviderService, LevelService, DataService) {
		// shared service object
		var sServObj = {};

		////////////////////////////////////////////
		// private vars and functions
		var svgGroup;
		var parentsFound;

		//
		/////////////////////

		/////////////////////
		// public API

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
		 * Calculate the position of nodes within a non-item level (ie, one with time information)
		 *
		 * The nodes are positioned at a regular distance to each other.
		 * The first node will be at position -0.5, the last at somewhat
		 * below 0.5.
		 *
		 * It is taken for granted that the order of the nodes within
		 * the array is coherent with the time information.

		sServObj.layoutNonItemLevel = function (name, levelDepth) {
			var nodes = LevelService.getLevelDetails(name).level.items;
			for (var i=0; i<nodes.length; ++i) {
				nodes[i]._posInLevel = i / nodes.length + 0.01 ;//- 0.5;
				nodes[i]._depth = levelDepth;

				// Additionally, calculate link positions
				var links = DataService.getData().links;
				for (var l=0; l<links.length; ++l) {
					if (links[l].toID === nodes[i].id) {
						links[l]._toPosInLevel = nodes[i]._posInLevel;
						links[l]._toDepth = nodes[i]._depth;
					}
				}
			}
		};
		 */
		/**
		 * Calculate the position of nodes within an item level (ie, one without time information)
		 * 
		 * This is done by looking at the position of the first and the
		 * last child of each node and centering the node in-between

		sServObj.layoutItemLevel = function (name, levelDepth) {
			var nodes = LevelService.getLevelDetails(name).level.items;
			for (var i=0; i<nodes.length; ++i) {
				// Find first and last child of nodes[i]
				var children = sServObj.findChildren (nodes[i], selectedPath);
				if (children.length === 0) {
					nodes[i]._posInLevel = null;
				}
				// FIXME if this function was actually used, the following would of course fail if children was an empty array
				var firstChild = children[0];
				var lastChild = children[children.length-1];

				nodes[i]._posInLevel = firstChild._posInLevel + (lastChild._posInLevel - firstChild._posInLevel)/2;
				nodes[i]._depth = levelDepth;
				
				// Additionally, calculate link positions
				var links = DataService.getData().links;
				for (var l=0; l<links.length; ++l) {
					if (links[l].toID === nodes[i].id) {
						links[l]._toPosInLevel = nodes[i]._posInLevel;
						links[l]._toDepth = nodes[i]._depth;
					}
					if (links[l].fromID === nodes[i].id) {
						links[l]._fromPosInLevel = nodes[i]._posInLevel;
						links[l]._fromDepth = nodes[i]._depth;
					}
				}
			}
		};
		 */
		 
		 
		/**
		 * This function aims to find and store the parents of every node
		 */
		sServObj.findParents = function (selectedPath) {
			var i, ii, c;

			if (parentsFound) {
				return;
			} else {
				parentsFound = true;
			}

			/////
			// Iterate throug levels top-down
			for (i = selectedPath.length-1; i>=0; --i) {
				var level = LevelService.getLevelDetails(selectedPath[i]).level;

				// Iterate through the current level's items
				// And save them as _parents in their children
				for (ii = 0; ii<level.items.length; ++ii) {
					var children = sServObj.findChildren(level.items[ii], selectedPath);

					//console.debug('label', level.items[ii].labels[0].value, 'number of children: ', children.length);

					for (c = 0; c < children.length; ++c) {
						if (typeof children[c]._parents === 'undefined') {
							children[c]._parents = [];
						}
						children[c]._parents.push (level.items[ii]);
					}
				}
			}
		};


		/**
		 * Calculate the weights (size within their level) of all nodes bottom-up
		 * This is most likely rather slow and definitely needs tweaking
		 */
		sServObj.calculateWeightsBottomUp = function (selectedPath) {
			var i, ii, iii;

			sServObj.findParents(selectedPath);

			// Iterate through levels bottom-up
			for (i = 0; i < selectedPath.length; ++i) {
				var level = LevelService.getLevelDetails(selectedPath[i]).level;
				level._weight = 0;

				//////
				// Iterate through items to calculate their _weight and the level's _weight
				for (ii = 0; ii < level.items.length; ++ii) {
					var itemWeight = level.items[ii]._weight;
					if (typeof itemWeight === 'undefined') {
						itemWeight = 1;
						level.items[ii]._weight = 1;
					}

					// This would create tidier drawings but depends on knowledge of each node's parents 
					if (typeof level.items[ii]._parents !== 'undefined') {
						//console.debug(level.items[ii]._parents.length);
						/*
						for (iii = 0; iii < level.items[ii]._parents.length; ++iii) {
							level.items[ii]._parents[iii]._weight += itemWeight / level.items[ii]._parents.length;
						}
						*/
					}
					

					level._weight += itemWeight;
				}

				/////
				// Iterate through items again to calculate their _posInLevel and _depth.
				// This is done in a new for loop because it depends on the correctness of level._weight
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

		return sServObj;
	});