import * as angular from 'angular';

angular.module('emuwebApp')
	.controller('TabbedCtrl', ['$scope', '$timeout', 'ConfigProviderService', 'ValidationService', 'ViewStateService', 'ModalService',
		function ($scope, $timeout, ConfigProviderService, ValidationService, ViewStateService, ModalService) {
		$scope.cps = ConfigProviderService;
		$scope.vs = ViewStateService;

		// all available tabs
		$scope.tree = [{
			title: 'Perspectives Configuration',
			url: 'views/config/perspectives.html'
		}, {
			title: 'Spectrogram Settings',
			url: 'views/config/spectro.html'
		}, {
			title: 'Expert Settings',
			url: 'views/config/expert.html'
		}];

		$scope.cps = ConfigProviderService;
		$scope.modal = ModalService;
		$scope.schema = ValidationService.getSchema('emuwebappConfigSchema').data.properties;
		$scope.modal.dataOut = angular.copy(ConfigProviderService.vals);
		$scope.warning = '';

		$scope.init = function () {
			$scope.options = Object.keys(ViewStateService.getWindowFunctions());
			$scope.timeMode = Object.keys(ViewStateService.getTimeModes());
			$scope.comMode = Object.keys(ViewStateService.getCommunicationModes());
			$scope.signalTypes = Object.keys(ViewStateService.getSignalTypes());
			$scope.levelTypes = [];

			ConfigProviderService.curDbConfig.ssffTrackDefinitions.forEach((val) => {
				$scope.signalTypes.push(val.name);
			});
			ConfigProviderService.curDbConfig.levelDefinitions.forEach((val) => {
				if (val.type === 'SEGMENT' || val.type === 'EVENT') {
					$scope.levelTypes.push(val.name);
				}
			});
			$scope.currentSignal = $scope.signalTypes[0];
			if ($scope.levelTypes.length > 0) {
				$scope.currentLevel = $scope.levelTypes[0];
			}

		};

		$scope.onClickTab = function (node) {
			if (node.url !== false) {
				$scope.currentTabUrl = node.url;
			}
		};

		$scope.getType = function (section, key) {
			var val;
			$scope.schema.forEach((schemaValue, schemaKey) => {
				if (schemaKey === section) {
					schemaValue.properties.forEach((value, configKey) => {
						if (configKey === key) {
							val = value.type;
						}
					});
				}
			});
			return val;
		};

		$scope.up = function (key, index, sequence) {
			var p = $scope.modal.dataOut.perspectives[key];
			if (index > 0) {
				var tmp;
				if (sequence === 0) {
					tmp = p.signalCanvases.order[index - 1];
					p.signalCanvases.order[index - 1] = p.signalCanvases.order[index];
					p.signalCanvases.order[index] = tmp;
				}
				else if (sequence === 1) {
					tmp = p.levelCanvases.order[index - 1];
					p.levelCanvases.order[index - 1] = p.levelCanvases.order[index];
					p.levelCanvases.order[index] = tmp;
				}
			}
		};

		$scope.down = function (key, index, sequence) {
			var p = $scope.modal.dataOut.perspectives[key];
            var tmp;
			if (sequence === 0) {
				if (p.signalCanvases.order[index + 1] !== undefined) {
					tmp = p.signalCanvases.order[index + 1];
					p.signalCanvases.order[index + 1] = p.signalCanvases.order[index];
					p.signalCanvases.order[index] = tmp;
				}
			}
			else if (sequence === 1) {
				if (p.levelCanvases.order[index + 1] !== undefined) {
					tmp = p.levelCanvases.order[index + 1];
					p.levelCanvases.order[index + 1] = p.levelCanvases.order[index];
					p.levelCanvases.order[index] = tmp;
				}
			}
		};

		$scope.del = function (key, index) {
			var p = $scope.modal.dataOut.perspectives[key];
            	var dependency = false;
            	var depWarn = '';
				if(p.signalCanvases.assign !== undefined) {
					for (var x = 0; x < p.signalCanvases.assign.length; x++) {
						if(p.signalCanvases.assign[x].signalCanvasName === p.signalCanvases.order[index]) {
							dependency = true;
							depWarn = p.signalCanvases.assign[x].signalCanvasName;
						}
						if(p.signalCanvases.assign[x].ssffTrackName === p.signalCanvases.order[index]) {
							dependency = true;
							depWarn = p.signalCanvases.assign[x].ssffTrackName;
						}
					}	
				}
				if(!dependency) {
					p.signalCanvases.order.splice(index, 1);
				}
				else {
					$scope.showWarning('Could not delete "' + depWarn + '" because of internal dependencies !');
				}
		};
		
		$scope.showWarning = function (msg) {
			$scope.warningSignal = true;
			$scope.warning = msg;
			$timeout(function () {
				$scope.warningSignal = false;
			}, 2000);						
		};

		$scope.perspDelete = function (key) {
            //delete $scope.modal.dataOut.perspectives.splice(key, 1); // used to be this... don't know why
			$scope.modal.dataOut.perspectives.splice(key, 1);
		};

		$scope.signalAdd = function (key, signal) {
			var p = $scope.modal.dataOut.perspectives[key];
			if (p.signalCanvases.order === undefined) {
				p.signalCanvases.order = [];
			}
			if(p.signalCanvases.order.indexOf(signal) === -1) {
				p.signalCanvases.order.push(signal);
			}
			else {
				$scope.showWarning('Signal "' + signal + '" already exists');
			}
		};

		$scope.levelAdd = function (key, level) {
			var p = $scope.modal.dataOut.perspectives[key];
			if (p.levelCanvases.order === undefined) {
				p.levelCanvases.order = [];
			}
			if (p.levelCanvases.order.indexOf(level) === -1) {
				p.levelCanvases.order.push(level);
			}
			else {
				$scope.showWarning('Level "' + level + '" already exists');
			}
		};

		$scope.perspAdd = function () {
			var obj = {
				name: 'new Perspective',
				signalCanvases: [],
				levelCanvases: {
					order: []
				},
				twoDimCanvases: []
			};
			$scope.modal.dataOut.perspectives.splice($scope.modal.dataOut.perspectives.length, 0, obj);
		};

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			ViewStateService.setEditing(true);
			ViewStateService.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			ViewStateService.setEditing(false);
			ViewStateService.setcursorInTextField(false);
		};


		$scope.onClickTab($scope.tree[0]);
		$scope.init();
	}]);
