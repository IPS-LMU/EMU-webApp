'use strict';

angular.module('emulvcApp')
	.service('Tierdataservice', function Tierdataservice($rootScope) {
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
    sServObj.getcurMouseTierDetails = function (tierName) {
      var curTier;
      sServObj.data.tiers.forEach(function (t) {
        if (t.TierName === tierName) {
          curTier = t;
        }
      });
      return curTier;

    };

    /**
     * gets tier details by passing in tierName
     */
    sServObj.getTierDetails = function (tierName) {
      var curTier;
      sServObj.data.tiers.forEach(function (t) {
        if (t.TierName === tierName) {
          curTier = t;
        }
      });
      return curTier;

    };		
    
    /**
     * rename a tier by passing in oldName and id
     */    
    sServObj.rename = function (tiername, id, name) {
	  angular.forEach(sServObj.data.tiers, function (t) {
	    var i = 0;
	    if (t.TierName === tiername) {
		  angular.forEach(t.events, function (evt, i) {
		    if (id == i) {
			  evt.label = name;
		    }
	      });
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
				angular.forEach(t.events, function (evt) {
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
	
	sServObj.deleteSegments = function (toDelete, tierName) {
	    var ret = new Object();
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName) {
				if (t.type === "seg") {
					for (var x in toDelete) {
						var id = toDelete[x];
						if (id > 0) {
							var length = t.events[id].sampleDur;
							t.events[id - 1].sampleDur += length / 2;
							t.events[id + 1].sampleDur += length / 2;
							t.events[id + 1].startSample -= length / 2;
							t.events.splice(id, 1);
						}
					}
				}
				if (toDelete[0] - 1 > 0) {
				    ret.val1 = t.events[toDelete[0] - 1];
				    ret.val2 = toDelete[0] - 1;
				} else {
				    ret.val1 = t.events[0];
				    ret.val2 = 0;
				}
				return ret;
			}
		});
	};	
	
	sServObj.deleteBoundary = function (toDelete, tierName, tierType) {
		angular.forEach(sServObj.data.tiers, function (t) {
			if (t.TierName === tierName) {
				angular.forEach(t.events, function (evt, id) {
					if (evt.startSample == toDelete.startSample) {
						if (t.type === "point") {
							t.events.splice(id, 1);
						} else {
							t.events[id - 1].label += t.events[id].label;
							t.events[id - 1].sampleDur += t.events[id].sampleDur;
							t.events.splice(id, 1);
						}
					}
				});
			}
		});
	};
	
	
	sServObj.snapBoundary = function (toTop, preSelSS, td) {
		var neighTd;
		var neighTdIdx;
		sServObj.data.tiers.forEach(function (t, tIdx) {
			if (t.TierName === td.TierName) {
				if (tIdx >= 1 && toTop) {
					neighTd = sServObj.data.tiers[tIdx - 1];
					neighTdIdx = tIdx - 1;
				} else if (tIdx < sServObj.data.tiers.length - 1 && !toTop) {
					neighTd = sServObj.data.tiers[tIdx + 1];
					neighTdIdx = tIdx + 1;
				}
			}
		});
		var absMinDist = Infinity;
		var absDist;
		var minDist;
		if (neighTd !== undefined) {
			neighTd.events.forEach(function (itm) {
				absDist = Math.abs(preSelSS - itm.startSample);
				if (absDist < absMinDist) {
					absMinDist = absDist;
					minDist = itm.startSample - preSelSS;
				}
			});
			//this.moveBorder(minDist, td);
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
					if (t.events[selected[selected.length - 1] + 1].sampleDur > (selected.length * changeTime)) {
						if (t.events[selected[0]].sampleDur > -(selected.length * changeTime)) {
							var found = false;
							for (i = 1; i <= selected.length; i++) {
								if (t.events[selected[i - 1]].sampleDur + changeTime <= 0) {
									found = true;
								}
							}
							if (found) {
								//  todo emit msg to $rootScope
								//dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segements Error: Cannot Expand/Shrink. Segment would be too small');
							} else {
								for (i = 1; i <= selected.length; i++) {
									t.events[selected[i - 1]].startSample += startTime;
									t.events[selected[i - 1]].sampleDur += changeTime;
									startTime = i * changeTime;
								}
								t.events[selected[selected.length - 1] + 1].startSample += startTime;
								t.events[selected[selected.length - 1] + 1].sampleDur -= startTime;
							}
				  		} else {
				  		   // todo emit msg to $rootScope
							//dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segements Error: No Space left to decrease');
				  		}
					} else {
						//  todo emit msg to $rootScope
				  		//dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segements Error: No Space left to increase');
					}
				}
			});
		} else {
	 		angular.forEach(sServObj.data.tiers, function (t) {
				if (t.TierName === tN) {
					if (t.events[selected[0] - 1].sampleDur > (selected.length * changeTime)) {
						if (t.events[selected[selected.length - 1]].sampleDur > (selected.length * changeTime)) {
							var found = false;
							for (i = 1; i <= selected.length; i++) {
								if (t.events[selected[i - 1]].sampleDur + changeTime <= 0) {
									found = true;
								}
							}
							if (found) {
								//$scope.openModal('views/error.html', 'dialogSmall', false, 'Expand Segements Error', 'Cannot Expand/Shrink. Segment would be too small');
							} 
							else {
								for (i = 0; i < selected.length; i++) {
									t.events[selected[i]].startSample -= (changeTime * (selected.length - i));
									t.events[selected[i]].sampleDur += changeTime;
								}
								t.events[selected[0] - 1].sampleDur -= changeTime * selected.length;
							}
						} 
						else {
							//$scope.openModal('views/error.html', 'dialogSmall', false, 'Expand Segements Error', 'No Space left to increase');
						}
					} 
					else {
						//$scope.openModal('views/error.html', 'dialogSmall', false, 'Expand Segements Error', 'No Space left to decrease');
					}
				}
			});
		}
	};
	
	
	
	
	
		
		
	return sServObj;

});