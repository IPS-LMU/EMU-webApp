'use strict';


angular.module('emuwebApp')
  .directive('emuhierarchy', function (viewState, HistoryService, DataService, LevelService, HierarchyLayoutService, Soundhandlerservice, ConfigProviderService) {
    return {
      template: '<div class="emuwebapp-hierarchy-container"></div>',
      restrict: 'E',
      scope: {
      	path: '=', // This directive actually never writes back to path
	vertical: '=',
	playing: '='
      },
      replace: true,
      link: function postLink(scope, element, attrs) {

        //////////////////////
	// private variables

	scope.selectedItem;
	scope.selectedLink;
	scope.newLinkSrc;
	scope.offsetX = 25;
	scope.offsetY = 30;
	scope.vertOffsetX = 150;
	scope.vertOffsetY = 25;



	//
	//////////////////////

        //////////////////////
        // watches 

	scope.cLAD = viewState.curLevelAttrDefs;
	scope.hierarchyState = viewState.hierarchyState;
	scope.historyService = HistoryService;

	scope.$watch('path', function (newValue) {
		console.debug('Rendering due to path change: ', newValue);
		scope.hierarchyState.path = newValue;
		scope.hierarchyState.newLinkFromID = undefined;
		scope.render();
	}, false);

	scope.$watch('vertical', function (newValue) {
		console.debug('Rendering due to rotation: ', newValue);
		scope.render();
	}, false);

	scope.$watch('cLAD', function (newValue) {
		console.debug('Rendering due to attribute change: ', newValue);
		scope.render();
	}, true);

	scope.$watch('playing', function (newValue) {
		console.debug('Play() triggered', newValue, scope.selectedItem);
		if (typeof scope.selectedItem !== 'undefined' && newValue !== 0) {
			scope.play(scope.selectedItem);
		}
	}, true);

	scope.$watch('hierarchyState.playing', function (newValue) {
		console.debug('Play() triggered by viewState', newValue);
		if (typeof scope.selectedItem !== 'undefined' && newValue !== 0) {
			scope.play(scope.selectedItem);
		}

	}, false);

	scope.$watch('historyService.movesAwayFromLastSave', function () {
		console.debug('history service is active, rendering');
		scope.render();
	}, false);

	scope.$watch('hierarchyState.newLinkFromID', function (newValue) {
		scope.newLinkSrc = LevelService.getItemByID(newValue);
		scope.render();
	}, false);

        //
        //////////////////////

	//////////////////////
	// helper functions


	/**
	 *
	 */
	scope.selectItem = function (item) {
		scope.selectedItem = item;
		viewState.hierarchyState.selectedItemID = item.id;
	};

	scope.selectLink = function (link) {
		scope.selectedLink = link;
		viewState.hierarchyState.selectedLinkFromID = link.fromID;
		viewState.hierarchyState.selectedLinkToID = link.toID;
	};

	/**
	 * Function to center node when clicked/dropped so node doesn't get lost when
	 * collapsing/moving with large amount of children.
	 */
	scope.centerNode = function (node) {
		var x = -node._x + scope.width/2;
		var y = -node._y  + scope.height/2;
		svg.transition()
			.duration(scope.duration)
			.attr('transform', scope.getOrientatedTransform()+'translate(' + x + ',' + y + ')');
		zoomListener.translate([x, y]);
	};
	
	/**
	 * The zoom function is called by the zoom listener, which listens for d3 zoom events and must be appended to the svg element
	 */
	scope.zoom = function () {
		svg.attr('transform', scope.getOrientatedTransform());

		captionLayer.attr('transform', scope.getOrientatedLevelCaptionLayerTransform);
		captionLayer.selectAll('g.emuhierarchy-levelcaption').attr('transform', scope.getOrientatedLevelCaptionTransform);
	};

	scope.getOrientatedTransform = function () {
		var transform = 'translate('+zoomListener.translate()+')';
		transform += 'scale('+zoomListener.scale()+')';
		if (scope.vertical) {
			transform += 'scale(-1,1),rotate(90)';
		} else {
			transform += 'rotate(0)';
		}
		return transform;
	};

	scope.getOrientatedNodeTransform = function (d) {
		// Parameter d is never used because this is independent from the node's position

		if (scope.vertical) {
			return 'scale(-1,1)rotate(90)';
		} else {
			return 'scale(1,1)rotate(0)';
		}
	};

	scope.getNodeText = function (d) {
		var level = viewState.getCurAttrDef(LevelService.getLevelNameByElementID(d.id));
		for (var i=0; i<d.labels.length; ++i) {
			if (d.labels[i].name === level) {
				return d.labels[i].value;
			}
		}
		console.debug ('Likely a bug: Did not find the label selected for display', 'Selected level:', level, 'Node: ', d);
		return 'NO VALUE';
	};

	scope.getOrientatedTextAnchor = function (d) {
		if (scope.vertical) {
			return 'middle';
		} else {
			return 'begin';
		}
	};

	scope.getOrientatedTextX = function (d) {
		if (scope.vertical) {
			return 0;
		} else {
			return 10;
		}
	};

	scope.getOrientatedTextY = function (d) {
		if (scope.vertical) {
			return '1.45em';
		} else {
			return '0.35em';
		}
	};

	scope.getOrientatedLevelCaptionLayerTransform = function (d) {
		if (scope.vertical) {
			return 'translate(0, '+zoomListener.translate()[1]+')';
		} else {
			return 'translate('+zoomListener.translate()[0]+',0)';
		}
	};

	scope.getOrientatedLevelCaptionTransform = function (d) {
		var revArr = angular.copy(scope.path).reverse();
		if (scope.vertical) {
			return 'translate(25, '+scope.depthToX(revArr.indexOf(d))*zoomListener.scale()+')';
		} else {
			return 'translate('+scope.depthToX(revArr.indexOf(d))*zoomListener.scale()+', 20)';
		}
	};

	scope.getOrientatedAddItemButtonTransform = function (d) {
		if (scope.vertical) {
			return 'translate(-12, -5)';
		} else {
			return 'translate(-12, -5)';
		}
	};

	scope.getOrientatedMousePosition = function (mouse) {
		if (scope.vertical) {
			return [
				( mouse[1] - zoomListener.translate()[1] ) / zoomListener.scale(),
				( mouse[0] - zoomListener.translate()[0] ) / zoomListener.scale()
			];
		} else {
			return [
				( mouse[0] - zoomListener.translate()[0] ) / zoomListener.scale(),
				( mouse[1] - zoomListener.translate()[1] ) / zoomListener.scale()
			];
		}
	};


	scope.getPath = function (d) {
		var controlX = d._fromX;
		var controlY = d._toY;

		return 'M'+d._fromX+' '+d._fromY+'Q'+controlX+' '+controlY+' '+d._toX+' '+d._toY;
	};

	/**
	 * Calculate the path for the dashed preview link that is shown when
	 * trying to add a new link.
	 */
	scope.getPreviewPath = function () {
		var from = { x: scope.newLinkSrc._x, y: scope.newLinkSrc._y };
		var to = { x: scope.selectedItem._x, y: scope.selectedItem._y };
		
		return 'M'+from.x+' '+from.y+'Q'+from.x+' '+to.y+' '+to.x+' '+to.y;
	};

	/**
	 * Return a color depending on the validity of the link the user is
	 * trying to create.
	 *
	 * If the link is invalid, this function will try reversing the link.
	 */
	scope.getPreviewColor = function () {
		var validity = LevelService.checkLinkValidity(scope.path, scope.newLinkSrc.id, scope.selectedItem.id);

		if (validity.valid) {
			return 'green';
		} else {
			if (validity.reason === 3) {
				validity = LevelService.checkLinkValidity(scope.path, scope.selectedItem.id, scope.newLinkSrc.id);
				if (validity.valid) {
					return 'green';
				}
			}
			return 'red';
		}
	};

	scope.svgOnMouseMove = function (d) {
		if (scope.newLinkSrc !== undefined) {
			var mouse = scope.getOrientatedMousePosition(d3.mouse(this));
			var x = mouse[0];
			var y = mouse[1];

			svg.select('path.emuhierarchy-newlink')
				.attr('d', 'M'+scope.newLinkSrc._x+','+scope.newLinkSrc._y+' L'+x+','+y)
				;
		}
	};
	
	scope.nodeOnClick = function (d) {
		console.debug('Clicked node', d);
		//scope.centerNode(d);

		// (De-)Collapse sub-tree
		var isCollapsing;
		if (typeof d._collapsed === 'undefined' || d._collapsed === false) {
			isCollapsing = true;
		} else if (d._collapsed === true) {
			isCollapsing = false;
		} else {
			console.debug ('Likely a bug: the following node appears to be neither collapsed nor uncollapsed:', d);
		}
		d._collapsed = isCollapsing;
		
		var currentDescendant;
		var descendants = HierarchyLayoutService.findChildren(d, scope.path);
		while (descendants.length > 0) {
			currentDescendant = descendants.pop();
			descendants = descendants.concat(HierarchyLayoutService.findChildren(currentDescendant, scope.path));

			if (isCollapsing) {
				if (typeof currentDescendant._collapsedParents === 'undefined') {
					currentDescendant._collapsedParents = 1;
				} else {
					currentDescendant._collapsedParents += 1;
				}
			} else {
				currentDescendant._collapsedParents -= 1;
			}

			currentDescendant._collapsePosition = [d._x, d._y];
		}

		scope.render();
	};

	scope.nodeOnRightClick = function (d) {
		scope.play(d);
	};
	
	scope.nodeOnMouseOver = function (d) {
		scope.selectItem(d);
		scope.renderSelectionOnly();
	};

	scope.linkOnMouseOver = function (d) {
		scope.selectLink(d);
		scope.renderSelectionOnly();
	};

	scope.addButtonOnClick = function (d) {
		LevelService.pushNewItem (d);
		scope.render();
	};
		

	scope.play = function (d) {
		var timeInfoLevel = scope.path[0];
		if (typeof timeInfoLevel === 'undefined') {
			console.debug('Likely a bug: There is no path selection. Not executing play():', d);
			return;
		}
		var timeInfoType = LevelService.getLevelDetails(timeInfoLevel).level.type;

		var firstTimeItem = null;
		var lastTimeItem = null;

		var itemList = [d];
		var currentItem;
		while (itemList.length > 0) {
			currentItem = itemList.pop();
			if (currentItem.labels[0].name === timeInfoLevel) {
				if (lastTimeItem === null) {
					lastTimeItem = currentItem;
				}
				
				firstTimeItem = currentItem;
			}
			itemList = itemList.concat(HierarchyLayoutService.findChildren(currentItem, scope.path));
		}

		console.debug('Node info for playback: ', timeInfoType, d, firstTimeItem, lastTimeItem);

		if (firstTimeItem === null) {
			console.debug('No time information found for node, aborting playback', d);
			return;
		}

		var startSample = 0;
		var endSample = 0;
		if (timeInfoType === 'EVENT') {
			startSample = firstTimeItem.samplePoint;
			endSample = lastTimeItem.samplePoint;
		} else if (timeInfoType === 'SEGMENT') {
			startSample = firstTimeItem.sampleStart;
			endSample = lastTimeItem.sampleStart + lastTimeItem.sampleDur;
		}

		console.debug('Sample information for playback:', startSample, endSample);
		Soundhandlerservice.playFromTo(startSample, endSample);
	};

	scope.depthToX = function (depth) {
		var size = (scope.vertical) ? scope.height : scope.width;
		var offset = (scope.vertical) ? scope.vertOffsetY : scope.offsetX;
		return offset + depth / scope.path.length * size;
	};

	scope.posInLevelToY = function (posInLevel) {
		var size = (scope.vertical) ? scope.width : scope.height;
		var offset = (scope.vertical) ? scope.vertOffsetX : scope.offsetY;
		size -= offset;
		return offset + posInLevel * size;
	};

	//
	/////////////////////////////


        /////////////////////////////
        // inital d3.js setup stuff

	scope.element = element;
	scope.width = 0;
	scope.height = 0;
	scope.duration = 750;


	// scaleExtent limits the amount of zooming possible
	var zoomListener = d3.behavior.zoom().scaleExtent([0.5, 10]).on('zoom', scope.zoom);

        // Create the d3 element and position it based on margins
        var svg = d3.select(element[0])
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
	  .style('background-color', ConfigProviderService.vals.colors.levelColor)
	  .call(zoomListener)
	  .on('dblclick.zoom', null)
	  .on('mousemove', scope.svgOnMouseMove)
          .append('g')
	  ;

	// Append a group which holds all overlay captions and which do not react to zooming
	var captionLayer = svg.append('g').style('z-index', 5);

	// Append a group which holds all nodes and which the zoom Listener can act upon.
	svg = svg.append('g').style('z-index', 1);

	scope.element = element;

	//
        /////////////////////////////

	scope.renderSelectionOnly = function() {
		// Change the circle fill of all nodes depending on whether they are selected
		svg.selectAll('circle.emuhierarchy-nodeCircle')
			.style('fill', function(d) {
				var color = ConfigProviderService.vals.colors.nodeColor;

				if (typeof scope.selectedItem !== 'undefined' && d.id === scope.selectedItem.id) {
					color = ConfigProviderService.vals.colors.selectedNodeColor;
				}

				return color;
			})
			;

		svg.selectAll('path.emuhierarchy-link')
			.style('stroke', function(d) {
				if (scope.selectedLink === d) {
					return ConfigProviderService.vals.colors.selectedLinkColor;
				} else {
					return ConfigProviderService.vals.colors.linkColor;
				}
			})
			;

		svg.select('.emuhierarchy-newlinkpreview')
			.attr('d', scope.getPreviewPath)
			.style('stroke', scope.getPreviewColor)
			;
	};


        /**
         *
         */
        scope.render = function () {
		var i;

		////
		// Get current width and height of SVG
		scope.width = parseInt(d3.select(scope.element[0]).style('width'), 10);
		scope.height = parseInt(d3.select(scope.element[0]).style('height'), 10);

		// Set orientation
		svg.transition()
		  .duration(scope.duration)
		  .attr('transform', scope.getOrientatedTransform()); 

		/////////
		// Draw level captions and time arrow
		captionLayer.attr('transform', scope.getOrientatedLevelCaptionLayerTransform);

		var levelCaptionSet = captionLayer.selectAll('g.emuhierarchy-levelcaption')
			.data(scope.path, function (d) { return d; });

		var newLevelCaptions = levelCaptionSet.enter();
		var oldLevelCaptions = levelCaptionSet.exit();

		newLevelCaptions = newLevelCaptions.append('g')
			.attr('class', 'emuhierarchy-levelcaption')
			;

		newLevelCaptions
			.append('text').text( function (d) {
				return d;
			})
			;

		var addItemButtons = newLevelCaptions
			.append('g')
			.attr('class', 'emuhierarchy-addbutton')
			.attr('transform', scope.getOrientatedAddItemButtonTransform)
			.on('click', scope.addButtonOnClick)
			;

		addItemButtons
			.append('circle')
			.style('fill', ConfigProviderService.vals.colors.addItemButtonBG)
			.attr('r', 8)
			;
		
		addItemButtons
			.append('path')
			.style('stroke', ConfigProviderService.vals.colors.addItemButtonFG)
			.attr('d', 'M0,-6 V6 M-6,0 H6')
			;
		
		levelCaptionSet
			.attr('transform', scope.getOrientatedLevelCaptionTransform)
			;
		
		oldLevelCaptions = oldLevelCaptions.transition()
			.duration(scope.duration)
			.remove()
			;

		oldLevelCaptions.select('text')
			.style('fill-opacity', 0)
			;

		//
		////////

		/////
		// Compute the new tree layout (first nodes and then links)
		//
		var nodes = [];
		HierarchyLayoutService.calculateWeightsBottomUp(scope.path);

		for (var i=0; i<scope.path.length; ++i) {
			// Add all nodes that are not collapsed
			var levelItems = LevelService.getLevelDetails(scope.path[i]).level.items;
			for (var ii=0; ii<levelItems.length; ++ii) {
				if (levelItems[ii]._visible) {
					nodes.push(levelItems[ii]);
				}
			}
		}
		



		// Now layout links
		//
		// We must only draw links that are part of the currently selected path.
		// We must therefore filter the links.
		//
		// We must also filter out links that are collapsed
		//
		// What follows below is a probably very low-performance approach to filtering
		//
		var links = [];
		var allLinks = DataService.getData().links;
		for (var l=0; l<allLinks.length; ++l) {
			for (var i=0; i<scope.path.length-1; ++i) {
				var element = LevelService.getItemFromLevelById(scope.path[i], allLinks[l].toID);
				var parentElement = LevelService.getItemFromLevelById(scope.path[i+1], allLinks[l].fromID);
				
				if (element === null) {
					continue;
				}
				if (parentElement === null) {
					continue;
				}
				if (!element._visible)
					continue;
				if (parentElement._collapsed || !parentElement._visible)
					continue;
				
				links.push(allLinks[l]);
			}
		}


		// Transform relative coordinates (_posInLevel and _depth) to actual coordinates (_x and _y)
		

		nodes.forEach(function (d) {
			d._x = scope.depthToX(d._depth);
			d._y = scope.posInLevelToY(d._posInLevel);
		});
		links.forEach(function (d) {
			d._fromX = scope.depthToX(d._fromDepth);
			d._fromY = scope.posInLevelToY(d._fromPosInLevel);
			d._toX = scope.depthToX(d._toDepth);
			d._toY = scope.posInLevelToY(d._toPosInLevel);
		});




		
		//////
		// Now that all actual coordinates have been calculated, we
		// update our SVG using d3js data joins
		//
		// For an introduction to the concept see
		// http://bost.ocks.org/mike/join/
		//

		//
		// Define the data set to be visualised

		var dataSet = svg.selectAll('g.emuhierarchy-node')
			.data(nodes, function (d) {
				return d.id;
			});

		var newNodes = dataSet.enter();
		var oldNodes = dataSet.exit();

		//
		// Add nodes that were previously not part of the svg.
		//
		// Any node will consist of an svg group ("g"), a circle, a
		// text and a second, invisible circle for mouseover handling.
		//
		// Note that properties that can be changed after the node is 
		// added will be set further below
		

		newNodes = newNodes.append('g')		// append() will return a set of all appended elements
			.attr('class', 'emuhierarchy-node')

			// event handlers
			//.call(dragListener)
			.attr('pointer-events', 'mouseover')
			.on('click', scope.nodeOnClick)
			//.on('dblclick', scope.nodeOnRightClick)
			.on('mouseover', scope.nodeOnMouseOver)
			.on('contextmenu', scope.play)
			;

		newNodes.append('circle')
			.attr('class', 'emuhierarchy-nodeCircle')
			.style('stroke', ConfigProviderService.vals.colors.nodeStrokeColor)

			// Make circle invisible at first
			.attr('r', 0)

			// And then transition it to its normal size
			.transition()
			.duration(scope.duration)
			.attr('r', 4.5)
			;

		newNodes.append('text')
			.attr('class', 'emuhierarchy-nodeText')
			;

		// Make sure that nodes that appear due to their ancestry being uncollapsed do not fly in from the origin
		// (as do all other nodes)
		newNodes.attr('transform', function (d) {
			if (typeof d._collapsePosition !== 'undefined') {
				var x = d._collapsePosition[0];
				var y = d._collapsePosition[1];
				delete d._collapsePosition;
				return 'translate(' + x + ',' + y + ')' + scope.getOrientatedNodeTransform();
			}
		});


		/*

		// phantom node to give us mouseover in a radius around it
		newNodes.append('circle')
			.attr('class', 'emuhierarchy-ghostCircle')
			.attr('r', 30)
			.attr('opacity', 0.2) // change this to zero to hide the target area
			.style('fill', 'red')
			.attr('pointer-events', 'mouseover')
			.on('mouseover', function (node) {
				console.debug(node);
				overCircle(node);
			})
			.on('mouseout', function (node) {
				outCircle(node);
			});

		*/
		
		//
		// Remove nodes that shall no longer be part of the svg

		// Transition exiting nodes to the origin
		oldNodes = oldNodes.transition()
			.duration(scope.duration)
			.attr('transform', function (d) {
				if (d._collapsePosition) {
					var x = d._collapsePosition[0];
					var y = d._collapsePosition[1];
					delete d._collapsePosition;
					return 'translate(' + x + ',' + y + ')';
				} else {
					return 'translate(' + 0 + ',' + 0 + ')';
				}
			})
			.remove();
		
		oldNodes.select('text')
			.style('fill-opacity', 0);

		//
		// Set or update properties that are subject to change after
		// the node is added.

		dataSet.select('text')
			.attr ('x', scope.getOrientatedTextX )
			.attr ('y', scope.getOrientatedTextY )
			.attr('text-anchor', scope.getOrientatedTextAnchor )
			.attr('transform', scope.getOrientatedTextTransform )
			.text( scope.getNodeText )
			;

		// Change the circle fill depending on whether it is collapsed and/or selected
		dataSet.select('circle.emuhierarchy-nodeCircle')
			// Highlight selected item
			.style('fill', function(d) {
				var color = ConfigProviderService.vals.colors.nodeColor;

				if (typeof scope.selectedItem !== 'undefined' && d.id === scope.selectedItem.id) {
					color = ConfigProviderService.vals.colors.selectedNodeColor;
				}

				return color;
			})
			// Highlight collapsed items
			.style('stroke', function(d) {
				if (d._collapsed) {
					return ConfigProviderService.vals.colors.collapsedNodeColor;
				} else {
					return ConfigProviderService.vals.colors.nodeStrokeColor;
				}
			})
			;

		// Transition nodes to their new position

		dataSet.transition()
			.duration(scope.duration)
			.attr('transform', function (d) {
				return 'translate(' + d._x + ',' + d._y + ')'+scope.getOrientatedNodeTransform();
			});



		//
		//
		// Now we turn to visualising links
		var linkSet = svg.selectAll('.emuhierarchy-linkgroup')
			.data(links, function (d) {
				// Form unique link ID
				return 's' + d.fromID + 't' + d.toID;
			});

		var newLinks = linkSet.enter();
		var oldLinks = linkSet.exit();

		// The new link's paths are inserted within the svg element
		// that linkSet was generated from.
		// They must be inserted at the beginning (before the nodes,
		// which have already been appended), because there is no CSS
		// z-index for SVG.
		// So the order of insertion is the only way to make sure that
		// the lines are painted under the nodes.
		newLinks = newLinks
			.insert('g', ':first-child')
			.attr('class', 'emuhierarchy-linkgroup')
			;

		// Append thicker ghost lines for better mouseover
		newLinks
			.append('path')
			.attr('class', 'emuhierarchy-ghostlink')
			.on('mouseover', scope.linkOnMouseOver)
			;

		newLinks
			.append('path')
			.attr('class', 'emuhierarchy-link')
			.style('opacity', 0)
			.transition()
			.duration(scope.duration)
			.style('opacity', 1)
			;
			

		// Remove old links
		oldLinks
			.transition()
			.duration(scope.duration)
			.style('opacity', 0)
			.remove()
			;

		// Set color depending on whether the link is selected
		linkSet
			.selectAll('.emuhierarchy-link')
			.style('stroke', function(d) {
				if (scope.selectedLink === d) {
					return ConfigProviderService.vals.colors.selectedLinkColor;
				} else {
					return ConfigProviderService.vals.colors.linkColor;
				}
			})
			;
		
		// Transition links to their new position.
		linkSet
			.selectAll('.emuhierarchy-link')
			.transition()
			.duration(scope.duration)
			.attr('d', scope.getPath )
			.style('opacity', 1)
			;
		linkSet
			.selectAll('.emuhierarchy-ghostlink')
			.attr('d', scope.getPath)
			;
		

		// If the user is trying to add a new link,
		// visualise what he's doing
		svg.selectAll('.emuhierarchy-newlink').remove();
		svg.selectAll('.emuhierarchy-newlinkpreview').remove();

		if (scope.newLinkSrc !== undefined) {
			svg.append('path')
				.attr('class', 'emuhierarchy-newlink')
				.style('stroke', 'black')
				;

			svg.append('path')
				.attr('class', 'emuhierarchy-newlinkpreview')
				.attr('d', scope.getPreviewPath)
				.style('stroke', scope.getPreviewColor)
				;
		}
		
	};

        /**
         * SIC... not being called
         */
        scope.resizeHierarchy = function () {
          console.log('###############')
          console.log(scope.width)
        };
      }
    };
  });
