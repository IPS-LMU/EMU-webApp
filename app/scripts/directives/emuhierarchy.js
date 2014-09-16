'use strict';


angular.module('emuwebApp')
  .directive('emuhierarchy', function (viewState, LevelService, HierarchyService) {
    return {
      template: '<div class="emuwebapp-hierarchy-container"></div>',
      restrict: 'E',
      scope: {
      	path: '=', // This directive actually never writes back to path
	vertical: '='
      },
      replace: true,
      link: function postLink(scope, element, attrs) {

        //////////////////////
        // watches 

	scope.$watch('path', function (newValue) {
		console.debug('Rendering due to path change: ', newValue);
		scope.render();
	}, false);

	scope.$watch('vertical', function (newValue) {
		console.debug('Rendering due to rotation: ', newValue);
		scope.render();
	}, false);

	scope.$watch('viewState.curLevelAttrDefs', function (newValue) {
		console.debug('Rendering due to attribute change: ', newValue);
		scope.render();
	}, true);

	/*
        // SIC deep watches are really expensive!!!! Should watch something else!!!!!!
        // With the advent of the $watch('path') above, this should have become obsolete
	scope.$watch('LevelService.data', function () {
          scope.render();
        }, true);
	*/

        //
        //////////////////////

	//////////////////////
	// helper functions

	/**
	 * Function to center node when clicked/dropped so node doesn't get lost when
	 * collapsing/moving with large amount of children.
	 */
	scope.centerNode = function (node) {
		var scale = zoomListener.scale();
		var x = -node._x * scale + width/2;
		var y = -node._y * scale + height/2;
		svg.transition()
			.duration(duration)
			.attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
		zoomListener.scale(scale);
		zoomListener.translate([x, y]);
	};
	
	/**
	 * The zoom function is called by the zoom listener, which listens for d3 zoom events and must be appended to the svg element
	 */
	scope.zoom = function () {
			svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"+scope.getOrientatedTransform());
	};

	scope.getOrientatedTransform = function () {
		var transform = 'scale('+zoomListener.scale()+')';
		transform += 'translate('+zoomListener.translate()+')';
		if (scope.vertical) {
			transform += 'scale(-1,1),rotate(90)';
		} else {
			transform += 'rotate(0)';
		}
		return transform;
	};

	scope.getOrientatedNodeTransform = function (d) {
		if (scope.vertical) {
			return 'scale(-1,1)rotate(90)';
		} else {
			return 'scale(1,1)rotate(0)';
		}
	};

	scope.getNodeText = function (d) {
		var level = viewState.getCurAttrDef(HierarchyService.getLevelName(d.id));
		for (var i=0; i<d.labels.length; ++i) {
			if (d.labels[i].name === level) {
				return d.labels[i].value;
			}
		}
		console.debug ("Likely a bug: Did not find the label selected for display", "Selected level:", level, "Node: ", d);
		return "NO VALUE";
	};

	scope.getOrientatedTextAnchor = function (d) {
		if (scope.vertical) {
			return 'middle';
		} else {
			return 'begin';
		}
	}

	scope.getOrientatedNodeX = function (d) {
		if (scope.vertical) {
			return 0;
		} else {
			return 10;
		}
	}

	scope.getOrientatedNodeY = function (d) {
		if (scope.vertical) {
			return '1.45em';
		} else {
			return '0.35em';
		}
	}

	//
	/////////////////////////////


        /////////////////////////////
        // inital d3.js setup stuff

        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          width = parseInt(d3.select(element[0]).style('width'), 10),
          width = width - margin.left - margin.right,
          height = parseInt(d3.select(element[0]).style('height'), 10),
          height = height - margin.top - margin.bottom,
          barHeight = 20,
          percent = d3.format('%'),
	  duration = 750;

	// scaleExtent limits the amount of zooming possible
	var zoomListener = d3.behavior.zoom().scaleExtent([0.5, 10]).on("zoom", scope.zoom);

        // Create the d3 element and position it based on margins
        var svg = d3.select(element[0])
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
	  .style('background-color', 'darkgrey')
	  .call(zoomListener)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	  // Append a group which holds all nodes and which the zoom Listener can act upon.
	  .append('g');

	//
        /////////////////////////////


        /**
         *
         */
        scope.render = function () {
		// Set orientation
		svg.transition()
		  .duration(duration)
		  .attr('transform', scope.getOrientatedTransform()); 

		/////
		// Compute the new tree layout (first nodes and then links)
		//
		var nodes = [];


		// At the moment I have two different approaches to calculating the layout of a hierarchy
		//
		// The first is simpler and is used by first calling layoutNonItemLevel() for the bottom-most level (the one with time information)
		// and then calling layoutItemLevel() for all other levels. Unfortunately, it will in some cases render multiple nodes to the same
		// position (happens when they share the same set of children).
		//
		// The second one looks simpler in this file, because it is completely done in one function. But that function is actually quite
		// complex.
		//
		// It might be desirable to find some sort of collision detection for the first approach (which is commented out below)
		//

		for (var i=0; i<HierarchyService.selectedPath.length; ++i) {
			/////
			// This is the aforementioned second approach
			HierarchyService.calculateWeightsBottomUp();
			//
			/////

			/////
			// This is the aformentioned first approach
			/*
			if (i === 0) {
				HierarchyService.layoutNonItemLevel(HierarchyService.selectedPath[0], HierarchyService.selectedPath.length);
			} else {
				HierarchyService.layoutItemLevel(HierarchyService.selectedPath[i], HierarchyService.selectedPath.length-i);
			}
			*/
			//////

			nodes = nodes.concat(LevelService.getLevelDetails(HierarchyService.selectedPath[i]).level.items);
		}
		



		// Now layout links

		// We must only draw links that are part of the currently selected path.
		// We must therefore filter the links.
		//
		// What follows below is a very low-performance approach to filtering
		var links = [];
		var allLinks = LevelService.getData().links;
		for (var l=0; l<allLinks.length; ++l) {
			for (var i=0; i<HierarchyService.selectedPath.length-1; ++i) {
				var element = LevelService.getElementDetailsById(HierarchyService.selectedPath[i], allLinks[l].toID);
				if (element === null) {
					continue;
				}
				var parentElement = LevelService.getElementDetailsById(HierarchyService.selectedPath[i+1], allLinks[l].fromID);
				if (parentElement !== null) {
					links.push(allLinks[l]);
				}


			}
		}


		// Transform relative coordinates (_posInLevel and _depth) to actual coordinates (_x and _y)
		
		var offsetX = 25;

		var depthToX = function (depth) {
			var size = (scope.vertical) ? height : width;
			return offsetX + depth / scope.path.length * size;
		};

		var posInLevelToY = function (posInLevel) {
			var size = (scope.vertical) ? width : height;
			return posInLevel * size;
		};

		nodes.forEach(function (d) {
			d._x = depthToX(d._depth);
			d._y = posInLevelToY(d._posInLevel);
		});
		links.forEach(function (d) {
			d._fromX = depthToX(d._fromDepth);
			d._fromY = posInLevelToY(d._fromPosInLevel);
			d._toX = depthToX(d._toDepth);
			d._toY = posInLevelToY(d._toPosInLevel);
		});

		// Update the nodes…
		var node = svg.selectAll("g.node")
			.data(nodes, function (d) {
				return d.id;
			});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("g")
			//.call(dragListener)
			.attr("class", "node")
			.attr("transform", function (d) {
				return "translate(" + d._x  + "," + d._y + ")";
			})
			.on('click', function (d) {
				console.debug('Clicked node', d);
				scope.centerNode(d);
			})
			;

		nodeEnter.append("circle")
			.attr('class', 'nodeCircle')
			.attr("r", 0)
			.style("fill", function (d) {
				return d._children ? "lightsteelblue" : "#fff";
			});

		nodeEnter.append("text")
			.attr('class', 'nodeText')
			/*.attr ('x', scope.getOrientatedNodeX )
			.attr ('y', scope.getOrientatedNodeY )
			.attr('text-anchor', scope.getOrientatedTextAnchor )
			.text( scope.getNodeText )
			.attr( 'transform', scope.getOrientatedNodeTransform )*/
			.style("fill-opacity", 1)
			;

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

		node.select('text')
			.attr ('x', scope.getOrientatedNodeX )
			.attr ('y', scope.getOrientatedNodeY )
			.attr('text-anchor', scope.getOrientatedTextAnchor )
			.text( scope.getNodeText )
			.attr('transform', scope.getOrientatedNodeTransform )
			;

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
				return "translate(" + d._x + "," + d._y + ")";
			});

		// Fade the text in
		nodeUpdate.select("text")
			.style("fill-opacity", 1);
		

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
			.duration(duration)
			/*.attr("transform", function (d) {
				return "translate(" + source.y + "," + source.x + ")";
			})*/
			.remove();
		
		nodeExit.select("circle")
			.attr("r", 0);

		nodeExit.select("text")
			.style("fill-opacity", 0);
		
		

		

		// Update the links…
		var link = svg.selectAll("path.link")
			.data(links, function (d) {
				// Form unique link ID
				return 's' + d.fromID + 't' + d.toID;
			});

		// Enter any new links at the parent's previous position.
		link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("d", function (d) {
				return "M"+d._fromX+" "+d._fromY+"L"+d._toX+" "+d._toY;
			})
			;


		// Transition links to their new position.
		link.transition()
			.duration(duration)
			.style("fill-opacity", 1)
			.attr("d", function (d) {
				return "M"+d._fromX+" "+d._fromY+"L"+d._toX+" "+d._toY;
			});
		
		
		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
			.duration(duration)
			/*.attr("d", function (d) {
				var o = {
					x: source.x,
					y: source.y
				};
				return diagonal({
					source: o,
					target: o
				});
			})*/
			.remove();
		
		

		// Stash the old positions for transition.
		nodes.forEach(function (d) {
			d._x0 = d._x;
			d._y0 = d._y;
		});

	};

        /**
         * SIC... not being called
         */
        scope.resizeHierarchy = function () {
          console.log('###############')
          console.log(width)
        };
      }
    };
  });
