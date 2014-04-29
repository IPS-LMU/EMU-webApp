'use strict';

angular.module('emuwebApp')
	.service('Levelservice', function Levelservice($rootScope, uuid, Soundhandlerservice) {
		// shared service object
		var sServObj = {};

		sServObj.data = {};

		sServObj.maxElementID = 0; // max currently loaded Id

		sServObj.getData = function () {
			return sServObj.data;
		};

		/**
		 * sets annotation data and sets maxElementID by parsing id in elements
		 */
		sServObj.setData = function (data) {
			angular.copy(data, sServObj.data);
			angular.forEach(sServObj.data.levels, function (level) {
				level.items.forEach(function (item) {
					sServObj.maxElementID = item.id;
				});
			});
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
		 * get's element order by passing in elemtent id
		 */
		sServObj.getOrderById = function (name, id) {
			var ret = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					level.items.forEach(function (element, num) {
						if (element.id == id) {
							ret = num;
						}
					});
				}
			});
			return ret;
		};


		/**
		 * get's element id by passing in element order
		 */
		sServObj.getIdByOrder = function (name, order) {
			var ret = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					level.items.forEach(function (element, num) {
						if (num == order) {
							details = element.id;
						}
					});
				}
			});
			return ret;
		};



		/**
		 * get's element details by passing in levelName and elemtent order
		 */
		sServObj.getElementDetails = function (name, order) {
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
		 * get's element details by passing in levelName and elemtent order
		 */
		sServObj.getLastElement = function (name) {
			var details = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					details = level.items[level.items.length - 1];
				}
			});
			return details;
		};


		/**
		 * get's element details by passing in levelName and elemtent id
		 */
		sServObj.getElementDetailsById = function (name, id) {
			return sServObj.getElementDetails(name, sServObj.getOrderById(name, id));
		};

		/**
		 * insert a new Segment at position
		 */
		sServObj.insertElementDetails = function (levelname, position, labelname, start, duration) {
			var myID = ++sServObj.maxElementID;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelname) {
					var newElement = angular.copy(level.items[0]);
					if (level.type == "SEGMENT") {
						newElement.id = myID;
						newElement.sampleStart = start;
						newElement.sampleDur = duration;
						newElement.labels[0].value = labelname;
						level.items.splice(position, 0, newElement);
					} else if (level.type == "EVENT") {
						newElement.id = myID;
						newElement.samplePoint = start;
						newElement.labels[0].value = labelname;
						level.items.splice(position, 0, newElement);
					}
				}
			});
		};

		/**
		 * get's element details by passing in levelName and elemtent id
		 */
		sServObj.setElementDetails = function (levelname, id, labelname, start, duration) {
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
								element.labels[0].value = labelname;
							}
						}
					});
				}
			});
		};

		/**
		 * get's element details by passing in levelName and elemtent id
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
		 * get's element details by passing in levelName and element id's
		 */
		sServObj.getElementNeighbourDetails = function (name, firstid, lastid) {
			var left = null;
			var right = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					level.items.forEach(function (element, num) {
						if (element.id == firstid) {
							left = level.items[num - 1];
						}
						if (element.id == lastid) {
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
		 * get's element details by passing in level, pcm position and maximum pcm
		 */
		sServObj.getEvent = function (pcm, level, maximum) {
			var event = level.items[0];
			var nearest = false;
			if (level.type === "SEGMENT") {
				angular.forEach(level.items, function (evt, index) {
					if (pcm >= evt.sampleStart) {
						if (pcm <= (evt.sampleStart + evt.sampleDur)) {
							if (pcm - evt.sampleStart >= evt.sampleDur / 2) {
								if (level.items[index + 1] !== undefined) {
									nearest = level.items[index + 1];
								} else {
									nearest = true;
									event = level.items[level.items.length - 1];
								}
							} else {
								nearest = level.items[index];
							}
						}
					}
					if (pcm >= evt.sampleStart) {
						if (pcm <= (evt.sampleStart + evt.sampleDur)) {
							event = evt;
						} else {
							nearest = true;
							event = level.items[level.items.length - 1];
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
					if (pcm <= spaceHigher && pcm >= spaceLower) {
						event = evt;
						nearest = evt;
					}
				});
			}
			return {
				evtr: event,
				nearest: nearest
			};
		};

		/**
		 * deletes a level by its name
		 */
		sServObj.deleteLevel = function (levelName) {
			var y = 0;
			var curLevel;
			angular.forEach(sServObj.data.levels, function (t, x) {
				if (t.name === levelName) {
					curLevel = t;
					y = x;
					sServObj.data.levels.splice(x, 1);
				}
			});
			return {
				level: curLevel,
				id: y,
				name: levelName
			};
		};

		/**
		 * rename the label of a level by passing in level name and id
		 */
		sServObj.renameLabel = function (levelName, id, newLabelName) {
			sServObj.setElementDetails(levelName, id, newLabelName);
		};

		/**
		 * rename the label of a level by passing in level name and id
		 */
		sServObj.renameLevel = function (oldname, newname) {
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === oldname) {
					level.name = newname;
				}
			});
		};


		sServObj.deleteSegmentsInvers = function (levelname, segments, neighbours) {
			var length1 = 0;
			var length2 = 0;
			for (var x in segments) {
				length1 += segments[x].sampleDur;
			}
			if (length1 % 2 == 0) {
				length1 /= 2;
				length2 = length1;
			} else {
				length1 = Math.ceil(length1 / 2);
				length2 = length1 - 1;
			}
			sServObj.setElementDetails(levelname, neighbours.left.id, neighbours.left.labels[0].value, neighbours.left.sampleStart, (neighbours.left.sampleDur - length1));
			sServObj.setElementDetails(levelname, neighbours.right.id, neighbours.right.labels[0].value, neighbours.right.sampleStart + length2, (neighbours.right.sampleDur - length2));
			var insertPoint = 0;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelname) {
					if (level.type === "SEGMENT") {
						angular.forEach(level.items, function (evt, num) {
							if (evt.id == neighbours.left.id) {
								insertPoint = num + 1;
							}
						});
						for (x in segments) {
							level.items.splice(insertPoint++, 0, segments[x]);
						}

					}
				}
			});


		};

		sServObj.deleteSegments = function (levelname, segments, neighbours) {
			var length1 = 0;
			var length2 = 0;
			var length = 0;
			var text = '';
			for (var x in segments) {
				length += segments[x].sampleDur;
			}
			if (length1 % 2 == 0) {
				length1 = length / 2;
				length2 = length1;
			} else {
				length1 = Math.ceil(length / 2);
				length2 = length1 - 1;
			}
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelname) {
					angular.forEach(level.items, function (evt, id) {
						if (evt.id == segments[0].id) {
							level.items.splice(id, segments.length);
						}
					});
				}
			});
			if (neighbours.left !== undefined) {
				sServObj.setElementDetails(levelname, neighbours.left.id, neighbours.left.labels[0].value, neighbours.left.sampleStart, (neighbours.left.sampleDur + length1));
			}
			if (neighbours.right !== undefined) {
				sServObj.setElementDetails(levelname, neighbours.right.id, neighbours.right.labels[0].value, neighbours.right.sampleStart - length2, (neighbours.right.sampleDur + length2));
			}

		};

		sServObj.insertSegmentInvers = function (start, end, levelName, newLabel) {
			var ret = true;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					if (start == end) {
						var startID = -1;
						angular.forEach(t.items, function (evt, id) {
							if (start == evt.sampleStart) {
								startID = id;
								ret = true;
							}
						});
						if (ret) {
							var diff = t.items[startID].sampleDur;
							t.items[startID - 1].sampleDur += diff;
							t.items.splice(startID, 1);
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
							var diff = t.items[startID].sampleDur;
							var diff2 = t.items[startID + 1].sampleDur;
							t.items[startID - 1].sampleDur += (diff + diff2);
							t.items.splice(startID, 2);
						}
					}
				}
			});
			return ret;
		};

		sServObj.insertSegment = function (start, end, name, newLabel) {
			var ret = true;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					if (start == end) {
						var startID = -1;
						if (start < level.items[0].sampleStart) { // before first segment
							var diff = level.items[0].sampleStart - start;
							sServObj.insertElementDetails(name, 0, newLabel, start, diff);
						} else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
							var newStart = (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur) + 1;
							sServObj.insertElementDetails(name, level.items.length, newLabel, newStart, start - newStart);
						} else {
							angular.forEach(level.items, function (evt, id) {
								if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
									startID = id;
								}
								if (evt.sampleStart == start) {
									ret = false;
								}
								if (evt.sampleStart + evt.sampleDur == start) {
									ret = false;
								}
							});
							if (ret) {
								var diff = start - level.items[startID].sampleStart;
								sServObj.insertElementDetails(name, startID + 1, newLabel, start, level.items[startID].sampleDur - diff);
								level.items[startID].sampleDur = diff;
							}
						}
					} else {
						if (end < level.items[0].sampleStart) { // before first segment
							var diff = level.items[0].sampleStart - end;
							var diff2 = end - start;
							sServObj.insertElementDetails(name, 0, newLabel, end, diff);
							sServObj.insertElementDetails(name, 0, newLabel, start, diff2);

						} else if (start > (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur)) { // after last segment
							var diff = start - (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur);
							var diff2 = end - start;
							var len = level.items.length;
							sServObj.insertElementDetails(name, len, newLabel, (level.items[level.items.length - 1].sampleStart + level.items[level.items.length - 1].sampleDur), diff);
							sServObj.insertElementDetails(name, len + 1, newLabel, start, diff2);
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
							if (startID === endID) {
								var diff = start - level.items[startID].sampleStart;
								var diff2 = end - start;
								sServObj.insertElementDetails(name, startID + 1, newLabel, start, diff2);
								sServObj.insertElementDetails(name, startID + 2, newLabel, end, level.items[startID].sampleDur - diff - diff2);
								level.items[startID].sampleDur = diff;
							}
						}
					}
				}
			});
			return ret;
		};

		sServObj.insertPoint = function (start, name, pointName) {
			var ret = false;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name && level.type == "EVENT") {
					var last = level.items[0].samplePoint;
					angular.forEach(level.items, function (evt, id) {
						if (!ret) {
							if (start < last && (Math.floor(start) != Math.floor(evt.samplePoint))) {
								sServObj.insertElementDetails(name, id - 1, pointName, start);
								ret = true;
							}
							last = evt.samplePoint;
						}

					});
				}
			});
			return ret;
		};

		sServObj.insertPointInvers = function (startP, levelName, pointName) {
			var ret = false;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName && t.type == "EVENT") {
					var last = 0;
					angular.forEach(t.items, function (evt, id) {
						if (!ret) {
							if (startP == evt.samplePoint) {
								t.items.splice(id, 1);
								ret = true;
							}
						}
					});
				}
			});
			return ret;
		};

		sServObj.deleteBoundary = function (toDelete, name, levelType) {
			var last = null;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === name) {
					angular.forEach(level.items, function (evt, id) {
						if (level.type === 'SEGMENT') {
							if (toDelete.sampleStart == evt.sampleStart && toDelete.sampleDur == evt.sampleDur) {
								last.labels[0].value += evt.labels[0].value;
								last.sampleDur += evt.sampleDur;
								level.items.splice(id, 1);
							}
						} else {
							if (evt.samplePoint == toDelete.samplePoint) {
								level.items.splice(id, 1);
							}
						}
						last = evt;
					});
				}
			});
		};


		sServObj.snapBoundary = function (toTop, sample, levelName, segID) {
			var neighTd;
			var thisTd;
			var neighTdIdx;
			var absMinDist = Infinity;
			var absDist;
			var minDist;
			angular.forEach(sServObj.data.levels, function (t, tIdx) {
				if (t.name === levelName) {
					thisTd = t;
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
					neighTd.items.forEach(function (itm) {
						absDist = Math.abs(sample - itm.sampleStart);
						if (absDist < absMinDist) {
							absMinDist = absDist;
							minDist = itm.sampleStart - sample;
						}
					});
				}
			});


			if (minDist !== undefined) {
				this.moveBoundry(minDist, thisTd, segID);
				return minDist;
			} else {
				return false;
			}
		};

		sServObj.moveBoundry = function (changeTime, name, seg, lastNeighbours) {
			if (seg === false) { // before first element
				seg = sServObj.getElementDetails(name, 0);
				sServObj.setElementDetails(name, seg.id, seg.labels[0].value, (seg.sampleStart + changeTime), (seg.sampleDur - changeTime));
			} else if (seg === true) {
				seg = sServObj.getLastElement(name);
				if ((seg.sampleDur + changeTime) >= 1 && (seg.sampleDur + seg.sampleStart + changeTime) <= Soundhandlerservice.wavJSO.Data.length) {
					sServObj.setElementDetails(name, seg.id, seg.labels[0].value, seg.sampleStart, (seg.sampleDur + changeTime));
				}
			} else {
				var orig = sServObj.getElementDetailsById(name, seg.id);
				if (lastNeighbours.left !== undefined) {
					var origLeft = sServObj.getElementDetailsById(name, lastNeighbours.left.id);
					if ((lastNeighbours.left.sampleDur + changeTime > 0) && (seg.sampleStart + changeTime > 0) && (seg.sampleDur - changeTime > 0)) {
						sServObj.setElementDetails(name, lastNeighbours.left.id, origLeft.labels[0].value, origLeft.sampleStart, (origLeft.sampleDur + changeTime));
						sServObj.setElementDetails(name, seg.id, orig.labels[0].value, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
					}
				} else {
					if ((seg.sampleStart + changeTime > 0) && (seg.sampleDur - changeTime > 0)) {
						sServObj.setElementDetails(name, seg.id, orig.labels[0].value, (orig.sampleStart + changeTime), (orig.sampleDur - changeTime));
					}
				}
			}
		};

		sServObj.movePoint = function (changeTime, name, seg) {
			sServObj.setPointDetails(name, seg.id, seg.labels[0].value, (seg.samplePoint + changeTime));
		};


		sServObj.moveSegment = function (changeTime, name, selected, lastNeighbours) {
			if (lastNeighbours.left === undefined) {
				if (((selected[0].sampleStart + changeTime) >= 1) && ((lastNeighbours.right.sampleDur - changeTime) >= 1)) {
					sServObj.setElementDetails(name, lastNeighbours.right.id, lastNeighbours.right.labels[0].value, (lastNeighbours.right.sampleStart + changeTime), (lastNeighbours.right.sampleDur - changeTime));
					angular.forEach(selected, function (s) {
						sServObj.setElementDetails(name, s.id, s.labels[0].value, (s.sampleStart + changeTime), s.sampleDur);
					});
				}
			} else if (lastNeighbours.right === undefined) {
				if ((lastNeighbours.left.sampleDur + changeTime) >= 1) {
					if ((selected[selected.length - 1].sampleStart + selected[selected.length - 1].sampleDur + changeTime) < Soundhandlerservice.wavJSO.Data.length) {
						sServObj.setElementDetails(name, lastNeighbours.left.id, lastNeighbours.left.labels[0].value, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur + changeTime));
						angular.forEach(selected, function (s) {
							var orig = sServObj.getElementDetails(name, s.id);
							sServObj.setElementDetails(name, s.id, s.labels[0].value, (s.sampleStart + changeTime), s.sampleDur);
						});
					}
				}
			} else {
				if (((lastNeighbours.left.sampleDur + changeTime) > 0) && ((lastNeighbours.right.sampleDur - changeTime) > 0)) {
					sServObj.setElementDetails(name, lastNeighbours.left.id, lastNeighbours.left.labels[0].value, lastNeighbours.left.sampleStart, (lastNeighbours.left.sampleDur + changeTime));
					sServObj.setElementDetails(name, lastNeighbours.right.id, lastNeighbours.right.labels[0].value, (lastNeighbours.right.sampleStart + changeTime), (lastNeighbours.right.sampleDur - changeTime));
					angular.forEach(selected, function (s) {
						sServObj.setElementDetails(name, s.id, s.labels[0].value, (s.sampleStart + changeTime), s.sampleDur);
					});
				}
			}
		};

		sServObj.expandSegment = function (rightSide, segments, name, changeTime) {
			var startTime = 0;
			var neighbours = sServObj.getElementNeighbourDetails(name, segments[0].id, segments[segments.length - 1].id);

			if (rightSide) { // if expand or shrink on RIGHT side
				if (neighbours.right === undefined) { // last element
					var lastLength = segments[segments.length - 1].sampleStart + segments[segments.length - 1].sampleDur + (changeTime * segments.length);
					if (lastLength < Soundhandlerservice.wavJSO.Data.length) {
						angular.forEach(segments, function (seg) {
							sServObj.setElementDetails(name, seg.id, seg.labels[0].value, seg.sampleStart + startTime, seg.sampleDur + changeTime);
							startTime += changeTime;
						});
					}
				} else {
					if (neighbours.right.sampleDur - (changeTime * segments.length) > 0) {
						angular.forEach(segments, function (seg) {
							sServObj.setElementDetails(name, seg.id, seg.labels[0].value, seg.sampleStart + startTime, seg.sampleDur + changeTime);
							startTime += changeTime;
						});
						sServObj.setElementDetails(name, neighbours.right.id, neighbours.right.labels[0].value, neighbours.right.sampleStart + startTime, neighbours.right.sampleDur - startTime);
					}
				}
			} else { // if expand or shrink on LEFT side
				if (neighbours.left === undefined) { // first element
					var first = sServObj.getElementDetails(name, 0);
					if (first.sampleStart + (changeTime * (segments.length + 1)) > 0) {
						angular.forEach(segments, function (seg) {
							sServObj.setElementDetails(name, seg.id, seg.labels[0].value, seg.sampleStart - changeTime, seg.sampleDur + changeTime);
						});
					}
				} else {
					if (neighbours.left.sampleDur - (changeTime * segments.length) > 0) {
						startTime = 0;
						angular.forEach(segments, function (seg, i) {
							startTime = -(segments.length - i) * changeTime;
							sServObj.setElementDetails(name, seg.id, seg.labels[0].value, seg.sampleStart + startTime, seg.sampleDur + changeTime);
						});
						sServObj.setElementDetails(name, neighbours.left.id, neighbours.left.labels[0].value, neighbours.left.sampleStart, neighbours.left.sampleDur - (segments.length * changeTime));
					}
				}
			}


		};



		return sServObj;

	});