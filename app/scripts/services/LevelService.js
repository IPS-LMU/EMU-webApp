'use strict';

angular.module('emulvcApp')
	.service('Levelservice', function Levelservice($rootScope, uuid) {
		// shared service object
		var sServObj = {};

		sServObj.data = {};

		sServObj.getData = function () {
			return sServObj.data;
		};

		/**
		 * sets annotation data and generates unique uuid if id in element is not set
		 */
		sServObj.setData = function (data) {
		    console.log(data);
			data.levels.forEach(function (level, lid) {
				if (level.type === 'SEGMENT') {
				    level.items.forEach(function (item, iid) {
				        if(item.id===undefined) {
				            item.id = uuid.new();
				        }
				    });
				}
				if (level.type === 'EVENT') {
				    level.items.forEach(function (item, iid) {
				        if(item.id===undefined) {
				            item.id = uuid.new();
				        }				    
				    });
				}
			});		    
			angular.copy(data, sServObj.data);
			
		};

		/**
		 * returns level details (level object and sorting id) by passing in level Name
		 */
		sServObj.getLevelDetails = function (levelName) {
			var curLevel = null;
			var id = null;
			sServObj.data.levels.forEach(function (t, num) {
				if (t.name === levelName) {
					curLevel = t;
					id = num;
				}
			});
			return {
				level: curLevel,
				id: id
			};
		};

		/**
		 * get's element details by passing in levelName and elemtentid
		 */
		sServObj.getElementDetails = function (levelName, elementid) {
			var details = null;
			sServObj.data.levels.forEach(function (t) {
				if (t.name === levelName) {
					t.items.forEach(function (element, num) {
						if (element.id == elementid) {
							details = element;
						}
					});
				}
			});
			return details;
		};
		
		/**
		 * get's element details by passing in levelName and elemtentid
		 */
		sServObj.getElementNeighbourDetails = function (levelName, firstid, lastid) {
			var left = null;
			var right = null;
			sServObj.data.levels.forEach(function (level) {
				if (level.name === levelName) {
					level.items.forEach(function (element, num) {
						if (element.id == firstid) {
							left = level.items[num-1];
						}
						if (element.id == lastid) {
							right = level.items[num+1];
						}						
					});
				}
			});
			return {left: left, right: right};
		};		


		/**
		 * get's element details by passing in level, pcm position and maximum pcm
		 */
		sServObj.getEvent = function (pcm, level, maximum) {
			var evtr = null;
			var evtrNearest = null;
			if (level.type === "SEGMENT") {
				angular.forEach(level.items, function (evt, id) {
						if (pcm >= evt.sampleStart && pcm <= (evt.sampleStart + evt.sampleDur)) {
							if (pcm - evt.sampleStart >= evt.sampleDur / 2 && (id-1) >= 0) {
								evtrNearest = level.items[id+1];
							} else {
								evtrNearest = level.items[id];
							}
						}
						if (pcm >= evt.sampleStart && pcm <= (evt.sampleStart + evt.sampleDur)) {
							evtr = evt;
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
						evtrNearest = evt;
					}
				});
			}
			return {evtr:evtr, nearest: evtrNearest};
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
		sServObj.tabNext = function (invers, now, levelName) {
			var ret = new Object();
			angular.forEach(sServObj.data.levels, function (t) {
				var i = 0;
				if (t.name === levelName) {
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

		sServObj.deleteSegments = function (segments, levelName) {
			var segm, segid;
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

		sServObj.moveBoundry = function (changeTime, levelName, seg) {
		    var last = 0;
		    angular.forEach(sServObj.data.levels, function (level) {
			    if (level.name === levelName && level.type === 'SEGMENT') {
			        angular.forEach(level.items, function (item) {
			          if(item.sampleStart + changeTime > last.sampleStart && item.sampleDur - changeTime > 0) {
			            if(item.id === seg.id) {
			                last.sampleDur += changeTime;
			                item.sampleStart += changeTime;
			                item.sampleDur -= changeTime;
			            }
			          }  
			          last = item;
			        });
			    }
			    else if (level.name === levelName) {
			        angular.forEach(level.items, function (item) {
			          if(item.id == seg.id && item.samplePoint > 0) {
			            item.samplePoint += changeTime;
			          }  
			        });
			    }
			});		
		};


		sServObj.moveSegment = function (changeTime, levelName, selected, lastNeighbours) {
			if( ( (lastNeighbours.left.sampleDur + changeTime) >= 1) && ((lastNeighbours.right.sampleDur - changeTime) >= 1) ) { 
			    
			    angular.forEach(sServObj.data.levels, function (level) {
			        if (level.name === levelName) {
			            angular.forEach(level.items, function (item) {
			                if(item.id == lastNeighbours.left.id) {
			                    item.sampleDur += changeTime;
			                }
			                if(item.id == lastNeighbours.right.id) {
			                    item.sampleStart += changeTime;
			                    item.sampleDur -= changeTime;
			                }
			                
			                angular.forEach(selected, function (s) {
			                    if(item.id==s.id) {
			                        item.sampleStart += changeTime;
			                    }
			                });		                
			            });
			        }
			    });
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