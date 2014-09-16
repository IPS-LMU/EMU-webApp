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
		var x = -node._x + width/2;
		var y = -node._y  + height/2;
		svg.transition()
			.duration(duration)
			.attr("transform", scope.getOrientatedTransform()+"translate(" + x + "," + y + ")");
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

	scope.getPath = function (d) {
		var controlX = d._fromX;
		var controlY = d._toY;

		return "M"+d._fromX+" "+d._fromY+"Q"+controlX+" "+controlY+" "+d._toX+" "+d._toY;
	};


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
		
		
		/////
		// This is the aforementioned second approach
		HierarchyService.calculateWeightsBottomUp();
		//
		/////

		for (var i=0; i<HierarchyService.selectedPath.length; ++i) {

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




		
		//////
		// Now that all actual coordinates have been calculated, we
		// update our SVG using d3js data joins
		//
		// For an introduction to the concept see
		// http://bost.ocks.org/mike/join/
		//

		//
		// Define the data set to be visualised

		var dataSet = svg.selectAll("g.node")
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
		

		newNodes = newNodes.append("g")		// append() will return a set of all appended elements
			.attr("class", "node")

			// event handlers
			//.call(dragListener)
			.on('click', function (d) {
				console.debug('Clicked node', d);
				scope.centerNode(d);
			})
			;

		newNodes.append("circle")
			.attr('class', 'nodeCircle')

			// Make circle invisible at first
			.attr('r', 0)

			// And then transition it to its normal size
			.transition()
			.duration(duration)
			.attr('r', 4.5)
			;

		newNodes.append("text")
			.attr('class', 'nodeText')
			;

		/*

		// phantom node to give us mouseover in a radius around it
		newNodes.append("circle")
			.attr('class', 'ghostCircle')
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
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + 0 + "," + 0 + ")";
			})
			.remove();
		
		oldNodes.select("text")
			.style("fill-opacity", 0);

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

		// Change the circle fill depending on whether it has children and is collapsed
		dataSet.select("circle.nodeCircle")
			//.attr("r", 4.5)
			//.style("fill", function (d) {
			//	return d._children ? "lightsteelblue" : "#fff";
			//})
			;

		// Transition nodes to their new position.
		dataSet.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d._x + "," + d._y + ")";
			});


		//
		//
		// Now we turn to visualising links
		var linkSet = svg.selectAll("path.link")
			.data(links, function (d) {
				// Form unique link ID
				return 's' + d.fromID + 't' + d.toID;
			});

		var newLinks = linkSet.enter();
		var oldLinks = linkSet.exit();

		newLinks.insert('path', 'g')
			.attr('class', 'link')
			.style('opacity', 0)
			.transition()
			.duration(duration)
			.style('opacity', 1)
			;

		oldLinks.transition()
			.duration(duration)
			.style('opacity', 0)
			.remove();
		
		// Transition links to their new position.
		linkSet.transition()
			.duration(duration)
			.attr("d", scope.getPath )
			.style('opacity', 1)
			;
		
		

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
