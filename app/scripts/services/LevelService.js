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
     * gets the current (mousemove) Tier Name
     */
    sServObj.getcurMouseLevelDetails = function (levelName) {
      var curLevel = null;
      sServObj.data.tiers.forEach(function (t) {
        if (t.TierName === levelName) {
          curLevel = t;
        }
      });
      return curLevel;

    };

    /**
     * gets tier details by passing in tierName
     */
    sServObj.getLevelDetails = function (levelName) {
      var curLevel = null;
      var y = null;
      sServObj.data.tiers.forEach(function (t, x) {
        if (t.TierName === levelName) {
          curLevel = t;
          y = x;
        }
      });
      return {level: curLevel, id: y};
    };	

    /**
     * gets element details by passing in levelName and elemtentid
     */
    sServObj.getElementDetails = function (levelName, elementid) {
      var details = null;
      sServObj.data.tiers.forEach(function (t) {
        if (t.TierName === levelName) {
          t.elements.forEach(function (element, y) {
            if(y==elementid) {
                details = element;
            }
          });
        }
      });
      return details;
    };	
    
    sServObj.deleteLevel = function (levelName, id) { 
        var y = 0; 
        var curTier;
		angular.forEach(sServObj.data.tiers, function (t, x) {
			if (t.TierName === levelName && id == x) {
			    curTier = t;
			    y = x;
				sServObj.data.tiers.splice(x, 1);
			}
		});	
		return {tier: curTier, id: y, name: tierName};
    };
        
    /**
     * rename the label of a tier by passing in tiername and id
     */    
    sServObj.renameLabel = function (levelName, id, newLabelName) {
	  angular.forEach(sServObj.data.tiers, function (t) {
	    if (t.TierName === levelName) {
		  angular.forEach(t.elements, function (evt, i) {
		    if (id == i) {
			  evt.label = newLabelName;
		    }
	      });
	    }
	  });
	};	
	    
    /**
     * rename the label of a tier by passing in tiername and id
     */    
    sServObj.renameLevel = function (oldname, newname) {
	  angular.forEach(sServObj.data.tiers, function (t, i) {
	    if (t.TierName === oldname) {
			t.TierName = newname;
	    }
	  });
	};	
	
    /**
     * traverse through tiers an return next/prev event and id
     */	
	sServObj.tabNext = function (invers, now, tN) {
	    var ret = new Object();
		angular.forEach(sServObj.data.tiers, function (t) {
			var i = 0;
			if (t.TierName === tN) {
				angular.forEach(t.elements, function (evt) {
					if (i === now) {
					    ret.event = evt;
					    ret.id =now;
					}
					++i;
				});
			}
		});
		return ret;
	};
	
	sServObj.deleteSegmentsInvers = function (segments, ids, tierName) {
	    var segm, segid;
		var start = ids[0] - 1;
		var end = ids[ids.length-1] + 1;
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName) {
				if (t.type === "seg") {
				    var length = 0;
					for (var x in segments) {
					    length += segments[x].sampleDur;
					}
					if (start >= 0) {
					    t.elements[start].sampleDur -=  length/2;
						t.elements[start+1].sampleDur -= length/2;
						t.elements[start+1].startSample += length/2;
					    for (var x in ids) {
					        t.elements.splice(ids[x], 0, segments[x]); 
					    }
	    			    
	    			    segm = t.elements[start];
		    		    segid = start;
						
					}
			    	else {
				        segm = t.elements[0];
				        segid = 0;
    				}				
				}
			}
		});
		return {segment: segm, id: segid};		
	};
	
	sServObj.deleteSegments = function (segments, ids, tierName) {
	    var segm, segid;
		var start = ids[0] - 1;
		var end = ids[ids.length-1] + 1;
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName) {
				if (t.type === "seg") {
				    var length = 0;
					for (var x in segments) {
					    length += segments[x].sampleDur;
					}
					if (start >= 0) {
					    t.elements[start].sampleDur +=  length/2;
						t.elements[end].sampleDur += length/2;
						t.elements[end].startSample -= length/2;
	    			    t.elements.splice(ids[0], ids.length);
	    			    segm = t.elements[start];
		    		    segid = start;
						
					}
			    	else {
				        segm = t.elements[0];
				        segid = 0;
    				}				
				}
			}
		});
		return {segment: segm, id: segid};		
	};	
	
	sServObj.insertSegmentInvers = function (start, end,  tierName, newLabel) {
	    var ret = true;
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName) {
			    if(start==end) {
			        var startID = -1;
				    angular.forEach(t.elements, function (evt, id) {
				     if(start == evt.startSample) {
				         startID = id;
				         ret = true;
				     }
				    });
				    if(ret) {
				        var diff = t.elements[startID].sampleDur;
				        t.elements[startID-1].sampleDur += diff;
				        t.elements.splice(startID, 1);
				    }			    
			    }
			    else {
			        var startID = -1;
				    angular.forEach(t.elements, function (evt, id) {
				     if(start == evt.startSample) {
				         startID = id;
				         ret = true;
				     }
				    });	
				    if(ret) {
				        var diff = t.elements[startID].sampleDur;
				        var diff2 = t.elements[startID+1].sampleDur;
				        t.elements[startID-1].sampleDur += (diff+diff2);
				        t.elements.splice(startID, 2);
				    }   
			    }
			}
		});
		return ret;
	};	
	
	sServObj.insertSegment = function (start, end,  tierName, newLabel) {
	    var ret = true;
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName) {
			    if(start==end) {
			        var startID = -1;
				    angular.forEach(t.elements, function (evt, id) {
				     if(start >= evt.startSample && start <= (evt.startSample + evt.sampleDur)) {
				         startID = id;
				     }
				     if(evt.startSample == start) {
				         ret = false;
				     }
				     if(evt.startSample + evt.sampleDur == start) {
				         ret = false;
				     }				     
				    });
				    if(ret) {
				        var diff = start - t.elements[startID].startSample;
				        t.elements.splice(startID, 0, angular.copy(t.elements[startID]));
				        t.elements[startID+1].startSample = start;
				        t.elements[startID+1].sampleDur = t.elements[startID].sampleDur - diff;
				        t.elements[startID+1].label = newLabel;
				        t.elements[startID].sampleDur = diff;
				    }			    
			    }
			    else {
			        var startID = -1;
			        var endID = -1;
				    angular.forEach(t.elements, function (evt, id) {
				     if(start >= evt.startSample && start <= (evt.startSample + evt.sampleDur)) {
				         startID = id;
				     }
				     if(end >= evt.startSample && end <= (evt.startSample + evt.sampleDur)) {
				         endID = id;
				     }
				    });	
				    ret = (startID === endID);	
				    if(startID === endID) {
				        var diff = start - t.elements[startID].startSample;
				        var diff2 = end - start;
				        t.elements.splice(startID, 0, angular.copy(t.elements[startID]));
				        t.elements.splice(startID, 0, angular.copy(t.elements[startID]));
				        t.elements[startID+1].startSample = start;
				        t.elements[startID+1].sampleDur = diff2;
				        t.elements[startID+1].label = newLabel;
				        t.elements[startID+2].startSample = end;
				        t.elements[startID+2].sampleDur = t.elements[startID].sampleDur - diff - diff2;
				        t.elements[startID+2].label = newLabel;				        
				        t.elements[startID].sampleDur = diff;
				        
				    }   
			    }
			}
		});
		return ret;
	};	
	
	sServObj.insertPoint = function (startP, tierName, pointName) {
	    var ret = false;
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName && t.type=="point") {
			    var pid = 0;
			    var last = 0;
				angular.forEach(t.elements, function (evt, id) {
				 if(!ret) {
				    if(startP>last && startP<evt.startSample && (Math.floor(startP) != Math.floor(evt.startSample))) {
				    
				    console.log(t.elements);
				    console.log(id);
				 				    
				    
				        t.elements.splice(id-1, 0, angular.copy(t.elements[id-1]));
				        
				    console.log(t.elements);
				        
				        t.elements[id].startSample = startP;
				        t.elements[id].label = pointName;
				        ret = true;
				    }
				    last = evt.startSample;
				    }
				    
				});
			}
		});	
		return ret;
	};	
	
	sServObj.insertPointInvers = function (startP, tierName, pointName) {
	    var ret = false;
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName && t.type=="point") {
			    var pid = 0;
			    var last = 0;
				angular.forEach(t.elements, function (evt, id) {
				 if(!ret) {
				        if(startP == evt.startSample) {
				            t.elements.splice(id,1);
				            ret = true;
				        }
				    }				    
				});
			}
		});	
		return ret;
	};		
	
	sServObj.deleteBoundary = function (toDelete, tierName, tierType) {
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName) {
				angular.forEach(t.elements, function (evt, id) {
					if (evt.startSample == toDelete.startSample) {
						if (t.type === "point") {
							t.elements.splice(id, 1);
						} else {
							t.elements[id - 1].label += t.elements[id].label;
							t.elements[id - 1].sampleDur += t.elements[id].sampleDur;
							t.elements.splice(id, 1);
						}
					}
				});
			}
		});
	};
	
	
	sServObj.snapBoundary = function (toTop, sample, tierName, segID) {
		var neighTd;
		var thisTd;
		var neighTdIdx;
		var absMinDist = Infinity;
		var absDist;
		var minDist;		
		sServObj.data.tiers.forEach(function (t, tIdx) {
			if (t.TierName === tierName) {
			    thisTd = t;
			    if(toTop) {
			        if (tIdx >= 1) {
			            neighTd = sServObj.data.tiers[tIdx - 1];
			        }
			        else {
			            return false;
			        }
			    }
			    else {
			        if (tIdx < sServObj.data.tiers.length - 1) {
			            neighTd = sServObj.data.tiers[tIdx + 1];
			        }
			        else {
			            return false;
			        }			    
			    }
			    neighTd.elements.forEach(function (itm) {
				    absDist = Math.abs(sample - itm.startSample);
				    if (absDist < absMinDist) {
					    absMinDist = absDist;
					    minDist = itm.startSample - sample;
				    }
			    });
			}
		});


		if (minDist !== undefined) {
			this.moveBoundry(minDist, thisTd, segID);
			return minDist;
		}
		else {
		    return false;
		}
	};	
	
	sServObj.moveBoundry = function (changeTime, t, seg) {
		if (null !== t) { // && t.TierName === viewState.getcurMouseLevelName()
			if (t.type === 'seg') {
				if (seg > 1 && (t.elements[seg - 1].sampleDur + changeTime) >= 1 && (t.elements[seg].sampleDur - changeTime) >= 1) {
					t.elements[seg - 1].sampleDur += changeTime;
					t.elements[seg].startSample += changeTime;
					t.elements[seg].sampleDur -= changeTime;
				}
			} else {
				if (seg > 0 && seg < t.elements.length - 1) {
					if (t.elements[seg].startSample + changeTime >= t.elements[seg - 1].startSample &&
						t.elements[seg].startSample + changeTime <= t.elements[seg + 1].startSample)
						t.elements[seg].startSample += changeTime;
				} else if (seg == 0) {
					if (t.elements[seg].startSample + changeTime >= 0 &&
						t.elements[seg].startSample + changeTime <= t.elements[seg + 1].startSample)
						t.elements[seg].startSample += changeTime;
				} else if (seg == t.elements.length - 1) {
					if (t.elements[seg].startSample + changeTime >= t.elements[seg - 1].startSample &&
						t.elements[seg].startSample + changeTime <= $scope.vs.curViewPort.bufferLength)
						t.elements[seg].startSample += changeTime;
				}
			}
		}
	};	
	
	
	sServObj.moveSegment = function (changeTime, t, selected) {
		if (null !== t) { 
			if ((t.elements[selected[0] - 1].sampleDur + changeTime) >= 1 && (t.elements[selected[selected.length - 1] + 1].sampleDur - changeTime) >= 1) {
				t.elements[selected[0] - 1].sampleDur += changeTime;
				for (var i = 0; i < selected.length; i++) {
					t.elements[selected[i]].startSample += changeTime;
				}
				t.elements[selected[selected.length - 1] + 1].startSample += changeTime;
				t.elements[selected[selected.length - 1] + 1].sampleDur -= changeTime;
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
	    	angular.forEach(sServObj.data.tiers, function (t) {
		  		if (t.TierName === tN) {
					if (t.elements[selected[selected.length - 1] + 1].sampleDur > (selected.length * changeTime)) {
						if (t.elements[selected[0]].sampleDur > -(selected.length * changeTime)) {
							var found = false;
							for (i = 1; i <= selected.length; i++) {
								if (t.elements[selected[i - 1]].sampleDur + changeTime <= 0) {
									found = true;
								}
							}
							if (found) {
								$rootScope.$broadcast('errorMessage','Expand Segements Error: Cannot Expand/Shrink. Segment would be too small');

							} else {
								for (i = 1; i <= selected.length; i++) {
									t.elements[selected[i - 1]].startSample += startTime;
									t.elements[selected[i - 1]].sampleDur += changeTime;
									startTime = i * changeTime;
								}
								t.elements[selected[selected.length - 1] + 1].startSample += startTime;
								t.elements[selected[selected.length - 1] + 1].sampleDur -= startTime;
							}
				  		} else {
							$rootScope.$broadcast('errorMessage','Expand Segements Error: No Space left to decrease');
						
				  		}
					} else {
				  		$rootScope.$broadcast('errorMessage', 'Expand Segements Error: No Space left to increase');
					}
				}
			});
		} else {
	 		angular.forEach(sServObj.data.tiers, function (t) {
				if (t.TierName === tN) {
					if (t.elements[selected[0] - 1].sampleDur > (selected.length * changeTime)) {
						if (t.elements[selected[selected.length - 1]].sampleDur > (selected.length * changeTime)) {
							var found = false;
							for (i = 1; i <= selected.length; i++) {
								if (t.elements[selected[i - 1]].sampleDur + changeTime <= 0) {
									found = true;
								}
							}
							if (found) {
								$rootScope.$broadcast('errorMessage', 'Expand Segements Error : Cannot Expand/Shrink. Segment would be too small');
							} 
							else {
								for (i = 0; i < selected.length; i++) {
									t.elements[selected[i]].startSample -= (changeTime * (selected.length - i));
									t.elements[selected[i]].sampleDur += changeTime;
								}
								t.elements[selected[0] - 1].sampleDur -= changeTime * selected.length;
							}
						} 
						else {
							$rootScope.$broadcast('errorMessage', 'Expand Segements Error : No Space left to increase');
						}
					} 
					else {
						$rootScope.$broadcast('errorMessage','Expand Segements Error : No Space left to decrease');
					}
				}
			});
		}
	};
	
	
	
	
	
		
		
	return sServObj;

});