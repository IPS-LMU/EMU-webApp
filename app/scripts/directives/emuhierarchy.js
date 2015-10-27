'use strict';


angular.module('emuwebApp')
  .directive('emuhierarchy', function (viewState, HistoryService, DataService, LevelService, HierarchyManipulationService, HierarchyLayoutService, Soundhandlerservice, ConfigProviderService, $timeout) {
    return {
      template: '<div class="emuwebapp-hierarchy-container" ng-mousemove="checkLink($event)"></div>',
      restrict: 'E',
      scope: {
          vertical: '=',
          playing: '='
      },
      replace: true,
      link: function postLink(scope, element, attrs) {

        //////////////////////
	// private variables

	// FIXME move these to viewState
	scope.selectedItem;
	scope.selectedLink;
	scope.newLinkSrc;
	// END FIXME

	// Graphical offset from the SVG's border to the first nodes
	// Note that level captions are drawn within that offset
	scope.offsetX = 25;
	scope.offsetY = 30;
	// The same when in rotated mode
	scope.vertOffsetX = 150;
	scope.vertOffsetY = 25;

	// Possible zoom range
	scope.scaleExtent = [0.5, 10];

	// Do not pan away from the graph
	scope.timeAxisSize = 0;

	// Settings for CSS transitions
	scope.transition = {
		duration: 750,
		links: false,
		nodes: false,
		rotation: false,
		contextMenu: false
	};

	// A promise that can be cancelled from within scope.zoom()
	scope.zoomTimeoutPromise = null;

	//
	//////////////////////

        //////////////////////
        // watches

	scope.viewState = viewState;
	scope.hierarchyState = viewState.hierarchyState;
	scope.historyService = HistoryService;
	scope.cps = ConfigProviderService;

	scope.$watch('hierarchyState.path', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			console.debug('Rendering due to path change: ', newValue);
			scope.hierarchyState.newLinkFromID = undefined;
			scope.render();
		}
	}, false);

	scope.$watch('vertical', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			console.debug('Rendering due to rotation: ', newValue);
			scope.render();
		}
	}, false);

	scope.$watch('viewState.curLevelAttrDefs', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			console.debug('Rendering due to attribute change: ', newValue);
			scope.render();
		}
	}, true);

	scope.$watch('playing', function (newValue, oldValue) {
		if(newValue !== oldValue) {
			console.debug('Play() triggered', newValue, scope.selectedItem);
			if (typeof scope.selectedItem !== 'undefined' && newValue !== 0) {
				scope.play(scope.selectedItem);
			}
		}
	}, true);

	scope.$watch('hierarchyState.playing', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			console.debug('Play() triggered by viewState', newValue);
			if (typeof scope.selectedItem !== 'undefined' && newValue !== 0) {
				scope.play(scope.selectedItem);
			}
		}
	}, false);

	scope.$watch('historyService.movesAwayFromLastSave', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			console.debug('history service is active, rendering');
			scope.render();
		}
	}, false);

	scope.$watch('hierarchyState.newLinkFromID', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			scope.newLinkSrc = LevelService.getItemByID(newValue);
			scope.render();
		}
	}, false);

	scope.$watch('viewState.hierarchyShown', function (newValue) {
		if (newValue === true) {
			console.debug ('Hierarchy modal activated, rendering');
			scope.render();
		}
	}, false);

	scope.$watch('hierarchyState.contextMenuID', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			scope.render();
		}
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
	 *
	scope.centerNode = function (node) {
		var x = -node._x + scope.width/2;
		var y = -node._y  + scope.height/2;
		scope.svg.transition()
			.duration(scope.transition.duration)
			.attr('transform', scope.getOrientatedTransform()+'translate(' + x + ',' + y + ')');
		scope.zoomListener.translate([x, y]);
	};
	*/

	/**
	 * The zoom function is called by the zoom listener, which listens for d3 zoom events and must be appended to the svg element
	 */
	scope.zoom = function () {
		scope.svg.attr('transform', scope.getOrientatedTransform());

		scope.captionLayer.attr('transform', scope.getOrientatedLevelCaptionLayerTransform);
		scope.captionLayer.selectAll('g.emuhierarchy-levelcaption').attr('transform', scope.getOrientatedLevelCaptionTransform);

		// Call scope.render(), but make sure it's only called once a rush of zoom events has finished
		if (scope.zoomTimeoutPromise !== null) {
			$timeout.cancel(scope.zoomTimeoutPromise);
			scope.zoomTimeoutPromise = null;
		}
		scope.zoomTimeoutPromise = $timeout (scope.render, 200);
	};

	/**
	 * This transform is applied to the all-encompassing SVG area
	 *
	 * It applies the current scale factor to the dimension that represents
	 * time.
	 */
	scope.getOrientatedTransform = function () {
		var transform = '';

		//
		// Limit panning factor to make sure the user cannot pan away
		// from the graph

		// Okay, so this is what I would like to do: Only allow to "pan away" 90 % of the graph
		var maxPositiveTranslate = scope.timeAxisSize/scope.zoomListener.scale() * 0.9;
		// NB: I divide by the scale factor becaus I need the original axis' size (because panning will be applied before scaling)

		//
		// BUT:
		// This is one of these real huge WTFs
		// The graph doesn't grow linearly with the scale() factor, it rather grows a little slower (why? -> I might still find out)
		// Therefore, I have to correct the panning limit by a logarithmic factor ... (inverse of Math.pow())
 		maxPositiveTranslate = maxPositiveTranslate / Math.pow(1.1, (scope.zoomListener.scale()-1));
		// ... WTF?
		//
		// btw: the base 1.1 was randomly guessed and seems to work
		//

		var maxNegativeTranslate = -scope.timeAxisSize*0.99;
		
		console.debug(scope.zoomListener.translate());
		if (scope.vertical) {
			var x = scope.zoomListener.translate()[0];
			var y = 0;

			if (scope.zoomListener.translate()[0] > maxPositiveTranslate) {
				x = maxPositiveTranslate;
			}
			if (scope.zoomListener.translate()[0] < maxNegativeTranslate) {
				x = maxNegativeTranslate;
			}
			
			// Apply correction
			scope.zoomListener.translate([x, y]);

			transform += 'translate('+x+','+y+')';
			transform += 'scale('+scope.zoomListener.scale()+',1)';
			transform += 'scale(-1,1),rotate(90)';
		} else {
			var x = 0;
			var y = scope.zoomListener.translate()[1];

			if (scope.zoomListener.translate()[1] > maxPositiveTranslate) {
				y = maxPositiveTranslate;
			}
			if (scope.zoomListener.translate()[1] < maxNegativeTranslate) {
				y = maxNegativeTranslate;
			}

			// Apply correction
			scope.zoomListener.translate([x, y]);

			transform += 'translate('+x+','+y+')';
			transform += 'scale(1,'+scope.zoomListener.scale()+')';
			transform += 'rotate(0)';
		}

		return transform;
	};

	/**
	 * This transform is applied to each individual node, which includes
	 * both the circle and the label.
	 *
	 * It reverses the zoom factor applied to the complete graphics so that
	 * the text doesn't consume more space than needed.
	 */
	scope.getOrientatedNodeTransform = function (d) {
		// Parameter d is never used because this is independent from the node's position

		if (scope.vertical) {
			return 'scale(1,'+(1/scope.zoomListener.scale())+')scale(-1,1)rotate(90)';
		} else {
			return 'scale(1,'+(1/scope.zoomListener.scale())+')rotate(0)';
		}
	};

	//
	// This returns the stroke width for links
	// It does not really depend on the orientation but rather on the zoom
	// scale. It is named getORIENTATEDLinkStrokeWidth anyway because all
	// functions are named like that, althoug they depend on both zoom
	// scale and orientation.
	scope.getOrientatedLinkStrokeWidth = function (d) {
		return (1.5/scope.zoomListener.scale())+'px';
	};

	scope.getOrientatedGhostLinkStrokeWidth = function (d) {
		return (15/scope.zoomListener.scale())+'px';
	};

	scope.getNodeText = function (d) {
		var level = viewState.getCurAttrDef(LevelService.getLevelName(d.id));
		for (var i=0; i<d.labels.length; ++i) {
			if (d.labels[i].name === level) {
				return d.labels[i].value;
			}
		}
		console.debug ('Likely a bug: Did not find the label selected for display', 'Selected level:', level, 'Node: ', d);
		return 'NO VALUE';
	};

	scope.getOrientatedNodeCollapseText = function(d) {
		if (scope.vertical) {
			if (viewState.getCollapsed(d.id)) {
				return '↓';
			} else {
				return '↑';
			}
		} else {
			if (viewState.getCollapsed(d.id)) {
				return '→';
			} else {
				return '←';
			}
		}
	};

	/**
	 * This transform is applied to all nodes' text labels
	 */
	scope.getOrientatedTextTransform = function (d) {
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
	};

	scope.getOrientatedLevelCaptionTransform = function (d) {
		var revArr = angular.copy(viewState.hierarchyState.path).reverse();
		if (scope.vertical) {
			return 'translate(25, '+scope.depthToX(revArr.indexOf(d))+')';
		} else {
			return 'translate('+scope.depthToX(revArr.indexOf(d))+', 20)';
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
				( mouse[1] ),
				( mouse[0] - scope.zoomListener.translate()[0] ) / scope.zoomListener.scale()
			];
		} else {
			return [
				( mouse[0] ),
				( mouse[1] - scope.zoomListener.translate()[1] ) / scope.zoomListener.scale()
			];
		}
	};


	scope.getPath = function (d) {
		// It would be better if this function was independent of the scaling factor.
		// But it turns out to be the easiest solution to counter the stretching
		// effect of "one-dimensional scaling" on links.
		var scale = scope.zoomListener.scale();
		if (scope.vertical) {
			return 'M'+d._fromX+' '+(d._fromY/scale)+'Q'+d._fromX+' '+(d._toY/scale)+' '+d._toX+' '+(d._toY/scale);
		} else {
			return 'M'+(d._fromX/scale)+' '+d._fromY+'Q'+(d._fromX/scale)+' '+d._toY+' '+(d._toX/scale)+' '+d._toY;
		}
	};

	/**
	 * Calculate the path for the dashed preview link that is shown when
	 * trying to add a new link.
	 */
	scope.getPreviewPath = function () {
		var from = { x: scope.newLinkSrc._x, y: scope.newLinkSrc._y };
		var to = { x: scope.selectedItem._x, y: scope.selectedItem._y };
		var scale = scope.zoomListener.scale();

		if (scope.vertical) {
			return 'M'+from.x+' '+(from.y/scale)+'Q'+from.x+' '+(to.y/scale)+' '+to.x+' '+(to.y/scale);
		} else {
			return 'M'+(from.x/scale)+' '+from.y+'Q'+(from.x/scale)+' '+to.y+' '+(to.x/scale)+' '+to.y;
		}
	};

	/**
	 * Return a color depending on the validity of the link the user is
	 * trying to create.
	 *
	 * If the link is invalid, this function will try reversing the link.
	 */
	scope.getPreviewColor = function () {
		var validity = HierarchyManipulationService.checkLinkValidity(viewState.hierarchyState.path, scope.newLinkSrc.id, scope.selectedItem.id);

		if (validity.valid) {
			return 'green';
		} else {
			if (validity.reason === 3) {
				validity = HierarchyManipulationService.checkLinkValidity(viewState.hierarchyState.path, scope.selectedItem.id, scope.newLinkSrc.id);
				if (validity.valid) {
					return 'green';
				}
			}
			return 'red';
		}
	};

	scope.getLabelLegalnessColor = function (d) {
		var dom = scope.svg.select('.emuhierarchy-contextmenu input')[0][0];
		var levelName = LevelService.getLevelName(d.id);
		var attrIndex = viewState.getCurAttrIndex(levelName);
		var legalLabels = scope.cps.getLevelDefinition(levelName).attributeDefinitions[attrIndex].legalLabels;

		if (legalLabels === undefined || (dom.value.length > 0 && legalLabels.indexOf(dom.value) >= 0)) {
			return 'lightgreen';
		} else {
			return 'red';
		}
	}


	scope.svgOnMouseMove = function (d) {
		if (scope.newLinkSrc !== undefined) {
			var mouse = scope.getOrientatedMousePosition(d3.mouse(this));
			var x = mouse[0];
			var y = mouse[1];

			scope.svg.select('path.emuhierarchy-newlink')
				.attr('d', 'M'+scope.newLinkSrc._x+','+scope.newLinkSrc._y+' L'+x+','+y)
				;
		}
	};

	scope.svgOnClick = function (d) {
		if (viewState.hierarchyState.contextMenuID !== undefined) {
			scope.$apply(function() {
				viewState.hierarchyState.contextMenuID = undefined;
			});
		}
	};

	scope.nodeOnClick = function (d) {
		console.debug('Clicked node', d);

		if (viewState.hierarchyState.contextMenuID === undefined) {
			d3.event.stopPropagation();
			viewState.hierarchyState.contextMenuID = d.id;
			viewState.hierarchyState.setEditValue(scope.getNodeText(d));
			scope.$apply(function() {
				scope.render();
			});
		}

		if (viewState.hierarchyState.contextMenuID === d.id) {
			d3.event.stopPropagation();
		}
	};

	scope.nodeOnPlayClick = function(d) {
		scope.play(d);
	};

	scope.nodeOnCollapseClick = function(d) {
		console.debug('collapsing', d);
		// (De-)Collapse sub-tree
		HierarchyLayoutService.toggleCollapse(d, viewState.hierarchyState.path);
		scope.render();
	};

	scope.nodeOnMouseOver = function (d) {
		scope.selectItem(d);
		scope.renderSelectionOnly();
	};

	scope.nodeOnInput = function (d) {
		// select() returns a single-element selection, which is always
		// a multi-dimensional array with [0][0] being the DOM node I'm
		// looking for
		var dom = scope.svg.select('.emuhierarchy-contextmenu input')[0][0];
		viewState.hierarchyState.setEditValue(dom.value);

		// Give feedback on legalness
		dom.style.backgroundColor = scope.getLabelLegalnessColor(d);
	};

	scope.nodeOnFocusIn = function (d) {
		viewState.hierarchyState.inputFocus = true;
	};

	scope.nodeOnFocusOut = function (d) {
		viewState.hierarchyState.inputFocus = false;
	};

	scope.linkOnMouseOver = function (d) {
		scope.selectLink(d);
		scope.renderSelectionOnly();
	};

	scope.addButtonOnClick = function (d) {
		var id = LevelService.pushNewItem (d);
		if (id !== -1) {
			scope.historyService.addObjToUndoStack({
				type: 'HIERARCHY',
				action: 'PUSHITEM',
				newID: id,
				level: d
			});
		}
		scope.$apply();
	};


	scope.play = function (d) {
		var timeInfoLevel = viewState.hierarchyState.path[0];
		if (typeof timeInfoLevel === 'undefined') {
			console.debug('Likely a bug: There is no path selection. Not executing play():', d);
			return;
		}
		var timeInfoType = LevelService.getLevelDetails(timeInfoLevel).type;

		var startSample = null;
		var endSample = null;

		var itemList = [d];
		var currentItem;
		while (itemList.length > 0) {
			currentItem = itemList.pop();
			if (currentItem.labels[0].name === timeInfoLevel) {
				if (timeInfoType === 'EVENT') {
					if (currentItem.samplePoint < startSample || startSample === null) {
						startSample = currentItem.samplePoint;
					}
					if (currentItem.samplePoint > endSample || endSample === null) {
						endSample = currentItem.samplePoint;
					}
				} else if (timeInfoType === 'SEGMENT') {
					if (currentItem.sampleStart < startSample || startSample === null) {
						startSample = currentItem.sampleStart;
					}

					// I promise I'll never again use tmp as a variable name :-)
					var tmp = currentItem.sampleStart + currentItem.sampleDur;
					if (tmp > endSample || endSample === null) {
						endSample = tmp;
					}
				}
			}
			itemList = itemList.concat(HierarchyLayoutService.findChildren(currentItem, viewState.hierarchyState.path));
		}

		console.debug('Node info for playback: ', timeInfoType, d, startSample, endSample);

		if (startSample === null || endSample === null) {
			console.debug('No time information found for node, aborting playback', d);
			return;
		}

		Soundhandlerservice.playFromTo(startSample, endSample);
	};

	scope.depthToX = function (depth) {
		var size = (scope.vertical) ? scope.height : scope.width;
		var offset = (scope.vertical) ? scope.vertOffsetY : scope.offsetX;
		return offset + depth / viewState.hierarchyState.path.length * size;
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
	// lazy loading
	scope.background = '';
	// set background according to config only if config is loaded
	if(scope.cps.design.color !== undefined) {
	    scope.background = scope.cps.design.color.lightGrey;
	}

	// scaleExtent limits the amount of zooming possible
	scope.zoomListener = d3.behavior.zoom().scaleExtent(scope.scaleExtent).on('zoom', scope.zoom);

        // Create the d3 element and position it based on margins
    scope.svg = d3.select(element[0])
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
	  .style('background-color', scope.background)
	  .call(scope.zoomListener)
	  .on('dblclick.zoom', null)
	  .on('mousemove', scope.svgOnMouseMove)
	  .on('click', scope.svgOnClick)
          .append('g')
	  ;

  scope.shiftMode = false;

  scope.checkLink = function (event) {
    if(event.shiftKey && !scope.shiftMode) {
      if (viewState.hierarchyState.newLinkFromID === undefined) {
        viewState.hierarchyState.newLinkFromID = viewState.hierarchyState.selectedItemID;
        scope.shiftMode = true;
      }
    }
    if(!event.shiftKey && scope.shiftMode) {
      scope.shiftMode = false;
      var linkObj = HierarchyManipulationService.addLink(viewState.hierarchyState.path, viewState.hierarchyState.newLinkFromID, viewState.hierarchyState.selectedItemID);
      viewState.hierarchyState.newLinkFromID = undefined;
      if (linkObj !== null) {
        HistoryService.addObjToUndoStack({
          type: 'HIERARCHY',
          action: 'ADDLINK',
          link: linkObj
        });
      }
    }
  }

	// Append a group which holds all overlay captions and which do not react to zooming
	scope.captionLayer = scope.svg.append('g').style('z-index', 5);

	scope.timeArrow = scope.svg.append('g')
		.append('text')
		.text('time →');

	// Append a group which holds all nodes and which the zoom Listener can act upon.
	scope.svg = scope.svg.append('g').style('z-index', 1);

	//
        /////////////////////////////



	////////////
	// Here come the two main functions of the directive
	//
	// scope.render() and scope.renderSelectionOnly() do the bulk of the
	// work


	/**
	 * Adjust the colors of all nodes and links to reflect the user's
	 * selection.
	 *
	 * @param nothing
	 * @returns nothing
	 */
	scope.renderSelectionOnly = function() {
		// Change the circle fill of all nodes depending on whether they are selected
		scope.svg.selectAll('circle.emuhierarchy-nodeCircle')
			.style('fill', function(d) {
				var color = ConfigProviderService.design.color.white;

				if (typeof scope.selectedItem !== 'undefined' && d.id === scope.selectedItem.id) {
					color = ConfigProviderService.design.color.blue;
				}

				return color;
			})
			;

		scope.svg.selectAll('path.emuhierarchy-link')
			.style('stroke', function(d) {
				if (scope.selectedLink === d) {
					return ConfigProviderService.design.color.yellow;
				} else {
					return ConfigProviderService.design.color.grey;
				}
			})
			;

		scope.svg.select('.emuhierarchy-newlinkpreview')
			.attr('d', scope.getPreviewPath)
			.style('stroke', scope.getPreviewColor)
			;
	};


        /**
         * (Re-)Render the complete hierarchical structure
	 *
	 * Calls HierarchyLayoutService to calculate the relative positions of
	 * all nodes and links within the graph and then uses the above helper
	 * functions to calculate the absolute positons within the SVG.
	 *
	 * Makes use of D3JS data joins at various positions. For an
	 * introduction to the concept, see: http://bost.ocks.org/mike/join/
	 *
	 * It basically works by associating a data set with an SVG selection.
	 * D3 then divides this data set in three sections: enter, update and
	 * exit.
	 *
         */
        scope.render = function () {
		// This is an undesired fix for #110
		// We clean the SVG element on every re-render, thereby destroying the
		// possibility of eye-candy transitions
		scope.svg.selectAll('*').remove();

		var i;

		// Get current width and height of SVG
		scope.width = parseInt(d3.select(scope.element[0]).style('width'), 10);
		scope.height = parseInt(d3.select(scope.element[0]).style('height'), 10);

		// Set orientation
		if (scope.transition.rotation) {
			scope.svg.transition()
			.duration(scope.transition.duration)
			.attr('transform', scope.getOrientatedTransform())
			;
		} else {
			scope.svg.attr('transform', scope.getOrientatedTransform());
		}


		/////////
		// Draw time arrow
		if (scope.vertical) {
			scope.timeArrow.attr('transform', 'translate('+(scope.width/2)+','+(scope.height-10)+')')
		} else {
			scope.timeArrow.attr('transform', 'translate('+(scope.width-20)+','+(scope.height/2)+')rotate(90)')
		}


		/////////
		// Draw level captions and 'add item buttons' (which append
		// nodes to the respective levels
		scope.captionLayer.attr('transform', scope.getOrientatedLevelCaptionLayerTransform);

		// for reference on the .data() call, compare the comment on
		// scope.render() above
		var levelCaptionSet = scope.captionLayer.selectAll('g.emuhierarchy-levelcaption')
			.data(viewState.hierarchyState.path, function (d) { return d; });

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
			.filter(function(d) {
				var levelType = LevelService.getLevelDetails(d).type;
				return (levelType === 'ITEM');
			})
			.append('g')
			.attr('class', 'emuhierarchy-addbutton')
			.attr('transform', scope.getOrientatedAddItemButtonTransform)
			.on('click', scope.addButtonOnClick)
			;

		addItemButtons
			.append('circle')
			.style('fill', scope.cps.design.color.blue)
			.attr('r', 8)
			;

		addItemButtons
			.append('path')
			.style('stroke', scope.cps.design.color.white)
			.attr('d', 'M0,-6 V6 M-6,0 H6')
			;

		levelCaptionSet
			.attr('transform', scope.getOrientatedLevelCaptionTransform)
			;

		if (scope.transition.rotation) {
			oldLevelCaptions = oldLevelCaptions.transition()
				.duration(scope.transition.duration)
				.remove()
				;
		} else {
			oldLevelCaptions.remove();
		}

		oldLevelCaptions.select('text')
			.style('fill-opacity', 0)
			;

		//
		/////////

		/////////
		// Compute the new tree layout (first nodes and then links)
		//
		var nodes = [];
		HierarchyLayoutService.calculateWeightsBottomUp(viewState.hierarchyState.path);

		for (var i=0; i<viewState.hierarchyState.path.length; ++i) {
			// Add all nodes that are not collapsed
			var levelItems = LevelService.getLevelDetails(viewState.hierarchyState.path[i]).items;
			for (var ii=0; ii<levelItems.length; ++ii) {
				if (levelItems[ii]._visible) {
					nodes.push(levelItems[ii]);
				}
			}
		}



		////////
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
			for (var i=0; i<viewState.hierarchyState.path.length-1; ++i) {
				var element = LevelService.getItemFromLevelById(viewState.hierarchyState.path[i], allLinks[l].toID);
				var parentElement = LevelService.getItemFromLevelById(viewState.hierarchyState.path[i+1], allLinks[l].fromID);

				if (element === null) {
					continue;
				}
				if (parentElement === null) {
					continue;
				}
				if (!element._visible) {
					continue;
				}
				if (viewState.getCollapsed(parentElement.id) || !parentElement._visible) {
					continue;
				}

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
		// for reference on the .data() call, compare the comment on
		// scope.render() above

		//
		// Define the data set to be visualised

		var dataSet = scope.svg.selectAll('g.emuhierarchy-node')
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
			;

		var circle = newNodes.append('circle')
			.attr('class', 'emuhierarchy-nodeCircle')
			.style('stroke', scope.cps.design.color.grey)
			;

		if (scope.transition.nodes) {
			circle
				// Make circle invisible at first
				.attr('r', 0)
				// And then transition it to its normal size
				.transition()
				.duration(scope.transition.duration)
				.attr('r', 4.5)
				;
		} else {
			circle.attr('r', 4.5);
		}

		newNodes.append('text')
			.attr('class', 'emuhierarchy-nodeText')
			;

		// Make sure that nodes that appear due to their ancestry being uncollapsed do not fly in from the origin
		// (as do all other nodes)
		newNodes.attr('transform', function (d) {
			var position = viewState.getCollapsePosition(d.id);
			if (typeof position !== 'undefined') {
				var x = position[0];
				var y = position[1];
				viewState.setCollapsePosition(d.id, undefined);
				return 'translate(' + x + ',' + y + ')' + scope.getOrientatedNodeTransform();
			}
		});

		//
		// Remove nodes that shall no longer be part of the svg

		// Transition exiting nodes to the origin
		// FIXME put that anyonymous transform function on scope

		if (scope.transition.nodes) {
			oldNodes = oldNodes
				.transition()
				.duration(scope.transition.duration)
				.attr('transform', function (d) {
					var collapsePosition = viewState.getCollapsePosition(d.id);
					if (typeof collapsePosition !== 'undefined') {
						var x = collapsePosition[0];
						var y = collapsePosition[1];
						viewState.setCollapsePosition(d.id, undefined);
						return 'translate(' + x + ',' + y + ')';
					} else {
						return 'translate(' + 0 + ',' + 0 + ')';
					}
				})
				.remove();
		} else {
			oldNodes = oldNodes
				.attr('transform', function (d) {
					var collapsePosition = viewState.getCollapsePosition(d.id);
					if (typeof collapsePosition !== 'undefined') {
						var x = collapsePosition[0];
						var y = collapsePosition[1];
						viewState.setCollapsePosition(d.id, undefined);
						return 'translate(' + x + ',' + y + ')';
					} else {
						return 'translate(' + 0 + ',' + 0 + ')';
					}
				})
				.remove();
		}

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
				var color = scope.cps.design.color.white;

				if (typeof scope.selectedItem !== 'undefined' && d.id === scope.selectedItem.id) {
					color = scope.cps.design.color.blue;
				}

				return color;
			})
			// Highlight collapsed items
			.style('stroke', function(d) {
				if (viewState.getCollapsed(d.id)) {
					return scope.cps.design.color.red;
				} else {
					return scope.cps.design.color.grey;
				}
			})
			;

		// Transition nodes to their new position

		if (scope.transition.nodes) {
			dataSet
				.transition()
				.duration(scope.transition.duration)
				.attr('transform', function (d) {
					return 'translate(' + d._x + ',' + d._y + ')'+scope.getOrientatedNodeTransform();
				});
		} else {
			dataSet
				.attr('transform', function (d) {
					return 'translate(' + d._x + ',' + d._y + ')'+scope.getOrientatedNodeTransform();
				});
		}


		/////
		// Create context menu

		// If the context menu has been closed, remove the elements
		if (viewState.hierarchyState.contextMenuID === undefined) {
			scope.svg.selectAll('.emuhierarchy-contextmenu')
				.remove()
				;
		}

		// If the context menu does not yet exist, create it
		var contextMenu = scope.svg.select('.emuhierarchy-contextmenu');

		if (contextMenu[0][0] === null) {
			contextMenu = dataSet
				.filter(function(d) {
					return d.id === viewState.hierarchyState.contextMenuID;
				})
				.append('g')
				.attr('class', 'emuhierarchy-contextmenu')
				;

			contextMenu
				.append('circle')
				.style('fill', 'darkgrey')
				.attr('r', 50)
				.style('cursor', 'default')
				;

			if (scope.transition.contextMenu) {
				contextMenu
					.style('opacity', 0)
					.transition()
					.duration(scope.transition.duration)
					.style('opacity', 0.5)
					;
			}

			contextMenu
				.append('text')
				.text(scope.getOrientatedNodeCollapseText)
				.attr('x', -25)
				.attr('y', -25)
				.attr('text-anchor', 'middle')
				.on('click', scope.nodeOnCollapseClick)
				;

			if (scope.transition.contextMenu) {
				contextMenu
					.style('opacity', 0)
					.transition()
					.duration(scope.transition.duration)
					.style('opacity', 1)
					;
			}

			contextMenu
				.append('text')
				.text('play')
				.attr('x', -25)
				.attr('y', +25)
				.attr('text-anchor', 'middle')
				.on('click', scope.nodeOnPlayClick)
				;

			if (scope.transition.contextMenu) {
				contextMenu
					.style('opacity', 0)
					.transition()
					.duration(scope.transition.duration)
					.style('opacity', 1)
					;
			}


			var foreignObject = contextMenu
				.append('foreignObject')
				.attr('height', 30)
				.attr('x', 10)
				.attr('y', -15)
				.attr('width', 0)
				;

			if (scope.transition.contextMenu) {
				foreignObject
					.transition()
					.duration(scope.transition.duration)
					.attr('width', 100)
					;
			} else {
				foreignObject.attr('width', 100);
			}

			foreignObject
				.append('xhtml:body')
				.append('input').attr('value', scope.getNodeText)
				.style('width', '100%')
				.style('height', '100%')
				.style('outline', 'none')
				.style('border', '0')
				.style('background-color', scope.getLabelLegalnessColor)
				.on('input', scope.nodeOnInput)
				.on('focusin', scope.nodeOnFocusIn)
				.on('focusout', scope.nodeOnFocusOut)
				;

			if (foreignObject[0].length !== 0) {
				foreignObject.select('input')[0][0].focus();
				foreignObject.select('input')[0][0].select();
			}

		} else {
			scope.svg.select('.emuhierarchy-contextmenu text').text(scope.getOrientatedNodeCollapseText);
		}

		// Make sure the node containing the context menu is the last
		// one in the SVG, otherwise the succeeding elements are drawn
		// visually on top of the context menu.
		scope.svg.selectAll('.emuhierarchy-node').sort ( function(a,b){
			if (a.id === viewState.hierarchyState.contextMenuID) {
				return 1;
			}
			if (b.id === viewState.hierarchyState.contextMenuID) {
				return -1;
			}
			return 0;
		});


		//
		//
		// Now we turn to visualising links
		//
		// for reference on the .data() call, compare the comment on
		// scope.render() above
		var linkSet = scope.svg.selectAll('.emuhierarchy-linkgroup')
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
			.style('stroke-width', scope.getOrientatedGhostLinkStrokeWidth)
			.on('mouseover', scope.linkOnMouseOver)
			;

		newLinks
			.append('path')
			.attr('class', 'emuhierarchy-link')
			.style('stroke-width', scope.getOrientatedLinkStrokeWidth)
			;

		if (scope.vertical) {
			newLinks.attr('transform', 'scale(1, '+scope.zoomListener.scale()+')');
		} else {
			newLinks.attr('transform', 'scale('+scope.zoomListener.scale()+', 1)');
		}

		if (scope.transition.links) {
			newLinks
				.style('opacity', 0)
				.transition()
				.duration(scope.transition.duration)
				.style('opacity', 1)
				;
		}


		// Remove old links
		if (scope.transition.links) {
			oldLinks
				.transition()
				.duration(scope.transition.duration)
				.style('opacity', 0)
				.remove()
				;
		} else {
			oldLinks.remove();
		}

		// Set color depending on whether the link is selected
		linkSet
			.selectAll('.emuhierarchy-link')
			.style('stroke', function(d) {
				if (scope.selectedLink === d) {
					return scope.cps.design.color.yellow;
				} else {
					return scope.cps.design.color.grey;
				}
			})
			;

		// Transition links to their new position.

		if (scope.transition.rotation) {
			linkSet
				.selectAll('.emuhierarchy-link')
				.transition()
				.duration(scope.transition.duration)
				.attr('d', scope.getPath )
				.style('stroke-width', scope.getOrientatedLinkStrokeWidth)
				.style('opacity', 1)
				;
		} else {
			linkSet
				.selectAll('.emuhierarchy-link')
				.attr('d', scope.getPath )
				.style('stroke-width', scope.getOrientatedLinkStrokeWidth)
				;
		}

		linkSet
			.selectAll('.emuhierarchy-ghostlink')
			.attr('d', scope.getPath)
			;



		// If the user is trying to add a new link,
		// visualise what he's doing
		scope.svg.selectAll('.emuhierarchy-newlink').remove();
		scope.svg.selectAll('.emuhierarchy-newlinkpreview').remove();

		if (scope.newLinkSrc !== undefined) {
			scope.svg.append('path')
				.attr('class', 'emuhierarchy-newlink')
				.style('stroke', 'black')
				.style('stroke-width', scope.getOrientatedLinkStrokeWidth)
				;

			var preview = scope.svg.append('path')
				.attr('class', 'emuhierarchy-newlinkpreview')
				.attr('d', scope.getPreviewPath)
				.style('stroke', scope.getPreviewColor)
				.style('stroke-width', scope.getOrientatedLinkStrokeWidth)
				;

			if (scope.vertical) {
				preview.attr('transform', 'scale(1, '+(scope.zoomListener.scale())+')');
			} else {
				preview.attr('transform', 'scale('+(scope.zoomListener.scale())+', 1)');
			}
		}


		// Find out size of the newly rendered SVG.
		// This is needed to prevent the user from scrolling/panning away from the graph.
		scope.timeAxisSize = scope.svg.node().getBBox().height*scope.zoomListener.scale();
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
