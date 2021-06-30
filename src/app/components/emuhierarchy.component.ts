import * as angular from 'angular';
import * as d3 from 'd3';

import styles from '../../styles/EMUwebAppDesign.scss';


let EmuHierarchyComponent = {
	selector: "emuhierarchy",
	template: `<div class="emuwebapp-hierarchy-container" ng-mousemove="$ctrl.checkLink($event)"></div>`,
	bindings: {
		vertical: '<',
		playing: '<',
		curLevelAttrDefs: '<',
		hierarchyPath: '<',
		movesAwayFromLastSave: '<',
		newLinkFromId: '<',
		isShown: '<',
		contextMenuId: '<',
		hierarchyResize: '<',
		attributeDefinitionClickCounter: '<'
	},
	controller: [
		'$scope', 
		'$element', 
		'$timeout', 
		'ViewStateService', 
		'HistoryService', 
		'DataService', 
		'LevelService', 
		'HierarchyManipulationService', 
		'HierarchyLayoutService', 
		'SoundHandlerService', 
		'ConfigProviderService',
		class EmuHierarchyController{
		private $scope;
		private $element;
		private $timeout;
		private ViewStateService;
		private HistoryService;
		private DataService;
		private LevelService;
		private HierarchyManipulationService;
		private HierarchyLayoutService;
		private SoundHandlerService;
		private ConfigProviderService;
		
		private vertical;
		private playing;
		private hierarchyPath;
		private movesAwayFromLastSave;
		private newLinkFromId;
		private isShown;
		private contextMenuId;
		private hierarchyResize;
		private attributeDefinitionClickCounter;
		
		// Graphical offset from the SVG's border to the first nodes
		// Note that level captions are drawn within that offset
		private offsetX;
		private offsetY;
		// The same when in rotated mode
		private vertOffsetX;
		private vertOffsetY;
		
		// Settings for CSS transitions
		private transition;
		
		// Possible zoom range
		private scaleExtent;
		
		// Possible pan range
		private panningLimit;
		private allowCrossAxisZoom;
		private allowCrossAxisPan;
		
		// Boundaries for enforcing pan range
		private timeAxisStartPosition;
		private timeAxisEndPosition;
		private crossAxisStartPosition;
		private crossAxisEndPosition;
		private northernBoundary;
		private southernBoundary;
		private westernBoundary;
		private easternBoundary;
		
		
		// While the user zooms (scrolls mouse wheel), many zoom events are
		// fired. The last zoom event must be treated differently than the ones
		// before it:
		
		// A promise that can be cancelled from within this.zoom()
		private zoomTimeoutPromise;
		// The last scale factor that was applied by a "final zoom event"
		private lastScaleFactor;
		
		private selectedItem;
		private selectedLink;
		
		private height;
		private width;
		private shiftMode;
		private element;
		private zoomListener;
		private svg;
		private zoomer;
		private captionLayer;
		private background;
		
		private newLinkSrc;
		
		private timeArrow;
		private scaleFactorDisplay;
		
		private _inited;
		
		constructor(
			$scope, 
			$element, 
			$timeout, 
			ViewStateService, 
			HistoryService, 
			DataService, 
			LevelService, 
			HierarchyManipulationService, 
			HierarchyLayoutService, 
			SoundHandlerService, 
			ConfigProviderService
			){
			this.$scope = $scope;
			this.$element = $element;
			this.$timeout = $timeout;
			this.ViewStateService = ViewStateService;
			this.HistoryService = HistoryService;
			this.DataService = DataService;
			this.LevelService = LevelService;
			this.HierarchyManipulationService = HierarchyManipulationService;
			this.HierarchyLayoutService = HierarchyLayoutService;
			this.SoundHandlerService = SoundHandlerService;
			this.ConfigProviderService = ConfigProviderService;
			
			// Graphical offset from the SVG's border to the first nodes
			// Note that level captions are drawn within that offset
			this.offsetX = 25;
			this.offsetY = 30;
			// The same when in rotated mode
			this.vertOffsetX = 150;
			this.vertOffsetY = 25;
			
			// Settings for CSS transitions
			this.transition = {
				duration: 750,
				links: false,
				nodes: false,
				rotation: false,
				contextMenu: false
			};
			
			
			// Possible zoom range
			this.scaleExtent = [0.5, 10];
			
			// Possible pan range
			this.panningLimit = 0.95;
			this.allowCrossAxisZoom = false;
			this.allowCrossAxisPan = false;
			
			// Boundaries for enforcing pan range
			this.timeAxisStartPosition = undefined;
			this.timeAxisEndPosition = undefined;
			this.crossAxisStartPosition = undefined;
			this.crossAxisEndPosition = undefined;
			this.northernBoundary = undefined;
			this.southernBoundary = undefined;
			this.westernBoundary = undefined;
			this.easternBoundary = undefined;
			
			
			// While the user zooms (scrolls mouse wheel), many zoom events are
			// fired. The last zoom event must be treated differently than the ones
			// before it:
			
			// A promise that can be cancelled from within this.zoom()
			this.zoomTimeoutPromise = null;
			// The last scale factor that was applied by a "final zoom event"
			this.lastScaleFactor = 1;
			
			this._inited = false;
		}
		
		$postLink (){
			/////////////////////////////
			// inital d3.js setup stuff
			
			this.element = this.$element;
			this.width = 0;
			this.height = 0;
			
			this.background = styles.colorDarkGrey;
			
			// scaleExtent limits the amount of zooming possible
			this.zoomListener = d3.zoom()
			.scaleExtent(this.scaleExtent)
			.on('zoom', this.zoom.bind(this));
			
			// Create the d3 element and position it based on margins
			this.svg = d3.select(this.element.find('div')[0])
			.append('svg')
			.attr('width', '100%')
			.attr('height', '100%')
			.style('background-color', this.background)
			.call(this.zoomListener)
			.on('dblclick.zoom', null)
			.on('mousemove', this.svgOnMouseMove.bind(this))
			.on('click', this.svgOnClick.bind(this))
			.append('g')
			;
			
			this.zoomer = this.svg.append("rect")
			.attr("width", '100%')
			.attr("height", '100%')
			.style("fill", "none")
			.style("pointer-events", "all")
			.call(this.zoomListener);
			
			this.shiftMode = false;
			
			
			
			// Append a group which holds all overlay captions and which do not react to zooming
			this.captionLayer = this.svg.append('g').style('z-index', 5);
			
			this.timeArrow = this.svg.append('g')
			.append('text')
			.style('fill', styles.colorWhite)
			.text('time →');
			
			this.scaleFactorDisplay = this.svg.append('g');
			this.scaleFactorDisplay.append('text');
			
			// Append a group which holds all nodes and which the zoom Listener can act upon.
			this.svg = this.svg.append('g').style('z-index', 1);
			
			
			// read previously stored zoom and pan values
			// this.zoomListener.translate(this.ViewStateService.hierarchyState.translate);
			// this.zoomListener.scale(this.ViewStateService.hierarchyState.scaleFactor);
			// this.render();
			var t = d3.zoomTransform(this.zoomer.node());
			this.zoomer.call(this.zoomListener.transform, d3.zoomIdentity.translate(t.x, t.y).scale(t.k));
		}
		
		$onChanges (changes){
			// console.log(changes);
			
			if(changes.vertical){
				if(changes.vertical.currentValue !== changes.vertical.previousValue){
					if(this._inited){
						this.rotate();
					}
				}
			}
			
			if(changes.curLevelAttrDefs){
				if(changes.curLevelAttrDefs.currentValue !== changes.curLevelAttrDefs.previousValue){
					if(this._inited){
						this.render();
					}
				}
			}
			
			if(changes.playing){
				if(changes.playing.currentValue !== changes.playing.previousValue){
					if(this._inited){
						if (typeof this.selectedItem !== 'undefined'){
							this.play(this.selectedItem);
						}
					}
				}
			}
			
			if(changes.hierarchyPath){
				if(changes.hierarchyPath.currentValue !== changes.hierarchyPath.previousValue){
					if(this._inited){
						this.newLinkFromId = undefined;
						this.render();
					}
				}
			}
			
			if(changes.movesAwayFromLastSave){
				if(changes.movesAwayFromLastSave.currentValue !== changes.movesAwayFromLastSave.previousValue){
					if(this._inited){
						this.render();
					}
				}
			}
			
			if(changes.newLinkFromId){
				if(changes.newLinkFromId.currentValue !== changes.newLinkFromId.previousValue){
					if(this._inited){
						this.newLinkSrc = this.LevelService.getItemByID(changes.newLinkFromId.currentValue);
						this.render();
					}
				}
			}
			
			if(changes.isShown){
				if(changes.isShown.currentValue !== changes.isShown.previousValue){
					if(changes.isShown.currentValue){
						if(this._inited){
							this.render();
						}
					}
				}
			}
			
			if(changes.contextMenuId){
				if(changes.contextMenuId.currentValue !== changes.contextMenuId.previousValue){
					if(this._inited){
						this.render();
					}
				}
			}
			
			if(changes.hierarchyResize){
				if(changes.hierarchyResize.currentValue !== changes.hierarchyResize.previousValue){
					if(this._inited){
						this.render();
					}
				}
			}
			
			// number is increased by controller to get update (hacky but don't see any other alternative for now)
			if(changes.attributeDefinitionClickCounter){
				if(changes.attributeDefinitionClickCounter.currentValue !== changes.attributeDefinitionClickCounter.previousValue){
					if(this._inited){
						this.render();
					}
				}
			}
			
		}
		
		$onInit (){
			this._inited = true;
		}
		
		//////////////////////
		// helper functions
		
		public checkLink (event) {
			if (event.shiftKey && !this.shiftMode) {
				if (this.ViewStateService.hierarchyState.newLinkFromID === undefined) {
					this.ViewStateService.hierarchyState.newLinkFromID = this.ViewStateService.hierarchyState.selectedItemID;
					this.shiftMode = true;
					// this.newLinkSrc = this.LevelService.getItemByID(this.ViewStateService.hierarchyState.newLinkFromID);
					// this.render();
				}
			}
			if (!event.shiftKey && this.shiftMode) {
				this.shiftMode = false;
				var linkObj = this.HierarchyManipulationService.addLink(this.ViewStateService.hierarchyState.path, this.ViewStateService.hierarchyState.newLinkFromID, this.ViewStateService.hierarchyState.selectedItemID);
				this.ViewStateService.hierarchyState.newLinkFromID = undefined;
				if (linkObj !== null) {
					this.HistoryService.addObjToUndoStack({
						type: 'HIERARCHY',
						action: 'ADDLINK',
						link: linkObj
					});
				}
			}
		};
		/**
		*
		*/
		private selectItem (item) {
			this.selectedItem = item;
			this.ViewStateService.hierarchyState.selectedItemID = item.id;
		};
		
		private selectLink (link) {
			this.selectedLink = link;
			this.ViewStateService.hierarchyState.selectedLinkFromID = link.fromID;
			this.ViewStateService.hierarchyState.selectedLinkToID = link.toID;
		};
		
		/**
		* Function to center node when clicked/dropped so node doesn't get lost when
		* collapsing/moving with large amount of children.
		*
		private centerNode(node) {
			var x = -node._x + this.width/2;
			var y = -node._y  + this.height/2;
			this.svg.transition()
			.duration(this.transition.duration)
			.attr('transform', this.getOrientatedTransform()+'translate(' + x + ',' + y + ')');
			this.zoomListener.translate([x, y]);
		};
		*/
		
		/**
		* The zoom function is called by the zoom listener, which listens for d3 zoom events and must be appended to the svg element
		*/
		private zoom () {
			var t = d3.zoomTransform(this.zoomer.node());
			// Make sure panning is within allowed regions
			t = this.limitPanning(t);
			
			// Save translate and scale so they can be re-used when the modal is re-opened
			this.ViewStateService.hierarchyState.translate = [t.x, t.y]//this.zoomListener.translate();
			this.ViewStateService.hierarchyState.scaleFactor = t.k; //this.zoomListener.scale();
			
			// Transform all SVG elements
			// Note that this.svg is actually not the svg itself but rather the main <g> within it
			// Note further that this.captionLayer is a sibling and not a descendant of this.svg
			this.svg.attr('transform', this.getOrientatedTransform(true));
			this.captionLayer.attr('transform', this.getOrientatedLevelCaptionLayerTransform());
			this.captionLayer.selectAll('g.emuhierarchy-levelcaption').attr('transform', this.getOrientatedLevelCaptionTransform.bind(this));
			
			// Call this.render(), but make sure it's only called once a rush of zoom events has finished
			if (this.zoomTimeoutPromise !== null) {
				this.$timeout.cancel(this.zoomTimeoutPromise);
				this.zoomTimeoutPromise = null;
			}
			this.zoomTimeoutPromise = this.$timeout(this.render.bind(this), 200);
		};
		
		
		/**
		* Check if user's chosen panning value is within such limits that the
		* graph is still visible.
		*
		* Actually, a portion of the graph defined by (1-this.limit)%.
		*
		* If the factor is not within that limit, reset it.
		*/
		private limitPanning (t) {
			// Read user's panning value
			var x = t.x;
			var y = t.y;
			
			if (this.vertical) {
				if (!this.allowCrossAxisPan) {
					y = 0;
				} else {
					if (y > this.southernBoundary - this.crossAxisStartPosition) {
						y = this.southernBoundary - this.crossAxisStartPosition;
					}
					if (y < this.northernBoundary - this.crossAxisEndPosition) {
						y = this.northernBoundary - this.crossAxisEndPosition;
					}
				}
				
				if (x > this.easternBoundary - this.timeAxisStartPosition) {
					x = this.easternBoundary - this.timeAxisStartPosition;
				}
				if (x < this.westernBoundary - this.timeAxisEndPosition) {
					x = this.westernBoundary - this.timeAxisEndPosition;
				}
			} else {
				if (!this.allowCrossAxisPan) {
					x = 0;
				} else {
					if (x > this.easternBoundary - this.crossAxisStartPosition) {
						x = this.easternBoundary - this.crossAxisStartPosition;
					}
					if (x < this.westernBoundary - this.crossAxisEndPosition) {
						x = this.westernBoundary - this.crossAxisEndPosition;
					}
				}
				
				if (y > this.southernBoundary - this.timeAxisStartPosition) {
					y = this.southernBoundary - this.timeAxisStartPosition;
				}
				if (y < this.northernBoundary - this.timeAxisEndPosition) {
					y = this.northernBoundary - this.timeAxisEndPosition;
				}
			}
			
			return({x: x, y: y, k: t.k})

			// this.zoomListener.translate([x, y]);
			// SIC this causes issue
			// this.zoomer.call(this.zoomListener.transform, d3.zoomIdentity.translate(t.x,t.y).scale(t.k));
		};
		
		private rotate () {
			// When rotating, we should preserve (to some accuracy)
			// the part of the graph we're looking at.
			// We therefore calculate how much of the graph is
			// panned away before the rotation and try to restore
			// that value afterwards.
			
			// var translate = this.zoomListener.translate();
			var t = d3.zoomTransform(this.zoomer.node());

			var percentageAwayTimeAxis, percentageAwayCrossAxis;
			if (this.vertical === true) {
				// Changing from horizontal to vertical
				percentageAwayTimeAxis = (t.y) / this.timeAxisEndPosition;
				percentageAwayCrossAxis = (t.x) / this.crossAxisEndPosition;
			} else {
				// Changing from vertical to horizontal
				percentageAwayTimeAxis = (t.x) / this.timeAxisEndPosition;
				percentageAwayCrossAxis = (t.y) / this.crossAxisEndPosition;
			}
			
			this.render();
			
			percentageAwayTimeAxis = percentageAwayTimeAxis * this.timeAxisEndPosition;
			percentageAwayCrossAxis = percentageAwayCrossAxis * this.crossAxisEndPosition;
			
			if (this.vertical === true) {
				// Changing from horizontal to vertical
				// this.zoomListener.translate([percentageAwayTimeAxis, percentageAwayCrossAxis]);
				this.zoomer.call(this.zoomListener.transform, d3.zoomIdentity.translate(percentageAwayTimeAxis, percentageAwayCrossAxis).scale(t.k));
			} else {
				// Changing from vertical to horizontal
				// this.zoomListener.translate([percentageAwayCrossAxis, percentageAwayTimeAxis]);
				this.zoomer.call(this.zoomListener.transform, d3.zoomIdentity.translate(percentageAwayCrossAxis, percentageAwayTimeAxis).scale(t.k));
			}
			
			this.limitPanning(t);
			
			// Make sure the programmatic changes to the translate vector are applied
			// TODO: do we need this?
			// this.zoomListener.event(this.svg);
		};
		
		/**
		* This transform is applied to the main <g> within the SVG
		* That <g> contains all the nodes and links but not the level captions
		* and neither the time arrow
		*/
		private getOrientatedTransform (zoomInProgress) {
			var transform = '';
			var t = d3.zoomTransform(this.zoomer.node());
			t = this.limitPanning(t);

			if (this.vertical) {
				transform += 'translate(' + t.x + ',' + t.y + ')';
				transform += 'scale(-1,1),rotate(90)';
			} else {
				transform += 'translate(' + t.x + ',' + t.y + ')';
				transform += 'rotate(0)';
			}

			if (zoomInProgress === true) {
				var factor = t.k / this.lastScaleFactor; //this.zoomListener.scale() / this.lastScaleFactor;
				if (this.allowCrossAxisZoom) {
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
		private getOrientatedNodeTransform () {
			// Parameter d is never used because this is independent from the node's position
			
			if (this.vertical) {
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
		private getOrientatedLinkStrokeWidth () {
			return '2px';
		};
		
		private getOrientatedGhostLinkStrokeWidth () {
			return '15px';
		};
		
		private getNodeText (d) {
			var level = this.ViewStateService.getCurAttrDef(this.LevelService.getLevelName(d.id));
			for (var i = 0; i < d.labels.length; ++i) {
				if (d.labels[i].name === level) {
					// return String(d.id); // SIC -> just 4 testing
					return d.labels[i].value;
				}
			}
			console.debug ('Likely a bug: Did not find the label selected for display', 'Selected level:', level, 'Node: ', d);
			return 'NO VALUE';
		};
		
		private getLevelCaptionText (levelName) {
			var attributeDefinition = this.ViewStateService.getCurAttrDef(levelName);
			if (levelName === attributeDefinition) {
				return levelName;
			} else {
				return levelName + ':' + attributeDefinition;
			}
		};
		
		private getOrientatedNodeCollapseText (d) {
			if (this.vertical) {
				if (this.ViewStateService.hierarchyState.getCollapsed(d.id)) {
					return '↓';
				} else {
					return '↑';
				}
			} else {
				if (this.ViewStateService.hierarchyState.getCollapsed(d.id)) {
					return '→';
				} else {
					return '←';
				}
			}
		};
		
		/**
		* This transform is applied to all nodes' text labels
		*/
		private getOrientatedTextTransform () {
		};
		
		private getOrientatedTextAnchor () {
			if (this.vertical) {
				return 'middle';
			} else {
				return 'begin';
			}
		};
		
		private getOrientatedTextX () {
			if (this.vertical) {
				return 0;
			} else {
				return 10;
			}
		};
		
		private getOrientatedTextY () {
			if (this.vertical) {
				return '1.45em';
			} else {
				return '0.35em';
			}
		};
		
		private getOrientatedLevelCaptionLayerTransform () {
			var t = d3.zoomTransform(this.zoomer.node());
			t = this.limitPanning(t);
			if (this.vertical) {
				return 'translate(0, ' + t.y + ')';
			} else {
				return 'translate(' + t.x + ', 0)';
			}
		};
		
		private getOrientatedLevelCaptionTransform (d) {
			var revArr = angular.copy(this.ViewStateService.hierarchyState.path).reverse();
			if (this.vertical) {
				return 'translate(25, ' + this.depthToX(revArr.indexOf(d)) + ')';
			} else {
				return 'translate(' + this.depthToX(revArr.indexOf(d)) + ', 20)';
			}
		};
		
		private getOrientatedAddItemButtonTransform () {
			if (this.vertical) {
				return 'translate(-12, -5)';
			} else {
				return 'translate(-12, -5)';
			}
		};
		
		private getOrientatedTimeLevelBackgroundTransform () {
			if (this.vertical) {
				return 'translate(' + (this.vertOffsetX - 25) + ',-8)';
			} else {
				return 'translate(-8,' + (this.offsetY - 20) + ')';
			}
		};
		
		private getOrientatedTimeLevelBackgroundWidth () {
			if (this.vertical) {
				return '100%';
			} else {
				return '15px';
			}
		};
		
		private getOrientatedTimeLevelBackgroundHeight () {
			if (this.vertical) {
				return '15px';
			} else {
				return '100%';
			}
		};
		
		private getOrientatedMousePosition (mouse) {
			var t = d3.zoomTransform(this.zoomer.node());
			t = this.limitPanning(t);
			if (this.vertical) {
				return [
					( mouse[1] - t.y ),
					( mouse[0] - t.x )
				];
			} else {
				return [
					( mouse[0] - t.x ),
					( mouse[1] - t.y )
				];
			}
		};
		
		
		private getPath (d) {
			return 'M' + d._fromX + ' ' + d._fromY + 'Q' + d._fromX + ' ' + d._toY + ' ' + d._toX + ' ' + d._toY;
		};
		
		/**
		* Calculate the path for the dashed preview link that is shown when
		* trying to add a new link.
		*/
		private getPreviewPath () {
			var from = {x: this.newLinkSrc._x, y: this.newLinkSrc._y};
			var to = {x: this.selectedItem._x, y: this.selectedItem._y};
			
			return 'M' + from.x + ' ' + from.y + 'Q' + from.x + ' ' + to.y + ' ' + to.x + ' ' + to.y;
		};
		
		/**
		* Return a color depending on the validity of the link the user is
		* trying to create.
		*
		* If the link is invalid, this function will try reversing the link.
		*/
		private getPreviewColor () {
			var validity = this.HierarchyManipulationService.checkLinkValidity(this.ViewStateService.hierarchyState.path, this.newLinkSrc.id, this.selectedItem.id);
			
			if (validity.valid) {
				return 'green';
			} else {
				if (validity.reason === 3) {
					validity = this.HierarchyManipulationService.checkLinkValidity(this.ViewStateService.hierarchyState.path, this.selectedItem.id, this.newLinkSrc.id);
					if (validity.valid) {
						return 'green';
					}
				}
				return 'red';
			}
		};
		
		private getLabelLegalnessColor (d) {
			var dom = this.svg.select('.emuhierarchy-contextmenu input').node();
			var levelName = this.LevelService.getLevelName(d.id);
			var attrIndex = this.ViewStateService.getCurAttrIndex(levelName);
			var legalLabels = this.ConfigProviderService.getLevelDefinition(levelName).attributeDefinitions[attrIndex].legalLabels;
			
			if (legalLabels === undefined || (dom.value.length > 0 && legalLabels.indexOf(dom.value) >= 0)) {
				return 'lightgreen';
			} else {
				return 'red';
			}
		};
		
		
		private svgOnMouseMove () {
			if (this.newLinkSrc !== undefined) {
				var mouse = this.getOrientatedMousePosition(d3.mouse(this.element.find('svg')[0]));
				var x = mouse[0];
				var y = mouse[1];
				
				this.svg.select('path.emuhierarchy-newlink')
				.attr('d', 'M' + this.newLinkSrc._x + ',' + this.newLinkSrc._y + ' L' + x + ',' + y)
				;
			}
		};
		
		private svgOnClick () {
			if (this.ViewStateService.hierarchyState.contextMenuID !== undefined) {
				this.$scope.$apply(() => {
					this.ViewStateService.hierarchyState.contextMenuID = undefined;
				});
			}
		};
		
		private nodeOnClick (d) {
			console.debug('Clicked node', d);
			
			if (this.ViewStateService.hierarchyState.contextMenuID === undefined) {
				d3.event.stopPropagation();
				this.ViewStateService.hierarchyState.contextMenuID = d.id;
				this.ViewStateService.hierarchyState.setEditValue(this.getNodeText(d));
				this.$scope.$apply(() => {
					this.render();
				});
			}
			
			if (this.ViewStateService.hierarchyState.contextMenuID === d.id) {
				d3.event.stopPropagation();
			}
		};
		
		private nodeOnPlayClick (d) {
			this.play(d);
		};
		
		private nodeOnCollapseClick (d) {
			console.debug('collapsing', d);
			// (De-)Collapse sub-tree
			this.HierarchyLayoutService.toggleCollapse(d, this.ViewStateService.hierarchyState.path);
			this.$scope.$apply(() => {
				this.render();
				// this.render(); // no idea why this needs 2 calls
			});
		};
		
		private nodeOnMouseOver (d) {
			this.selectItem(d);
			this.renderSelectionOnly();
		};
		
		private nodeOnInput (d) {
			var dom = this.svg.select('.emuhierarchy-contextmenu input').node();
			this.ViewStateService.hierarchyState.setEditValue(dom.value);
			
			// Give feedback on legalness
			dom.style.backgroundColor = this.getLabelLegalnessColor(d);
		};
		
		private nodeOnFocusIn () {
			this.ViewStateService.hierarchyState.inputFocus = true;
		};
		
		private nodeOnFocusOut () {
			this.ViewStateService.hierarchyState.inputFocus = false;
		};
		
		private linkOnMouseOver (d) {
			this.selectLink(d);
			this.renderSelectionOnly();
		};
		
		private addButtonOnClick (d) {
			var id = this.LevelService.pushNewItem (d);
			if (id !== -1) {
				this.HistoryService.addObjToUndoStack({
					type: 'HIERARCHY',
					action: 'PUSHITEM',
					newID: id,
					level: d
				});
			}
			this.$scope.$apply(() => {
				this.render();
			});
		};
		
		
		private play (d) {
			var timeInfoLevel = this.ViewStateService.hierarchyState.path[0];
			if (typeof timeInfoLevel === 'undefined') {
				console.debug('Likely a bug: There is no path selection. Not executing play():', d);
				return;
			}
			var timeInfoType = this.LevelService.getLevelDetails(timeInfoLevel).type;
			
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
				itemList = itemList.concat(this.HierarchyLayoutService.findChildren(currentItem, this.ViewStateService.hierarchyState.path));
			}
			
			console.debug('Node info for playback: ', timeInfoType, d, startSample, endSample);
			
			if (startSample === null || endSample === null) {
				console.debug('No time information found for node, aborting playback', d);
				return;
			}
			
			this.SoundHandlerService.playFromTo(startSample, endSample);
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
		private depthToX (depth) {
			var crossAxisSize, offset;
			if (this.vertical) {
				crossAxisSize = this.height;
				offset = this.vertOffsetY;
			} else {
				crossAxisSize = this.width;
				offset = this.offsetX;
			}
			
			var result = depth / this.ViewStateService.hierarchyState.path.length * crossAxisSize;
			if (this.allowCrossAxisZoom) {
				result *= this.zoomListener.scale();
			}
			
			result += offset;
			
			return result;
		};
		
		private posInLevelToY (posInLevel) {
			var t = d3.zoomTransform(this.zoomer.node());
			var t = this.limitPanning(t);
			var offset, timeAxisSize;
			if (this.vertical) {
				offset = this.vertOffsetX;
				timeAxisSize = this.width - offset;
			} else {
				offset = this.offsetY;
				timeAxisSize = this.height - offset;
			}
			
			var result = posInLevel * timeAxisSize * t.k;
			result += offset;
			return result;
		};
		
		//
		/////////////////////////////
		
		
		
		
		//
		/////////////////////////////
		
		
		////////////
		// Here come the two main functions of the directive
		//
		// this.render() and this.renderSelectionOnly() do the bulk of the
		// work
		
		
		/**
		* Adjust the colors of all nodes and links to reflect the user's
		* selection.
		*
		* @param nothing
		* @returns nothing
		*/
		private renderSelectionOnly () {
			// Change the circle fill of all nodes depending on whether they are selected
			this.svg.selectAll('circle.emuhierarchy-nodeCircle')
			.style('fill', (d) => {
				var color = styles.colorWhite;
				
				if (typeof this.selectedItem !== 'undefined' && d.id === this.selectedItem.id) {
					color = styles.colorBlue;
				}
				
				return color;
			})
			;
			
			this.svg.selectAll('path.emuhierarchy-link')
			.style('stroke', (d) => {
				if (this.selectedLink === d) {
					return styles.colorYellow;
				} else {
					return styles.colorGrey;
				}
			})
			;
			
			this.svg.select('.emuhierarchy-newlinkpreview')
			.attr('d', this.getPreviewPath.bind(this))
			.style('stroke', this.getPreviewColor.bind(this))
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
		private render () {
			// console.log(this.lastScaleFactor);
			var i;
			var t = d3.zoomTransform(this.zoomer.node());
			t = this.limitPanning(t);
			// this.lastScaleFactor = this.zoomListener.scale();
			this.lastScaleFactor = t.k;
			// console.log(t);
			
			// Get current width and height of SVG
			this.width = parseInt(d3.select(this.element.find('svg')[0]).style('width'), 10);
			this.height = parseInt(d3.select(this.element.find('svg')[0]).style('height'), 10);
			
			// Set orientation
			if (this.transition.rotation) {
				this.svg.transition()
				.duration(this.transition.duration)
				.attr('transform', this.getOrientatedTransform(false))
				;
			} else {
				this.svg.attr('transform', this.getOrientatedTransform(false));
			}
			
			
			/////////
			// Draw time arrow
			if (this.vertical) {
				this.timeArrow.attr('transform', 'translate(' + (this.width / 2) + ',' + (this.height - 10) + ')');
			} else {
				this.timeArrow.attr('transform', 'translate(' + (this.width - 20) + ',' + (this.height / 2) + ')rotate(90)');
			}
			
			
			/////////
			// Draw scale factor display
			if (this.vertical) {
				this.scaleFactorDisplay
				.attr('transform', 'translate(' + this.width + ', 20)')
				;
				
				this.scaleFactorDisplay
				.select('text')
				.attr('text-anchor', 'end')
				.style('fill', styles.colorWhite)
				.text('Zoom: ' + Math.round(t.k * 100) + ' %');
			} else {
				this.scaleFactorDisplay
				.attr('transform', 'translate(0, ' + this.height + ')')
				;
				
				this.scaleFactorDisplay
				.select('text')
				.attr('text-anchor', 'start')
				.style('fill', styles.colorWhite)
				.text('Zoom: ' + Math.round(t.k * 100) + ' %')
				;
			}
			
			
			/////////
			// Draw level captions and 'add item buttons' (which append
			// nodes to the respective levels
			this.captionLayer.attr('transform', this.getOrientatedLevelCaptionLayerTransform());
			
			// for reference on the .data() call, compare the comment on
			// this.render() above
			var levelCaptionSet = this.captionLayer.selectAll('g.emuhierarchy-levelcaption')
			.data(this.ViewStateService.hierarchyState.path, (d) => {
				return d;
			});
			
			var oldLevelCaptions = levelCaptionSet.exit(); // remove unneeded captions
			var newLevelCaptions = levelCaptionSet.enter();
			
			newLevelCaptions = newLevelCaptions
			.append('g')
			.attr('class', 'emuhierarchy-levelcaption')
			;
			
			newLevelCaptions
			.append('text')
			;
			
			var addItemButtons = newLevelCaptions
			.filter((d) => {
				var levelType = this.LevelService.getLevelDetails(d).type;
				return (levelType === 'ITEM');
			})
			.append('g')
			.attr('class', 'emuhierarchy-addbutton')
			.attr('transform', this.getOrientatedAddItemButtonTransform.bind(this))
			.on('click', this.addButtonOnClick.bind(this))
			;
			
			addItemButtons
			.append('circle')
			.style('fill', styles.colorBlue)
			.attr('r', 8)
			;
			
			addItemButtons
			.append('path')
			.style('stroke', styles.colorWhite)
			.attr('d', 'M0,-6 V6 M-6,0 H6')
			;
			
			newLevelCaptions
			.filter((d) => {
				var levelType = this.LevelService.getLevelDetails(d).type;
				return (levelType === 'SEGMENT' || levelType === 'EVENT');
			})
			.append('rect')
			.attr('class', 'emuhierarchy-timelevelbackground')
			.style('fill', styles.colorTransparentGrey)
			;
			
			// merge new ones
			levelCaptionSet = levelCaptionSet.merge(newLevelCaptions);

			levelCaptionSet
			.attr('transform', this.getOrientatedLevelCaptionTransform.bind(this))
			;
			
			levelCaptionSet
			.select('text')
			.text(this.getLevelCaptionText.bind(this));
			
			levelCaptionSet
			.select('.emuhierarchy-timelevelbackground')
			.attr('transform', this.getOrientatedTimeLevelBackgroundTransform.bind(this))
			.style('width', this.getOrientatedTimeLevelBackgroundWidth.bind(this))
			.style('height', this.getOrientatedTimeLevelBackgroundHeight.bind(this))
			;
			

			if (this.transition.rotation) {
				oldLevelCaptions = oldLevelCaptions.transition()
				.duration(this.transition.duration)
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
			this.HierarchyLayoutService.calculateWeightsBottomUp(this.ViewStateService.hierarchyState.path);
			
			for (i = 0; i < this.ViewStateService.hierarchyState.path.length; ++i) {
				// Add all nodes that are not collapsed
				var levelItems = this.LevelService.getLevelDetails(this.ViewStateService.hierarchyState.path[i]).items;
				for (var ii = 0; ii < levelItems.length; ++ii) {
					if (levelItems[ii]._visible) {
						nodes.push(levelItems[ii]);
					}
				}
			}
			
			
			// Make sure the selected things are visible, otherwise un-select them
			var selectedItem = this.LevelService.getItemByID(this.ViewStateService.hierarchyState.selectedItemID);
			var contextMenuItem = this.LevelService.getItemByID(this.ViewStateService.hierarchyState.contextMenuID);
			var selectedLinkFromItem = this.LevelService.getItemByID(this.ViewStateService.hierarchyState.selectedLinkFromID);
			var selectedLinkToItem = this.LevelService.getItemByID(this.ViewStateService.hierarchyState.selectedLinkToID);
			
			
			if (selectedItem !== undefined && !selectedItem._visible) {
				console.debug('Unselecting node');
				this.ViewStateService.hierarchyState.selectedItemID = undefined;
			}
			
			if (selectedLinkFromItem !== undefined && !selectedLinkFromItem._visible) {
				console.debug('Unselecting link');
				this.ViewStateService.hierarchyState.selectedLinkFromID = undefined;
				this.ViewStateService.hierarchyState.selectedLinkToID = undefined;
			}
			
			if (selectedLinkToItem !== undefined && !selectedLinkToItem._visible) {
				console.debug('Unselecting link');
				this.ViewStateService.hierarchyState.selectedLinkFromID = undefined;
				this.ViewStateService.hierarchyState.selectedLinkToID = undefined;
			}
			
			if (contextMenuItem !== undefined && !contextMenuItem._visible) {
				console.debug('Closing context menu (node became invisible)');
				this.ViewStateService.hierarchyState.contextMenuID = undefined;
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
			var allLinks = this.DataService.getData().links;
			for (var l = 0; l < allLinks.length; ++l) {
				for (i = 0; i < this.ViewStateService.hierarchyState.path.length - 1; ++i) {
					var element = this.LevelService.getItemFromLevelById(this.ViewStateService.hierarchyState.path[i], allLinks[l].toID);
					var parentElement = this.LevelService.getItemFromLevelById(this.ViewStateService.hierarchyState.path[i + 1], allLinks[l].fromID);
					
					if (element === null) {
						continue;
					}
					if (parentElement === null) {
						continue;
					}
					if (!element._visible) {
						continue;
					}
					if (this.ViewStateService.hierarchyState.getCollapsed(parentElement.id) || !parentElement._visible) {
						continue;
					}
					
					links.push(allLinks[l]);
				}
			}
			
			
			// Transform relative coordinates (_posInLevel and _depth) to actual coordinates (_x and _y)
			nodes.forEach((d) => {
				d._x = this.depthToX(d._depth);
				d._y = this.posInLevelToY(d._posInLevel);
			});
			links.forEach((d) => {
				d._fromX = this.depthToX(d._fromDepth);
				d._fromY = this.posInLevelToY(d._fromPosInLevel);
				d._toX = this.depthToX(d._toDepth);
				d._toY = this.posInLevelToY(d._toPosInLevel);
			});
			
			
			//////
			// Now that all actual coordinates have been calculated, we
			// update our SVG using d3js data joins
			//
			// for reference on the .data() call, compare the comment on
			// this.render() above
			
			//
			// Define the data set to be visualised
			
			var dataSet = this.svg.selectAll('g.emuhierarchy-node')
			.data(nodes, (d) => {
				return d.id;
			});

			var oldNodes = dataSet.exit();
			var newNodes = dataSet.enter();
			
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
			.merge(newNodes)
			// event handlers
			//.call(dragListener)
			.attr('pointer-events', 'mouseover')
			.on('click', this.nodeOnClick.bind(this))
			//.on('dblclick', this.nodeOnRightClick)
			.on('mouseover', this.nodeOnMouseOver.bind(this))
			;
			
			var circle = newNodes.append('circle')
			.attr('class', 'emuhierarchy-nodeCircle')
			.style('stroke', styles.colorGrey)
			;
			
			if (this.transition.nodes) {
				circle
				// Make circle invisible at first
				.attr('r', 0)
				// And then transition it to its normal size
				.transition()
				.duration(this.transition.duration)
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
			newNodes.attr('transform', (d) => {
				var position = this.ViewStateService.hierarchyState.getCollapsePosition(d.id);
				if (typeof position !== 'undefined') {
					var x = position[0];
					var y = position[1];
					this.ViewStateService.hierarchyState.setCollapsePosition(d.id, undefined);
					return 'translate(' + x + ',' + y + ')' + this.getOrientatedNodeTransform();
				}
			});

			// merge new ones
			dataSet = dataSet.merge(newNodes);

			//
			// Remove nodes that shall no longer be part of the svg
			
			// Transition exiting nodes to the origin
			
			if (this.transition.nodes) {
				oldNodes = oldNodes
				.transition()
				.duration(this.transition.duration)
				.attr('transform', (d) => {
					var collapsePosition = this.ViewStateService.hierarchyState.getCollapsePosition(d.id);
					if (typeof collapsePosition !== 'undefined') {
						var x = collapsePosition[0];
						var y = collapsePosition[1];
						this.ViewStateService.hierarchyState.setCollapsePosition(d.id, undefined);
						return 'translate(' + x + ',' + y + ')';
					} else {
						return 'translate(' + 0 + ',' + 0 + ')';
					}
				})
				.remove();
			} else {
				oldNodes = oldNodes
				.attr('transform', (d) => {
					var collapsePosition = this.ViewStateService.hierarchyState.getCollapsePosition(d.id);
					if (typeof collapsePosition !== 'undefined') {
						var x = collapsePosition[0];
						var y = collapsePosition[1];
						this.ViewStateService.hierarchyState.setCollapsePosition(d.id, undefined);
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
			.attr ('x', this.getOrientatedTextX.bind(this))
			.attr ('y', this.getOrientatedTextY.bind(this))
			.attr('text-anchor', this.getOrientatedTextAnchor.bind(this))
			.attr('transform', this.getOrientatedTextTransform.bind(this))
			.text(this.getNodeText.bind(this))
			;
			
			// Change the circle fill depending on whether it is collapsed and/or selected
			dataSet.select('circle.emuhierarchy-nodeCircle')
			// Highlight selected item
			.style('fill', (d) => {
				var color = styles.colorWhite;
				
				if (typeof this.selectedItem !== 'undefined' && d.id === this.selectedItem.id) {
					color = styles.colorBlue;
				}
				
				return color;
			})
			// Highlight collapsed items
			.style('stroke', (d) => {
				if (this.ViewStateService.hierarchyState.getCollapsed(d.id)) {
					return styles.colorRed;
				} else {
					return styles.colorGrey;
				}
			})
			;
			
			// Transition nodes to their new position
			
			if (this.transition.nodes) {
				dataSet
				.transition()
				.duration(this.transition.duration)
				.attr('transform', (d) => {
					return 'translate(' + d._x + ',' + d._y + ')' + this.getOrientatedNodeTransform();
				});
			} else {
				dataSet
				.attr('transform', (d) => {
					return 'translate(' + d._x + ',' + d._y + ')' + this.getOrientatedNodeTransform();
				});
			}
			
			
			/////
			// Create context menu
			
			// If the context menu has been closed, remove the elements
			if (this.ViewStateService.hierarchyState.contextMenuID === undefined) {
				this.svg.selectAll('.emuhierarchy-contextmenu')
				.remove()
				;
			}
			
			// If the context menu does not yet exist, create it
			var contextMenu = this.svg.select('.emuhierarchy-contextmenu');
			
			if (contextMenu.empty()) {
				contextMenu = dataSet
				.filter((d) => {
					return d.id === this.ViewStateService.hierarchyState.contextMenuID;
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
				
				if (this.transition.contextMenu) {
					contextMenu
					.style('opacity', 0)
					.transition()
					.duration(this.transition.duration)
					.style('opacity', 0.5)
					;
				}
				
				contextMenu
				.append('text')
				.text(this.getOrientatedNodeCollapseText.bind(this))
				.attr('x', -25)
				.attr('y', -25)
				.attr('text-anchor', 'middle')
				.on('click', this.nodeOnCollapseClick.bind(this))
				;
				
				if (this.transition.contextMenu) {
					contextMenu
					.style('opacity', 0)
					.transition()
					.duration(this.transition.duration)
					.style('opacity', 1)
					;
				}
				
				contextMenu
				.append('text')
				.text('play')
				.attr('x', -25)
				.attr('y', +25)
				.attr('text-anchor', 'middle')
				.on('click', this.nodeOnPlayClick.bind(this))
				;
				
				if (this.transition.contextMenu) {
					contextMenu
					.style('opacity', 0)
					.transition()
					.duration(this.transition.duration)
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
				
				if (this.transition.contextMenu) {
					foreignObject
					.transition()
					.duration(this.transition.duration)
					.attr('width', 100)
					;
				} else {
					foreignObject.attr('width', 100);
				}
				
				foreignObject
				.append('xhtml:body')
				.append('input').attr('value', this.getNodeText.bind(this))
				.style('width', '100%')
				.style('height', '100%')
				.style('outline', 'none')
				.style('border', '0')
				.style('background-color', this.getLabelLegalnessColor.bind(this))
				.on('input', this.nodeOnInput.bind(this))
				.on('focus', this.nodeOnFocusIn.bind(this))
				.on('blur', this.nodeOnFocusOut.bind(this))
				;
				
				if (!foreignObject.empty()) {
					foreignObject.select('input').node().focus();
					foreignObject.select('input').node().select();
				}
				
			} else {
				this.svg.select('.emuhierarchy-contextmenu text').text(this.getOrientatedNodeCollapseText.bind(this));
			}
			
			// Make sure the node containing the context menu is the last
			// one in the SVG, otherwise the succeeding elements are drawn
			// visually on top of the context menu.
			this.svg.selectAll('.emuhierarchy-node').sort ((a, b) => {
				if (a.id === this.ViewStateService.hierarchyState.contextMenuID) {
					return 1;
				}
				if (b.id === this.ViewStateService.hierarchyState.contextMenuID) {
					return -1;
				}
				return 0;
			});
			
			
			//
			//
			// Now we turn to visualising links
			//
			// for reference on the .data() call, compare the comment on
			// this.render() above
			var linkSet = this.svg.selectAll('.emuhierarchy-linkgroup')
			.data(links, (d) => {
				// Form unique link ID
				return 's' + d.fromID + 't' + d.toID;
			});
			
			var oldLinks = linkSet.exit();
			var newLinks = linkSet.enter();

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
			.style('stroke-width', this.getOrientatedGhostLinkStrokeWidth.bind(this))
			.on('mouseover', this.linkOnMouseOver.bind(this))
			;
			
			newLinks
			.append('path')
			.attr('class', 'emuhierarchy-link')
			.style('stroke-width', this.getOrientatedLinkStrokeWidth.bind(this))
			;
			
			if (this.transition.links) {
				newLinks
				.style('opacity', 0)
				.transition()
				.duration(this.transition.duration)
				.style('opacity', 1)
				;
			}
			
			// merge new ones
			linkSet = linkSet.merge(newLinks);
			
			// Remove old links
			if (this.transition.links) {
				oldLinks
				.transition()
				.duration(this.transition.duration)
				.style('opacity', 0)
				.remove()
				;
			} else {
				oldLinks.remove();
			}
			
			// Set color depending on whether the link is selected
			linkSet
			.selectAll('.emuhierarchy-link')
			.style('stroke', (d) => {
				if (this.selectedLink === d) {
					return styles.colorYellow;
				} else {
					return styles.colorGrey;
				}
			})
			;
			
			
			// Transition links to their new position.
			
			if (this.transition.links) {
				linkSet
				.selectAll('.emuhierarchy-link')
				.transition()
				.duration(this.transition.duration)
				.attr('d', this.getPath.bind(this))
				.style('stroke-width', this.getOrientatedLinkStrokeWidth.bind(this))
				.style('opacity', 1)
				;
			} else {
				linkSet
				.selectAll('.emuhierarchy-link')
				.attr('d', this.getPath.bind(this))
				.style('stroke-width', this.getOrientatedLinkStrokeWidth)
				;
			}
			
			linkSet
			.selectAll('.emuhierarchy-ghostlink')
			.attr('d', this.getPath.bind(this))
			;
			
			
			// If the user is trying to add a new link,
			// visualise what he's doing
			this.svg.selectAll('.emuhierarchy-newlink').remove();
			this.svg.selectAll('.emuhierarchy-newlinkpreview').remove();
			
			if (this.newLinkSrc !== undefined) {
				this.svg.append('path')
				.attr('class', 'emuhierarchy-newlink')
				.style('stroke', 'black')
				.style('stroke-width', this.getOrientatedLinkStrokeWidth.bind(this))
				;
				
				this.svg.append('path')
				.attr('class', 'emuhierarchy-newlinkpreview')
				.attr('d', this.getPreviewPath.bind(this))
				.style('stroke', this.getPreviewColor.bind(this))
				.style('stroke-width', this.getOrientatedLinkStrokeWidth.bind(this))
				;
				
			}
			
			
			// Set boundaries within which the graph has to stay when the
			// user is panning. That is, the graph can never *completely*
			// leave these boundaries
			if (this.vertical) {
				this.northernBoundary = this.vertOffsetY + this.height * (1 - this.panningLimit);
				this.southernBoundary = this.height * this.panningLimit;
				this.westernBoundary = this.vertOffsetX + this.width * (1 - this.panningLimit);
				this.easternBoundary = this.width * this.panningLimit;
			} else {
				this.northernBoundary = this.offsetY + this.height * (1 - this.panningLimit);
				this.southernBoundary = this.height * this.panningLimit;
				this.westernBoundary = this.offsetX + this.width * (1 - this.panningLimit);
				this.easternBoundary = this.width * this.panningLimit;
			}
			
			// Find out where the time and cross axis start and end, to
			// prevent that these points leave the above boundaries.
			// Note that these do not depend on this.vertical because they
			// are transformed when the user is in "this.vertical mode".
			this.timeAxisStartPosition = this.svg.node().getBBox().y;
			this.timeAxisEndPosition = this.timeAxisStartPosition + this.svg.node().getBBox().height;
			this.crossAxisStartPosition = this.svg.node().getBBox().x;
			this.crossAxisEndPosition = this.crossAxisStartPosition + this.svg.node().getBBox().width;
		};
	}]
}


angular.module('emuwebApp')
.component(EmuHierarchyComponent.selector, EmuHierarchyComponent);
