'use strict';

var HandletiersCtrl = angular.module('emulvcApp')
	.controller('HandletiersCtrl', function($scope, $http, $injector, viewState, Colorproviderservice, Soundhandlerservice) {

		$scope.vs = viewState;
		$scope.shs = Soundhandlerservice;
		$scope.cps = Colorproviderservice;
		$scope.testValue = '';
		$scope.message = '';
		$scope.myHistory = [];
		$scope.myHistoryCounter = 0;

		$scope.sortableOptions = {
			update: function(e, ui) {
				//alert("update"); 
			},
			start: function(e, ui) {
				$scope.deleteEditArea();
			},
			axis: 'y',
			placeholder: "tierPlaceholder"
		};

		/**
		 * listen for newlyLoadedLabelJson broadcast
		 * update tierDetails if heard
		 */
		$scope.$on('newlyLoadedLabelJson', function(evt, data) {
			// SIC should look for longest tier in tier details
			$scope.vs.curViewPort.eS = data.tiers[8].events[data.tiers[8].events.length - 1].startSample + data.tiers[8].events[data.tiers[8].events.length - 1].sampleDur;
			// for development
			// $scope.viewState.curViewPort.sS = 100;
			// $scope.viewState.curViewPort.eS = 1000;
			// $scope.viewState.bufferLength = $scope.viewState.curViewPort.eS;
			$scope.tierDetails = data;
		});

		$scope.updateAllLabels = function() {
			if ($scope.testValue !== '') {
				angular.forEach($scope.tierDetails.events, function(evt) {
					evt.label = $scope.testValue;
				});
			}
		};

		$scope.history = function() {
			$scope.myHistory[$scope.myHistoryCounter] = jQuery.extend(true, {}, $scope.tierDetails);
			++$scope.myHistoryCounter;
		};

		$scope.goBackHistory = function() {
			if ($scope.myHistoryCounter >= 1) {
				//delete $scope.tierDetails;
				$scope.tierDetails = jQuery.extend(true, {}, $scope.myHistory[$scope.myHistoryCounter - 2]);
				--$scope.myHistoryCounter;
			} else {
				alert("no more history!");
			}
		};

		$scope.renameLabel = function() {
			if (viewState.isEditing()) {
				$scope.rename(viewState.getcurClickTierName(), viewState.getlastID(), $("." + viewState.getlasteditArea()).val());
				viewState.deleteEditArea();
			} else {
				if (viewState.countSelected() == 0) {
					alert("please select a segement first!");
				} else {
					viewState.setEditing(true);
					viewState.openEditArea();
				}
			}
		};

		$scope.deleteEditArea = function() {
			viewState.deleteEditArea();
		};
		
		$scope.selectTier = function(next) {
			if (viewState.isEditing()) {
				$scope.renameLabel();
				viewState.deleteEditArea();
			}
			var now = viewState.getcurClickTierName();
			if(now==undefined) {
			    viewState.setcurClickTierName($("li").children()[0].id);
			}
			else {
			    if(next) {
			        var tag = $("li."+now).next().children()[0];
			        if(tag==undefined)
			            viewState.setcurClickTierName($("li").children()[0].id);
			        else 
			            viewState.setcurClickTierName(tag.id);
			    }
			    else {
			        var tag = $("li."+now).prev().children()[0];
			        if(tag==undefined)
			            viewState.setcurClickTierName($("li").children()[0].id);
			        else
			            viewState.setcurClickTierName(tag.id);
			    }
			}
		};		


		$scope.tabNext = function() {
			if (viewState.isEditing()) {
				$scope.renameLabel();
				viewState.deleteEditArea();
			}
			var now = parseInt(viewState.getselected()[0], 10);
			if (now < viewState.getTierLength() - 1)++now;
			else now = 0;
			viewState.setlasteditArea("_" + now);
			viewState.setcurClickSegment($scope.tierDetails.tiers[viewState.getselected()].events[now], now);
		};

		$scope.tabPrev = function() {
			if (viewState.isEditing()) {
				$scope.renameLabel();
				viewState.deleteEditArea();
			}
			var now = parseInt(viewState.getselected()[0], 10);
			if (now > 0)--now;
			else now = viewState.getTierLength() - 1;
			viewState.setlasteditArea("_" + now);
			viewState.setcurClickSegment($scope.tierDetails.tiers[viewState.getselected()].events[now], now);
		};

		$scope.rename = function(tiername, id, name) {
			angular.forEach($scope.tierDetails.tiers, function(t) {
				var i = 0;
				if (t.TierName == tiername)
					angular.forEach(t.events, function(evt) {
						if (id == i) {
							evt.label = name;
							$scope.history();
						}
						++i;
					});
			});
		};
		
		$scope.deleteTier = function(id) {
		    var x = 0;
			angular.forEach($scope.tierDetails.tiers, function(t) {
				if (t.TierName == id) {
				    $scope.tierDetails.tiers.splice(x,1);
				    
				}
				++x;
			});
			$scope.history();
		};
		
		$scope.deleteSegments = function() {

		    var toDelete = viewState.getselected();
		    var last = toDelete.length-1;
		    var tierName = viewState.getcurClickTierName();
		    
			angular.forEach($scope.tierDetails.tiers, function(t) {
				if (t.TierName == tierName) {
    				for(var x in toDelete) {
    				    var id = toDelete[x];
				        length = t.events[id].sampleDur;
				        t.events[id-1].sampleDur += length/2;
						t.events[id+1].sampleDur += length/2;
						t.events[id+1].startSample -= length/2;
						t.events.splice(id,1);
					}
					
					viewState.setcurClickSegment(t.events[toDelete[0]-1], toDelete[0]-1);
				}
			});
			$scope.history();
			
		};		

		$scope.getEventId = function(x, tier) {
			var pcm = parseInt($scope.vs.curViewPort.sS, 10) + x;
			var id = 0;
			var ret = 0;
			angular.forEach(tier.events, function(evt) {
				if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
					ret = id;
				}
				++id;
			});
			return ret;
		};

		$scope.getEvent = function(x, tier) {
			var pcm = parseInt($scope.vs.curViewPort.sS, 10) + x;
			var evtr = null;
			angular.forEach(tier.events, function(evt) {
				if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
					evtr = evt;
				}
			});
			return evtr;
		};

		$scope.moveBorder = function(changeTime, t) {
			if (null != t && t.TierName == viewState.getcurMouseTierName()) {
				var seg = viewState.getcurMouseSegmentId();
				if (seg >= 1 && (t.events[seg - 1].sampleDur + changeTime) >= 1 && (t.events[seg].sampleDur - changeTime) >= 1) {
					t.events[seg - 1].sampleDur += changeTime;
					t.events[seg].startSample += changeTime;
					t.events[seg].sampleDur -= changeTime;
				}
			}
		};

		$scope.moveSegment = function(changeTime, t) {
			if (null != t && t.TierName == viewState.getcurClickTierName()) {
				var selected = viewState.getselected().sort();
				if ((t.events[selected[0] - 1].sampleDur + changeTime) >= 1 && (t.events[selected[selected.length - 1] + 1].sampleDur - changeTime) >= 1) {
					t.events[selected[0] - 1].sampleDur += changeTime;
					for (var i = 0; i < selected.length; i++) {
						t.events[selected[i]].startSample += changeTime;
					}
					t.events[selected[selected.length - 1] + 1].startSample += changeTime;
					t.events[selected[selected.length - 1] + 1].sampleDur -= changeTime;
				}
			}
		};
	});