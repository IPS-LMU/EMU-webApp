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
		 */
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

		/**
		 * Calculate the position of nodes within an item level (ie, one without time information)
		 * 
		 * This is done by looking at the position of the first and the
		 * last child of each node and centering the node in-between
		 */
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
					}

					if (level.items[ii]._visible === true) {
						itemWeight = 1;
					}

					if (level.items[ii]._visible === false) {
						itemWeight = 0.35;
					}
					
					level.items[ii]._weight = itemWeight;
					
					// This would create tidier drawings but depends on knowledge of each node's parents 
					if (typeof level.items[ii]._parents !== 'undefined') {
						//console.debug(level.items[ii]._parents.length);
						/*
						for (iii = 0; iii < level.items[ii]._parents.length; ++iii) {
							level.items[ii]._parents[iii]._weight += itemWeight / level.items[ii]._parents.length;
						}
						*/
					}
					
					// Calculate weight of the level
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
		 * SIC this should probably be moved to the LevelService as it might
		 * be useful for other parts of the webApp
		 */
		sServObj.getLevelName = function (nodeID) {
			var levelName = null;

			for (var i = 0; i < DataService.getData().levels.length; ++i) {
				for (var ii = 0; ii < DataService.getData().levels[i].items.length; ++ii) {
					if (DataService.getData().levels[i].items[ii].id === nodeID) {
						levelName = DataService.getData().levels[i].name;
						break;
					}
				}
			}

			return levelName;
		}

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
			var currentLevel = sServObj.getLevelName(d.id);
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




/*##########################################
##########################################
##########################################
########  THE REMAINDER IS ONLY LEFT TO ##
########  USE SOME IDEAS – IT IS NEVER  ##
########  CALLED                        ##
##########################################
##########################################
##########################################
*/
		/**
		 * @todo documentation
		 * for the time being: this function is no fun to read because it is based on a d3 example and contains a lot of sub-functions.
		 * you'd better wait until I have polished it to a certain degree.
		 */
		//sServObj.oldDrawHierarchy = function () {
		var foooooooo = function () {
			// Make sure that any private properties that have been added during a previous call of this function are removed
			for (var x = 0; x < DataService.getData().levels.length; ++x) {
				for (var y = 0; y < DataService.getData().levels[x].items.length; ++y) {
					delete DataService.getData().levels[x].items[y]._visited;
					delete DataService.getData().levels[x].items[y]._parents;
					delete DataService.getData().levels[x].items[y]._weight;
				}
			}


			// Calculate total nodes, max label length
			var totalNodes = 0;
			var maxLabelLength = 0;

			// variables for drag/drop
			var selectedNode = null;
			var draggingNode = null;
			// panning variables
			var panSpeed = 200;
			var panBoundary = 20; // Within 20px from edges will pan when dragging.
			// Misc. variables
			var i = 0;

			var tree = d3.layout.myLayout()
				.size([viewerHeight, viewerWidth]);



			tree = tree.children(sServObj.findChildren);

			// define a d3 diagonal projection for use by the node paths later on.
			var diagonal = d3.svg.diagonal()
				.projection(function (d) {
					return [d.y, d.x];
				});

			// A recursive helper function for performing some setup by walking through all nodes

			function visit(parent, visitFn, childrenFn) {
				if (!parent) return;

				visitFn(parent);

				var children = childrenFn(parent);
				if (children) {
					var count = children.length;
					for (var i = 0; i < count; i++) {
						visit(children[i], visitFn, childrenFn);
					}
				}
			}

			// Call visit function to establish maxLabelLength
			/*visit(DataService.getData(), function(d) {
				totalNodes++;
				maxLabelLength = Math.max(d.name.length, maxLabelLength);

			}, function(d) {
				return d.children && d.children.length > 0 ? d.children : null;
			});*/
			maxLabelLength = 15;


			// sort the tree according to the node names

			function sortTree() {
				/*tree.sort(function(a, b) {
					return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
				});*/
			}
			// Sort the tree initially incase the JSON isn't in a sorted order.
			sortTree();

			// TODO: Pan function, can be better implemented.

			function pan(domNode, direction) {
				var speed = panSpeed;
				if (panTimer) {
					clearTimeout(panTimer);
					translateCoords = d3.transform(svgGroup.attr('transform'));
					if (direction == 'left' || direction == 'right') {
						translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
						translateY = translateCoords.translate[1];
					} else if (direction == 'up' || direction == 'down') {
						translateX = translateCoords.translate[0];
						translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
					}
					scaleX = translateCoords.scale[0];
					scaleY = translateCoords.scale[1];
					var scale = zoomListener.scale();
					svgGroup.transition().attr('transform', 'translate(' + translateX + ',' + translateY + ")scale(" + scale + ")");
					d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
					zoomListener.scale(zoomListener.scale());
					zoomListener.translate([translateX, translateY]);
					panTimer = setTimeout(function () {
						pan(domNode, speed, direction);
					}, 50);
				}
			}


			function initiateDrag(d, domNode) {
				draggingNode = d;
				d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
				d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
				d3.select(domNode).attr('class', 'node activeDrag');

				svgGroup.selectAll("g.node").sort(function (a, b) { // select the parent and sort the path's
					if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
					else return -1; // a is the hovered element, bring "a" to the front
				});
				// if nodes has children, remove the links and nodes
				if (nodes.length > 1) {
					// remove link paths
					links = tree.links(nodes);
					nodePaths = svgGroup.selectAll("path.link")
						.data(links, function (d) {
							return d.target.id;
						}).remove();
					// remove child nodes
					nodesExit = svgGroup.selectAll("g.node")
						.data(nodes, function (d) {
							return d.id;
						}).filter(function (d, i) {
							if (d.id == draggingNode.id) {
								return false;
							}
							return true;
						}).remove();
				}

				// remove parent link
				parentLink = tree.links(tree.nodes(draggingNode.parent));
				svgGroup.selectAll('path.link').filter(function (d, i) {
					if (d.target.id == draggingNode.id) {
						return true;
					}
					return false;
				}).remove();

				dragStarted = null;
			}

			// define the baseSvg, attaching a class for styling and the zoomListener
			d3.select("#emuwebapp-tree-container svg").remove();
			var baseSvg = d3.select("#emuwebapp-tree-container").append("svg")
				.attr("width", viewerWidth)
				.attr("height", viewerHeight)
				.attr("class", "overlay")
				.call(zoomListener);


			// Define the drag listeners for drag/drop behaviour of nodes.
			/*var dragListener = d3.behavior.drag()
				.on("dragstart", function(d) {
					if (d == root) {
						return;
					}
					dragStarted = true;
					nodes = tree.nodes(d);
					d3.event.sourceEvent.stopPropagation();
					// it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(sServObj).attr('pointer-events', 'none');
				})
				.on("drag", function(d) {
					if (d == root) {
						return;
					}
					if (dragStarted) {
						domNode = sServObj;
						initiateDrag(d, domNode);
					}

					// get coords of mouseEvent relative to svg container to allow for panning
					relCoords = d3.mouse($('svg').get(0));
					if (relCoords[0] < panBoundary) {
						panTimer = true;
						pan(sServObj, 'left');
					} else if (relCoords[0] > ($('svg').width() - panBoundary)) {

						panTimer = true;
						pan(sServObj, 'right');
					} else if (relCoords[1] < panBoundary) {
						panTimer = true;
						pan(sServObj, 'up');
					} else if (relCoords[1] > ($('svg').height() - panBoundary)) {
						panTimer = true;
						pan(sServObj, 'down');
					} else {
						try {
							clearTimeout(panTimer);
						} catch (e) {

						}
					}

					d.x0 += d3.event.dy;
					d.y0 += d3.event.dx;
					var node = d3.select(sServObj);
					node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
					updateTempConnector();
				}).on("dragend", function(d) {
					if (d == root) {
						return;
					}
					domNode = sServObj;
					if (selectedNode) {
						// now remove the element from the parent, and insert it into the new elements children
						var index = draggingNode.parent.children.indexOf(draggingNode);
						if (index > -1) {
							draggingNode.parent.children.splice(index, 1);
						}
						if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
							if (typeof selectedNode.children !== 'undefined') {
								selectedNode.children.push(draggingNode);
							} else {
								selectedNode._children.push(draggingNode);
							}
						} else {
							selectedNode.children = [];
							selectedNode.children.push(draggingNode);
						}
						// Make sure that the node being added to is expanded so user can see added node is correctly moved
						expand(selectedNode);
						sortTree();
						endDrag();
					} else {
						endDrag();
					}
				});
/*
			function endDrag() {
				selectedNode = null;
				d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
				d3.select(domNode).attr('class', 'node');
				// now restore the mouseover event or we won't be able to drag a 2nd time
				d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
				updateTempConnector();
				if (draggingNode !== null) {
					update(root);
					centerNode(draggingNode);
					draggingNode = null;
				}
			}

			// Helper functions for collapsing and expanding nodes.

			function collapse(d) {
				if (d.children) {
					d._children = d.children;
					d._children.forEach(collapse);
					d.children = null;
				}
			}

			function expand(d) {
				if (d._children) {
					d.children = d._children;
					d.children.forEach(expand);
					d._children = null;
				}
			}

			var overCircle = function(d) {
				selectedNode = d;
				updateTempConnector();
			};
			var outCircle = function(d) {
				selectedNode = null;
				updateTempConnector();
			};

			// Function to update the temporary connector indicating dragging affiliation
			var updateTempConnector = function() {
				var data = [];
				if (draggingNode !== null && selectedNode !== null) {
					// have to flip the source coordinates since we did sServObj for the existing connectors on the original tree
					data = [{
						source: {
							x: selectedNode.y0,
							y: selectedNode.x0
						},
						target: {
							x: draggingNode.y0,
							y: draggingNode.x0
						}
					}];
				}
				var link = svgGroup.selectAll(".templink").data(data);

				link.enter().append("path")
					.attr("class", "templink")
					.attr("d", d3.svg.diagonal())
					.attr('pointer-events', 'none');

				link.attr("d", d3.svg.diagonal());

				link.exit().remove();
			};*/



			// Toggle children function

			function toggleChildren(d) {
				if (d.children) {
					d._children = d.children;
					d.children = null;
				} else if (d._children) {
					d.children = d._children;
					d._children = null;
				}
				return d;
			}

			// Toggle children on click.

			function click(d) {
				if (d3.event.defaultPrevented) return; // click suppressed
				d = toggleChildren(d);
				update(d);
				centerNode(d);
			}

			function update(source) {

				//



				// Compute the new height, function counts total children of root node and sets tree height accordingly.
				// sServObj prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
				// sServObj makes the layout more consistent.
				var levelWidth = [1];
				var childCount = function (level, n) {

					//if (n.children && n.children.length > 0) {
					var children = tree.children()(n);
					if (children && children.length > 0) {
						if (levelWidth.length <= level + 1) levelWidth.push(0);

						levelWidth[level + 1] += children.length;
						children.forEach(function (d) {
							childCount(level + 1, d);
						});
					}
				};
				childCount(0, root);

				var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
				tree = tree.size([newHeight, viewerWidth]);

				// Compute the new tree layout.
				var nodes = tree.nodes(root).reverse(),
					links = tree.links(nodes);

				sServObj.calculateWeightsBottomUp();

				// Set widths between levels based on maxLabelLength.
				nodes.forEach(function (d) {
					d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
					// alternatively to keep a fixed scale one can set a fixed depth per level
					// Normalize for fixed-depth by commenting out below line
					// d.y = (d.depth * 500); //500px per level.

					//console.debug(d);
					//d.x = 20* d._weight / d._levelWeight;
					//level.items[ii].x = 20*  level.items[ii]._weight / level._weight;
				});

				// Update the nodes…
				var node = svgGroup.selectAll("g.node")
					.data(nodes, function (d) {
						return d.id || (d.id = ++i);
					});

				// Enter any new nodes at the parent's previous position.
				var nodeEnter = node.enter().append("g")
					//.call(dragListener)
					.attr("class", "node")
					.attr("transform", function (d) {
						return "translate(" + source.y0 + "," + source.x0 + ")";
					})
					.on('click', click);

				nodeEnter.append("circle")
					.attr('class', 'nodeCircle')
					.attr("r", 0)
					.style("fill", function (d) {
						return d._children ? "lightsteelblue" : "#fff";
					});

				nodeEnter.append("text")
					.attr("x", function (d) {
						return d.children || d._children ? -10 : 10;
					})
					.attr("dy", ".35em")
					.attr('class', 'nodeText')
					.attr("text-anchor", function (d) {
						return d.children || d._children ? "end" : "start";
					})
					.text(function (d) {
						var text = d.labels[0].value;
						for (var i = 1; i < d.labels.length; ++i) {
							text += ' / ' + d.labels[i].name + ': ' + d.labels[i].value;
						}
						return text;
					})
					.style("fill-opacity", 0);

				// phantom node to give us mouseover in a radius around it
				nodeEnter.append("circle")
					.attr('class', 'ghostCircle')
					.attr("r", 30)
					.attr("opacity", 0.2) // change sServObj to zero to hide the target area
				.style("fill", "red")
					.attr('pointer-events', 'mouseover')
					.on("mouseover", function (node) {
						overCircle(node);
					})
					.on("mouseout", function (node) {
						outCircle(node);
					});

				// Update the text to reflect whether node has children or not.
				node.select('text')
					.attr('transform', function (d) {
						if (rotated) {
							return 'scale(1, -1)'; // SIC SIC SIC ... not working
						} else {
							return 'scale(1, 1)';
						}
					})
					.attr("x", 10)
					.attr("text-anchor", "start")
					.text(function (d) {
						var text = d.labels[0].value;
						for (var i = 1; i < d.labels.length; ++i) {
							text += ' / ' + d.labels[i].name + ': ' + d.labels[i].value;
						}
						return text;
					});

				// Change the circle fill depending on whether it has children and is collapsed
				node.select("circle.nodeCircle")
					.attr("r", 4.5)
					.style("fill", function (d) {
						return d._children ? "lightsteelblue" : "#fff";
					});

				// Transition nodes to their new position.
				var nodeUpdate = node.transition()
					.duration(duration)
					.attr("transform", function (d) {
						return "translate(" + d.y + "," + d.x + ")";
					});

				// Fade the text in
				nodeUpdate.select("text")
					.style("fill-opacity", 1);

				// Transition exiting nodes to the parent's new position.
				var nodeExit = node.exit().transition()
					.duration(duration)
					.attr("transform", function (d) {
						return "translate(" + source.y + "," + source.x + ")";
					})
					.remove();

				nodeExit.select("circle")
					.attr("r", 0);

				nodeExit.select("text")
					.style("fill-opacity", 0);

				// Update the links…
				var link = svgGroup.selectAll("path.link")
					.data(links, function (d) {
						//return d.target.id;
						return 's' + d.source.id + 't' + d.target.id;
					});

				// Enter any new links at the parent's previous position.
				link.enter().insert("path", "g")
					.attr("class", "link")
					.attr("d", function (d) {
						var o = {
							x: source.x0,
							y: source.y0
						};
						return diagonal({
							source: o,
							target: o
						});
					});

				// Transition links to their new position.
				link.transition()
					.duration(duration)
					.attr("d", diagonal);

				// Transition exiting nodes to the parent's new position.
				link.exit().transition()
					.duration(duration)
					.attr("d", function (d) {
						var o = {
							x: source.x,
							y: source.y
						};
						return diagonal({
							source: o,
							target: o
						});
					})
					.remove();

				// Stash the old positions for transition.
				nodes.forEach(function (d) {
					d.x0 = d.x;
					d.y0 = d.y;
				});

				// check for rotation if so rotate
				if (rotated) {
					// svgGroup.attr("transform", "rotate(90)");
					
				}
			}

			// Append a group which holds all nodes and which the zoom Listener can act upon.
			svgGroup = baseSvg.append("g");

			// Define the root
			// I presume that the root level of the currently selected path only has one item,
			// which will be defined as the hierarchy's root item
			root = LevelService.getLevelDetails(selectedPath[selectedPath.length - 1]).level.items[0];
			//root = DataService.getData().levels[0].items[0];
			root.x0 = viewerHeight / 2;
			root.y0 = 0;

			// Layout the tree initially and center on the root node.
			update(root);
			centerNode(root);


		};

	

