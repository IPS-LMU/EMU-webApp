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

				// Settings for CSS transitions
				scope.transition = {
					duration: 750,
					links: false,
					nodes: false,
					rotation: false,
					contextMenu: false
				};


				// Possible zoom range
				scope.scaleExtent = [0.5, 10];

				// Possible pan range
				scope.panningLimit = 0.95;
				scope.allowCrossAxisZoom = false;
				scope.allowCrossAxisPan = false;

				// Boundaries for enforcing pan range
				scope.timeAxisStartPosition = undefined;
				scope.timeAxisEndPosition = undefined;
				scope.crossAxisStartPosition = undefined;
				scope.crossAxisEndPosition = undefined;
				scope.northernBoundary = undefined;
				scope.southernBoundary = undefined;
				scope.westernBoundary = undefined;
				scope.easternBoundary = undefined;


				// While the user zooms (scrolls mouse wheel), many zoom events are
				// fired. The last zoom event must be treated differently than the ones
				// before it:

				// A promise that can be cancelled from within scope.zoom()
				scope.zoomTimeoutPromise = null;
				// The last scale factor that was applied by a "final zoom event"
				scope.lastScaleFactor = 1;

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
						scope.rotate();
					}
				}, false);

				scope.$watch('viewState.curLevelAttrDefs', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						console.debug('Rendering due to attribute change: ', newValue);
						scope.render();
					}
				}, true);

				scope.$watch('playing', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						console.debug('Play() triggered', newValue, scope.selectedItem);
						if (typeof scope.selectedItem !== 'undefined' && newValue !== 0) {
							scope.play(scope.selectedItem);
						}
					}
				}, true);

				scope.$watch('historyService.movesAwayFromLastSave', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						console.debug('history service is active, rendering');
						scope.render();
					}
				}, false);

				scope.$watch('hierarchyState.newLinkFromID', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						scope.newLinkSrc = HierarchyLayoutService.getItemByID(newValue);
						scope.render();
					}
				}, false);

				scope.$watch('viewState.hierarchyState.isShown()', function (newValue) {
					if (newValue === true) {
						console.debug ('Hierarchy modal activated, rendering');
						scope.render();
					}
				}, false);

				scope.$watch('hierarchyState.contextMenuID', function (newValue, oldValue) {
					if (newValue !== oldValue && newValue === undefined) {
						console.log('Rendering (context menu disappearing)');
						scope.render(false);
					}
				}, false);

				scope.$watch('hierarchyState.resize', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						console.debug('Rendering due to window resize');
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
					// Make sure panning is within allowed regions
					scope.limitPanning();

					// Save translate and scale so they can be re-used when the modal is re-opened
					var translate = scope.zoomListener.translate();
					var scale = scope.zoomListener.scale();

					viewState.hierarchyState.translate = translate;
					viewState.hierarchyState.scaleFactor = scale;

					// Transform all SVG elements
					// Note that scope.svg is actually not the svg itself but rather the main <g> within it
					// Note further that scope.captionLayer is a sibling and not a descendant of scope.svg
					scope.svg.attr('transform', scope.getOrientatedTransform(true));
					scope.captionLayer.attr('transform', scope.getOrientatedLevelCaptionLayerTransform);
					scope.captionLayer.selectAll('g.emuhierarchy-levelcaption').attr('transform', scope.getOrientatedLevelCaptionTransform);

					// Call scope.render(), but make sure it's only called once a rush of zoom events has finished
					// Moreover, it's only necessary after zooming, not after panning
					if (scope.zoomTimeoutPromise !== null) {
						$timeout.cancel(scope.zoomTimeoutPromise);
						scope.zoomTimeoutPromise = null;
					}
					if (scale !== scope.lastScaleFactor) {
						scope.zoomTimeoutPromise = $timeout(function () {
							console.log('Rendering due to zoom');
							scope.render();
						}, 200);
					}
				};


				/**
				 * Check if user's chosen panning value is within such limits that the
				 * graph is still visible.
				 *
				 * Actually, a portion of the graph defined by (1-scope.limit)%.
				 *
				 * If the factor is not within that limit, reset it.
				 */
				scope.limitPanning = function () {
					// Read user's panning value
					var x = scope.zoomListener.translate()[0];
					var y = scope.zoomListener.translate()[1];
					var xOrig = x;
					var yOrig = y;

					if (scope.vertical) {
						if (!scope.allowCrossAxisPan) {
							y = 0;
						} else {
							if (y > scope.southernBoundary - scope.crossAxisStartPosition) {
								y = scope.southernBoundary - scope.crossAxisStartPosition;
							}
							if (y < scope.northernBoundary - scope.crossAxisEndPosition) {
								y = scope.northernBoundary - scope.crossAxisEndPosition;
							}
						}

						if (x > scope.easternBoundary - scope.timeAxisStartPosition) {
							x = scope.easternBoundary - scope.timeAxisStartPosition;
						}
						if (x < scope.westernBoundary - scope.timeAxisEndPosition) {
							x = scope.westernBoundary - scope.timeAxisEndPosition;
						}
					} else {
						if (!scope.allowCrossAxisPan) {
							x = 0;
						} else {
							if (x > scope.easternBoundary - scope.crossAxisStartPosition) {
								x = scope.easternBoundary - scope.crossAxisStartPosition;
							}
							if (x < scope.westernBoundary - scope.crossAxisEndPosition) {
								x = scope.westernBoundary - scope.crossAxisEndPosition;
							}
						}

						if (y > scope.southernBoundary - scope.timeAxisStartPosition) {
							y = scope.southernBoundary - scope.timeAxisStartPosition;
						}
						if (y < scope.northernBoundary - scope.timeAxisEndPosition) {
							y = scope.northernBoundary - scope.timeAxisEndPosition;
						}
					}

					if (x !== xOrig || y !== yOrig) {
						scope.zoomListener.translate([x, y]);
						// Make sure the programmatic changes to the translate vector are applied
						scope.zoomListener.event(scope.svg);
					}
				};

				scope.rotate = function () {
					// When rotating, we should preserve (to some accuracy)
					// the part of the graph we're looking at.
					// We therefore calculate how much of the graph is
					// panned away before the rotation and try to restore
					// that value afterwards.

					if (scope.timeAxisEndPosition === 0 || scope.crossAxisEndPosition === 0) {
						// if these values are zero, we cannot preserve any
						// panning because we'd have to divide by zero (what
						// would we preserve, anyway?)

						scope.render();
					} else {
						var translate = scope.zoomListener.translate();

						if (scope.vertical === true) {
							// Changing from horizontal to vertical
							var percentageAwayTimeAxis = (translate[1]) / scope.timeAxisEndPosition;
							var percentageAwayCrossAxis = (translate[0]) / scope.crossAxisEndPosition;
						} else {
							// Changing from vertical to horizontal
							var percentageAwayTimeAxis = (translate[0]) / scope.timeAxisEndPosition;
							var percentageAwayCrossAxis = (translate[1]) / scope.crossAxisEndPosition;
						}

						scope.render();

						percentageAwayTimeAxis = percentageAwayTimeAxis * scope.timeAxisEndPosition;
						percentageAwayCrossAxis = percentageAwayCrossAxis * scope.crossAxisEndPosition;

						if (scope.vertical === true) {
							// Changing from horizontal to vertical
							scope.zoomListener.translate([percentageAwayTimeAxis, percentageAwayCrossAxis]);
						} else {
							// Changing from vertical to horizontal
							scope.zoomListener.translate([percentageAwayCrossAxis, percentageAwayTimeAxis]);
						}

						// Make sure the programmatic changes to the translate vector are applied
						scope.zoomListener.event(scope.svg);
					}
				};

				/**
				 * This transform is applied to the main <g> within the SVG
				 * That <g> contains all the nodes and links but not the level captions
				 * and neither the time arrow
				 */
				scope.getOrientatedTransform = function (zoomInProgress) {
					var transform = '';
					var scale = scope.zoomListener.scale();
					var translate = scope.zoomListener.translate();

					if (scope.vertical) {
						transform += 'translate(' + translate[0] + ',' + translate[1] + ')';
						transform += 'scale(-1,1),rotate(90)';
					} else {
						transform += 'translate(' + translate[0] + ',' + translate[1] + ')';
						transform += 'rotate(0)';
					}

					if (zoomInProgress === true) {
						var factor = scale / scope.lastScaleFactor;

						if (scope.allowCrossAxisZoom) {
							transform += 'scale(' + factor + ')';
						} else {
							transform += 'scale(1,' + factor + ')';
						}
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
						return 'scale(-1,1)rotate(90)';
					} else {
						return 'rotate(0)';
					}
				};

				//
				// This returns the stroke width for links
				// It does not really depend on the orientation but rather on the zoom
				// scale. It is named getORIENTATEDLinkStrokeWidth anyway because all
				// functions are named like that, althoug they depend on both zoom
				// scale and orientation.
				scope.getOrientatedLinkStrokeWidth = function (d) {
					return '2px';
				};

				scope.getOrientatedGhostLinkStrokeWidth = function (d) {
					return '15px';
				};

				scope.getNodeText = function (d) {
					var level = viewState.getCurAttrDef(LevelService.getLevelName(d.id));
					for (var i = 0; i < d.labels.length; ++i) {
						if (d.labels[i].name === level) {
							return d.labels[i].value;
						}
					}
					console.debug ('Likely a bug: Did not find the label selected for display', 'Selected level:', level, 'Node: ', d);
					return 'NO VALUE';
				};

				scope.getLevelCaptionText = function (levelName) {
					var attributeDefinition = viewState.getCurAttrDef(levelName);
					if (levelName === attributeDefinition) {
						return levelName;
					} else {
						return levelName + ':' + attributeDefinition;
					}
				};

				scope.getOrientatedNodeCollapseText = function (d) {
					if (scope.vertical) {
						if (viewState.hierarchyState.getCollapsed(d.id)) {
							return '↓';
						} else {
							return '↑';
						}
					} else {
						if (viewState.hierarchyState.getCollapsed(d.id)) {
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
					var translate = scope.zoomListener.translate();
					if (scope.vertical) {
						return 'translate(0, ' + translate[1] + ')';
					} else {
						return 'translate(' + translate[0] + ', 0)';
					}
				};

				scope.getOrientatedLevelCaptionTransform = function (d) {
					var revArr = angular.copy(viewState.hierarchyState.path).reverse();
					if (scope.vertical) {
						return 'translate(25, ' + scope.depthToX(revArr.indexOf(d)) + ')';
					} else {
						return 'translate(' + scope.depthToX(revArr.indexOf(d)) + ', 20)';
					}
				};

				scope.getOrientatedAddItemButtonTransform = function (d) {
					if (scope.vertical) {
						return 'translate(-12, -5)';
					} else {
						return 'translate(-12, -5)';
					}
				};

				scope.getOrientatedTimeLevelBackgroundTransform = function (d) {
					if (scope.vertical) {
						return 'translate(' + (scope.vertOffsetX - 25) + ',-8)';
					} else {
						return 'translate(-8,' + (scope.offsetY - 20) + ')';
					}
				};

				scope.getOrientatedTimeLevelBackgroundWidth = function (d) {
					if (scope.vertical) {
						return '100%';
					} else {
						return '15px';
					}
				};

				scope.getOrientatedTimeLevelBackgroundHeight = function (d) {
					if (scope.vertical) {
						return '15px';
					} else {
						return '100%';
					}
				};

				scope.getOrientatedMousePosition = function (mouse) {
					var translate = scope.zoomListener.translate();
					if (scope.vertical) {
						return [
							( mouse[1] - translate[1] ),
							( mouse[0] - translate[0] )
						];
					} else {
						return [
							( mouse[0] - translate[0] ),
							( mouse[1] - translate[1] )
						];
					}
				};


				scope.getPath = function (d) {
					return 'M' + d._fromX + ' ' + d._fromY + 'Q' + d._fromX + ' ' + d._toY + ' ' + d._toX + ' ' + d._toY;
				};

				/**
				 * Calculate the path for the dashed preview link that is shown when
				 * trying to add a new link.
				 */
				scope.getPreviewPath = function () {
					var from = {x: scope.newLinkSrc._x, y: scope.newLinkSrc._y};
					var to = {x: scope.selectedItem._x, y: scope.selectedItem._y};

					return 'M' + from.x + ' ' + from.y + 'Q' + from.x + ' ' + to.y + ' ' + to.x + ' ' + to.y;
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
							.attr('d', 'M' + scope.newLinkSrc._x + ',' + scope.newLinkSrc._y + ' L' + x + ',' + y)
						;
					}
				};

				scope.svgOnClick = function (d) {
					if (viewState.hierarchyState.contextMenuID !== undefined) {
						scope.$apply(function () {
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
						scope.$apply(function () {
							console.log('Rendering (context menu appearing)');
							scope.render(false);
						});
					}

					if (viewState.hierarchyState.contextMenuID === d.id) {
						d3.event.stopPropagation();
					}
				};

				scope.nodeOnPlayClick = function (d) {
					scope.play(d);
				};

				scope.nodeOnCollapseClick = function (d) {
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
					var timeInfoType = HierarchyLayoutService.getLevelDetails(timeInfoLevel).type;

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

				/***********************************************************************
				 * Transform relative into absolute coordinates
				 *
				 * Uses the two functions depthToX() and posInLevelToY()
				 *
				 * The relative coordinates are defined on the time-axis and on the
				 * cross-axis.
				 *
				 * In vertical mode, the time-axis is X and the cross-axis is Y.
				 * In default mode, the time-axis is Y and the cross-axis is X.
				 *
				 * The relative coordinate on the cross-axis is specified as "number of
				 * levels away from the time level".
				 *
				 * On the time-axis, the relative coordinate is a number within [0;1].
				 */
				scope.depthToX = function (depth) {
					if (scope.vertical) {
						var crossAxisSize = scope.height;
						var offset = scope.vertOffsetY;
					} else {
						var crossAxisSize = scope.width;
						var offset = scope.offsetX;
					}

					var result = depth / viewState.hierarchyState.path.length * crossAxisSize;
					if (scope.allowCrossAxisZoom) {
						result *= scope.zoomListener.scale();
					}

					result += offset;

					return result;
				};

				scope.posInLevelToY = function (posInLevel) {
					if (scope.vertical) {
						var offset = scope.vertOffsetX;
						var timeAxisSize = scope.width - offset;
					} else {
						var offset = scope.offsetY;
						var timeAxisSize = scope.height - offset;
					}

					var result = posInLevel * timeAxisSize * scope.zoomListener.scale();
					result += offset;
					return result;
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
				if (scope.cps.design.color !== undefined) {
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
					if (event.shiftKey && !scope.shiftMode) {
						if (viewState.hierarchyState.newLinkFromID === undefined) {
							viewState.hierarchyState.newLinkFromID = viewState.hierarchyState.selectedItemID;
							scope.shiftMode = true;
						}
					}
					if (!event.shiftKey && scope.shiftMode) {
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

				scope.scaleFactorDisplay = scope.svg.append('g');
				scope.scaleFactorDisplay.append('text');

				// Append a group which holds all nodes and which the zoom Listener can act upon.
				scope.svg = scope.svg.append('g').style('z-index', 1);


				// read previously stored zoom and pan values
				scope.zoomListener.translate(viewState.hierarchyState.translate);
				scope.zoomListener.scale(viewState.hierarchyState.scaleFactor);

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
				scope.renderSelectionOnly = function () {
					// Change the circle fill of all nodes depending on whether they are selected
					scope.svg.selectAll('circle.emuhierarchy-nodeCircle')
						.style('fill', function (d) {
							var color = ConfigProviderService.design.color.white;

							if (typeof scope.selectedItem !== 'undefined' && d.id === scope.selectedItem.id) {
								color = ConfigProviderService.design.color.blue;
							}

							return color;
						})
					;

					scope.svg.selectAll('path.emuhierarchy-link')
						.style('stroke', function (d) {
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
					var startTime = Date.now();
					console.debug ('render() started');

					var scaleFactor = scope.zoomListener.scale();
					scope.lastScaleFactor = scaleFactor;

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
						scope.timeArrow.attr('transform', 'translate(' + (scope.width / 2) + ',' + (scope.height - 10) + ')')
					} else {
						scope.timeArrow.attr('transform', 'translate(' + (scope.width - 20) + ',' + (scope.height / 2) + ')rotate(90)')
					}


					/////////
					// Draw scale factor display
					if (scope.vertical) {
						scope.scaleFactorDisplay
							.attr('transform', 'translate(' + scope.width + ', 20)')
						;

						scope.scaleFactorDisplay
							.select('text')
							.attr('text-anchor', 'end')
							.text('Zoom: ' + Math.round(scaleFactor * 100) + ' %');
					} else {
						scope.scaleFactorDisplay
							.attr('transform', 'translate(0, ' + scope.height + ')')
						;

						scope.scaleFactorDisplay
							.select('text')
							.attr('text-anchor', 'start')
							.text('Zoom: ' + Math.round(scaleFactor * 100) + ' %');
						;
					}


					/////////
					// Draw level captions and 'add item buttons' (which append
					// nodes to the respective levels
					scope.captionLayer.attr('transform', scope.getOrientatedLevelCaptionLayerTransform);

					// for reference on the .data() call, compare the comment on
					// scope.render() above
					var levelCaptionSet = scope.captionLayer.selectAll('g.emuhierarchy-levelcaption')
						.data(viewState.hierarchyState.path, function (d) {
							return d;
						});

					var newLevelCaptions = levelCaptionSet.enter();
					var oldLevelCaptions = levelCaptionSet.exit();

					newLevelCaptions = newLevelCaptions.append('g')
						.attr('class', 'emuhierarchy-levelcaption')
					;

					var text = newLevelCaptions.append('text');

					text.append('tspan');
					text.append('tspan')
						.attr('x', 0)
						.attr('dy', '1.4em')
					;

					var addItemButtons = newLevelCaptions
						.filter(function (d) {
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

					newLevelCaptions
						.filter(function (d) {
							var levelType = LevelService.getLevelDetails(d).type;
							return (levelType === 'SEGMENT' || levelType === 'EVENT');
						})
						.append('rect')
						.attr('class', 'emuhierarchy-timelevelbackground')
						.style('fill', scope.cps.design.color.transparent.grey)
					;

					levelCaptionSet
						.attr('transform', scope.getOrientatedLevelCaptionTransform)
					;

					levelCaptionSet
						.select('text tspan')
						.text(scope.getLevelCaptionText);

					levelCaptionSet
						.select('.emuhierarchy-timelevelbackground')
						.attr('transform', scope.getOrientatedTimeLevelBackgroundTransform)
						.style('width', scope.getOrientatedTimeLevelBackgroundWidth)
						.style('height', scope.getOrientatedTimeLevelBackgroundHeight)
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

					// Compute how many items fit on the screen
					var timeAxisCapacity;
					if (scope.vertical) {
						timeAxisCapacity = Math.floor((scope.width - scope.vertOffsetX) / 10);
					} else {
						timeAxisCapacity = Math.floor((scope.height - scope.offsetY) / 10);
					}
					var levelVisibility = {};

					var nodes = [];
					HierarchyLayoutService.calculateWeightsBottomUp(viewState.hierarchyState.path);

					for (var i = 0; i < viewState.hierarchyState.path.length; ++i) {
						var level = HierarchyLayoutService.getLevelDetails(viewState.hierarchyState.path[i]);

						// Add all nodes that are not collapsed

						var items = level.items
							.filter(function (item) {
								return item._visible;
							});

						var itemsInViewPort;
						if (scaleFactor < 1) {
							itemsInViewPort = items.length;
						} else {
							itemsInViewPort = Math.ceil(items.length / scaleFactor);
						}

						if (itemsInViewPort <= timeAxisCapacity) {
							nodes = nodes.concat(items);
							levelVisibility[level.name] = {visible: true};
						} else {
							levelVisibility[level.name] = {
								visible: false,
								itemsInViewPort: itemsInViewPort
							};
						}
					}

					// Give feedback for invisible levels
					levelCaptionSet
						.selectAll('text tspan')
						.filter(':nth-child(2)')
						.text(function(levelName) {
							var text = '';
							if (!levelVisibility[levelName].visible) {
								text = 'Too many nodes, zoom in (';
								text += levelVisibility[levelName].itemsInViewPort + '/' + timeAxisCapacity;
								text += ')';
							}
							return text;
						});


					// Make sure the selected things are visible, otherwise un-select them
					var selectedItem = HierarchyLayoutService.getItemByID(viewState.hierarchyState.selectedItemID);
					var contextMenuItem = HierarchyLayoutService.getItemByID(viewState.hierarchyState.contextMenuID);
					var selectedLinkFromItem = HierarchyLayoutService.getItemByID(viewState.hierarchyState.selectedLinkFromID);
					var selectedLinkToItem = HierarchyLayoutService.getItemByID(viewState.hierarchyState.selectedLinkToID);


					if (selectedItem !== undefined && !selectedItem._visible) {
						console.debug('Unselecting node');
						viewState.hierarchyState.selectedItemID = undefined;
					}

					if (selectedLinkFromItem !== undefined && !selectedLinkFromItem._visible) {
						console.debug('Unselecting link');
						viewState.hierarchyState.selectedLinkFromID = undefined;
						viewState.hierarchyState.selectedLinkToID = undefined;
					}

					if (selectedLinkToItem !== undefined && !selectedLinkToItem._visible) {
						console.debug('Unselecting link');
						viewState.hierarchyState.selectedLinkFromID = undefined;
						viewState.hierarchyState.selectedLinkToID = undefined;
					}

					if (contextMenuItem !== undefined && !contextMenuItem._visible) {
						console.debug('Closing context menu (node became invisible)');
						viewState.hierarchyState.contextMenuID = undefined;
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
					for (var l = 0; l < allLinks.length; ++l) {
						var element = HierarchyLayoutService.getItemByID(allLinks[l].toID);
						if (element === null || element === undefined) {
							continue;
						}
						if (!element._visible) {
							continue;
						}

						var parentElement = HierarchyLayoutService.getItemByID(allLinks[l].fromID);
						if (parentElement === null || parentElement === undefined) {
							continue;
						}
						if (viewState.hierarchyState.getCollapsed(parentElement.id) || !parentElement._visible) {
							continue;
						}

						var level = LevelService.getLevelName(allLinks[l].toID);
						var parentLevel = LevelService.getLevelName(allLinks[l].fromID);

						if (!levelVisibility[level].visible || !levelVisibility[parentLevel].visible) {
							continue;
						}

						links.push(allLinks[l]);
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
						var position = viewState.hierarchyState.getCollapsePosition(d.id);
						if (typeof position !== 'undefined') {
							var x = position[0];
							var y = position[1];
							viewState.hierarchyState.setCollapsePosition(d.id, undefined);
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
								var collapsePosition = viewState.hierarchyState.getCollapsePosition(d.id);
								if (typeof collapsePosition !== 'undefined') {
									var x = collapsePosition[0];
									var y = collapsePosition[1];
									viewState.hierarchyState.setCollapsePosition(d.id, undefined);
									return 'translate(' + x + ',' + y + ')';
								} else {
									return 'translate(' + 0 + ',' + 0 + ')';
								}
							})
							.remove();
					} else {
						oldNodes = oldNodes
							.attr('transform', function (d) {
								var collapsePosition = viewState.hierarchyState.getCollapsePosition(d.id);
								if (typeof collapsePosition !== 'undefined') {
									var x = collapsePosition[0];
									var y = collapsePosition[1];
									viewState.hierarchyState.setCollapsePosition(d.id, undefined);
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
						.attr ('x', scope.getOrientatedTextX)
						.attr ('y', scope.getOrientatedTextY)
						.attr('text-anchor', scope.getOrientatedTextAnchor)
						.attr('transform', scope.getOrientatedTextTransform)
						.text(scope.getNodeText)
					;

					// Change the circle fill depending on whether it is collapsed and/or selected
					dataSet.select('circle.emuhierarchy-nodeCircle')
						// Highlight selected item
						.style('fill', function (d) {
							var color = scope.cps.design.color.white;

							if (typeof scope.selectedItem !== 'undefined' && d.id === scope.selectedItem.id) {
								color = scope.cps.design.color.blue;
							}

							return color;
						})
						// Highlight collapsed items
						.style('stroke', function (d) {
							if (viewState.hierarchyState.getCollapsed(d.id)) {
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
								return 'translate(' + d._x + ',' + d._y + ')' + scope.getOrientatedNodeTransform();
							});
					} else {
						dataSet
							.attr('transform', function (d) {
								return 'translate(' + d._x + ',' + d._y + ')' + scope.getOrientatedNodeTransform();
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
							.filter(function (d) {
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
							.on('focus', scope.nodeOnFocusIn)
							.on('blur', scope.nodeOnFocusOut)
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
					scope.svg.selectAll('.emuhierarchy-node').sort (function (a, b) {
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
						.style('stroke', function (d) {
							if (scope.selectedLink === d) {
								return scope.cps.design.color.yellow;
							} else {
								return scope.cps.design.color.grey;
							}
						})
					;


					// Transition links to their new position.

					if (scope.transition.links) {
						linkSet
							.selectAll('.emuhierarchy-link')
							.transition()
							.duration(scope.transition.duration)
							.attr('d', scope.getPath)
							.style('stroke-width', scope.getOrientatedLinkStrokeWidth)
							.style('opacity', 1)
						;
					} else {
						linkSet
							.selectAll('.emuhierarchy-link')
							.attr('d', scope.getPath)
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

					}


					// Set boundaries within which the graph has to stay when the
					// user is panning. That is, the graph can never *completely*
					// leave these boundaries
					if (scope.vertical) {
						scope.northernBoundary = scope.vertOffsetY + scope.height * (1 - scope.panningLimit);
						scope.southernBoundary = scope.height * scope.panningLimit;
						scope.westernBoundary = scope.vertOffsetX + scope.width * (1 - scope.panningLimit);
						scope.easternBoundary = scope.width * scope.panningLimit;
					} else {
						scope.northernBoundary = scope.offsetY + scope.height * (1 - scope.panningLimit);
						scope.southernBoundary = scope.height * scope.panningLimit;
						scope.westernBoundary = scope.offsetX + scope.width * (1 - scope.panningLimit);
						scope.easternBoundary = scope.width * scope.panningLimit;
					}

					// Find out where the time and cross axis start and end, to
					// prevent that these points leave the above boundaries.
					// Note that these do not depend on scope.vertical because they
					// are transformed when the user is in "scope.vertical mode".


					//var boundingBox = scope.svg.node().getBBox();

					// The runtime of scope.svg.node().getBBox() grows with
					// the number of SVG nodes (i.e. with the size of the
					// hierarchy) and it is very slow.

					// Since there are only very few candidates among the
					// nodes that might determine the bounding box of the
					// whole thing, we just check these. This way, we do not
					// need to rely on svg.getBBox() to check all nodes'
					// position.

					// This method does not return the exact same results as
					// svg.getBBox(). It returns the center of the nodes
					// that determine the bounding box. It fails to include
					// their radius, and it fails to include the labels that
					// surround the nodes. But the approximation is fair enough.
					// And it is fast.

					var largestY = 0, largestX = 0, smallestY, smallestX;

					for (var i = 0; i < viewState.hierarchyState.path.length; ++i) {
						var levelItems = HierarchyLayoutService.getLevelDetails(viewState.hierarchyState.path[i]).items;

						if (smallestX === undefined || levelItems[0]._x < smallestX) {
							smallestX = levelItems[0]._x;
						}
						if (smallestY === undefined || levelItems[0]._y < smallestY) {
							smallestY = levelItems[0]._y;
						}
						if (levelItems[levelItems.length - 1]._x > largestX) {
							largestX = levelItems[levelItems.length - 1]._x;
						}
						if (levelItems[levelItems.length - 1]._y > largestY) {
							largestY = levelItems[levelItems.length - 1]._y;
						}
					}
					if (smallestX === undefined) {
						smallestX = 0;
					}
					if (smallestY === undefined) {
						smallestY = 0;
					}

					var boundingBox = {
						x: smallestX,
						y: smallestY,
						width: largestX,
						height: largestY
					};

					scope.timeAxisStartPosition = boundingBox.y;
					scope.timeAxisEndPosition = scope.timeAxisStartPosition + boundingBox.height;
					scope.crossAxisStartPosition = boundingBox.x;
					scope.crossAxisEndPosition = scope.crossAxisStartPosition + boundingBox.width;

					scope.limitPanning();
					console.log('render() finished, took', Date.now() - startTime, 'milliseconds');
				};
			}
		};
	});
