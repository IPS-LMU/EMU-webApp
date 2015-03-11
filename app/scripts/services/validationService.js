'use strict';

angular.module('emuwebApp')
	.service('Validationservice', function Validationservice($http, $q, ConfigProviderService) {

		//shared service object to be returned
		var sServObj = {};
		var schemasJsos = [];
		var names = ['annotationFileSchema', 'emuwebappConfigSchema', 'DBconfigFileSchema', 'bundleListSchema', 'bundleSchema'];


		/**
		 *
		 */
		function checkIfLevelsAreDefined(levelNames, DBconfig) {
			var res = true;

			// check levels are defined
			DBconfig.levelDefinitions.forEach(function (ld) {
				var lnIdx = levelNames.indexOf(ld.name);
				if (lnIdx !== -1) {
					levelNames.splice(lnIdx, 1);
				}
			});

			if (levelNames.length !== 0) {
				res = 'Following levels are not defined: ' + levelNames;
			}
			return res;
		}

		/**
		 *
		 */
		function checkIfSsffTracksAreDefined(trackNames, DBconfig) {
			var res = true;
			// remove OSCI and SPEC
			var tnIdx = trackNames.indexOf('OSCI');
			if (tnIdx !== -1) {
				trackNames.splice(tnIdx, 1);
			}
			tnIdx = trackNames.indexOf('SPEC');
			if (tnIdx !== -1) {
				trackNames.splice(tnIdx, 1);
			}
			// check levels are defined
			DBconfig.ssffTrackDefinitions.forEach(function (td) {
				var tnIdx = trackNames.indexOf(td.name);
				while(tnIdx !== -1) {
					trackNames.splice(tnIdx, 1);
					tnIdx = trackNames.indexOf(td.name);
				}
			});

			if (trackNames.length !== 0) {
				res = 'Following ssffTracks are not defined: ' + trackNames;
			}
			return res;
		}


		//////////////////////////////////
		// public API

		/**
		 *
		 */
		sServObj.semCheckLoadedConfigs = function (EMUwebAppConfig, DBconfig) {
			var res = true;
			var keepGoing = true;
			// TODO check for unique perspective names

			////////////////////////////////////////////////////////////////////
			// check perspectives
			EMUwebAppConfig.perspectives.forEach(function (p) {
				if (keepGoing) {
					/////////////////////////
					// check signalCanvases

					// check only defined signalCanvases are displayed
					var tDefRes = checkIfSsffTracksAreDefined(angular.copy(p.signalCanvases.order), DBconfig);
					if (tDefRes !== true) {
						res = 'Error in EMUwebAppConfig/perspectives/signalCanvases/order! References to undefined ssffTracks are present. ' + tDefRes;
						keepGoing = false;
					}
					var assTrackNames = [];
					// check only defined and displayed (in order array) assignments are present
					p.signalCanvases.assign.forEach(function (ass) {
						if (keepGoing) {
							assTrackNames.push(ass.ssffTrackName);

							// self assignments are not allowed
							if (ass.signalCanvasName === ass.ssffTrackName) {
								res = 'Error in EMUwebAppConfig/perspectives/signalCanvases/assign! Assignment to self is not possible! signalCanvasesName: ' + ass.signalCanvasName;
								keepGoing = false;
							}
							// OSCI and SPEC can not be assigned 
							if (ass.ssffTrackName === 'OSCI' || ass.ssffTrackName === 'SPEC') {
								res = 'Error in EMUwebAppConfig/perspectives/signalCanvases/assign! Assignment of OSCI or SPEC is not possible!';
								keepGoing = false;
							}

							// are defined
							tDefRes = checkIfSsffTracksAreDefined([ass.signalCanvasName, ass.ssffTrackName], DBconfig);
							if (tDefRes !== true) {
								res = 'Error in EMUwebAppConfig/perspectives/signalCanvases/assign! References to undefined ssffTracks are present. ' + tDefRes;
								keepGoing = false;
							}
							// are displayed
							var tnIdx = p.signalCanvases.order.indexOf(ass.signalCanvasName);
							if (tnIdx === -1) {
								res = 'Error in EMUwebAppConfig/perspectives/signalCanvases/assign! References to ssffTracks that are not displayed (not in order array of that perspective) are: ' + ass.signalCanvasName;
								keepGoing = false;
							}
						}
					});

					// check only defined and displayed contourLims are present
					p.signalCanvases.contourLims.forEach(function (cl) {
						if (keepGoing) {
							// are defined
							tDefRes = checkIfSsffTracksAreDefined([cl.ssffTrackName], DBconfig);
							if (tDefRes !== true) {
								res = 'Error in EMUwebAppConfig/perspectives/signalCanvases/contourLims! References to undefined ssffTracks are present. ' + tDefRes;
								keepGoing = false;
							}
							// are displayed (concat to find assigned ssffTracks as well)
							var tnIdx = p.signalCanvases.order.concat(assTrackNames).indexOf(cl.ssffTrackName);
							if (tnIdx === -1) {
								res = 'Error in EMUwebAppConfig/perspectives/signalCanvases/contourLims! References to ssffTracks that are not displayed (not in order array of that perspective) are: ' + cl.ssffTrackName;
								keepGoing = false;
							}
						}
					});

					/////////////////////////
					// check levelCanvases

					// check only defined levels are displayed
					var lDefRes = checkIfLevelsAreDefined(angular.copy(p.levelCanvases.order), DBconfig);
					if (lDefRes !== true) {
						res = 'Error in EMUwebAppConfig/perspectives/levelCanvases/order! References to undefined levels are present. ' + lDefRes;
						keepGoing = false;
					}

					// check only SEGMENT or EVENT levels are displayed
					p.levelCanvases.order.forEach(function (ln) {
						if (keepGoing) {
							var ld = ConfigProviderService.getLevelDefinition(ln);
							if (ld.type !== 'SEGMENT' && ld.type !== 'EVENT') {
								res = 'Error in EMUwebAppConfig/perspectives/levelCanvases/order! Configured to display levels of type ITEM as levels containing time information (ITEM level in order array). LevelName: ' + ln;
								keepGoing = false;
							}
						}
					});

					/////////////////////////
					// check twoDimCanvases
					if (p.twoDimCanvases.twoDimDrawingDefinitions !== undefined) {
						p.twoDimCanvases.twoDimDrawingDefinitions.forEach(function (tddd) {
							if (keepGoing) {
								var dotNames = [];
								// check dots
								tddd.dots.forEach(function (d) {
									if (keepGoing) {
										dotNames.push(d.name);
										// are defined
										tDefRes = checkIfSsffTracksAreDefined([d.xSsffTrack, d.ySsffTrack], DBconfig);
										if (tDefRes !== true) {
											res = 'Error in EMUwebAppConfig/perspectives/twoDimCanvases/twoDimDrawingDefinitions/dots! References to undefined ssffTracks are present. ' + tDefRes;
											keepGoing = false;
										}
									}
								});
								// check connectLines
								tddd.connectLines.forEach(function (cl) {
									if (keepGoing) {
										// fromDot is defined
										var tnIdx = dotNames.indexOf(cl.fromDot);
										if (tnIdx === -1) {
											res = 'Error in EMUwebAppConfig/perspectives/twoDimCanvases/twoDimDrawingDefinitions/connectLines! References dots in fromDot that are not defined. dots.name: ' + cl.fromDot;
											keepGoing = false;
										}
										// toDot is defined
										tnIdx = dotNames.indexOf(cl.toDot);
										if (tnIdx === -1) {
											res = 'Error in EMUwebAppConfig/perspectives/twoDimCanvases/twoDimDrawingDefinitions/connectLines! References dots in toDot that are not defined. dots.name: ' + cl.toDot;
											keepGoing = false;
										}
									}
								});
								// check staticDots
								tddd.staticDots.forEach(function (sd) {
									if (keepGoing) {
										// check array is of the same length
										if (sd.xCoordinates.length !== sd.yCoordinates.length) {
											res = 'Error in EMUwebAppConfig/perspectives/twoDimCanvases/twoDimDrawingDefinitions/staticDots! xCoordinates and yCoordinates are not of the same length!';
											keepGoing = false;
										}
									}
								});
							}
						});
					}

				}

			});


			////////////////////////////////////////////////////////////////////
			// check for anagestConfig and if the according tracks/levels are defined

			// get tack and level names of anagestConfigs
			var trackNames = [];
			var levelNames = [];
			DBconfig.levelDefinitions.forEach(function (ld) {
				if (ld.anagestConfig !== undefined) {
					trackNames.push(ld.anagestConfig.verticalPosSsffTrackName);
					trackNames.push(ld.anagestConfig.velocitySsffTrackName);
					levelNames.push(ld.anagestConfig.autoLinkLevelName);
				}
			});
			// check levels
			var lDefRes = checkIfLevelsAreDefined(levelNames, DBconfig);
			if (lDefRes !== true) {
				res = 'Error in DBconfig/levelDefinitions/anagestConfig/autoLinkLevelName! References to undefined levels are present. ' + lDefRes;
			}

			// check ssffTrackDefs
			var tDefRes = checkIfSsffTracksAreDefined(trackNames, DBconfig);
			if (tDefRes !== true) {
				res = 'Error in DBconfig/levelDefinitions/anagestConfig/verticalPosSsffTrackName || velocitySsffTrackName! References to undefined ssffTracks are present. ' + tDefRes;
			}

			return res;
		};

		/**
		 *
		 */
		sServObj.loadSchemas = function () {
			var proms = [];
			var uri;
			angular.forEach(names, function (n) {
				uri = 'schemaFiles/' + n + '.json';
				proms.push($http.get(uri));
			});
			return $q.all(proms);
		};

		/**
		 *
		 */
		sServObj.setSchemas = function (schemaArr) {
			angular.forEach(schemaArr, function (s) {
				schemasJsos.push({
					name: s.config.url,
					data: s.data
				});
				// add annotationFileSchema to tv4 for de-referencing $ref
				if (s.config.url === 'schemaFiles/annotationFileSchema.json') {
					tv4.addSchema(s.config.url, s.data);
				}
			});
		};

		/**
		 *
		 */
		sServObj.getSchema = function (schemaName) {
			var schema = undefined;
			angular.forEach(schemasJsos, function (s) {
				if (s.name === 'schemaFiles/' + schemaName + '.json') {
					schema = s;
				}
			});
			return schema;
		};

		/**
		 *
		 */
		sServObj.validateJSO = function (schemaName, jso) {
			var schema = sServObj.getSchema(schemaName);
			var res;

			if (schema !== undefined && tv4.validate(jso, schema.data)) {
				if (schemaName === 'DBconfigFileSchema') {
					var semCheckRes = sServObj.semCheckLoadedConfigs(ConfigProviderService.vals, ConfigProviderService.curDbConfig);
					if (semCheckRes === true) {
						res = true;
					} else {
						res = semCheckRes;
					}
				} else {
					res = true;
				}
			} else {
				if (schema === undefined) {
					res = 'Schema: ' + schemaName + ' is currently undefined! This is probably due to a misnamed schema file on the server...';
				} else {
					res = tv4.error;
				}
			}

			return res;
		};

		return sServObj;
	});