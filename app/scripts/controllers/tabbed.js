'use strict';

angular.module('emuwebApp')
	.controller('TabbedCtrl', function ($scope, ConfigProviderService, Validationservice) {
		$scope.cps = ConfigProviderService;
		// all available tabs
		$scope.tree = [{
				title: 'Main Settings',
				url: 'views/config/main.html',
				config: ConfigProviderService.vals.main
			}, {
				title: 'Spectrogram Settings',
				url: 'views/config/spectro.html',
				config: ConfigProviderService.vals.spectrogramSettings
			}, {
				title: 'Perspectives Configuration',
				url: 'views/config/perspectives.html',
				config: ConfigProviderService.vals.perspectives
			}, {
				title: 'Label Configuration',
				url: 'views/config/label.html',
				config: ConfigProviderService.vals.labelCanvasConfig
			}, {
				title: 'Restrictions',
				url: 'views/config/restrictions.html',
				config: ConfigProviderService.vals.restrictions
		}];

		$scope.schema = Validationservice.getSchema('emuwebappConfigSchema').data.properties;

		console.log($scope.schema);

		$scope.onClickTab = function (node) {
			if(node.url !== false) {
				$scope.currentTabUrl = node.url;
				$scope.currentConfig = node.config;
			}
		};

		$scope.getConfigValue = function (key) {
			var val = undefined;
			angular.forEach($scope.currentConfig, function (value, configKey) {
				if (configKey === key) {
					val = value;
					console.log(val);
				}
			});
			return val;
		};

		$scope.onClickTab($scope.tree[0]);
	});
