'use strict';

angular.module('emuwebApp')
	.controller('TabbedCtrl', function ($scope, ConfigProviderService, Validationservice, viewState, modalService) {
		$scope.cps = ConfigProviderService;
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
		}];
		
		$scope.cps = ConfigProviderService;		
		$scope.modal = modalService;
		$scope.schema = Validationservice.getSchema('emuwebappConfigSchema').data.properties;
		$scope.modal.dataOut = ConfigProviderService.vals;
		$scope.options = Object.keys(viewState.getWindowFunctions());
		$scope.timeMode = Object.keys(viewState.getTimeModes());
		$scope.comMode = Object.keys(viewState.getCommunicationModes());
		
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
