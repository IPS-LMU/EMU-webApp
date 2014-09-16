'use strict';

angular.module('emuwebApp')
	.service('LevelService', function LevelService($q, ConfigProviderService, Soundhandlerservice, viewState, Ssffdataservice, ArrayHelperService) {
		// shared service object
		var sServObj = {};

		sServObj.data = {}; // holding level data
		sServObj.maxItemID = 0; // max currently loaded level data Id
		sServObj.lasteditArea = null; // holding current edit area
		sServObj.lasteditAreaElem = null; // holding current edit area element


		/**
		 * search for the according label field in labels
		 * and return its index
		 *    @param attrDefName
		 *    @param labels
		 */
		function getLabelIdx(attrDefName, labels) {
			var labelIdx;
			angular.forEach(labels, function (l, idx) {
				if (l.name === attrDefName) {
					labelIdx = idx;
				}
			});
			return labelIdx;
		}

		///////////////////////////////
		// public api

		sServObj.getData = function () {
			return sServObj.data;
		};

		/**
		 * sets annotation data and sets maxItemID by parsing id in elements
		 */
		sServObj.setData = function (data) {
			angular.copy(data, sServObj.data);
			angular.forEach(sServObj.data.levels, function (level) {
				level.items.forEach(function (item) {
					if (item.id > sServObj.maxItemID) {
						sServObj.maxItemID = item.id;
					}
				});
			});
		};

		/**
		 * called externally by handlekeystrokes
		 */
		sServObj.getNewId = function () {
			sServObj.maxItemID += 1;
			return sServObj.maxItemID;
		};


		/**
		 * called internally by functions
		 */
		sServObj.raiseId = function (amount) {
			sServObj.maxItemID += amount;
		};

		/**
		 * called internally by functions
		 */
		sServObj.lowerId = function (amount) {
			sServObj.maxItemID -= amount;
		};


		/**
		 * returns level details (level object and sorting id) by passing in level Name
		 */
		sServObj.getLevelDetails = function (name) {
			var curLevel = null;
			var id = null;
			angular.forEach(sServObj.data.levels, function (level, num) {
				if (level.name === name) {
					curLevel = level;
					id = num;
				}
			});
			return {
				level: curLevel,
				id: id
			};
		};

		/**
		 * gets element order by passing in elemtent id
		 */
		sServObj.getOrderById = function (name, eid) {
			var ret = undefined;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					level.items.forEach(function (e, num) {
						if (e.id === eid) {
							ret = num;
						}
					});
				}
			});
			return ret;
		};


		/**
		 * gets element id by passing in element order
		 */
		sServObj.getIdByOrder = function (name, order) {
			var ret = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					level.items.forEach(function (element, num) {
						if (num == order) {
							ret = element.id;
						}
					});
				}
			});
			return ret;
		};



		/**
		 * gets item details by passing in levelName and item order
		 */
		sServObj.getItemDetails = function (name, order) {
			var details = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					level.items.forEach(function (element, num) {
						if (num == order) {
							details = element;
						}
					});
				}
			});
			return details;
		};

		/**
		 * gets element details by passing in levelName and elemtent order
		 */
		sServObj.getLastItem = function (name) {
			var details = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					details = level.items[level.items.length - 1];
				}
			});
			return details;
		};

		/**
		 * get next Element in order
		 */
		sServObj.getNextItem = function (name, id) {
			var details = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					level.items.forEach(function (element, num) {
						if (element.id == id) {
							details = level.items[num + 1];
						}
					});
				}
			});
			return details;
		};


		/**
		 * gets item from leve by passing in levelName and item id
		 *
		 * @return item
		 */
		sServObj.getItemFromLevelById = function (levelName, id) {
			var foundItm = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelName) {
					level.items.forEach(function (element) {
						if (element.id == id) {
							foundItm = element;
						}
					});
				}
			});
			return foundItm;
		};

		/**
		 * Getter for last edit Area Element
		 *   @return lasteditAreaElem last edit Area Element
		 */
		sServObj.getlasteditAreaElem = function () {
			return sServObj.lasteditAreaElem;
		};

		/**
		 * Setter for last edit Area Element
		 *   @param lasteditAreaElem last edit Area Element
		 */
		sServObj.setlasteditAreaElem = function (e) {
			sServObj.lasteditAreaElem = e;
		};

		/**
		 * Setter for last edit Area
		 *   @param lasteditAreaElem last edit Area
		 */
		sServObj.setlasteditArea = function (name) {
			sServObj.lasteditArea = name;
		};

		/**
		 * Getter for last edit Area
		 *   @return lasteditAreaElem last edit Area
		 */
		sServObj.getlasteditArea = function () {
			return sServObj.lasteditArea;
		};

		/**
		 * Getter for id of last edited Element
		 *   @return lasteditAreaElem last edit Area
		 */
		sServObj.getlastID = function () {
			return sServObj.lasteditArea.substr(1);
		};

		/**
		 * Remove currently open html textarea (if there is a textarea open)
		 * and set viewState.editing to false.
		 */
		sServObj.deleteEditArea = function () {
			if (null !== sServObj.getlasteditArea()) {
				$('.' + sServObj.getlasteditArea()).remove();
			}
			viewState.editing = false;
		};

		/**
		 * Calculate values (x,y,width,height) for textarea to open
		 * depending on the current Level type, the current canvas
		 * and the current clicked Element
		 *   @param lastEventClick the current clicked Level Element
		 *   @param element the current html Element to get canvas from
		 *   @param type the current Level type
		 */
		sServObj.openEditArea = function (lastEventClick, element, type) {
			var levelName = viewState.getcurClickLevelName();
			var attrDefName = viewState.getCurAttrDef(levelName);

			// find labelIdx
			var labelIdx = getLabelIdx(attrDefName, lastEventClick.labels);

			var elem = element.find('canvas').context.getContext('2d');
			var clientWidth = elem.canvas.clientWidth;
			var clientOffset = elem.canvas.offsetLeft;
			var top = elem.canvas.offsetTop;
			var height = elem.canvas.clientHeight;
			var len = 10;
			if(labelIdx !== undefined) {
    			len = lastEventClick.labels[labelIdx].value.length * 10;
    		}
    		console.log(lastEventClick);
    		var editText = '';
			if(lastEventClick.labels.length>0) {
			    editText = lastEventClick.labels[labelIdx].value;
			}    		
			if (type === 'SEGMENT') {
				var start = Math.floor(viewState.getPos(clientWidth, lastEventClick.sampleStart) + clientOffset);
				var end = Math.ceil(viewState.getPos(clientWidth, (lastEventClick.sampleStart + lastEventClick.sampleDur + 1)) + clientOffset);
				var width = end - start;
				if (width < (2*len)) {
				    var zoom = viewState.curViewPort.eS - viewState.curViewPort.sS;
				    console.log(zoom);
				    if(zoom <= 10) { // if already zoomed in but text is still too long
				        sServObj.createEditArea(element, start, top, end - start, height, lastEventClick.labels[labelIdx].value, lastEventClick.id);
				    }
				    else {
					    viewState.zoomViewPort(true, this);
					    sServObj.openEditArea(lastEventClick, element, type);
					    return;
					}
				}
				

				sServObj.createEditArea(element, start, top, end - start, height, editText, lastEventClick.id);
			} else {
				var start = viewState.getPos(clientWidth, lastEventClick.samplePoint) + clientOffset - (len / 2);
				var end = viewState.getPos(clientWidth, lastEventClick.samplePoint) + clientOffset + (len / 2);
				var width = end - start;
				if (width < (2*len)) {
					width = (2*len);
				}
				sServObj.createEditArea(element, start + ((end - start) / 3), top, width, height, editText, lastEventClick.id);
			}
			sServObj.createSelection(element.find('textarea')[0], 0, editText.length);
		};

		/**
		 * Create a Text Selection in a html Textarea
		 *   @param field the textarea element
		 *   @param start the starting character position as int
		 *   @param end the ending character position as int
		 */
		sServObj.createSelection = function (field, start, end) {
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
		 *   @param x the x Position
		 *   @param y the y Position
		 *   @param width the Width
		 *   @param height the Height
		 *   @param label the Text Content of the Textarea
		 *   @param labelid the id of the element
		 */
		sServObj.createEditArea = function (element, x, y, width, height, label, labelid) {
			var textid = '_' + labelid;
			element.prepend($('<textarea>').attr({
				id: textid,
				'class': textid + ' emuwebapp-labelEdit',
				'ng-model': 'message',
				'autofocus': 'true'
			}).css({
				'left': Math.round(x + 2) + 'px',
				'top': Math.round(y) + 'px',
				'width': Math.round(width) - 4 + 'px',
				'height': Math.round(height) - 1 + 'px',
				'padding-top': Math.round(height / 3 + 1) + 'px'
			}).text(label));
		};


		/**
		 * insert a new Item with id labelname start and duration at position on level
		 */
		sServObj.insertItemDetails = function (id, levelname, position, labelname, start, duration) {
			var attrdefs = ConfigProviderService.getLevelDefinition(levelname).attributeDefinitions;
			var curAttrDef = viewState.getCurAttrDef(levelname);
			var newElement;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelname) {
					if (level.type == 'SEGMENT') {
						newElement = {
							id: id,
							sampleStart: start,
							sampleDur: duration,
							labels: []
						};
						if(attrdefs.length>0) {
						    for (var i = 0; i < attrdefs.length; i++) {
    							if (attrdefs[i].name === curAttrDef) {
	    							newElement.labels.push({
		    							name: levelname,
			    						value: labelname
				    				});
					    		} else {
						    		newElement.labels.push({
							    		name: attrdefs[i].name,
								    	value: ''
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
					} else if (level.type == 'EVENT') {
						newElement = {
							id: id,
							samplePoint: start,
							labels: []
						};
						for (var i = 0; i < attrdefs.length; i++) {
							if (attrdefs[i].name === curAttrDef) {
								newElement.labels.push({
									name: levelname,
									value: labelname
								});
							} else {
								newElement.labels.push({
									name: attrdefs[i].name,
									value: ''
								});
							}
						}
					}
					level.items.splice(position, 0, newElement);
				}
			});
		};

		/**
		 * sets element details by passing in levelName and elemtent id
		 */
		sServObj.updateSegItemInLevel = function (levelname, id, labelname, labelIdx, start, duration) {
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelname) {
					level.items.forEach(function (element) {
						if (element.id == id) {
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
		sServObj.setPointDetails = function (levelname, id, labelname, start) {
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelname) {
					level.items.forEach(function (element) {
						if (element.id == id) {
							element.samplePoint = start;
							element.labels[0].value = labelname;
						}
					});
				}
			});
		};

		/**
		 * gets item details by passing in levelName and item id's
		 */
		sServObj.getItemNeighboursFromLevel = function (levelName, firstid, lastid) {
			var left = undefined;
			var right = undefined;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelName) {
					level.items.forEach(function (itm, num) {
						if (itm.id == firstid) {
							left = level.items[num - 1];
						}
						if (itm.id == lastid) {
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
		 * - current is the actual item where the mouse is
		 * - nearest is the item next to the current one depending on where the mouse is (ie if over 50% right element, under 50% left element)
		 * - isFirst is true if the mouse is before the first item
		 * - isLast is true if the mouse is after the last item
		 *          
		 */
		sServObj.getClosestItem = function (sampleNr, levelname, maximum) {
			var level = sServObj.getLevelDetails(levelname).level;
			var current = undefined;
			var nearest = undefined;
			var isFirst = undefined;
			var isLast = undefined;
			
			if (level.items.length > 0) {
			    current = nearest = level.items[0];
			    isFirst = true;
			    isLast = false;
    			if (level.type === 'SEGMENT') {
				    angular.forEach(level.items, function (itm, index) {
				    	if (sampleNr >= (itm.sampleStart - 0.5)) { // 0.5 sample correction
					    	if (sampleNr <= (itm.sampleStart + itm.sampleDur + 0.5)) { // 0.5 sample correction
						    	if (sampleNr - itm.sampleStart >= itm.sampleDur / 2) {
							    	if (level.items[index + 1] !== undefined) {
							    	    current = level.items[index];
								    	nearest = level.items[index + 1];
								    	isLast = false;
    								} else {
    								    isLast = true;
		    							current = nearest = level.items[level.items.length - 1];
			    					}
				    			} else {
				    			    isLast = false;
				    			    current = nearest = level.items[index];
						    	}
    						}
    					    isFirst = false;    						
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
		    		angular.forEach(level.items, function (evt, index) {
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
		 * deletes a level by its name
		 */
		sServObj.deleteLevel = function (levelIndex, curPerspectiveIdx) {
			var lvl = sServObj.data.levels[levelIndex];
			sServObj.data.levels.splice(levelIndex, 1);
			ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order.splice(levelIndex, 1);
			return lvl;
		};

		/**
		 * adds a level by its name
		 */
		sServObj.addLevel = function (originalLevel, levelIndex, curPerspectiveIdx) {
			if (sServObj.data.levels !== undefined) {
				sServObj.data.levels.splice(levelIndex, 0, originalLevel);
				ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order.splice(levelIndex, 0, originalLevel.name);
			} else {
				sServObj.data.levels = [];
				sServObj.data.levels.splice(levelIndex, 0, originalLevel);
				ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order.splice(levelIndex, 0, originalLevel.name);
			}
		};

		/**
		 * rename the label of an element by passing in level name and id
		 */
		sServObj.renameLabel = function (levelName, id, attrIndex, newLabelName) {
			sServObj.updateSegItemInLevel(levelName, id, newLabelName, attrIndex);

		};

		/**
		 * rename the label of a level by passing in level name and id
		 */
		sServObj.renameLevel = function (oldname, newname, curPerspectiveIdx) {
			//rename level name
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === oldname) {
					level.name = newname;
					// rename all first label names to match new 
					angular.forEach(level.items, function (item) {
						item.labels[0].name = newname;
					});
				}
			});
			// update order name as well
			ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order[ConfigProviderService.vals.perspectives[curPerspectiveIdx].levelCanvases.order.indexOf(oldname)] = newname;
		};


		/**
		 *
		 */
		sServObj.deleteSegmentsInvers = function (name, id, length, deletedSegment) {
			var attrDefName = viewState.getCurAttrDef(name);
			var labelIdx;
			var x, insertPoint;
			insertPoint = 0;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					insertPoint = deletedSegment.order;
					for (x in deletedSegment.segments) {
						level.items.splice(insertPoint++, 0, deletedSegment.segments[x]);
					}
				}
			});
			var lastNeighbours = sServObj.getItemNeighboursFromLevel(name, deletedSegment.segments[0].id, deletedSegment.segments[deletedSegment.segments.length - 1].id);

			if ((lastNeighbours.left !== undefined) && (lastNeighbours.right === undefined)) {
				labelIdx = getLabelIdx(attrDefName, lastNeighbours.left.labels);
				sServObj.updateSegItemInLevel(name, lastNeighbours.left.id, lastNeighbours.left.labels[labelIdx].value, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur - deletedSegment.timeRight));
			} else if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
				labelIdx = getLabelIdx(attrDefName, lastNeighbours.right.labels);
				sServObj.updateSegItemInLevel(name, lastNeighbours.right.id, lastNeighbours.right.labels[labelIdx].value, labelIdx, (lastNeighbours.right.sampleStart + deletedSegment.timeLeft), (lastNeighbours.right.sampleDur - deletedSegment.timeLeft));
			} else if ((lastNeighbours.left === undefined) && (lastNeighbours.right === undefined)) {

			} else {
				labelIdx = getLabelIdx(attrDefName, lastNeighbours.left.labels);
				sServObj.updateSegItemInLevel(name, lastNeighbours.left.id, lastNeighbours.left.labels[labelIdx].value, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur - deletedSegment.timeLeft));
				sServObj.updateSegItemInLevel(name, lastNeighbours.right.id, lastNeighbours.right.labels[labelIdx].value, labelIdx, (lastNeighbours.right.sampleStart + deletedSegment.timeRight), (lastNeighbours.right.sampleDur - deletedSegment.timeRight));
			}
		};

		/**
		 *
		 */
		sServObj.deleteSegments = function (name, id, length) {
			var firstSegment = sServObj.getItemFromLevelById(name, id);
			var firstOrder = sServObj.getOrderById(name, id);
			var lastSegment = sServObj.getItemDetails(name, (firstOrder + length - 1));
			var lastNeighbours = sServObj.getItemNeighboursFromLevel(name, firstSegment.id, lastSegment.id);
			var timeLeft = 0;
			var timeRight = 0;
			var deleteOrder = null;
			var deletedSegment = null;
			var clickSeg = null;

			var attrDefName = viewState.getCurAttrDef(name);
			var labelIdx = getLabelIdx(attrDefName, firstSegment.labels);

			for (var i = firstOrder; i < (firstOrder + length); i++) {
				timeLeft += sServObj.getItemDetails(name, i).sampleDur;
			}
			if (timeLeft % 2 == 0) {
				timeLeft = timeLeft / 2;
				timeRight = timeLeft;
			} else {
				timeLeft = Math.ceil(timeLeft / 2);
				timeRight = timeLeft - 1;
			}
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					angular.forEach(level.items, function (evt, order) {
						if (evt.id == id) {
							deleteOrder = order;
							deletedSegment = level.items.splice(deleteOrder, length);
						}
					});
				}
			});

			if ((lastNeighbours.left !== undefined) && (lastNeighbours.right === undefined)) {
				sServObj.updateSegItemInLevel(name, lastNeighbours.left.id, undefined, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur + timeRight));
				clickSeg = lastNeighbours.left;
			} else if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
				sServObj.updateSegItemInLevel(name, lastNeighbours.right.id, undefined, labelIdx, lastNeighbours.right.sampleStart - timeLeft, (lastNeighbours.right.sampleDur + timeLeft));
				clickSeg = lastNeighbours.right;
			} else if ((lastNeighbours.left === undefined) && (lastNeighbours.right === undefined)) {
				// nothing left to do level empty now
				viewState.setcurMouseSegment(undefined, undefined, undefined);
			} else {
				sServObj.updateSegItemInLevel(name, lastNeighbours.left.id, undefined, labelIdx, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur + timeLeft));
				sServObj.updateSegItemInLevel(name, lastNeighbours.right.id, undefined, labelIdx, lastNeighbours.right.sampleStart - timeRight, (lastNeighbours.right.sampleDur + timeRight));
				clickSeg = lastNeighbours.left;
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
		sServObj.insertSegmentInvers = function (name, start, end, newLabel) {
			var ret = true;
			var diff, diff2;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === name) {
					if (start == end) {
						var startID = -1;
						angular.forEach(t.items, function (evt, id) {
							if (start == evt.sampleStart) {
								startID = id;
								ret = true;
							}
						});
						if (ret) {
							var diff = 0;
							if (t.items[startID] !== undefined) {
								diff = t.items[startID].sampleDur;
							}
							if (t.items[startID - 1] !== undefined) { // if leftmost item
								t.items[startID - 1].sampleDur += diff;
							}
							t.items.splice(startID, 1);
							//sServObj.lowerId(1);
						}
					} else {
						var startID = -1;
						angular.forEach(t.items, function (evt, id) {
							if (start == evt.sampleStart) {
								startID = id;
								ret = true;
							}
						});
						if (ret) {
							if (t.items[startID + 1] === undefined) {
								t.items.splice(startID - 1, 2);
								//sServObj.lowerId(2);	    						    
							} else if (t.items[startID - 1] === undefined) {
								t.items.splice(startID, 2);
								//sServObj.lowerId(2);		    						    
							} else {
								diff = t.items[startID].sampleDur;
								diff2 = t.items[startID + 1].sampleDur;
								t.items[startID - 1].sampleDur += (diff + diff2);
								t.items.splice(startID, 2);
								//sServObj.lowerId(2);	    
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
		sServObj.insertSegment = function (name, start, end, newLabel, ids) {
			var ret = true;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					if (start == end) {
						if (level.items.length == 0) { // if on an empty level
							return {
								ret: false,
								ids: ids
							};
						} else { // if not on an empty level
							if (ids === undefined) {
								ids = [];
								ids[0] = sServObj.getNewId();
							}
							var startID = -1;
							if (start < level.items[0].sampleStart) { // before first segment
								var diff = level.items[0].sampleStart - start;
								sServObj.insertItemDetails(ids[0], name, 0, newLabel, start, diff - 1);
							} 
							else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
								var newStart = (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur + 1);
								sServObj.insertItemDetails(ids[0], name, level.items.length, newLabel, newStart, start - newStart);
							} 
							else {
								angular.forEach(level.items, function (evt, id) {
									if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
										startID = id;
									}
									if (evt.sampleStart == start) {
										ret = false;
									}
									if (evt.sampleStart + evt.sampleDur + 1 == start) {
										ret = false;
										console.log('HIER');
									}
								});
								if (ret) {
									var diff = start - level.items[startID].sampleStart - 1;
									sServObj.insertItemDetails(ids[0], name, startID + 1, newLabel, start, level.items[startID].sampleDur - diff - 1);
									level.items[startID].sampleDur = diff;
								}
							}
						}
					} else {
						if (ids === undefined) {
							ids = [];
							ids[0] = sServObj.getNewId();
							ids[1] = sServObj.getNewId();
						}
						if (level.items.length == 0) { // if on an empty level
							sServObj.insertItemDetails(ids[0], name, 0, newLabel, start, (end - start) - 1);
						} else { // if not on an empty level				
							if (end < level.items[0].sampleStart) { // before first segment
								var diff = level.items[0].sampleStart - end - 1;
								var diff2 = end - start - 1;
								sServObj.insertItemDetails(ids[0], name, 0, newLabel, end, diff);
								sServObj.insertItemDetails(ids[1], name, 0, newLabel, start, diff2);

							} else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
								var diff = start - (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur) - 1;
								var diff2 = end - start - 1;
								var len = level.items.length;
								sServObj.insertItemDetails(ids[0], name, len, newLabel, (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur), diff);
								sServObj.insertItemDetails(ids[1], name, len + 1, newLabel, start, diff2);
							} else { // in the middle			
								var startID = -1;
								var endID = -1;
								angular.forEach(level.items, function (evt, id) {
									if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
										startID = id;
									}
									if (end >= evt.sampleStart && end <= (evt.sampleStart + evt.sampleDur)) {
										endID = id;
									}
								});
								ret = (startID === endID);
								if (startID === endID && startID !== -1) {
									var diff = start - level.items[startID].sampleStart - 1;
									var diff2 = end - start - 1;
									sServObj.insertItemDetails(ids[0], name, startID + 1, newLabel, start, diff2);
									sServObj.insertItemDetails(ids[1], name, startID + 2, newLabel, end, level.items[startID].sampleDur - diff - diff2);
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
		sServObj.insertPoint = function (name, start, pointName, id) {
			var ret = false;
			var found = false;
			var pos = undefined;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name && level.type === 'EVENT') {
					var last = level.items[0].samplePoint;
					angular.forEach(level.items, function (evt, order) {
						if (Math.floor(start) === Math.floor(evt.samplePoint)) {
							found = true;
						}
						if (start > evt.samplePoint) {
							pos = order + 1;
						}
					});
					if (!found) {
						if (id === undefined) {
							id = sServObj.getNewId();
						}
						sServObj.insertItemDetails(id, name, pos, pointName, start);
					}
				}
			});

			return {
				ret: !found,
				id: id
			};
		};

		/**
		 *
		 */
		sServObj.deletePoint = function (name, id) {
			var ret = false;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === name && t.type == 'EVENT') {
					var last = 0;
					angular.forEach(t.items, function (evt, order) {
						if (!ret) {
							if (id == evt.id) {
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
		sServObj.deleteBoundary = function (name, id) {
			var toDelete = sServObj.getItemFromLevelById(name, id);
			var last = null;
			var retOrder = null;
			var retEvt = null;
			var clickSeg = null;
			
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
				    last = level.items[0];
					angular.forEach(level.items, function (evt, order) {
						if (level.type === 'SEGMENT') {
							if (toDelete.sampleStart == evt.sampleStart && toDelete.sampleDur == evt.sampleDur) {
							    if(order===0) {
								    level.items.splice(order, 1);
								    retOrder = order;
								    retEvt = evt;
								    clickSeg = level.items[0];							    
							    }
							    else {
								    last.labels[0].value += evt.labels[0].value;
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
					if (clickSeg == null) {
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
		sServObj.deleteBoundaryInvers = function (name, id, deletedSegment) {
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					level.items.splice(deletedSegment.order, 0, deletedSegment.event);
					var oldName = deletedSegment.event.labels[0].value;
					if(deletedSegment.order>0) {
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
		sServObj.snapBoundary = function (toTop, levelName, segment, neighbor, type) {
			var neighTd;
			var neighTdIdx;
			var absMinDist = Infinity;
			var absDist;
			var minDist = undefined;
			var sample;
			var sampleTarget;
			if (type == "SEGMENT") {
				sample = segment.sampleStart;
			} else if (type == "EVENT") {
				sample = segment.samplePoint;
			}

			angular.forEach(sServObj.data.levels, function (thisTd, tIdx) {
				if (thisTd.name === levelName) {
					if (toTop) {
						if (tIdx >= 1) {
							neighTd = sServObj.data.levels[tIdx - 1];
						} else {
							return false;
						}
					} else {
						if (tIdx < sServObj.data.levels.length - 1) {
							neighTd = sServObj.data.levels[tIdx + 1];
						} else {
							return false;
						}
					}
					neighTd.items.forEach(function (itm, order) {
						if (neighTd.type == "SEGMENT") {
							sampleTarget = itm.sampleStart;
						} else if (neighTd.type == "EVENT") {
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
			if (minDist !== undefined) {
				if (type == "SEGMENT") {
					this.moveBoundary(levelName, segment.id, minDist, 0);
				} else if (type == "EVENT") {
					this.movePoint(levelName, segment.id, minDist);
				}
				return minDist;
			} else {
				return false;
			}
		};

		/**
		 *  moves a boundary of a given segment
		 *
		 *  @param {string} name The name of the level in which the segment lies.
		 *  @param {number} id The id of the segment.
		 *  @param {number} changeTime The time to add or substract.
		 *  @param {isFirst} if item is first
		 *  @param {isLast} if item is last
		 *
		 */
		sServObj.moveBoundary = function (levelName, id, changeTime, isFirst, isLast) {
			var orig = sServObj.getItemFromLevelById(levelName, id);
			var attrDefName = viewState.getCurAttrDef(levelName);
			var labelIdx = getLabelIdx(attrDefName, orig.labels);

			var ln = sServObj.getItemNeighboursFromLevel(levelName, id, id);
			if (isFirst) { // before first item
				var origRight = ln.right;
				if (origRight !== undefined) {
					if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + changeTime) < origRight.sampleStart)) {
						sServObj.updateSegItemInLevel(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
					}
				} else {
					if ((orig.sampleStart + changeTime) >= 0 && (orig.sampleDur - changeTime) >= 0 && (orig.sampleStart + orig.sampleDur + changeTime) <= Soundhandlerservice.wavJSO.Data.length) {
						sServObj.updateSegItemInLevel(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
					}
				}
			} else if (isLast) { // after last item
				if ((orig.sampleDur + changeTime) >= 0 && (orig.sampleDur + orig.sampleStart + changeTime) <= Soundhandlerservice.wavJSO.Data.length) {
					sServObj.updateSegItemInLevel(levelName, orig.id, undefined, labelIdx, orig.sampleStart, (orig.sampleDur + changeTime));
				}
			} else {
				if (ln.left === undefined) {
					var origRight = ln.right;
					if (origRight !== undefined) {
						if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + changeTime) < origRight.sampleStart)) {
							sServObj.updateSegItemInLevel(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
						}
					} else {
						if (((orig.sampleStart + changeTime) >= 0) && ((orig.sampleStart + orig.sampleDur + changeTime) <= Soundhandlerservice.wavJSO.Data.length)) {
							sServObj.updateSegItemInLevel(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
						}
					}
				} else {
					var origLeft = ln.left;
					if ((origLeft.sampleDur + changeTime >= 0) && (orig.sampleStart + changeTime >= 0) && (orig.sampleDur - changeTime >= 0)) {
						sServObj.updateSegItemInLevel(levelName, ln.left.id, undefined, labelIdx, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
						sServObj.updateSegItemInLevel(levelName, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
					}
				}
			}
		};

		/**
		 *
		 */
		sServObj.movePoint = function (name, id, changeTime) {
			var orig = sServObj.getItemFromLevelById(name, id);
			if ((orig.samplePoint + changeTime) > 0 && (orig.samplePoint + changeTime) <= Soundhandlerservice.wavJSO.Data.length) {
				sServObj.setPointDetails(name, orig.id, orig.labels[0].value, (orig.samplePoint + changeTime));
			}
		};

		/**
		 *
		 */
		sServObj.moveSegment = function (name, id, length, changeTime) {
			var firstOrder = sServObj.getOrderById(name, id);
			var firstSegment = sServObj.getItemDetails(name, firstOrder);
			var lastSegment = sServObj.getItemDetails(name, firstOrder + length - 1);
			var lastNeighbours = sServObj.getItemNeighboursFromLevel(name, firstSegment.id, lastSegment.id);

			var attrDefName = viewState.getCurAttrDef(name);
			var labelIdx = getLabelIdx(attrDefName, firstSegment.labels);

			if ((lastNeighbours.left === undefined) && (lastNeighbours.right !== undefined)) {
				var right = sServObj.getItemFromLevelById(name, lastNeighbours.right.id);
				if (((firstSegment.sampleStart + changeTime) > 0) && ((lastNeighbours.right.sampleDur - changeTime) >= 0)) {
					sServObj.updateSegItemInLevel(name, right.id, undefined, labelIdx, (right.sampleStart + changeTime), (right.sampleDur - changeTime));
					for (var i = firstOrder; i < (firstOrder + length); i++) {
						var orig = sServObj.getItemDetails(name, i);
						sServObj.updateSegItemInLevel(name, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
					}
				}
			} else if ((lastNeighbours.right === undefined) && (lastNeighbours.left !== undefined)) {
				var left = sServObj.getItemFromLevelById(name, lastNeighbours.left.id);
				if ((lastNeighbours.left.sampleDur + changeTime) >= 0) {
					if ((lastSegment.sampleStart + lastSegment.sampleDur + changeTime) < Soundhandlerservice.wavJSO.Data.length) {
						sServObj.updateSegItemInLevel(name, left.id, undefined, labelIdx, left.sampleStart, (left.sampleDur + changeTime));
						for (var i = firstOrder; i < (firstOrder + length); i++) {
							var orig = sServObj.getItemDetails(name, i);
							sServObj.updateSegItemInLevel(name, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
						}
					}
				}
			} else if ((lastNeighbours.right !== undefined) && (lastNeighbours.left !== undefined)) {
				var origLeft = sServObj.getItemFromLevelById(name, lastNeighbours.left.id);
				var origRight = sServObj.getItemFromLevelById(name, lastNeighbours.right.id);
				if (((origLeft.sampleDur + changeTime) >= 0) && ((origRight.sampleDur - changeTime) >= 0)) {
					sServObj.updateSegItemInLevel(name, origLeft.id, undefined, labelIdx, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
					sServObj.updateSegItemInLevel(name, origRight.id, undefined, labelIdx, (origRight.sampleStart + changeTime), (origRight.sampleDur - changeTime));
					for (var i = firstOrder; i < (firstOrder + length); i++) {
						var orig = sServObj.getItemDetails(name, i);
						sServObj.updateSegItemInLevel(name, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
					}
				}
			} else if ((lastNeighbours.right === undefined) && (lastNeighbours.left === undefined)) {
				var first = sServObj.getItemDetails(name, firstOrder);
				var last = sServObj.getItemDetails(name, (firstOrder + length - 1));
				if (((first.sampleStart + changeTime) > 0) && (((last.sampleDur + last.sampleStart) + changeTime) < Soundhandlerservice.wavJSO.Data.length)) {
					for (var i = firstOrder; i < (firstOrder + length); i++) {
						var orig = sServObj.getItemDetails(name, i);
						sServObj.updateSegItemInLevel(name, orig.id, undefined, labelIdx, (orig.sampleStart + changeTime), orig.sampleDur);
					}
				}
			}
		};

		/**
		 *
		 */
		sServObj.expandSegment = function (rightSide, segments, name, changeTime) {
			var startTime = 0;
			var neighbours = sServObj.getItemNeighboursFromLevel(name, segments[0].id, segments[segments.length - 1].id);
			var segTime = (changeTime * segments.length);

			var attrDefName = viewState.getCurAttrDef(name);
			var labelIdx = getLabelIdx(attrDefName, segments[0].labels);

			if (rightSide) { // if expand or shrink on RIGHT side
				if (neighbours.right === undefined) { // last element
					var lastLength = segments[segments.length - 1].sampleStart + segments[segments.length - 1].sampleDur + (changeTime * segments.length);
					if (lastLength < Soundhandlerservice.wavJSO.Data.length) {
						angular.forEach(segments, function (seg) {
							sServObj.updateSegItemInLevel(name, seg.id, undefined, labelIdx, seg.sampleStart + startTime, seg.sampleDur + changeTime);
							startTime += changeTime;
						});
					}
				} else {
					angular.forEach(segments, function (seg) {
						segTime += seg.sampleDur;
					});
					if (segTime > 0 && (neighbours.right.sampleDur - (changeTime * segments.length) >= 0)) {
						angular.forEach(segments, function (seg) {
							sServObj.updateSegItemInLevel(name, seg.id, undefined, labelIdx, seg.sampleStart + startTime, seg.sampleDur + changeTime);
							startTime += changeTime;
						});
						sServObj.updateSegItemInLevel(name, neighbours.right.id, undefined, labelIdx, neighbours.right.sampleStart + startTime, neighbours.right.sampleDur - startTime);
					}
				}
			} else { // if expand or shrink on LEFT side
				if (neighbours.left === undefined) { // first element
					var first = sServObj.getItemDetails(name, 0);
					if (first.sampleStart + (changeTime * (segments.length + 1)) > 0) {
						angular.forEach(segments, function (seg) {
							sServObj.updateSegItemInLevel(name, seg.id, undefined, seg.sampleStart - changeTime, labelIdx, seg.sampleDur + changeTime);
						});
					}
				} else {
					angular.forEach(segments, function (seg) {
						segTime += seg.sampleDur;
					});
					if (segTime > 0 && (neighbours.left.sampleDur - (changeTime * segments.length) >= 0)) {
						startTime = 0;
						angular.forEach(segments, function (seg, i) {
							startTime = -(segments.length - i) * changeTime;
							sServObj.updateSegItemInLevel(name, seg.id, undefined, labelIdx, seg.sampleStart + startTime, seg.sampleDur + changeTime);
						});
						sServObj.updateSegItemInLevel(name, neighbours.left.id, undefined, labelIdx, neighbours.left.sampleStart, neighbours.left.sampleDur - (segments.length * changeTime));
					}
				}
			}
		};


		/**
		 *
		 */
		sServObj.calcDistanceToNearestZeroCrossing = function (sample) {
			// walk right
			var distRight;
			for (var i = sample; i < Soundhandlerservice.wavJSO.Data.length - 1; i++) {
				if (Soundhandlerservice.wavJSO.Data[i] >= 0 && Soundhandlerservice.wavJSO.Data[i + 1] < 0 || Soundhandlerservice.wavJSO.Data[i] < 0 && Soundhandlerservice.wavJSO.Data[i + 1] >= 0) {
					distRight = i - sample;
					break;
				}
			}

			// walk left
			var distLeft;
			for (var i = sample; i > 1; i--) {
				if (Soundhandlerservice.wavJSO.Data[i] >= 0 && Soundhandlerservice.wavJSO.Data[i - 1] < 0 || Soundhandlerservice.wavJSO.Data[i] < 0 && Soundhandlerservice.wavJSO.Data[i - 1] >= 0) {
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
		 * get all labels (curAttr def applies) of a level and
		 * return them as a flat array
		 * @param levelName
		 * @return array containing all labels (form==['x','y','z'])
		 */
		sServObj.getAllLabelsOfLevel = function (levelDetails) {
			// console.log(levelDetails);
			var curAttrDef = viewState.getCurAttrDef(levelDetails.level.name);
			var labels = [];
			for (var i = 0; i < levelDetails.level.items.length; i++) {
				for (var j = 0; j < levelDetails.level.items[i].labels.length; j++) {
					if (levelDetails.level.items[i].labels[j].name === curAttrDef) {
						labels.push(levelDetails.level.items[i].labels[j].value);
					}
				}
			}
			return labels;
		}


		/////////////////////// handle hierarchy links (probably better in other service)/////////////////////
		
		/**
		 * adds links to sServObj.data.links 
		 * by pairing all childIds with the parent 
		 * id (form=={'fromID':parentID, 'toID':childId})
		 */
		sServObj.addLinkToParent = function (parentId, childIds) {
			angular.forEach(childIds, function (chId) {
				sServObj.data.links.push({
					'fromID': parentId,
					'toID': chId
				});
			});
		};


		/**
		 * removes links from sServObj.data.links 
		 * that match the form {'fromID':parentID, 'toID':childId}
		 */
		sServObj.inverseAddLinkToParent = function (parentId, childIds) {

			angular.forEach(sServObj.data.links, function (link, linkIdx) {

				if(link.fromID === parentId && childIds.indexOf(link.toID) !==-1){
					sServObj.data.links.splice(linkIdx);					
				};

			});
			// console.log(sServObj.data.links);
		};

		return sServObj;
	});