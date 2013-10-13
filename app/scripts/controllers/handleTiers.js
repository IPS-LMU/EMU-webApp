'use strict';

var HandletiersCtrl = angular.module('emulvcApp')
	.controller('HandletiersCtrl', function($scope, $http, $injector, viewState) {

		$scope.viewState = viewState;
		$scope.testValue = '';
		$scope.message = '';
		$scope.myHistory = [];
		$scope.myHistoryCounter = 0;

		/**
		* listen for newlyLoadedLabelJson broadcast
		* update tierDetails if heard
		*/ 
		$scope.$on('newlyLoadedLabelJson', function(evt, data){
			// should look for longest tier in tier details
			$scope.viewState.curViewPort.eS = data.tiers[8].events[data.tiers[8].events.length - 1].startSample + data.tiers[8].events[data.tiers[8].events.length - 1].sampleDur;
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
			if (($scope.myHistoryCounter - 1) > 0) {
				delete $scope.tierDetails;
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


		$scope.tabNext = function() {
			if (viewState.isEditing()) {
				$scope.renameLabel(viewState.getcurClickTierName(), viewState.getlastID(), $("." + viewState.getlasteditArea()).val());
				viewState.deleteEditArea();
			}
			var now = parseInt(viewState.getcurClickSegment()[0], 10);
			if (now < viewState.getTierLength() - 1)++now;
			else now = 0;
			viewState.setlasteditArea("_" + now);
			viewState.setcurClickSegment($scope.tierDetails.tiers[viewState.getcurClickSegment()].events[now], now);
		};

		$scope.tabPrev = function() {
			if (viewState.isEditing()) {
				$scope.renameLabel(viewState.getcurClickTierName(), viewState.getlastID(), $("." + viewState.getlasteditArea()).val());
				viewState.deleteEditArea();
			}
			var now = parseInt(viewState.getcurClickSegment()[0], 10);
			if (now > 0)--now;
			else now = viewState.getTierLength() - 1;
			viewState.setlasteditArea("_" + now);
			viewState.setcurClickSegment($scope.tierDetails.tiers[viewState.getcurClickSegment()].events[now], now);
		};


		$scope.rename = function(tier, id, name) {
			var i = 0;
			angular.forEach($scope.tierDetails.events, function(evt) {
				if (id == i) {
					evt.label = name;
				}
				++i;
			});
		};

		$scope.getEventId = function(x, tier) {
			var pcm = parseInt($scope.viewState.curViewPort.sS, 10) + x;
			var id = 0;
			var ret = 0;
			angular.forEach(tier.events, function(evt) {
				if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
					ret = id;
				}
				++id;
			});
			return ret;
		}

		$scope.getEvent = function(x, tier) {
			var pcm = parseInt($scope.viewState.curViewPort.sS, 10) + x;
			var evtr = null;
			angular.forEach(tier.events, function(evt) {
				if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
					evtr = evt;
				}
			});
			return evtr;
		}

		$scope.moveBorder = function(changeTime, t) {
			if (null != t && t.TierName == viewState.getcurMouseTierName()) {
				var seg = viewState.getcurMouseSegmentId();
				if (seg>=1 && (t.events[seg - 1].sampleDur + changeTime) >= 1 && (t.events[seg].sampleDur - changeTime) >= 1) {
					t.events[seg - 1].sampleDur += changeTime;
					t.events[seg].startSample += changeTime;
					t.events[seg].sampleDur -= changeTime;
				}
			}
		};

		$scope.moveSegment = function(changeTime, t) {
			if (null != t && t.TierName == viewState.getcurClickTierName()) {
				var selected = viewState.getcurClickSegment();
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