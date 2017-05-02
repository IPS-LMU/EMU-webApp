'use strict';

angular.module('emuwebApp')
	.service('ConfigProviderService', function ($q, viewState) {

		// shared service object
		var sServObj = {};
		sServObj.vals = {};
		sServObj.design = {};
		sServObj.curDbConfig = {};
		sServObj.initDbConfig = {};

		// embedded values -> if these are set this overrides the normal config  
		sServObj.embeddedVals = {
			audioGetUrl: '',
			labelGetUrl: '',
			labelType: '',
			fromUrlParams: false
		};

		sServObj.setDesign = function (data) {
			angular.copy(data, sServObj.design);
		};

		/**
		 * depth of 2 = max
		 */
		sServObj.setVals = function (data) {
			if ($.isEmptyObject(sServObj.vals)) {
				sServObj.vals = data;
			} else {
				angular.forEach(Object.keys(data), function (key1) {
					// if array... overwrite entire thing!
					if (angular.isArray(sServObj.vals[key1])) {
						//empty array
						sServObj.vals[key1] = [];
						angular.forEach(data[key1], function (itm) {
							sServObj.vals[key1].push(itm);
						});
					} else {
						angular.forEach(Object.keys(data[key1]), function (key2) {
							if (sServObj.vals[key1][key2] !== undefined) {
								sServObj.vals[key1][key2] = data[key1][key2];
							} else {
								console.error('BAD ENTRY IN CONFIG! Key1: ' + key1 + ' key2: ' + key2);
							}
						});
					}

				});
			}
		};
		
		sServObj.getDelta = function (current) {
			var defer = $q.defer();
			var ret = sServObj.getDeltas(current, sServObj.initDbConfig);
			defer.resolve(ret);
			return defer.promise;
		};
		
		sServObj.getDeltas = function (current, start) {
			var ret = {};
			angular.forEach(current, function (value, key) {
				if (!angular.equals(value, start[key])) {
					if(Array.isArray(value)) {
						ret[key] = [];
						angular.copy(value, ret[key]);
					}
					else if(typeof value == 'object'){
						ret[key] = {};
						ret[key] = sServObj.getDeltas(value, start[key]);
					}
					else {
						if(key !== 'clear' && key !== 'openDemoDB' && key !== 'specSettings') {
							ret[key] = value;
						}
						
					}
				}
			});
			return ret;
		};		

		/**
		 *
		 */
		sServObj.getSsffTrackConfig = function (name) {
			var res;
			if (sServObj.curDbConfig.ssffTrackDefinitions !== undefined) {
				angular.forEach(sServObj.curDbConfig.ssffTrackDefinitions, function (tr) {
					if (tr.name === name) {
						res = tr;
					}
				});
			}
			return res;
		};

        /**
         *
         */
        sServObj.getValueLimsOfTrack = function (trackName) {
            var res = {};
            angular.forEach(sServObj.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.minMaxValLims, function (vL) {
                if (vL.ssffTrackName === trackName) {
                    res = vL;
                }
            });

            return res;
        };

		/**
		 *
		 */
		sServObj.getContourLimsOfTrack = function (trackName) {
			var res = {};
			angular.forEach(sServObj.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.contourLims, function (cL) {
				if (cL.ssffTrackName === trackName) {
					res = cL;
				}
			});

			return res;
		};


        /**
		 *
		 */
		sServObj.getContourColorsOfTrack = function (trackName) {
			var res;
			angular.forEach(sServObj.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.contourColors, function (cC) {
				if (cC.ssffTrackName === trackName) {
					res = cC;
				}
			});

			return res;
		};

		/**
		 *
		 */
		sServObj.getAssignment = function (signalName) {
			var res = {};
			angular.forEach(sServObj.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign, function (a) {
				if (a.signalCanvasName === signalName) {
					res = a;
				}
			});

			return res;
		};

		/**
		 *
		 */
		sServObj.getLevelDefinition = function (levelName) {
			var res = {};
			angular.forEach(sServObj.curDbConfig.levelDefinitions, function (ld) {
				if (ld.name === levelName) {
					res = ld;
				}
			});

			return res;
		};

		/**
		 *
		 */
		sServObj.getAttrDefsNames = function (levelName) {
			var res = [];
			angular.forEach(sServObj.getLevelDefinition(levelName).attributeDefinitions, function (ad) {
				res.push(ad.name);
			});

			return res;
		};


		/**
		 *
		 */
		sServObj.setPerspectivesOrder = function (curPerspective, levelName) {
			if (sServObj.vals !== undefined) {
				if (sServObj.vals.perspectives !== undefined) {
					if (sServObj.vals.perspectives[curPerspective] !== undefined) {
						if (sServObj.vals.perspectives[curPerspective].levelCanvases !== undefined) {
							sServObj.vals.perspectives[curPerspective].levelCanvases.order = levelName;
						}
					}
				}
			}
		};

		/**
		 *  replace ascii codes from config with strings
		 */
		sServObj.getStrRep = function (code) {
			var str;
			switch (code) {
				case 8:
					str = 'BACKSPACE';
					break;
				case 9:
					str = 'TAB';
					break;
				case 13:
					str = 'ENTER';
					break;
				case 16:
					str = 'SHIFT';
					break;
				case 18:
					str = 'ALT';
					break;
				case 32:
					str = 'SPACE';
					break;
				case 37:
					str = '←';
					break;
				case 39:
					str = '→';
					break;
				case 38:
					str = '↑';
					break;
				case 40:
					str = '↓';
					break;
				case 42:
					str = '+';
					break;
				case 43:
					str = '+';
					break;
				case 45:
					str = '-';
					break;
				case 95:
					str = '-';
					break;
				default:
					str = String.fromCharCode(code);
			}
			return str;
		};


		return sServObj;

	});