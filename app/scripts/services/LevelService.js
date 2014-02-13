'use strict';

angular.module('emulvcApp')
	.service('Levelservice', function Levelservice($rootScope) {
		// shared service object
		var sServObj = {};

		sServObj.data = {};

		sServObj.getData = function () {
			return sServObj.data;
		};

		sServObj.setData = function (data) {
			angular.copy(data, sServObj.data);
		};

		/**
		 * gets the current (mousemove) Level Name
		 */
		sServObj.getcurMouseLevelDetails = function (levelName) {
			var curLevel = null;
			sServObj.data.levels.forEach(function (t) {
				if (t.name === levelName) {
					curLevel = t;
				}
			});
			return curLevel;
		};

		/**
		 * get's level details by passing in level Name
		 */
		sServObj.getLevelDetails = function (levelName) {
			var curLevel = null;
			var y = null;
			sServObj.data.levels.forEach(function (t, x) {
				if (t.name === levelName) {
					curLevel = t;
					y = x;
				}
			});
			return {
				level: curLevel,
				id: y
			};
		};

		/**
		 * get's element details by passing in levelName and elemtentid
		 */
		sServObj.getElementDetails = function (levelName, elementid) {
			var details = null;
			sServObj.data.levels.forEach(function (t) {
				if (t.name === levelName) {
					t.items.forEach(function (element) {
						if (element.id == elementid) {
							details = element;
						}
					});
				}
			});
			return details;
		};



		sServObj.getEvent = function (pcm, level, maximum) {
			var evtr = null;
			var evtrNearest = null;
			var id = 0;
			if (level.type === "SEGMENT") {
				angular.forEach(level.items, function (evt, id) {
						if (pcm >= evt.sampleStart && pcm <= (evt.sampleStart + evt.sampleDur)) {
							if (pcm - evt.sampleStart >= evt.sampleDur / 2 && (id-1) >= 0) {
								evtrNearest = level.items[id+1];
								evtrNearest.id = id+1;
							} else {
								evtrNearest = level.items[id];
								evtrNearest.id = id;
							}
						}
						if (pcm >= evt.sampleStart && pcm <= (evt.sampleStart + evt.sampleDur)) {
							evtr = evt;
							evtr.id = id;
						}
				});
			} else {
				var spaceLower = 0;
				var spaceHigher = 0;
				angular.forEach(level.items, function (evt, key) {
					if (key < level.items.length - 1) {
						spaceHigher = evt.samplePoint + (level.items[key + 1].samplePoint - level.items[key].samplePoint) / 2;
					} else {
						spaceHigher = maximum;
					}
					if (key > 0) {
						spaceLower = evt.samplePoint - (level.items[key].samplePoint - level.items[key - 1].samplePoint) / 2;
					} else {
					    spaceLower = 0;
					}
					if (pcm <= spaceHigher && pcm >= spaceLower) {
						evtr = evt;
						evtr.id = key;					
						evtrNearest = evt;
						evtrNearest.id = key;
					}
				});
			}
			return {evtr:evtr, nearest: evtrNearest};
		};


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
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					angular.forEach(t.items, function (evt) {
						if (evt.id==id) {
							evt.labels[0].value = newLabelName;
						}
					});
				}
			});
		};

		/**
		 * rename the label of a level by passing in level name and id
		 */
		sServObj.renameLevel = function (oldname, newname) {
			angular.forEach(sServObj.data.levels, function (t, i) {
				if (t.name === oldname) {
					t.name = newname;
				}
			});
		};

		/**
		 * traverse through lavels an return next/prev event and id
		 */
		sServObj.tabNext = function (invers, now, tN) {
			var ret = new Object();
			angular.forEach(sServObj.data.levels, function (t) {
				var i = 0;
				if (t.name === tN) {
					angular.forEach(t.items, function (evt) {
						if (i === now) {
							ret.event = evt;
							ret.id = now;
						}
						++i;
					});
				}
			});
			return ret;
		};

		sServObj.deleteSegmentsInvers = function (segments, ids, levelName) {
			var segm, segid;
			var start = ids[0] - 1;
			var end = ids[ids.length - 1] + 1;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					if (t.type === "SEGMENT") {
						var length = 0;
						for (var x in segments) {
							length += segments[x].sampleDur;
						}
						if (start >= 0) {
							t.items[start].sampleDur -= length / 2;
							t.items[start + 1].sampleDur -= length / 2;
							t.items[start + 1].sampleStart += length / 2;
							for (var x in ids) {
								t.items.splice(ids[x], 0, segments[x]);
							}

							segm = t.items[start];
							segid = start;

						} else {
							segm = t.items[0];
							segid = 0;
						}
					}
				}
			});
			return {
				segment: segm,
				id: segid
			};
		};

		sServObj.deleteSegments = function (segments, ids, levelName) {
			var segm, segid;
			var start = ids[0] - 1;
			var end = ids[ids.length - 1] + 1;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					if (t.type === "SEGMENT") {
						var length = 0;
						for (var x in segments) {
							length += segments[x].sampleDur;
						}
						if (start >= 0) {
							t.items[start].sampleDur += length / 2;
							t.items[end].sampleDur += length / 2;
							t.items[end].sampleStart -= length / 2;
							t.items.splice(ids[0], ids.length);
							segm = t.items[start];
							segid = start;

						} else {
							segm = t.items[0];
							segid = 0;
						}
					}
				}
			});
			return {
				segment: segm,
				id: segid
			};
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

		sServObj.insertSegment = function (start, end, levelName, newLabel) {
			var ret = true;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					if (start == end) {
						var startID = -1;
						angular.forEach(t.items, function (evt, id) {
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
							var diff = start - t.items[startID].sampleStart;
							t.items.splice(startID, 0, angular.copy(t.items[startID]));
							t.items[startID + 1].sampleStart = start;
							t.items[startID + 1].sampleDur = t.items[startID].sampleDur - diff;
							t.items[startID + 1].label = newLabel;
							t.items[startID].sampleDur = diff;
						}
					} else {
						var startID = -1;
						var endID = -1;
						angular.forEach(t.items, function (evt, id) {
							if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
								startID = id;
							}
							if (end >= evt.sampleStart && end <= (evt.sampleStart + evt.sampleDur)) {
								endID = id;
							}
						});
						ret = (startID === endID);
						if (startID === endID) {
							var diff = start - t.items[startID].sampleStart;
							var diff2 = end - start;
							t.items.splice(startID, 0, angular.copy(t.items[startID]));
							t.items.splice(startID, 0, angular.copy(t.items[startID]));
							t.items[startID + 1].sampleStart = start;
							t.items[startID + 1].sampleDur = diff2;
							t.items[startID + 1].label = newLabel;
							t.items[startID + 2].sampleStart = end;
							t.items[startID + 2].sampleDur = t.items[startID].sampleDur - diff - diff2;
							t.items[startID + 2].label = newLabel;
							t.items[startID].sampleDur = diff;

						}
					}
				}
			});
			return ret;
		};

		sServObj.insertPoint = function (startP, levelName, pointName) {
			var ret = false;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName && t.type == "point") {
					var pid = 0;
					var last = 0;
					angular.forEach(t.items, function (evt, id) {
						if (!ret) {
							if (startP > last && startP < evt.sampleStart && (Math.floor(startP) != Math.floor(evt.sampleStart))) {

								console.log(t.items);
								console.log(id);


								t.items.splice(id - 1, 0, angular.copy(t.items[id - 1]));

								console.log(t.items);

								t.items[id].sampleStart = startP;
								t.items[id].label = pointName;
								ret = true;
							}
							last = evt.sampleStart;
						}

					});
				}
			});
			return ret;
		};

		sServObj.insertPointInvers = function (startP, levelName, pointName) {
			var ret = false;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName && t.type == "point") {
					var pid = 0;
					var last = 0;
					angular.forEach(t.items, function (evt, id) {
						if (!ret) {
							if (startP == evt.sampleStart) {
								t.items.splice(id, 1);
								ret = true;
							}
						}
					});
				}
			});
			return ret;
		};

		sServObj.deleteBoundary = function (toDelete, levelName, levelType) {
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					angular.forEach(t.items, function (evt, id) {
						if (evt.sampleStart == toDelete.sampleStart) {
							if (t.type === "point") {
								t.items.splice(id, 1);
							} else {
								t.items[id - 1].label += t.items[id].label;
								t.items[id - 1].sampleDur += t.items[id].sampleDur;
								t.items.splice(id, 1);
							}
						}
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
			sServObj.data.levels.forEach(function (t, tIdx) {
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

		sServObj.moveBoundry = function (changeTime, t, seg, maximum) {
			if (null !== t) { // && t.name === viewState.getcurMouseLevelName()
				if (t.type === 'SEGMENT') {
					if (seg > 0 && (t.items[seg].sampleDur + changeTime) >= 1 && (t.items[seg+1].sampleDur - changeTime) >= 1) {
						t.items[seg].sampleDur += changeTime;
						t.items[seg+1].sampleStart += changeTime;
						t.items[seg+1].sampleDur -= changeTime;
					}
				} else {
				    var item = sServObj.getElementDetails(t.name,seg+1);
				    var itemnext = sServObj.getElementDetails(t.name,seg+2);
				    var itemprev = sServObj.getElementDetails(t.name,seg);
					if (item !== undefined && itemnext !== undefined && itemprev !== undefined) {
							item.samplePoint += changeTime;
					} else if (item !== undefined && itemnext !== undefined) {
							item.samplePoint += changeTime;
					} else if (item !== undefined && itemprev !== undefined) {
							item.samplePoint += changeTime;
					}
				}
			}
		};


		sServObj.moveSegment = function (changeTime, t, selected) {
			if (null !== t) {
				if ((t.items[selected[0].id - 1].sampleDur + changeTime) >= 1 && (t.items[selected[selected.length - 1].id + 1].sampleDur - changeTime) >= 1) {
					t.items[selected[0].id - 1].sampleDur += changeTime;
					for (var i = 0; i < selected.length; i++) {
						t.items[selected[i].id].sampleStart += changeTime;
					}
					t.items[selected[selected.length - 1].id + 1].sampleStart += changeTime;
					t.items[selected[selected.length - 1].id + 1].sampleDur -= changeTime;
				}
			}
		};

		sServObj.expandSegment = function (expand, rightSide, selected, tN, changeTime) {
			var startTime = 0;
			var i;
			if (!expand) {
				changeTime = 0 - changeTime;
			}
			if (rightSide) {
				angular.forEach(sServObj.data.levels, function (t) {
					if (t.name === tN) {
						if (t.items[selected[selected.length - 1] + 1].sampleDur > (selected.length * changeTime)) {
							if (t.items[selected[0]].sampleDur > -(selected.length * changeTime)) {
								var found = false;
								for (i = 1; i <= selected.length; i++) {
									if (t.items[selected[i - 1]].sampleDur + changeTime <= 0) {
										found = true;
									}
								}
								if (found) {
									$rootScope.$broadcast('errorMessage', 'Expand Segements Error: Cannot Expand/Shrink. Segment would be too small');

								} else {
									for (i = 1; i <= selected.length; i++) {
										t.items[selected[i - 1]].sampleStart += startTime;
										t.items[selected[i - 1]].sampleDur += changeTime;
										startTime = i * changeTime;
									}
									t.items[selected[selected.length - 1] + 1].sampleStart += startTime;
									t.items[selected[selected.length - 1] + 1].sampleDur -= startTime;
								}
							} else {
								$rootScope.$broadcast('errorMessage', 'Expand Segements Error: No Space left to decrease');

							}
						} else {
							$rootScope.$broadcast('errorMessage', 'Expand Segements Error: No Space left to increase');
						}
					}
				});
			} else {
				angular.forEach(sServObj.data.levels, function (t) {
					if (t.name === tN) {
						if (t.items[selected[0] - 1].sampleDur > (selected.length * changeTime)) {
							if (t.items[selected[selected.length - 1]].sampleDur > (selected.length * changeTime)) {
								var found = false;
								for (i = 1; i <= selected.length; i++) {
									if (t.items[selected[i - 1]].sampleDur + changeTime <= 0) {
										found = true;
									}
								}
								if (found) {
									$rootScope.$broadcast('errorMessage', 'Expand Segements Error : Cannot Expand/Shrink. Segment would be too small');
								} else {
									for (i = 0; i < selected.length; i++) {
										t.items[selected[i]].sampleStart -= (changeTime * (selected.length - i));
										t.items[selected[i]].sampleDur += changeTime;
									}
									t.items[selected[0] - 1].sampleDur -= changeTime * selected.length;
								}
							} else {
								$rootScope.$broadcast('errorMessage', 'Expand Segements Error : No Space left to increase');
							}
						} else {
							$rootScope.$broadcast('errorMessage', 'Expand Segements Error : No Space left to decrease');
						}
					}
				});
			}
		};



		return sServObj;

	});