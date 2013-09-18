'use strict';

angular.module('emulvcApp')
	.controller('HandletiersCtrl', function($scope, viewState) {
		$scope.viewState = viewState;

		$scope.testValue = '';

		$scope.tierDetails = {
			'TierName': 'Phonetic',
			'type': 'seg',
			'events': [{
				'label': '',
				'startSample': 0,
				'sampleDur': 8267
			}, {
				'label': 'V',
				'startSample': 8268,
				'sampleDur': 3064
			}, {
				'label': 'm',
				'startSample': 11333,
				'sampleDur': 3670
			}, {
				'label': 'V',
				'startSample': 15004,
				'sampleDur': 3814
			}, {
				'label': 'N',
				'startSample': 18819,
				'sampleDur': 2501
			}, {
				'label': 's',
				'startSample': 21321,
				'sampleDur': 3682
			}, {
				'label': 't',
				'startSample': 25004,
				'sampleDur': 1311
			}, {
				'label': 'H',
				'startSample': 26316,
				'sampleDur': 3416
			}, {
				'label': '@:',
				'startSample': 29733,
				'sampleDur': 2899
			}, {
				'label': 'f',
				'startSample': 32633,
				'sampleDur': 6735
			}, {
				'label': 'r',
				'startSample': 39369,
				'sampleDur': 2524
			}, {
				'label': 'E',
				'startSample': 41894,
				'sampleDur': 3615
			}, {
				'label': 'n',
				'startSample': 45510,
				'sampleDur': 7232
			}, {
				'label': 'z',
				'startSample': 52743,
				'sampleDur': 4122
			}, {
				'label': 'S',
				'startSample': 56866,
				'sampleDur': 5754
			}, {
				'label': 'i:',
				'startSample': 62621,
				'sampleDur': 1906
			}, {
				'label': 'w',
				'startSample': 64528,
				'sampleDur': 1896
			}, {
				'label': '@',
				'startSample': 66425,
				'sampleDur': 1862
			}, {
				'label': 'z',
				'startSample': 68288,
				'sampleDur': 3792
			}, {
				'label': 'k',
				'startSample': 72081,
				'sampleDur': 1829
			}, {
				'label': 'H',
				'startSample': 73911,
				'sampleDur': 1741
			}, {
				'label': '@',
				'startSample': 75653,
				'sampleDur': 1146
			}, {
				'label': 'n',
				'startSample': 76800,
				'sampleDur': 2203
			}, {
				'label': 's',
				'startSample': 79004,
				'sampleDur': 4486
			}, {
				'label': 'I',
				'startSample': 83491,
				'sampleDur': 2304
			}, {
				'label': 'd',
				'startSample': 85796,
				'sampleDur': 936
			}, {
				'label': '@',
				'startSample': 86733,
				'sampleDur': 2953
			}, {
				'label': 'db',
				'startSample': 89687,
				'sampleDur': 5137
			}, {
				'label': 'j',
				'startSample': 94825,
				'sampleDur': 2689
			}, {
				'label': 'u:',
				'startSample': 97515,
				'sampleDur': 3197
			}, {
				'label': 'dH',
				'startSample': 100713,
				'sampleDur': 847
			}, {
				'label': '@',
				'startSample': 101561,
				'sampleDur': 2601
			}, {
				'label': 'f',
				'startSample': 104163,
				'sampleDur': 3770
			}, {
				'label': '@',
				'startSample': 107934,
				'sampleDur': 2593
			}, {
				'label': 'l',
				'startSample': 110528,
				'sampleDur': 4328
			}, {
				'label': '',
				'startSample': 114857,
				'sampleDur': 13228
			}]
		};

		$scope.updateAllLabels = function() {
			if ($scope.testValue !== '') {
				angular.forEach($scope.tierDetails.events, function(evt) {
					evt.label = $scope.testValue;
				});
			}
		};
	});