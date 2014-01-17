'use strict';

angular.module('emulvcApp')
	.controller('HandletiersCtrl', function ($scope, $http, $injector, viewState, HistoryService, ConfigProviderService, Soundhandlerservice, Tierservice, fontScaleService, Drawhelperservice, dialogService) {

		$scope.vs = viewState;
		$scope.hists = HistoryService;
		$scope.fontImage = fontScaleService;
		$scope.shs = Soundhandlerservice;
		$scope.config = ConfigProviderService;
		$scope.dhs = Drawhelperservice;
		$scope.dials = dialogService;
		$scope.testValue = '';
		$scope.message = '';
		$scope.tierDetails = Tierservice;
			

		$scope.sortableOptions = {
			update: function (e, ui) {
				if (!ConfigProviderService.vals.restrictions.sortLabels) {
					// ui.item.parent().sortable('cancel');
				}
			},
			start: function () {
				$scope.deleteEditArea();
			},
			create: function (e, ui) {
				 //ui.item.sortable('enable');
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
		
		
		$scope.$on('errorMessage', function(evt, data) {
		    dialogService.open('views/error.html', 'ModalCtrl', data);
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
			} else {
				dialogService.open('views/error.html', 'ModalCtrl', 'Rename Error : This Tiername already exists ! Please choose another name !');
			}
		};


		$scope.getNearest = function (x, tier) {
			var pcm = parseFloat($scope.vs.curViewPort.sS) + x;
			var id = 0;
			var ret = 0;
			if (tier.type === "seg") {
				angular.forEach(tier.elements, function (evt) {
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
				angular.forEach(tier.elements, function (evt, key) {
					if (key < tier.elements.length - 1) {
						spaceHigher = evt.startSample + (tier.elements[key + 1].startSample - tier.elements[key].startSample) / 2;
					} else {
						spaceHigher = $scope.vs.curViewPort.bufferLength;
					}

					if (key > 0) {
						spaceLower = evt.startSample - (tier.elements[key].startSample - tier.elements[key - 1].startSample) / 2;
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
				angular.forEach(tier.elements, function (evt, id) {
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
				angular.forEach(tier.elements, function (evt, key) {
					if (key < tier.elements.length - 1) {
						spaceHigher = evt.startSample + (tier.elements[key + 1].startSample - tier.elements[key].startSample) / 2;
					} else {
						spaceHigher = $scope.vs.curViewPort.bufferLength;
					}

					if (key > 0) {
						spaceLower = evt.startSample - (tier.elements[key].startSample - tier.elements[key - 1].startSample) / 2;
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
				angular.forEach(tier.elements, function (evt, id) {
					if (nearest) {
						if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
							if (pcm - evt.startSample >= evt.sampleDur / 2) {
								evtr = tier.elements[id + 1];
							} else {
								evtr = tier.elements[id];
							}
						}
					} else {
						if (pcm >= evt.startSample && pcm <= (evt.startSample + evt.sampleDur)) {
							evtr = tier.elements[id];
						}
					}
				});

			} else {
				var spaceLower = 0;
				var spaceHigher = 0;
				angular.forEach(tier.elements, function (evt, key) {
					if (key < tier.elements.length - 1) {
						spaceHigher = evt.startSample + (tier.elements[key + 1].startSample - tier.elements[key].startSample) / 2;
					} else {
						spaceHigher = $scope.vs.curViewPort.bufferLength;
					}

					if (key > 0) {
						spaceLower = evt.startSample - (tier.elements[key].startSample - tier.elements[key - 1].startSample) / 2;
					}

					if (pcm <= spaceHigher && pcm >= spaceLower) {
						evtr = evt;
					}
				});

			}
			return evtr;
		};

	});