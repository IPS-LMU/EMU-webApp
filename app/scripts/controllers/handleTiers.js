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
			$scope.viewState.eS = data.events[data.events.length - 1].startSample + data.events[data.events.length - 1].sampleDur;
			$scope.viewState.bufferLength = $scope.viewState.eS;
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
			if (now < $scope.tierDetails.events.length - 1)++now;
			else now = 0;
			viewState.setlasteditArea("_" + now);
			viewState.setcurClickSegment($scope.tierDetails.events[now], now);
		};

		$scope.tabPrev = function() {
			if (viewState.isEditing()) {
				$scope.renameLabel(viewState.getcurClickTierName(), viewState.getlastID(), $("." + viewState.getlasteditArea()).val());
				viewState.deleteEditArea();
			}
			var now = parseInt(viewState.getcurClickSegment()[0], 10);
			if (now > 0)--now;
			else now = $scope.tierDetails.events.length - 1;
			viewState.setlasteditArea("_" + now);
			viewState.setcurClickSegment($scope.tierDetails.events[now], now);
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

		$scope.getPCMpp = function(event) {
			var start = parseInt($scope.viewState.sS, 10);
			var end = parseInt($scope.viewState.eS, 10);
			return (end - start) / event.originalEvent.srcElement.width;
		}

		$scope.getEventId = function(x, event) {
			var pcm = parseInt($scope.viewState.sS, 10) + x;
			var id = 0;
			var ret = 0;
			angular.forEach($scope.tierDetails.events, function(evt) {
				if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
					ret = id;
				}
				++id;
			});
			return ret;
		}

		$scope.getEvent = function(x) {
			var pcm = parseInt($scope.viewState.sS, 10) + x;
			var evtr = null;
			angular.forEach($scope.tierDetails.events, function(evt) {
				if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
					evtr = evt;
				}
			});
			return evtr;
		}

		$scope.moveBorder = function(changeTime) {
			var t = $scope.tierDetails;
			if (null != t) {
				var seg = viewState.getcurMouseSegmentId();
				if ((t.events[seg - 1].sampleDur + changeTime) >= 1 && (t.events[seg].sampleDur - changeTime) >= 1) {
					t.events[seg - 1].sampleDur += changeTime;
					t.events[seg].startSample += changeTime;
					t.events[seg].sampleDur -= changeTime;
				}
			}
		};

		$scope.moveSegment = function(changeTime) {
			var t = $scope.tierDetails;
			if (null != t) {
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