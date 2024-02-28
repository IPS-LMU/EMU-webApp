import * as angular from 'angular';

class LevelService{
	
	private $q;
	private DataService;
	private LinkService;
	private ConfigProviderService;
	private SoundHandlerService;
	private ViewStateService;
	
	private lasteditArea; // holding current edit area
	private lasteditAreaElem; // holding current edit area element
	
	
	constructor($q, DataService, LinkService, ConfigProviderService, SoundHandlerService, ViewStateService){
		
		this.$q = $q;
		this.DataService = DataService;
		this.LinkService = LinkService;
		this.ConfigProviderService = ConfigProviderService;
		this.SoundHandlerService = SoundHandlerService;
		this.ViewStateService = ViewStateService;	
		
		this.lasteditArea = null; // holding current edit area
		this.lasteditAreaElem = null; // holding current edit area element
		
	}
	/**
	* search for the according label field in labels
	* and return its position
	*    @param attrDefName
	*    @param labels
	*/
	private getLabelIdx(attrDefName, labels) {
		var labelIdx;
		labels.forEach((l, idx) => {
			if (l.name === attrDefName) {
				labelIdx = idx;
			}
		});
		return labelIdx;
	}
	
	/**
	* returns level details by passing in level name
	* if the corresponding level exists
	* otherwise returns 'null'
	*    @param name
	*/
	public getLevelDetails(name) {
		var ret = null;
		let ld = this.DataService.getLevelData();
		if(typeof ld !== 'undefined'){
			ld.forEach((level) => {
				if (level.name === name) {
					ret = level;
				}
			});
		}
		return ret;
	};
	
	/**
	* returns level details by passing in level index
	* if the corresponding level exists
	* otherwise returns 'null'
	*    @param idx
	*/
	public getLevelDetailsByIdx(idx) {
		var ret = null;
		ret = this.DataService.getLevelData()[idx]
		if(typeof ret === 'undefined'){
			ret = null;
		}
		return ret;
	};
	
	/**
	* returns all levels with details for a specific type
	*    @param types
	*/
	public getLevelsByType(types) {
		var levels = [];
		this.DataService.getLevelData().forEach((level) => {
			if (types.indexOf(level.type) >= 0) {
				levels.push(level);
			}
		});
		return levels;
	};
	
	/**
	* gets element position inside a level with 'name'
	* by passing in the element id
	*    @param name
	*    @param id
	*/
	public getOrderById(name, id) {
		var ret = null;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				level.items.forEach((e, num) => {
					if (e.id === id) {
						ret = num;
					}
				});
			}
		});
		return ret;
	};
	
	/**
	* gets element id inside a level with 'name' by
	* passing in the element position/order
	*    @param name
	*    @param order
	*/
	public getIdByOrder(name, order) {
		var ret = null;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				level.items.forEach((element, num) => {
					if (num === order) {
						ret = element.id;
					}
				});
			}
		});
		return ret;
	};
	
	/**
	* gets item details by passing in 'name' of level
	* and item position/order
	*    @param name
	*    @param order
	*/
	public getItemDetails(name, order) {
		var ret = null;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				ret = level.items[order];
			}
		});
		return ret;
	};
	
	
	/**
	* returns the last element inside a level with 'name'
	*    @param name
	*/
	public getLastItem(name) {
		var details = null;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				details = level.items[level.items.length - 1];
			}
		});
		return details;
	};
	
	/**
	* get next element of element with id in order/position
	* inside a level with 'name'
	*    @param name
	*    @param id
	*/
	public getNextItem(name, id) {
		var ret = null;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				level.items.forEach((element, num) => {
					if (element.id === id) {
						ret = level.items[num + 1];
					}
				});
			}
		});
		return ret;
	};
	
	/**
	* get next or prev Element in time inside level with 'name'
	* after or bevore (boolean) an element with 'id'
	*    @param name
	*    @param id
	*    @param after
	*/
	public getItemInTime(name, id, after) {
		var ret = null;
		var timeDifference = Infinity;
		var startItem = this.getItemFromLevelById(name, id);
		if (startItem !== null) {
			var myStart = startItem.sampleStart || startItem.samplePoint;
			this.DataService.getLevelData().forEach((level) => {
				if (level.name === name) {
					level.items.forEach((element) => {
						var start = element.sampleStart || element.samplePoint;
						if (after) {
							if (start > myStart && start - myStart <= timeDifference) {
								timeDifference = start - myStart;
								ret = element;
							}
						}
						else {
							if (start < myStart && myStart - start <= timeDifference) {
								timeDifference = myStart - start;
								ret = element;
							}
						}
					});
				}
			});
		}
		return ret;
	};
	
	/**
	* returns item from a level with 'name' by passing in the item 'id'
	*    @param name
	*    @param id
	*/
	public getItemFromLevelById(name, id) {
		var ret = null;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				level.items.forEach((element) => {
					if (element.id === id){
						ret = element;
					}
				});
			}
		});
		return ret;
	};
	
	
	/**
	* get all labels (curAttr def applies) of a level and
	* return them as a flat array
	* @param levelDetails containing labels
	* @return array containing all labels (form==['x','y','z'])
	*/
	public getAllLabelsOfLevel(levelDetails) {
		var curAttrDef = this.ViewStateService.getCurAttrDef(levelDetails.name);
		var labels = [];
		levelDetails.items.forEach((item) => {
			var pos = item.labels.map((e) => {
				return e.name;
			}).indexOf(curAttrDef);
			if (pos >= 0) {
				labels.push(item.labels[pos].value);
			}
		});
		return labels;
	};
	
	/**
	* returns level name of a given node id
	* @param nodeID id of the node
	* @return name of the containing level
	*/
	public getLevelName(nodeID) {
		var ret = null;
		this.DataService.getLevelData().forEach((level) => {
			var pos = level.items.map((e) => {
				return e.id;
			}).indexOf(nodeID);
			if (pos >= 0) {
				ret = level.name;
			}
		});
		return ret;
	};
	
	/**
	* Returns a level object and an item object according to a given item id
	* @param nodeID id of the node
	* @return object with level and item
	*/
	public getLevelAndItem(nodeID) {
		var name = this.getLevelName(nodeID);
		if (name !== null) {
			return {level: this.getLevelDetails(name), item: this.getItemByID(nodeID)};
		}
		else {
			return null;
		}
	};
	
	/**
	* Returns an item with a given id
	* @param nodeID id of the node
	* @return item with id
	*/
	public getItemByID(nodeID) {
		var ret;
		this.DataService.getLevelData().forEach((level) => {
			var pos = level.items.map((e) => {
				return e.id;
			}).indexOf(nodeID);
			if (pos >= 0) {
				ret = level.items[pos];
			}
		});
		return ret;
	};
	
	/**
	* returns multiple item(s) from a level with 'name' by passing in
	* the start item 'id' and the length (how many objects to return)
	*    @param name
	*    @param id
	*    @param length
	*/
	public getItemsFromLevelByIdAndLength(name, id, length) {
		var ret = [];
		var lastID = id;
		for (var j = 0; j < length; j++) {
			var segment = this.getItemFromLevelById(name, lastID);
			lastID = this.getNextItem(name, segment.id);
			ret.push(segment);
		}
		return ret;
	};
	
	/**
	* Getter for last edit Area Element
	*   @return lasteditAreaElem last edit Area Element
	*/
	public getlasteditAreaElem() {
		return this.lasteditAreaElem;
	};
	
	/**
	* Setter for last edit Area Element
	*   @param e lasteditAreaElem last edit Area Element
	*/
	public setlasteditAreaElem(e) {
		this.lasteditAreaElem = e;
	};
	
	/**
	* Setter for last edit Area
	*   @param name lasteditAreaElem last edit Area
	*/
	public setlasteditArea(name) {
		this.lasteditArea = name;
	};
	
	/**
	* Getter for last edit Area
	*   @return lasteditAreaElem last edit Area
	*/
	public getlasteditArea() {
		return this.lasteditArea;
	};
	
	/**
	* Getter for id of last edited Element
	*   @return lasteditAreaElem last edit Area
	*/
	public getlastID() {
		return parseInt(this.lasteditArea.substr(1));
	};
	
	/**
	* Remove currently open html textarea (if there is a textarea open)
	* and set ViewStateService.editing to false.
	*/
	public deleteEditArea() {
		if (null !== this.getlasteditArea()) {
			$('.' + this.getlasteditArea()).remove();
		}
		this.ViewStateService.editing = false;
		// close large text input field
		this.ViewStateService.largeTextFieldInputFieldCurLabel =  '';
		this.ViewStateService.largeTextFieldInputFieldVisable = false;
		
	};
	
	/**
	* Calculate values (x,y,width,height) for textarea to open
	* depending on the current Level type, the current canvas
	* and the current clicked Element
	*   @param lastEventClick the current clicked Level Element
	*   @param element the current html Element to get canvas from
	*   @param type the current Level type
	*/
	public openEditArea(lastEventClick, element, type) {
		var levelName = this.ViewStateService.getcurClickLevelName();
		var attrDefName = this.ViewStateService.getCurAttrDef(levelName);
		
		// find labelIdx
		var labelIdx = this.getLabelIdx(attrDefName, lastEventClick.labels);
		
		var elem = element.find('canvas')[0];
		var clientWidth = elem.clientWidth;
		var clientOffset = elem.offsetLeft;
		var top = elem.offsetTop;
		var height = elem.clientHeight - 1;
		var len = 10;
		var start, end, width;
		if (labelIdx !== undefined) {
			if (lastEventClick.labels[labelIdx].value.length > 0) {
				len = lastEventClick.labels[labelIdx].value.length * 7;
			}
		}
		var editText = '';
		if (lastEventClick.labels.length > 0) {
			if (lastEventClick.labels[labelIdx] !== undefined) {
				editText = lastEventClick.labels[labelIdx].value;
			}
			else {
				editText = '';
			}
		}
		if(!this.ConfigProviderService.vals.restrictions.useLargeTextInputField){
			if (type === 'SEGMENT') {
				start = Math.floor(this.ViewStateService.getPos(clientWidth, lastEventClick.sampleStart) + clientOffset);
				end = Math.ceil(this.ViewStateService.getPos(clientWidth, (lastEventClick.sampleStart + lastEventClick.sampleDur + 1)) + clientOffset);
				this.createEditAreaElement(element, start, top, end - start, height, lastEventClick.labels[labelIdx].value, lastEventClick.id);
				
				/*
				zooming in disabled
				
				if (width < (2 * len)) {
					var zoom = ViewStateService.curViewPort.eS - ViewStateService.curViewPort.sS;
					if (zoom <= 10) { // if already zoomed in but text is still too long
						this.createEditAreaElement(element, start, top, end - start, height, lastEventClick.labels[labelIdx].value, lastEventClick.id);
					}
					else {
						ViewStateService.zoomViewPort(true, this);
						this.openEditArea(lastEventClick, element, type);
						return;
					}
				}
				*/
			} else {
				start = this.ViewStateService.getPos(clientWidth, lastEventClick.samplePoint) + clientOffset - (len / 2);
				end = this.ViewStateService.getPos(clientWidth, lastEventClick.samplePoint) + clientOffset + (len / 2);
				width = end - start;
				if (width < (2 * len)) {
					width = (2 * len);
				}
				this.createEditAreaElement(element, start, top, width, height, editText, lastEventClick.id);
			}
			this.createSelection(element.find('textarea')[0], 0, editText.length);
		}else{
			this.ViewStateService.largeTextFieldInputFieldVisable = true;
			this.ViewStateService.largeTextFieldInputFieldCurLabel =  editText;
		}
	};
	
	/**
	* Create a Text Selection in a html Textarea
	*   @param field the textarea element
	*   @param start the starting character position as int
	*   @param end the ending character position as int
	*/
	public createSelection(field, start, end) {
		if (field.createTextRange) {
			var selRange = field.createTextRange();
			selRange.collapse(true);
			selRange.moveStart('character', start);
			selRange.moveEnd('character', end);
			selRange.select();
		} else if (field.setSelectionRange) {
			field.setSelectionRange(start, end);
		} else if (field.selectionStart) {
			field.selectionStart = start;
			field.selectionEnd = end;
		}
		field.focus();
	};
	
	/**
	* create a html textarea element at given
	* @param element to prepend textarea to
	* @param x the x Position
	* @param y the y Position
	* @param width the Width
	* @param height the Height
	* @param label the Text Content of the Textarea
	* @param labelid the id of the element
	*/
	public createEditAreaElement(element, x, y, width, height, label, labelid) {
		var textid = '_' + labelid;
		var cssObj = {
			'left': Math.round(x + 2) + 'px',
			'top': Math.round(y + 1) + 'px',
			'width': Math.round(width) - 2 + 'px',
			'height': Math.round(height) - 20 + 'px',
			'padding-top': Math.round(height / 3 + 1) + 'px'
		};
		// add custom label font to CSS if specified
		if(typeof this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.labelFontFamily !== 'undefined'){
			cssObj['font-family'] = this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.labelFontFamily;
		}
		element.prepend($('<textarea>').attr({
			id: textid,
			'class': textid + ' emuwebapp-label-edit',
			'ng-model': 'message',
			'autofocus': 'true'
		}).css(cssObj).text(label));
	};
	
	/**
	* insert a new Item with id labelname start and duration at position on level
	*/
	public insertItemDetails(id, levelname, position, labelname, start, duration) {
		var attrdefs = this.ConfigProviderService.getLevelDefinition(levelname).attributeDefinitions;
		var curAttrDef = this.ViewStateService.getCurAttrDef(levelname);
		var newElement;
		if (attrdefs === undefined) { // ugly hack if attrdefs undefined
			attrdefs = [];
		}
		this.DataService.getLevelData().forEach((level) => {
			var i;
			if (level.name === levelname) {
				if (level.type === 'SEGMENT') {
					newElement = {
						id: id,
						sampleStart: start,
						sampleDur: duration,
						labels: []
					};
					if (attrdefs.length > 0) {
						for (i = 0; i < attrdefs.length; i++) {
							if (attrdefs[i].name === curAttrDef) {
								newElement.labels.push({
									name: attrdefs[i].name,
									value: labelname
								});
							} else {
								newElement.labels.push({
									name: attrdefs[i].name,
									value: labelname
								});
							}
						}
					}
					else {
						newElement.labels.push({
							name: levelname,
							value: labelname
						});
					}
				} else if (level.type === 'EVENT') {
					if (start !== undefined) {
						newElement = {
							id: id,
							samplePoint: start,
							labels: []
						};
					}
					else {
						newElement = {
							id: id,
							labels: []
						};
					}
					if (attrdefs.length > 0) {
						for (i = 0; i < attrdefs.length; i++) {
							if (attrdefs[i].name === curAttrDef) {
								newElement.labels.push({
									name: attrdefs[i].name,
									value: labelname
								});
							} else {
								newElement.labels.push({
									name: attrdefs[i].name,
									value: labelname
								});
							}
						}
					}
					else {
						newElement.labels.push({
							name: levelname,
							value: labelname
						});
					}
				}
				level.items.splice(position, 0, newElement);
			}
		});
	};
	
	/**
	* sets element details by passing in levelName and elemtent id
	*/
	public updateSegment(levelname, id, labelname, labelIdx, start, duration) {
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === levelname) {
				level.items.forEach((element) => {
					if (element.id === id) {
						if (start !== undefined) {
							element.sampleStart = start;
						}
						if (duration !== undefined) {
							element.sampleDur = duration;
						}
						if (labelname !== undefined) {
							element.labels[labelIdx].value = labelname;
						}
					}
				});
			}
		});
	};
	
	/**
	* sets element details by passing in levelName and elemtent id
	*/
	public updatePoint(levelname, id, labelname, labelIdx, start) {
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === levelname) {
				level.items.forEach((element) => {
					if (element.id === id) {
						element.samplePoint = start;
						if (labelIdx === undefined) {
							element.labels[0].value = labelname;
						}
						else {
							element.labels[labelIdx].value = labelname;
						}
					}
				});
			}
		});
	};
	
	/**
	* gets item details by passing in levelName and item id's
	*/
	public getItemNeighboursFromLevel(levelName, firstid, lastid) {
		var left;
		var right;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === levelName) {
				level.items.forEach((itm, num) => {
					if (itm.id === firstid) {
						left = level.items[num - 1];
					}
					if (itm.id === lastid) {
						right = level.items[num + 1];
					}
				});
			}
		});
		return {
			left: left,
			right: right
		};
	};
	
	/**
	* get item details by passing in level, sampleNr and maximum pcm
	*
	* @param level
	* @param sampleNr
	* @param maximum
	* @returns object of the form {current: item, nearest: item, isFirst: boolean, isLast: boolean} where
	* @returns object of the form {current: item, nearest: item, isFirst: boolean, isLast: boolean} where
	* - current is the actual item where the mouse is
	* - nearest is the item next to the current one depending on where the mouse is (ie if over 50% right element, under 50% left element)
	* - isFirst is true if the mouse is before the first item
	* - isLast is true if the mouse is after the last item
	*
	*/
	public getClosestItem(sampleNr, levelname, maximum) {
		var level = this.getLevelDetails(levelname);
		var current;
		var nearest;
		var isFirst;
		var isLast;
		
		
		if (level !== undefined && level !== null && level.items.length > 0) {
			current = nearest = level.items[0];
			isFirst = true;
			isLast = false;
			if (level.type === 'SEGMENT') {
				var leftHalf; // boolean to specify which half of the segment sampleNr is in
				level.items.forEach((itm, index) => {
					// check if in current segment
					if (sampleNr >= (itm.sampleStart - 0.5)) { // 0.5 sample correction
						if (sampleNr <= (itm.sampleStart + itm.sampleDur + 0.5)) { // 0.5 sample correction
							// check if in left or right half of segment
							if (sampleNr - itm.sampleStart >= itm.sampleDur / 2) {
								// right side
								leftHalf = false;
								if (level.items[index + 1] !== undefined) {
									current = level.items[index];
									nearest = level.items[index + 1];
									isLast = false;
								} else {
									isLast = true;
									current = nearest = level.items[level.items.length - 1];
								}
							} else {
								// left side
								leftHalf = true;
								isLast = false;
								current = nearest = level.items[index];
							}
						}
						// only set to false if not in left half of first segment
						if(!leftHalf && index === 0){
							isFirst = false;
						}
					}
					if (sampleNr >= (itm.sampleStart - 0.5)) {
						if (sampleNr <= (itm.sampleStart + itm.sampleDur + 0.5)) { // 0.5 sample correction
							current = itm;
						} else {
							isLast = true;
							current = nearest = level.items[level.items.length - 1];
						}
					}
				});
			} else {
				var spaceLower = 0;
				var spaceHigher = 0;
				isFirst = false;
				isLast = false;
				level.items.forEach((evt, index) => {
					if (index < level.items.length - 1) {
						spaceHigher = evt.samplePoint + (level.items[index + 1].samplePoint - level.items[index].samplePoint) / 2;
					} else {
						spaceHigher = maximum;
					}
					if (index > 0) {
						spaceLower = evt.samplePoint - (level.items[index].samplePoint - level.items[index - 1].samplePoint) / 2;
					} else {
						spaceLower = 0;
					}
					if (sampleNr <= spaceHigher && sampleNr >= spaceLower) {
						current = nearest = evt;
					}
				});
			}
		}
		return {
			current: current,
			nearest: nearest,
			isFirst: isFirst,
			isLast: isLast
		};
	};
	
	/**
	* deletes a level by its index
	*/
	public deleteLevel(levelIndex, curPerspectiveIdx) {
		var lvl = this.DataService.getLevelDataAt(levelIndex);
		this.DataService.deleteLevelDataAt(levelIndex);
		this.ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order.splice(levelIndex, 1);
		return lvl;
	};
	
	/**
	* adds a level by its name
	*/
	public insertLevel(originalLevel, levelIndex, curPerspectiveIdx) {
		if (this.DataService.getLevelData() === undefined) {
			this.DataService.setLevelData([]);
		}
		this.DataService.insertLevelDataAt(levelIndex, originalLevel);
		this.ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order.splice(levelIndex, 0, originalLevel.name);
	};
	
	/**
	* rename the label of an element by passing in level name and id
	*/
	public renameLabel(levelName, id, attrIndex, newLabelName) {
		this.updateSegment(levelName, id, newLabelName, attrIndex, undefined, undefined);
		
	};
	
	/**
	* rename a level by passing in old and new level name and perspective id
	*/
	public renameLevel(oldname, newname, curPerspectiveIdx) {
		//rename level name
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === oldname) {
				level.name = newname;
				this.ViewStateService.curLevelAttrDefs.forEach((def, i) => {
					if (def.curAttrDefName === oldname && def.levelName === oldname) {
						this.ViewStateService.curLevelAttrDefs.slice(i, 1);
					}
				});
				this.ViewStateService.curLevelAttrDefs.push({curAttrDefName: newname, levelName: newname});
				// rename all first label names to match new
				level.items.forEach((item) => {
					item.labels[0].name = newname;
				});
			}
		});
		// update order name as well
		this.ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order[this.ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order.indexOf(oldname)] = newname;
	};
	
	/**
	*
	*/
	public deleteSegmentsInvers(name, id, length, deletedSegment) {
		var attrDefName = this.ViewStateService.getCurAttrDef(name);
		var labelIdx;
		var x, insertPoint;
		insertPoint = 0;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				insertPoint = deletedSegment.order;
				for (x in deletedSegment.segments) {
					level.items.splice(insertPoint++, 0, deletedSegment.segments[x]);
				}
			}
		});
		var lastNeighbours = this.getItemNeighboursFromLevel(name, deletedSegment.segments[0].id, deletedSegment.segments[deletedSegment.segments.length - 1].id);
		
		if ((lastNeighbours.left !== undefined) && (lastNeighbours.right === undefined)) {
			labelIdx = this.getLabelIdx(attrDefName, lastNeighbours.left.labels);
			this.updateSegment(name, lastNeighbours.left.id, lastNeighbours.left.labels[labelIdx].value, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur - deletedSegment.timeRight));
		} else if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
			labelIdx = this.getLabelIdx(attrDefName, lastNeighbours.right.labels);
			this.updateSegment(name, lastNeighbours.right.id, lastNeighbours.right.labels[labelIdx].value, labelIdx, (lastNeighbours.right.sampleStart + deletedSegment.timeLeft), (lastNeighbours.right.sampleDur - deletedSegment.timeLeft));
		} else if ((lastNeighbours.left === undefined) && (lastNeighbours.right === undefined)) {
			
		} else {
			labelIdx = this.getLabelIdx(attrDefName, lastNeighbours.left.labels);
			this.updateSegment(name, lastNeighbours.left.id, lastNeighbours.left.labels[labelIdx].value, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur - deletedSegment.timeLeft));
			this.updateSegment(name, lastNeighbours.right.id, lastNeighbours.right.labels[labelIdx].value, labelIdx, (lastNeighbours.right.sampleStart + deletedSegment.timeRight), (lastNeighbours.right.sampleDur - deletedSegment.timeRight));
		}
	};
	
	/**
	*
	*/
	public deleteSegments(name, id, length) {
		var firstSegment = this.getItemFromLevelById(name, id);
		var firstOrder = this.getOrderById(name, id);
		var lastSegment = this.getItemDetails(name, (firstOrder + length - 1));
		var neighbours = this.getItemNeighboursFromLevel(name, firstSegment.id, lastSegment.id);
		var timeLeft = 0;
		var timeRight = 0;
		var deleteOrder = null;
		var deletedSegment = null;
		var clickSeg = null;
		var attrDefName = this.ViewStateService.getCurAttrDef(name);
		var labelIdx = this.getLabelIdx(attrDefName, firstSegment.labels);
		
		for (var i = firstOrder; i < (firstOrder + length); i++) {
			timeLeft += this.getItemDetails(name, i).sampleDur + 1;
		}
		if (timeLeft % 2 === 0) {
			timeLeft = timeLeft / 2;
			timeRight = timeLeft;
		} else {
			timeLeft = Math.ceil(timeLeft / 2);
			timeRight = timeLeft - 1;
		}
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				level.items.forEach((evt, order) => {
					if (evt.id === id) {
						deleteOrder = order;
						deletedSegment = level.items.splice(deleteOrder, length);
					}
				});
			}
		});
		
		if ((neighbours.left !== undefined) && (neighbours.right === undefined)) {
			this.updateSegment(name, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, (neighbours.left.sampleDur + timeRight));
			clickSeg = neighbours.left;
		} else if ((neighbours.left === undefined) && (neighbours.right !== undefined)) {
			this.updateSegment(name, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart - timeLeft, (neighbours.right.sampleDur + timeLeft));
			clickSeg = neighbours.right;
		} else if ((neighbours.left === undefined) && (neighbours.right === undefined)) {
			// nothing left to do level empty now
			this.ViewStateService.setcurMouseItem(undefined, undefined, undefined);
		} else {
			this.updateSegment(name, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, (neighbours.left.sampleDur + timeLeft));
			this.updateSegment(name, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart - timeRight, (neighbours.right.sampleDur + timeRight));
			clickSeg = neighbours.left;
		}
		return {
			order: deleteOrder,
			segments: deletedSegment,
			timeLeft: timeLeft,
			timeRight: timeRight,
			clickSeg: clickSeg
		};
	};
	
	/**
	*
	*/
	public insertSegmentInvers(name, start, end) {
		var ret = true;
		this.DataService.getLevelData().forEach((t) => {
			var diff, diff2, startOrder;
			if (t.name === name) {
				if (start === end) {
					startOrder = -1;
					t.items.forEach((evt, order) => {
						if (start === evt.sampleStart) {
							startOrder = order;
							ret = true;
						}
					});
					if (ret) {
						diff = 0;
						if (t.items[startOrder] !== undefined) {
							diff = t.items[startOrder].sampleDur + 1;
						}
						if (t.items[startOrder - 1] !== undefined) { // if not leftmost item
							t.items[startOrder - 1].sampleDur += diff;
						}
						t.items.splice(startOrder, 1);
					}
				} else {
					startOrder = -1;
					t.items.forEach((evt, order) => {
						if (start === evt.sampleStart) {
							startOrder = order;
							ret = true;
						}
					});
					if (ret) {
						if (t.items[startOrder + 1] === undefined) { // if rightmost item
							t.items.splice(startOrder - 1, 2);
						} else if (t.items[startOrder - 1] === undefined) { // if leftmost item
							t.items.splice(startOrder, 2);
						} else { // in the middle
							diff = t.items[startOrder].sampleDur + 1;
							diff2 = t.items[startOrder + 1].sampleDur + 1;
							t.items[startOrder - 1].sampleDur += (diff + diff2);
							t.items.splice(startOrder, 2);
						}
					}
				}
			}
		});
		return ret;
	};
	
	/**
	*
	*/
	public insertSegment(name, start, end, newLabel, ids) {
		var ret = true;
		this.DataService.getLevelData().forEach((level) => {
			var diff, diff2, startID, endID;
			if (level.name === name) {
				if (start === end) {
					if (level.items.length === 0) { // if on an empty level
						return {
							ret: false,
							ids: ids
						};
					} else { // if not on an empty level
						if (ids === undefined) {
							ids = [];
							ids[0] = this.DataService.getNewId();
						}
						startID = -1;
						if (start < level.items[0].sampleStart) { // before first segment
							diff = level.items[0].sampleStart - start;
							this.insertItemDetails(ids[0], name, 0, newLabel, start, diff - 1);
						}
						else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
							var newStart = (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur + 1);
							this.insertItemDetails(ids[0], name, level.items.length, newLabel, newStart, start - newStart);
						}
						else {
							level.items.forEach((evt, id) => {
								if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
									startID = id;
								}
								if (evt.sampleStart === start) {
									ret = false;
								}
								if (evt.sampleStart + evt.sampleDur + 1 === start) {
									ret = false;
								}
							});
							if (ret) {
								diff = start - level.items[startID].sampleStart - 1;
								this.insertItemDetails(ids[0], name, startID + 1, newLabel, start, level.items[startID].sampleDur - diff - 1);
								level.items[startID].sampleDur = diff;
							}
						}
					}
				} else {
					if (ids === undefined) {
						ids = [];
						ids[0] = this.DataService.getNewId();
						ids[1] = this.DataService.getNewId();
					}
					if (level.items.length === 0) { // if on an empty level
						this.insertItemDetails(ids[0], name, 0, newLabel, start, (end - start) - 1);
					} else { // if not on an empty level
						if (end < level.items[0].sampleStart) { // before first segment
							diff = level.items[0].sampleStart - end - 1;
							diff2 = end - start - 1;
							this.insertItemDetails(ids[0], name, 0, newLabel, end, diff);
							this.insertItemDetails(ids[1], name, 0, newLabel, start, diff2);
							
						} else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
							diff = start - (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur) - 1;
							diff2 = end - start - 1;
							var len = level.items.length;
							this.insertItemDetails(ids[0], name, len, newLabel, (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur), diff);
							this.insertItemDetails(ids[1], name, len + 1, newLabel, start, diff2);
						} else { // in the middle
							startID = -1;
							endID = -1;
							level.items.forEach((evt, id) => {
								if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
									startID = id;
								}
								if (end >= evt.sampleStart && end <= (evt.sampleStart + evt.sampleDur)) {
									endID = id;
								}
							});
							ret = (startID === endID);
							if (ret && startID !== -1) {
								diff = start - level.items[startID].sampleStart - 1;
								diff2 = end - start - 1;
								this.insertItemDetails(ids[0], name, startID + 1, newLabel, start, diff2);
								this.insertItemDetails(ids[1], name, startID + 2, newLabel, end, level.items[startID].sampleDur - diff - 1 - diff2 - 1);
								level.items[startID].sampleDur = diff;
							}
						}
					}
				}
			}
		});
		return {
			ret: ret,
			ids: ids
		};
	};
	
	/**
	*
	*/
	public insertEvent(name, start, pointName, id) {
		var alreadyExists = false;
		var pos;
		var last;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name && level.type === 'EVENT') {
				if (level.items.length > 0) {
					last = level.items[0].samplePoint;
				}
				else {
					last = 0;
				}
				level.items.forEach((evt, order) => {
					if (Math.floor(start) === Math.floor(evt.samplePoint)) {
						alreadyExists = true;
					}
					if (start > evt.samplePoint) {
						pos = order + 1;
					}
				});
			}
		});
		if (!alreadyExists) {
			if (id === undefined) {
				id = this.DataService.getNewId();
			}
			this.insertItemDetails(id, name, pos, pointName, start, -1);
		}
		return {
			alreadyExists: alreadyExists,
			id: id
		};
	};
	
	/**
	*
	*/
	public deleteEvent(name, id) {
		var ret = false;
		this.DataService.getLevelData().forEach((t) => {
			if (t.name === name && t.type === 'EVENT') {
				t.items.forEach((evt, order) => {
					if (!ret) {
						if (id === evt.id) {
							ret = evt;
							t.items.splice(order, 1);
						}
					}
				});
			}
		});
		return ret;
	};
	
	/**
	*   delete a single boundary between items
	*   @param toDelete
	*   @param name
	*   @param levelType
	*/
	public deleteBoundary(name, id, isFirst, isLast) {
		var toDelete = this.getItemFromLevelById(name, id);
		var last = null;
		var retOrder = null;
		var retEvt = null;
		var clickSeg = null;
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				last = level.items[0];
				level.items.forEach((evt, order) => {
					if (level.type === 'SEGMENT') {
						if (toDelete.sampleStart === evt.sampleStart && toDelete.sampleDur === evt.sampleDur) {
							if (order === 0 && isFirst) {
								level.items.splice(order, 1);
								retOrder = order;
								retEvt = evt;
								clickSeg = level.items[0];
							}
							else if (order === (level.items.length - 1) && isLast) {
								level.items.splice(order, 1);
								retOrder = order;
								retEvt = evt;
								clickSeg = level.items[level.items.length - 1];
							}
							else {
								for (var i = 0; i < last.labels.length; i++) {
									last.labels[i].value += evt.labels[i].value;
								}
								last.sampleDur += evt.sampleDur + 1;
								level.items.splice(order, 1);
								retOrder = order;
								retEvt = evt;
								clickSeg = last;
							}
						}
					}
					last = evt;
				});
				if (clickSeg === null) {
					clickSeg = level.items[0];
				}
			}
		});
		
		return {
			order: retOrder,
			event: retEvt,
			clickSeg: clickSeg
		};
	};
	
	/**
	*   restore a single boundary between items
	*   @param toDelete
	*   @param name
	*   @param levelType
	*/
	public deleteBoundaryInvers(name, id, isFirst, isLast, deletedSegment) {
		this.DataService.getLevelData().forEach((level) => {
			if (level.name === name) {
				level.items.splice(deletedSegment.order, 0, deletedSegment.event);
				var oldName = deletedSegment.event.labels[0].value;
				if (!isFirst && !isLast) {
					oldName = level.items[deletedSegment.order - 1].labels[0].value.slice(0, (level.items[deletedSegment.order - 1].labels[0].value.length - deletedSegment.event.labels[0].value.length));
					level.items[deletedSegment.order - 1].labels[0].value = oldName;
					level.items[deletedSegment.order - 1].sampleDur -= (deletedSegment.event.sampleDur + 1);
				}
			}
		});
		
	};
	
	/**
	*
	*/
	public snapBoundary(toTop, levelName, segment, neighbor, type) {
		var neighTd;
		var absMinDist = Infinity;
		var absDist;
		var minDist;
		var sample;
		var sampleTarget;
		if (type === 'SEGMENT') {
			sample = segment.sampleStart;
		} else if (type === 'EVENT') {
			sample = segment.samplePoint;
		}
		
		this.DataService.getLevelData().forEach((thisTd, tIdx) => {
			if (thisTd.name === levelName) {
				var currentPerspective = this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx];
				var levelOrder = currentPerspective.levelCanvases.order;
				var levelIndex = levelOrder.indexOf(levelName);
				var neighborLevelName;
				
				if (toTop) {
					if (levelIndex >= 1) {
						neighborLevelName = levelOrder[levelIndex - 1];
					} else {
						return false;
					}
				} else {
					if (levelIndex < levelOrder.length - 1) {
						neighborLevelName = levelOrder[levelIndex + 1];
					} else {
						return false;
					}
				}
				
				this.DataService.getLevelData().forEach((neighborLevelData) => {
					if (neighborLevelData.name === neighborLevelName) {
						neighTd = neighborLevelData;
						
						neighTd.items.forEach((itm) => {
							if (neighTd.type === 'SEGMENT') {
								sampleTarget = itm.sampleStart;
							} else if (neighTd.type === 'EVENT') {
								sampleTarget = itm.samplePoint;
							}
							absDist = Math.abs(sample - sampleTarget);
							
							if (absDist < absMinDist) {
								
								absMinDist = absDist;
								minDist = sampleTarget - sample;
							}
						});
					}
				});
			}
		});
		if (minDist !== undefined) {
			if (type === 'SEGMENT') {
				this.moveBoundary(levelName, segment.id, minDist, false, false);
			} else if (type === 'EVENT') {
				this.moveEvent(levelName, segment.id, minDist);
			}
			return minDist;
		} else {
			return false;
		}
	};
	
	/**
	*  moves a boundary of a given segment
	*
	*  @param levelName name The name of the level in which the segment lies
	*  @param id The id of the segment
	*  @param changeTime The time to add or subtract
	*  @param isFirst if item is first
	*  @param isLast if item is last
	*
	*/
	public moveBoundary(levelName, id, changeTime, isFirst, isLast) {
		var orig = this.getItemFromLevelById(levelName, id);
		var attrDefName = this.ViewStateService.getCurAttrDef(levelName);
		var labelIdx = this.getLabelIdx(attrDefName, orig.labels);
		var origRight;
		var ln = this.getItemNeighboursFromLevel(levelName, id, id);
		if (isFirst) { // before first item
			origRight = ln.right;
			if (origRight !== undefined) {
				if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + changeTime) < origRight.sampleStart)) {
					this.updateSegment(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
				}
			} else {
				if ((orig.sampleStart + changeTime) >= 0 && (orig.sampleDur - changeTime) >= 0 && (orig.sampleStart + orig.sampleDur + changeTime) <= this.SoundHandlerService.audioBuffer.length) {
					this.updateSegment(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
				}
			}
		} else if (isLast) { // after last item
			if ((orig.sampleDur + changeTime) >= 0 && (orig.sampleDur + orig.sampleStart + changeTime) <= this.SoundHandlerService.audioBuffer.length) {
				this.updateSegment(levelName, orig.id, undefined, labelIdx, orig.sampleStart, (orig.sampleDur + changeTime));
			}
		} else {
			if (ln.left === undefined) {
				origRight = ln.right;
				if (origRight !== undefined) {
					if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + changeTime) < origRight.sampleStart)) {
						this.updateSegment(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
					}
				} else {
					if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + orig.sampleDur + changeTime) <= this.SoundHandlerService.audioBuffer.length)) {
						this.updateSegment(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
					}
				}
			} else {
				var origLeft = ln.left;
				if ((origLeft.sampleDur + changeTime >= 0) && (orig.sampleStart + changeTime >= 0) && (orig.sampleDur - changeTime >= 0)) {
					this.updateSegment(levelName, ln.left.id, undefined, labelIdx, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
					this.updateSegment(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
				}
			}
		}
	};
	
	/**
	*
	*/
	public moveEvent(name, id, changeTime) {
		var orig = this.getItemFromLevelById(name, id);
		var attrDefName = this.ViewStateService.getCurAttrDef(name);
		var labelIdx = this.getLabelIdx(attrDefName, orig.labels);
		
		if (this.LinkService.isLinked(id)) {
			var neighbour = this.getItemNeighboursFromLevel(name, id, id);
			if ((orig.samplePoint + changeTime) > 0 && (orig.samplePoint + changeTime) <= this.SoundHandlerService.audioBuffer.length) { // if within audio
				if (neighbour.left !== undefined && neighbour.right !== undefined) { // if between two events
					// console.log('between two events')
					if ((orig.samplePoint + changeTime) > (neighbour.left.samplePoint) && (orig.samplePoint + changeTime) < (neighbour.right.samplePoint)) {
						this.updatePoint(name, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
					}
				} else if (neighbour.left === undefined && neighbour.right === undefined) { // if only event
					// console.log('only element')
					this.updatePoint(name, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
				} else if (neighbour.left === undefined && neighbour.right !== undefined) { // if first event
					// console.log('first event')
					if ((orig.samplePoint + changeTime) > 0 && (orig.samplePoint + changeTime) < (neighbour.right.samplePoint)) {
						this.updatePoint(name, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
					}
				} else if (neighbour.left !== undefined && neighbour.right === undefined) { // if last event
					// console.log('last event')
					if ((orig.samplePoint + changeTime) > neighbour.left.samplePoint && (orig.samplePoint + changeTime) <= this.SoundHandlerService.audioBuffer.length) {
						this.updatePoint(name, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
					}
				}
			}
		}
		else {
			// console.log('unlinked event')
			if ((orig.samplePoint + changeTime) > 0 && (orig.samplePoint + changeTime) <= this.SoundHandlerService.audioBuffer.length) {
				this.updatePoint(name, orig.id, orig.labels[0].value, labelIdx, (orig.samplePoint + changeTime));
			}
			//resort Points after moving
			this.DataService.getLevelData().forEach((t) => {
				if (t.name === name) {
					t.items.sort(this.ViewStateService.sortbystart);
				}
			});
		}
	};
	
	/**
	* reorder points on Event level after moving them. This is needed when Points are moved before or after each other
	*
	*/
	public orderPoints(a, b) {
		//Compare "a" and "b" in some fashion, and return -1, 0, or 1
		if (a.samplePoint > b.samplePoint){
			return 1;
		}
		if (a.samplePoint < b.samplePoint){
			return -1;
		}
		return 0;
	};
	
	/**
	*
	*/
	public moveSegment(name, id, length, changeTime) {
		var firstOrder = this.getOrderById(name, id);
		var firstSegment = this.getItemDetails(name, firstOrder);
		var lastSegment = this.getItemDetails(name, firstOrder + length - 1);
		var orig, i;
		if (firstSegment !== null && lastSegment !== null) {
			var lastNeighbours = this.getItemNeighboursFromLevel(name, firstSegment.id, lastSegment.id);
			var attrDefName = this.ViewStateService.getCurAttrDef(name);
			var labelIdx = this.getLabelIdx(attrDefName, firstSegment.labels);
			if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
				var right = this.getItemFromLevelById(name, lastNeighbours.right.id);
				if (((firstSegment.sampleStart + changeTime) > 0) && ((lastNeighbours.right.sampleDur - changeTime) >= 0)) {
					this.updateSegment(name, right.id, undefined, labelIdx, (right.sampleStart + changeTime), (right.sampleDur - changeTime));
					for (i = firstOrder; i < (firstOrder + length); i++) {
						orig = this.getItemDetails(name, i);
						this.updateSegment(name, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
					}
				}
			} else if ((lastNeighbours.right === undefined) && (lastNeighbours.left !== undefined)) {
				var left = this.getItemFromLevelById(name, lastNeighbours.left.id);
				if ((lastNeighbours.left.sampleDur + changeTime) >= 0) {
					if ((lastSegment.sampleStart + lastSegment.sampleDur + changeTime) < this.SoundHandlerService.audioBuffer.length) {
						this.updateSegment(name, left.id, undefined, labelIdx, left.sampleStart, (left.sampleDur + changeTime));
						for (i = firstOrder; i < (firstOrder + length); i++) {
							orig = this.getItemDetails(name, i);
							this.updateSegment(name, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
						}
					}
				}
			} else if ((lastNeighbours.right !== undefined) && (lastNeighbours.left !== undefined)) {
				var origLeft = this.getItemFromLevelById(name, lastNeighbours.left.id);
				var origRight = this.getItemFromLevelById(name, lastNeighbours.right.id);
				if (((origLeft.sampleDur + changeTime) >= 0) && ((origRight.sampleDur - changeTime) >= 0)) {
					this.updateSegment(name, origLeft.id, undefined, labelIdx, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
					this.updateSegment(name, origRight.id, undefined, labelIdx, (origRight.sampleStart + changeTime), (origRight.sampleDur - changeTime));
					for (i = firstOrder; i < (firstOrder + length); i++) {
						orig = this.getItemDetails(name, i);
						this.updateSegment(name, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
					}
				}
			} else if ((lastNeighbours.right === undefined) && (lastNeighbours.left === undefined)) {
				var first = this.getItemDetails(name, firstOrder);
				var last = this.getItemDetails(name, (firstOrder + length - 1));
				if (((first.sampleStart + changeTime) > 0) && (((last.sampleDur + last.sampleStart) + changeTime) < this.SoundHandlerService.audioBuffer.length)) {
					for (i = firstOrder; i < (firstOrder + length); i++) {
						orig = this.getItemDetails(name, i);
						this.updateSegment(name, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
					}
				}
			}
		}
		
	};
	
	/**
	*
	*/
	public expandSegment(rightSide, segments, name, changeTime) {
		var startTime = 0;
		var neighbours = this.getItemNeighboursFromLevel(name, segments[0].id, segments[segments.length - 1].id);
		var attrDefName = this.ViewStateService.getCurAttrDef(name);
		var labelIdx = this.getLabelIdx(attrDefName, segments[0].labels);
		var tempItem;
		var allow = true;
		
		if (rightSide) { // if expand or shrink on RIGHT side
			if (neighbours.right === undefined) { // last element
				var lastLength = segments[segments.length - 1].sampleStart + segments[segments.length - 1].sampleDur + (changeTime * segments.length);
				if (lastLength <= this.SoundHandlerService.audioBuffer.length) {
					segments.forEach((seg) => {
						tempItem = this.getItemFromLevelById(name, seg.id);
						this.updateSegment(name, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
						startTime += changeTime;
					});
				}
			} else {
				segments.forEach((seg) => {
					if ((seg.sampleDur + 1 + changeTime) < 0) {
						allow = false;
					}
				});
				if (allow && (neighbours.right.sampleDur - (changeTime * segments.length) > 0)) {
					segments.forEach((seg) => {
						tempItem = this.getItemFromLevelById(name, seg.id);
						this.updateSegment(name, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
						startTime += changeTime;
					});
					this.updateSegment(name, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart + startTime, neighbours.right.sampleDur - startTime);
				}
			}
		} else { // if expand or shrink on LEFT side
			if (neighbours.left === undefined) { // first element
				var first = this.getItemDetails(name, 0);
				if (first.sampleStart + (changeTime * (segments.length + 1)) > 0) {
					segments.forEach((seg) => {
						tempItem = this.getItemFromLevelById(name, seg.id);
						this.updateSegment(name, tempItem.id, undefined, tempItem.sampleStart - changeTime, labelIdx, tempItem.sampleDur + changeTime);
					});
				}
			} else {
				segments.forEach((seg) => {
					if ((seg.sampleDur + 1 + changeTime) < 0) {
						allow = false;
					}
				});
				if (allow && (neighbours.left.sampleDur - (changeTime * segments.length) > 0)) {
					startTime = 0;
					segments.forEach((seg, i) => {
						tempItem = this.getItemFromLevelById(name, seg.id);
						startTime = -(segments.length - i) * changeTime;
						this.updateSegment(name, tempItem.id, undefined, labelIdx, tempItem.sampleStart + startTime, tempItem.sampleDur + changeTime);
					});
					this.updateSegment(name, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, neighbours.left.sampleDur - (segments.length * changeTime));
				}
			}
		}
	};
	
	/**
	*
	*/
	public calcDistanceToNearestZeroCrossing(sample) {
		// walk right
		var distRight = Infinity;
		var distLeft = Infinity;
		var channelData = this.SoundHandlerService.audioBuffer.getChannelData(this.ViewStateService.osciSettings.curChannel);
		var i;
		for (i = sample; i < this.SoundHandlerService.audioBuffer.length - 1; i++) {
			if (channelData[i] >= 0 && channelData[i + 1] < 0 || channelData[i] < 0 && channelData[i + 1] >= 0) {
				distRight = i - sample;
				break;
			}
		}
		
		// walk left
		for (i = sample; i > 1; i--) {
			if (channelData[i] >= 0 && channelData[i - 1] < 0 || channelData[i] < 0 && channelData[i - 1] >= 0) {
				distLeft = i - sample;
				break;
			}
		}
		var res;
		if (Math.abs(distLeft) < Math.abs(distRight)) {
			res = distLeft;
		} else {
			res = distRight + 1;
		}
		
		return res;
	};
	
	/**
	* Add an item to the end of the specified level
	*
	* @param levelName of the level onto which to push the new item
	* @param id (optional) if given, this id is used instead of a new one
	*
	* @returns id of the new item or -1 if no item has been added
	*/
	public pushNewItem(levelName, id) {
		var level = this.getLevelDetails(levelName);
		console.debug(levelName, level, id);
		
		// Check whether the level has time information
		// and only proceed if this is not the case
		if (level.type === 'ITEM') {
			// Create new item object
			var newObject;
			if (typeof id === 'number') {
				newObject = {id: id, labels: []};
			} else {
				newObject = {id: this.DataService.getNewId(), labels: []};
			}
			
			// Add all necessary labels
			var attrdefs = this.ConfigProviderService.getLevelDefinition(level.name).attributeDefinitions;
			for (var i = 0; i < attrdefs.length; ++i) {
				if (attrdefs[i].type === 'STRING') {
					newObject.labels.push({name: attrdefs[i].name, value: ''});
				} else {
					newObject.labels.push({name: attrdefs[i].name, value: null});
				}
			}
			
			// Insert item into level
			level.items.push (newObject);
			
			return newObject.id;
		} else {
			return -1;
		}
	};
	
	/**
	* Add an item next to the item with id === eid.
	* Do nothing if eid is not of type ITEM (ie, if it is on a level with time information)
	*
	* @param eid The ID of the element that will get a new sibling
	* @param before boolean to define whether the new sibling will be inserted before or after eid
	* @param newID optional, only used for redoing from within the history service. if given, no new id is requested from the DataService.
	*
	* @return the id of the newly added item (if an item has been added); -1 if no item has been added
	*/
	public addItem(eid, before, newID) {
		// Check parameters
		if (eid === undefined) {
			return -1;
		}
		if (typeof before !== 'boolean') {
			return -1;
		}
		
		// Find the level and item objects corresponding to the given id
		var levelAndItem = this.getLevelAndItem(eid);
		if (levelAndItem === null) {
			console.debug('Could not find item with id:', eid);
			return -1;
		}
		var level = levelAndItem.level;
		var item = levelAndItem.item;
		
		
		// Check whether the level has time information
		// and only proceed if this is not the case
		if (level.type === 'ITEM') {
			// Find position of the given element and
			// define position of the new one
			var posOld = level.items.indexOf(item);
			var posNew;
			if (before === true) {
				posNew = posOld;
			} else {
				posNew = posOld + 1;
			}
			
			// Create new item object
			var newObject;
			if (newID === undefined) {
				newObject = {id: this.DataService.getNewId(), labels: []};
			} else {
				newObject = {id: newID, labels: []};
			}
			
			// Add all necessary labels
			var attrdefs = this.ConfigProviderService.getLevelDefinition(level.name).attributeDefinitions;
			for (var i = 0; i < attrdefs.length; ++i) {
				if (attrdefs[i].type === 'STRING') {
					newObject.labels.push({name: attrdefs[i].name, value: ''});
				} else {
					newObject.labels.push({name: attrdefs[i].name, value: null});
				}
			}
			
			// Insert item into level
			level.items.splice(posNew, 0, newObject);
			
			return newObject.id;
		}
		
		return -1;
	};
	
	/**
	* This is only used as an undo function for the above addItem() and pushNewItem()
	*
	* Deletes an item but doesn't check whether there are links to or from it
	*/
	public addItemInvers(id) {
		var levels = this.DataService.getLevelData();
		
		for (var i = 0; i < levels.length; ++i) {
			for (var ii = 0; ii < levels[i].items.length; ++ii) {
				if (levels[i].items[ii].id === id) {
					levels[i].items.splice(ii, 1);
					return;
				}
			}
		}
	};
	
	
	/**
	* Delete an item (of type ITEM, not of type SEGMENT or EVENT)
	* and all links that lead from or to it
	*
	* @param id The ID of the item to be deleted
	* @return an object like {item: object/undefined, ...} (an undefined value of item means that nothing has been done)
	*/
	public deleteItemWithLinks(id) {
		var result = {
			item: undefined,
			levelName: undefined,
			position: undefined,
			deletedLinks: []
		};
		
		var levelAndItem = this.getLevelAndItem (id);
		
		if (levelAndItem === null) {
			// item with the specified id does not exist
			return result;
		}
		
		var level = levelAndItem.level;
		var item = levelAndItem.item;
		
		if (level.type !== 'ITEM') {
			// Never touch non-ITEMs
			return result;
		}
		
		// Delete the item itself
		// console.log('Deleting item:', item, 'From level:', level);
		result.item = item;
		result.levelName = level.name;
		result.position = level.items.indexOf(item);
		level.items.splice(level.items.indexOf(item), 1);
		
		// Delete all links that lead from or to the item
		// Iterate over the links array backwards so we can manipulate the array from within the loop
		var links = this.DataService.getLinkData();
		for (var i = links.length - 1; i >= 0; --i) {
			if (links[i].fromID === id || links[i].toID === id) {
				// console.log('Deleting link', i);
				result.deletedLinks.push(links[i]);
				links.splice(i, 1);
			}
		}
		
		return result;
	};
	
	/**
	* undo the deletion of an item with its links
	*/
	public deleteItemWithLinksInvers(item, levelName, position, deletedLinks) {
		// Re-add item
		this.getLevelDetails(levelName).items.splice(position, 0, item);
		
		// Re-add deleted links
		for (var i = 0; i < deletedLinks.length; ++i) {
			this.DataService.insertLinkData(deletedLinks[i]);
		}
	};
	
}

angular.module('emuwebApp')
.service('LevelService', ['$q', 'DataService', 'LinkService', 'ConfigProviderService', 'SoundHandlerService', 'ViewStateService', LevelService])