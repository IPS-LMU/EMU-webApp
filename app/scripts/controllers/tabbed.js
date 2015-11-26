'use strict';

angular.module('emuwebApp')
	.controller('TabbedCtrl', function ($scope, ConfigProviderService, Validationservice, viewState, modalService) {
		$scope.cps = ConfigProviderService;
		$scope.vs = viewState;
		
		// all available tabs
		$scope.tree = [{
			title: 'Main Settings',
			url: 'views/config/main.html'
		}, {
			title: 'Spectrogram Settings',
			url: 'views/config/spectro.html'
		}, {
			title: 'Perspectives Configuration',
			url: 'views/config/perspectives.html'
		}, {
			title: 'Label Configuration',
			url: 'views/config/label.html'
		}, {
			title: 'Restrictions',
			url: 'views/config/restrictions.html'
		}, {
			title: 'Buttons',
			url: 'views/config/buttons.html'
		}];

		$scope.sortableOptions = {
			'ui-floating': true,
			axis: 'y'
		};

		$scope.cps = ConfigProviderService;
		$scope.modal = modalService;
		$scope.schema = Validationservice.getSchema('emuwebappConfigSchema').data.properties;
		$scope.modal.dataOut = ConfigProviderService.vals;
		$scope.options = Object.keys(viewState.getWindowFunctions());
		$scope.timeMode = Object.keys(viewState.getTimeModes());
		$scope.comMode = Object.keys(viewState.getCommunicationModes());
		$scope.signalTypes = Object.keys(viewState.getSignalTypes());
		
		$scope.currentSignal = $scope.signalTypes[0];

		$scope.onClickTab = function (node) {
			if(node.url !== false) {
				$scope.currentTabUrl = node.url;
			}
		};

		$scope.getType = function (section, key) {
			var val = undefined;
			angular.forEach($scope.schema, function (schemaValue, schemaKey) {
				if (schemaKey === section) {
					angular.forEach(schemaValue.properties, function (value, configKey) {
						if (configKey === key) {
							val = value.type;
						}
					});
				}
			});
			return val;
		};

		$scope.perspDelete = function (key) {
			delete $scope.modal.dataOut.perspectives.splice(key, 1);
		};
		
		$scope.signalDelete = function (key, index) {
			$scope.modal.dataOut.perspectives[key].signalCanvases.order.splice(index, 1);
		};
		
		$scope.signalAdd = function (key,  signal) {
			if($scope.modal.dataOut.perspectives[key].signalCanvases.order === undefined) {
				$scope.modal.dataOut.perspectives[key].signalCanvases.order = [];
			}
			$scope.modal.dataOut.perspectives[key].signalCanvases.order.splice($scope.modal.dataOut.perspectives[key].signalCanvases.order.length, 0, signal);
		};		

		$scope.perspAdd = function () {
			var obj = {
				name: 'new Perspective',
				signalCanvases: [],
				levelCanvases: {
					order: []
				},
				twoDimCanvases: []
			}
			$scope.modal.dataOut.perspectives.splice($scope.modal.dataOut.perspectives.length, 0, obj);
		};

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.setEditing(true);
			viewState.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.setEditing(false);
			viewState.setcursorInTextField(false);
		};

		$scope.onClickTab($scope.tree[0]);
	});
