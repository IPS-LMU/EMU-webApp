'use strict';

angular.module('emulvcApp')
	.service('Tierdataservice', function Tierdataservice() {
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
							//dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segements Error: No Space left to decrease');
				  		}
					} else {
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