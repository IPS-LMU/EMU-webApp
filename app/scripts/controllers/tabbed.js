'use strict';

angular.module('emuwebApp')
	.controller('TabbedCtrl', function ($scope, $timeout, ConfigProviderService, Validationservice, viewState, modalService) {
		$scope.cps = ConfigProviderService;
		$scope.vs = viewState;
		
		// all available tabs
		$scope.tree = [{
			title: 'Spectrogram Settings',
			url: 'views/config/spectro.html'
		}, {
			title: 'Perspectives Configuration',
			url: 'views/config/perspectives.html'
		}, {
			title: 'Label Configuration',
			url: 'views/config/label.html'
		}, {
			title: 'Expert Settings',
			url: 'views/config/expert.html'
		}];

		$scope.cps = ConfigProviderService;
		$scope.modal = modalService;
		$scope.schema = Validationservice.getSchema('emuwebappConfigSchema').data.properties;
		$scope.modal.dataOut = ConfigProviderService.vals;
		$scope.warning = '';
		
		$scope.init = function () {
			$scope.options = Object.keys(viewState.getWindowFunctions());
			$scope.timeMode = Object.keys(viewState.getTimeModes());
			$scope.comMode = Object.keys(viewState.getCommunicationModes());
			$scope.signalTypes = Object.keys(viewState.getSignalTypes());
			$scope.levelTypes = [];
			
			angular.forEach(ConfigProviderService.curDbConfig.ssffTrackDefinitions, function (val, key) {
				$scope.signalTypes.push(val.name);
			});
			angular.forEach(ConfigProviderService.curDbConfig.levelDefinitions, function (val, key) {
				if(val.type === 'SEGMENT' || val.type === 'EVENT') {
					$scope.levelTypes.push(val.name);
				}
			});
			$scope.currentSignal = $scope.signalTypes[0];
			if($scope.levelTypes.length>0) {
				$scope.currentLevel = $scope.levelTypes[0];
			}
			
		};

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

		$scope.up = function (key, index, sequence) {
			var p = $scope.modal.dataOut.perspectives[key];
		    if(index>0) {
		    	if(sequence === 0) {
		            var tmp = p.signalCanvases.order[index-1];
    		        p.signalCanvases.order[index-1] = p.signalCanvases.order[index];
	    	        p.signalCanvases.order[index] = tmp;
		    	}
		    	else if (sequence === 1) {
		            var tmp = p.levelCanvases.order[index-1];
    		        p.levelCanvases.order[index-1] = p.levelCanvases.order[index];
	    	        p.levelCanvases.order[index] = tmp;
		    	}
		    }
		};
		
		$scope.down = function (key, index, sequence) {
			var p = $scope.modal.dataOut.perspectives[key];
		    if(sequence === 0) {
				if(p.signalCanvases.order[index+1] !== undefined) {
    		    	var tmp = p.signalCanvases.order[index+1];
		    	    p.signalCanvases.order[index+1] = p.signalCanvases.order[index];
		            p.signalCanvases.order[index] = tmp;
				}
			}
	    	else if (sequence === 1) {
				if(p.levelCanvases.order[index+1] !== undefined) {
    		    	var tmp = p.levelCanvases.order[index+1];
		    	    p.levelCanvases.order[index+1] = p.levelCanvases.order[index];
		            p.levelCanvases.order[index] = tmp;
				}
	    	}		
		};	
		
		$scope.del = function (key, index, sequence) {
			var p = $scope.modal.dataOut.perspectives[key];
			if(sequence === 0) {
				p.signalCanvases.order.splice(index, 1);
			}
			else if(sequence === 1) {
				p.levelCanvases.order.splice(index, 1);
			}
		};
		
		$scope.perspDelete = function (key) {
			delete $scope.modal.dataOut.perspectives.splice(key, 1);
		};		
		
		$scope.signalAdd = function (key,  signal) {
			var p = $scope.modal.dataOut.perspectives[key];
			if(p.signalCanvases.order === undefined) {
				p.signalCanvases.order = [];
			}
			p.signalCanvases.order.push(signal);
		};		

		$scope.levelAdd = function (key,  level) {
			var p = $scope.modal.dataOut.perspectives[key];
			if(p.levelCanvases.order === undefined) {
				p.levelCanvases.order = [];
			}
			if(p.levelCanvases.order.indexOf(level) === -1) {
				p.levelCanvases.order.push(level);
			}
			else {
				$scope.warning = 'Error: "'+level+'" is already existing';
				$timeout(function() { $scope.warning = ''; }, 3000);
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
		$scope.init();
	});
