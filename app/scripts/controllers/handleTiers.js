'use strict';

angular.module('emulvcApp')
	.controller('HandletiersCtrl', function ($scope, $http, $injector, viewState, HistoryService, ConfigProviderService, Soundhandlerservice, Tierdataservice, fontScaleService, Drawhelperservice, dialogService) {

		$scope.vs = viewState;
		$scope.hists = HistoryService;
		$scope.fontImage = fontScaleService;
		$scope.shs = Soundhandlerservice;
		$scope.config = ConfigProviderService;
		$scope.dhs = Drawhelperservice;

		$scope.testValue = '';
		$scope.message = '';

		$scope.tierDetails = Tierdataservice;

		$scope.sortableOptions = {
			update: function (e, ui) {
				if (!ConfigProviderService.vals.restrictions.sortLabels) {
					// ui.item.parent().sortable('cancel');
				}
			},
			start: function () {
				$scope.deleteEditArea();
			},
			create: function () {
				// $('#allowSortable').sortable('disable');
			},
			axis: 'y',
			placeholder: 'tierPlaceholder'
		};

		/**
		 * listen for newlyLoadedLabelJson broadcast
		 * update tierDetails if heard
		 */
		$scope.$on('newlyLoadedLabelJson', function (evt, data) {
			if ($.isEmptyObject($scope.tierDetails.data)) {
				$scope.tierDetails.data = data;
			} else {
				data.tiers.forEach(function (tier) {
					$scope.tierDetails.data.tiers.push(tier);
				});
				data.fileInfos.forEach(function (fInf) {
					$scope.tierDetails.data.fileInfos.push(fInf);
				});
				// console.log(JSON.stringify($scope.tierDetails, undefined, 2));
			}
			$scope.sortTiers();
		});

		/**
		 * clear tierDetails when new utt is loaded
		 */
		$scope.$on('loadingNewUtt', function () {
			$scope.tierDetails.data = {};
		});

		//
		$scope.sortTiers = function () {
			var sortedTiers = [];
			var sortedFileInfos = [];
			var searchOrd;

			// ConfigProviderService.vals
			ConfigProviderService.vals.labelCanvasConfig.order.forEach(function (curOrd) {
				// console.log(curOrdIdx)
				searchOrd = curOrd.split('.')[1];
				$scope.tierDetails.data.tiers.forEach(function (t, tIdx) {
					if (t.TierName.split('_')[1] === searchOrd) {
						sortedTiers.push(t);
						sortedFileInfos.push($scope.tierDetails.data.fileInfos[tIdx]);
					}
				});
			});
			$scope.tierDetails.data.tiers = sortedTiers;
			$scope.tierDetails.data.fileInfos = sortedFileInfos;
		};


		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
		};

		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};


		$scope.getTierLength = function () {
			return $scope.tierDetails.data.tiers.length;
		};

		$scope.getTier = function (id) {
			var t;
			angular.forEach($scope.tierDetails.data.tiers, function (tier) {
				if (tier.TierName === id) {
					t = tier;
				}
			});
			return t;
		};

		$scope.renameLabel = function () {
			if (viewState.isEditing()) {
				console.log(viewState.getcurClickSegments()[0].label);
				console.log($('.' + viewState.getlasteditArea()).val());
				HistoryService.addObjToUndoStack({
					'type': 'ESPS',
					'action': 'renameLabel',
					'tierName': viewState.getcurClickTierName(),
					'itemIdx': viewState.getlastID(),
					'oldValue': viewState.getcurClickSegments()[0].label,
					'newValue': $('.' + viewState.getlasteditArea()).val()
				});

				$scope.rename(viewState.getcurClickTierName(), viewState.getlastID(), $('.' + viewState.getlasteditArea()).val());
				viewState.deleteEditArea();
				viewState.focusInTextField = false;
			} else {
				if (viewState.countSelected() === 0) {
					alert('please select a segement first!');
				} else {
					viewState.setEditing(true);
					viewState.openEditArea();

				}
			}
		};

		$scope.deleteEditArea = function () {
			viewState.deleteEditArea();
		};

		$scope.selectTier = function (next) {
			var tag;

			if (viewState.isEditing()) {
				$scope.renameLabel();
				viewState.deleteEditArea();
			}
			var now = viewState.getcurClickTierName();
			if (now === undefined) {
				viewState.setcurClickTierName($('li').children()[0].id);
			} else {
				if (next) {
					tag = $('li.' + now).next().children()[0];
					if (tag === undefined) {
						viewState.setcurClickTierName($('li').children()[0].id);
					} else {
						viewState.setcurClickTierName(tag.id);
					}
				} else {
					tag = $('li.' + now).prev().children()[0];
					if (tag === undefined) {
						viewState.setcurClickTierName($('li').children()[0].id);
					} else {
						viewState.setcurClickTierName(tag.id);
					}
				}
			}
		};


		$scope.tabNext = function (invers) {
			if (viewState.isEditing()) {
				$scope.renameLabel();
				viewState.deleteEditArea();
			}
			var now = parseInt(viewState.getselected()[0], 10);

			if (invers) {
				if (now > 1) {
					--now;
				}
			} else {
				if (now < viewState.getTierLength() - 1) {
					++now;
				}
			}

			if (now < 1) {
				now = viewState.getTierLength() - 1;
			}

			angular.forEach($scope.tierDetails.data.tiers, function (t) {
				var i = 0;
				if (t.TierName === viewState.getcurClickTierName()) {
					angular.forEach(t.events, function (evt) {
						if (i === now) {
							viewState.setcurClickSegment(evt, now);
							viewState.setlasteditArea('_' + now);
						}
						++i;
					});
				}
			});
		};


		$scope.snapBoundary = function (toTop) {
			var preSelSS = viewState.getcurMouseSegment().startSample;
			var td = viewState.getcurMouseTierDetails();
			// console.log(td)
			var neighTd;
			var neighTdIdx;
			$scope.tierDetails.data.tiers.forEach(function (t, tIdx) {
				if (t.TierName === td.TierName) {
					if (tIdx >= 1 && toTop) {
						neighTd = $scope.tierDetails.data.tiers[tIdx - 1];
						neighTdIdx = tIdx - 1;
					} else if (tIdx < $scope.tierDetails.data.tiers.length - 1 && !toTop) {
						neighTd = $scope.tierDetails.data.tiers[tIdx + 1];
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
				this.moveBorder(minDist, td);

			}
			// add action to history stack
			$scope.hists.addObjToUndoStack({
				'type': 'ESPS',
				'action': 'moveBoundary',
				'tierName': td.TierName,
				'itemIdx': viewState.getcurMouseSegmentId(),
				'movedBy': minDist
			});
		};


		$scope.expandSegment = function (expand, rightSide) {
			if (viewState.getcurClickTierName() === undefined) {
				dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segments Error: Please select a Tier first');
			} else {
				if (viewState.getselected().length === 0) {
					dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segments Error: Please select one or more Segments first');
				} else {
					var changeTime = 0;
					if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
						changeTime = parseInt(ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
					} else if (ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
						changeTime = ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (viewState.curViewPort.bufferLength / 100);
					} else {
						$scope.openModal('views/error.html', 'dialogSmall', false, 'Expand Segements Error', 'Error in Configuration (Value labelCanvasConfig.addTimeMode)');
					}

					if (!expand) {
						changeTime = 0 - changeTime;
					}
					var selected = viewState.getselected().sort();
					var startTime = 0;
					var i;
					if (rightSide) {
						angular.forEach($scope.tierDetails.data.tiers, function (t) {
							if (t.TierName === viewState.getcurClickTierName()) {
								if (t.events[selected[selected.length - 1] + 1].sampleDur > (selected.length * changeTime)) {
									if (t.events[selected[0]].sampleDur > -(selected.length * changeTime)) {


										// check loop in order to prevent negative sampleDurs
										var found = false;
										for (i = 1; i <= selected.length; i++) {
											if (t.events[selected[i - 1]].sampleDur + changeTime <= 0) {
												found = true;
											}
										}
										if (found) {
											dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segements Error: Cannot Expand/Shrink. Segment would be too small');
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
										dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segements Error: No Space left to decrease');
									}
								} else {
									dialogService.open('views/error.html', 'ErrormodalCtrl', 'Expand Segements Error: No Space left to increase');
								}
							}
						});
					} else {
						angular.forEach($scope.tierDetails.data.tiers, function (t) {
							if (t.TierName === viewState.getcurClickTierName()) {
								if (t.events[selected[0] - 1].sampleDur > (selected.length * changeTime)) {
									if (t.events[selected[selected.length - 1]].sampleDur > (selected.length * changeTime)) {

										// check loop in order to prevent negative sampleDurs
										var found = false;
										for (i = 1; i <= selected.length; i++) {
											if (t.events[selected[i - 1]].sampleDur + changeTime <= 0) {
												found = true;
											}
										}
										if (found) {
											$scope.openModal('views/error.html', 'dialogSmall', false, 'Expand Segements Error', 'Cannot Expand/Shrink. Segment would be too small');
										} else {
											for (i = 0; i < selected.length; i++) {
												t.events[selected[i]].startSample -= (changeTime * (selected.length - i));
												t.events[selected[i]].sampleDur += changeTime;

											}
											t.events[selected[0] - 1].sampleDur -= changeTime * selected.length;
										}
									} else {
										$scope.openModal('views/error.html', 'dialogSmall', false, 'Expand Segements Error', 'No Space left to increase');
									}
								} else {
									$scope.openModal('views/error.html', 'dialogSmall', false, 'Expand Segements Error', 'No Space left to decrease');
								}
							}
						});
					}
				}
			}
		};

		$scope.selectSegmentsInSelection = function () {
			if (viewState.getcurClickTierName() === undefined) {
				$scope.openModal('views/error.html', 'dialogSmall', false, 'Selection Error', 'Please select a Tier first');
			} else {
				var rangeStart = viewState.curViewPort.selectS;
				var rangeEnd = viewState.curViewPort.selectE;
				angular.forEach($scope.tierDetails.data.tiers, function (t) {
					var i = 0;
					if (t.TierName === viewState.getcurClickTierName()) {
						angular.forEach(t.events, function (evt) {
							if (evt.startSample >= rangeStart && (evt.startSample + evt.sampleDur) <= rangeEnd) {
								viewState.setcurClickSegmentMultiple(evt, i);
							}
							++i;
						});
					}
				});
			}
		};

		$scope.rename = function (tiername, id, name) {
			angular.forEach($scope.tierDetails.data.tiers, function (t) {
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

		$scope.deleteTier = function () {
			var x = 0;
			var id = viewState.getcurClickTierName();
			angular.forEach($scope.tierDetails.data.tiers, function (t) {
				if (t.TierName === id) {
					$scope.tierDetails.data.tiers.splice(x, 1);
				}
				++x;
			});
			HistoryService.history();
		};

		$scope.renameTier = function (newName) {
			// var x = 0;
			var found = false;
			angular.forEach($scope.tierDetails.data.tiers, function (t) {
				if (t.TierName === newName) {
					found = true;
				}
			});
			if (!found) {
				angular.forEach($scope.tierDetails.data.tiers, function (t) {
					if (t.TierName === viewState.getcurClickTierName()) {
						t.TierName = newName;
					}
				});
				HistoryService.history();
			} else {
				$scope.openModal('views/error.html', 'dialog', false, 'Rename Error', 'This Tiername already exists ! Please choose another name !');
			}
		};

		$scope.deleteSegments = function () {
			var toDelete = viewState.getselected();
			var tierName = viewState.getcurClickTierName();
			angular.forEach($scope.tierDetails.data.tiers, function (t) {
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
						viewState.setcurClickSegment(t.events[toDelete[0] - 1], toDelete[0] - 1);
					} else {
						viewState.setcurClickSegment(t.events[0], 0);
					}
				}
			});
			// HistoryService.history();
		};

		$scope.deleteBoundary = function () {
			var toDelete = viewState.getcurMouseSegment();
			var tierName = viewState.getcurMouseTierName();
			var tierType = viewState.getcurMouseTierType();
			angular.forEach($scope.tierDetails.data.tiers, function (t) {
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
							console.log(evt);
						}
					});
				}
			});
			// HistoryService.history();

		};

		$scope.getNearest = function (x, tier) {
			var pcm = parseFloat($scope.vs.curViewPort.sS) + x;
			var id = 0;
			var ret = 0;
			if (tier.type === "seg") {
				angular.forEach(tier.events, function (evt) {
					if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
						if (pcm - evt.startSample >= evt.sampleDur / 2) {
							ret = id + 1;
						} else {
							ret = id;
						}
					}
					++id;
				});
			} else {
				var spaceLower = 0;
				var spaceHigher = 0;
				angular.forEach(tier.events, function (evt, key) {
					if (key < tier.events.length - 1) {
						spaceHigher = evt.startSample + (tier.events[key + 1].startSample - tier.events[key].startSample) / 2;
					} else {
						spaceHigher = $scope.vs.curViewPort.bufferLength;
					}

					if (key > 0) {
						spaceLower = evt.startSample - (tier.events[key].startSample - tier.events[key - 1].startSample) / 2;
					}

					if (pcm <= spaceHigher && pcm >= spaceLower) {
						ret = id;
					}
					++id;
				});
			}
			return ret;
		};

		$scope.getEventId = function (x, tier, nearest) {
			var pcm = parseFloat($scope.vs.curViewPort.sS) + x;
			var id = 0;
			var ret = 0;
			if (tier.type === "seg") {
				angular.forEach(tier.events, function (evt, id) {
					if (nearest) {
						if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
							if (pcm - evt.startSample >= evt.sampleDur / 2) {
								ret = id + 1;
							} else {
								ret = id;
							}
						}
					} else {
						if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
							ret = id;
						}
					}
				});
			} else {
				var spaceLower = 0;
				var spaceHigher = 0;
				angular.forEach(tier.events, function (evt, key) {
					if (key < tier.events.length - 1) {
						spaceHigher = evt.startSample + (tier.events[key + 1].startSample - tier.events[key].startSample) / 2;
					} else {
						spaceHigher = $scope.vs.curViewPort.bufferLength;
					}

					if (key > 0) {
						spaceLower = evt.startSample - (tier.events[key].startSample - tier.events[key - 1].startSample) / 2;
					}

					if (pcm <= spaceHigher && pcm >= spaceLower) {
						ret = id;
					}
					++id;
				});
			}

			return ret;
		};


		$scope.getEvent = function (x, tier, nearest) {
			var pcm = parseFloat($scope.vs.curViewPort.sS) + x;
			var evtr = null;
			if (tier.type === "seg") {
				angular.forEach(tier.events, function (evt, id) {
					if (nearest) {
						if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
							if (pcm - evt.startSample >= evt.sampleDur / 2) {
								evtr = tier.events[id + 1];
							} else {
								evtr = tier.events[id];
							}
						}
					} else {
						if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
							evtr = tier.events[id];
						}
					}
				});

			} else {
				var spaceLower = 0;
				var spaceHigher = 0;
				angular.forEach(tier.events, function (evt, key) {
					if (key < tier.events.length - 1) {
						spaceHigher = evt.startSample + (tier.events[key + 1].startSample - tier.events[key].startSample) / 2;
					} else {
						spaceHigher = $scope.vs.curViewPort.bufferLength;
					}

					if (key > 0) {
						spaceLower = evt.startSample - (tier.events[key].startSample - tier.events[key - 1].startSample) / 2;
					}

					if (pcm <= spaceHigher && pcm >= spaceLower) {
						evtr = evt;
					}
				});

			}
			return evtr;
		};

		$scope.moveBorder = function (changeTime, t, segID) {
			if (null !== t) { // && t.TierName === viewState.getcurMouseTierName()
				var seg;
				if (segID === undefined) {
					seg = viewState.getcurMouseSegmentId();
				} else {
					seg = segID;
				}
				if (t.type === 'seg') {
					if (seg > 1 && (t.events[seg - 1].sampleDur + changeTime) >= 1 && (t.events[seg].sampleDur - changeTime) >= 1) {
						t.events[seg - 1].sampleDur += changeTime;
						t.events[seg].startSample += changeTime;
						t.events[seg].sampleDur -= changeTime;
					}
				} else {
					if (seg > 0 && seg < t.events.length - 1) {
						if (t.events[seg].startSample + changeTime >= t.events[seg - 1].startSample &&
							t.events[seg].startSample + changeTime <= t.events[seg + 1].startSample)
							t.events[seg].startSample += changeTime;
					} else if (seg == 0) {
						if (t.events[seg].startSample + changeTime >= 0 &&
							t.events[seg].startSample + changeTime <= t.events[seg + 1].startSample)
							t.events[seg].startSample += changeTime;
					} else if (seg == t.events.length - 1) {
						if (t.events[seg].startSample + changeTime >= t.events[seg - 1].startSample &&
							t.events[seg].startSample + changeTime <= $scope.vs.curViewPort.bufferLength)
							t.events[seg].startSample += changeTime;
					}
				}
			}
		};

		$scope.moveSegment = function (changeTime, t, segIDs) {
			if (null !== t) { // && t.TierName === viewState.getcurClickTierName()
				var selected;
				if (segIDs === undefined) {
					selected = viewState.getselected().sort();
				} else {
					selected = segIDs;
				}
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