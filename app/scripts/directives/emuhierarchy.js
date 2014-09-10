'use strict';


angular.module('emuwebApp')
  .directive('emuhierarchy', function (viewState, LevelService, HierarchyService) {
    return {
      template: '<div class="emuwebapp-hierarchy-container"></div>',
      restrict: 'E',
      scope: {},
      replace: true,
      link: function postLink(scope, element, attrs) {

        console.log(element[0])

        //////////////////////
        // watches 

        // SIC deep watches are really expensive!!!! Should watch something else!!!!!!
        scope.$watch('LevelService.data', function () {
          scope.render();
        }, true);
        scope.$watch('viewState', function () {
	  console.debug('wathced sth');
          scope.render();
        }, true);

        //
        //////////////////////

	//////////////////////
	// helper functions
	/**
	 * Function to center node when clicked/dropped so node doesn't get lost when
	 * collapsing/moving with large amount of children.
	 */
	scope.centerNode = function (node) {
		//var scale = zoomListener.scale();
		console.debug(width, height);
		var x = (-node._x + width/2); // * scale
		var y = (-node._y + height/2); // * scale
		d3.select('g').transition()
			.duration(duration)
			.attr("transform", "translate(" + x + "," + y + ")"/*scale(" + scale + ")"*/);
		/*zoomListener.scale(scale);
		zoomListener.translate([x, y]);*/
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

        console.log(height)

        //Set margins, width, and height
        // var margin = {
        //     top: 0,
        //     right: 0,
        //     bottom: 0,
        //     left: 0
        //   },
        //   width = 500 - margin.left - margin.right,
        //  height = 150 - margin.top - margin.bottom;

        //Create the d3 element and position it based on margins
        var svg = d3.select(element[0])
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
	  .style('background-color', 'darkgrey')
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Create the scales we need for the graph
        var x = d3.scale.linear().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        // Create the axes we need for the graph
        var xAxis = d3.svg.axis()
          .scale(x)
          .tickSize(5)
          .tickSubdivide(true)
          .orient('top');

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('right');

        // line drawing function
        var lineFunc = d3.svg.line()
          .x(function (d) {
            return x(d.x);
          })
          .y(function (d) {
            return y(d.y);
          })
          .interpolate('linear');


        /**
         *
         */
        scope.render = function () {
		// Append a group which holds all nodes and which the zoom Listener can act upon.
		var svgGroup = svg.append("g");
		// Compute the new tree layout
		var nodes = [];

		for (var i=0; i<HierarchyService.selectedPath.length; ++i) {
			if (i === 0) {
				HierarchyService.layoutNonItemLevel(HierarchyService.selectedPath[0], HierarchyService.selectedPath.length);
			} else {
				HierarchyService.layoutItemLevel(HierarchyService.selectedPath[i], HierarchyService.selectedPath.length-i);
			}

			nodes = nodes.concat(LevelService.getLevelDetails(HierarchyService.selectedPath[i]).level.items);
		}

		// We can only draw links that are part of the currently selected path
		// This is a very low-performance approach to filtering
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


		// Set widths between levels based on maxLabelLength.
		nodes.forEach(function (d) {
			d._x = (d._depth * 150); //maxLabelLength * 10px
			d._y = (d._posInLevel * height);
		});
		links.forEach(function (d) {
			d._fromX = (d._fromDepth * 150);
			d._fromY = (d._fromPosInLevel * height);
			d._toX = (d._toDepth * 150);
			d._toY = (d._toPosInLevel * height);
		});

		// Update the nodes…
		var node = svgGroup.selectAll("g.node")
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
			.attr("x", function (d) {
				return d.children || d._children ? -10 : 10;
			})
			.attr("dy", ".35em")
			.attr('class', 'nodeText')
			.attr("text-anchor", function (d) {
				return d.children || d._children ? "end" : "start";
			})
			.text(function (d) {
				var level = viewState.getCurAttrDef(HierarchyService.getLevelName(d.id));
				for (var i=0; i<d.labels.length; ++i) {
					if (d.labels[i].name === level) {
						return d.labels[i].value;
					}
				}
				console.debug ("Likely a bug: Did not find the label selected for display", "Selected level:", level, "Node: ", d);
				return "NO VALUE";
			})
			.style("fill-opacity", 1);

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
			.attr("x", function (d) {
				return d.children || d._children ? -10 : 10;
			})
			.attr("text-anchor", function (d) {
				return d.children || d._children ? "end" : "start";
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
				return "translate(" + d._x + "," + d._y + ")";
			});

		// Fade the text in
		nodeUpdate.select("text")
			.style("fill-opacity", 1);
		

		/*
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
		*/
		

		

		// Update the links…
		var link = svgGroup.selectAll("path.link")
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

	/*	

		// Transition links to their new position.
		link.transition()
			.duration(duration)
			.attr("d", diagonal);
	*/
		
		/*
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
		*/
		

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
