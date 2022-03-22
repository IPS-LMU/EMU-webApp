import * as angular from 'angular';
import * as tv4 from 'tv4';

class ValidationService{
	private $http;
	private $q;
	private ConfigProviderService;
	
	private schemasJsos;
	private names;
	
	constructor($http, $q, ConfigProviderService){
		this.$http = $http;
		this.$q = $q;
		this.ConfigProviderService = ConfigProviderService;
		
		this.schemasJsos = [];
		this.names = ['annotationFileSchema', 'emuwebappConfigSchema', 'DBconfigFileSchema', 'bundleListSchema', 'bundleSchema', 'designSchema'];
		
	}
	
	/**
	*
	*/
	private checkIfLevelsAreDefined(levelNames, DBconfig) {
		var res = true as any;
		
		// check levels are defined
		DBconfig.levelDefinitions.forEach((ld) => {
			var lnIdx = levelNames.indexOf(ld.name);
			while (lnIdx !== -1) {
				levelNames.splice(lnIdx, 1);
				lnIdx = levelNames.indexOf(ld.name);
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
	private checkIfSsffTracksAreDefined(trackNames, DBconfig) {
		var res = true as any;
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
		DBconfig.ssffTrackDefinitions.forEach((td) => {
			var tnIdx = trackNames.indexOf(td.name);
			while (tnIdx !== -1) {
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
	public semCheckLoadedConfigs(EMUwebAppConfig, DBconfig) {
		var res = true as any;
		var keepGoing = true;
		/////////////////////////////////////////////////////////////////////
		// check DBconfig levelDefinitions
		DBconfig.levelDefinitions.forEach((ld, ldIdx) => {
			
			// check for duplicate attributeDefinition names
			ld.attributeDefinitions.forEach((ad1, ad1idx) => {
				var counter = 0;
				ld.attributeDefinitions.forEach((ad2) => {
					if (ad1.name === ad2.name) {
						counter = counter + 1;
					}
				});
				if (counter > 1) {
					res = 'Error in DBconfig /levelDefinitions[' + ldIdx + ']/attributeDefinitions[' + ad1idx +
					'] duplicate attribute definitions found for this entry!';
					
					keepGoing = false;
				}
			});
		});
		
		// TODO check for unique perspective names
		
		////////////////////////////////////////////////////////////////////
		// check perspectives
		EMUwebAppConfig.perspectives.forEach((p) => {
			if (keepGoing) {
				/////////////////////////
				// check signalCanvases
				
				// check only defined signalCanvases are displayed
				var tDefRes = this.checkIfSsffTracksAreDefined(angular.copy(p.signalCanvases.order), DBconfig);
				if (tDefRes !== true) {
					res = 'Error in EMUwebAppConfig/perspectives/signalCanvases/order! References to undefined ssffTracks are present. ' + tDefRes;
					keepGoing = false;
				}
				var assTrackNames = [];
				// check only defined and displayed (in order array) assignments are present
				p.signalCanvases.assign.forEach((ass) => {
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
						tDefRes = this.checkIfSsffTracksAreDefined([ass.signalCanvasName, ass.ssffTrackName], DBconfig);
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
				p.signalCanvases.contourLims.forEach((cl) => {
					if (keepGoing) {
						// are defined
						tDefRes = this.checkIfSsffTracksAreDefined([cl.ssffTrackName], DBconfig);
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
				var lDefRes = this.checkIfLevelsAreDefined(angular.copy(p.levelCanvases.order), DBconfig);
				if (lDefRes !== true) {
					res = 'Error in EMUwebAppConfig/perspectives/levelCanvases/order! References to undefined levels are present. ' + lDefRes;
					keepGoing = false;
				}
				
				// check only SEGMENT or EVENT levels are displayed
				p.levelCanvases.order.forEach((ln) => {
					if (keepGoing) {
						var ld = this.ConfigProviderService.getLevelDefinition(ln);
						if (ld.type !== 'SEGMENT' && ld.type !== 'EVENT') {
							res = 'Error in EMUwebAppConfig/perspectives/levelCanvases/order! Configured to display levels of type ITEM as levels containing time information (ITEM level in order array). LevelName: ' + ln;
							keepGoing = false;
						}
					}
				});
				
				/////////////////////////
				// check twoDimCanvases
				if (p.twoDimCanvases !== undefined) {
					if (p.twoDimCanvases.twoDimDrawingDefinitions !== undefined) {
						p.twoDimCanvases.twoDimDrawingDefinitions.forEach((tddd) => {
							if (keepGoing) {
								var dotNames = [];
								// check dots
								tddd.dots.forEach((d) => {
									if (keepGoing) {
										dotNames.push(d.name);
										// are defined
										tDefRes = this.checkIfSsffTracksAreDefined([d.xSsffTrack, d.ySsffTrack], DBconfig);
										if (tDefRes !== true) {
											res = 'Error in EMUwebAppConfig/perspectives/twoDimCanvases/twoDimDrawingDefinitions/dots! References to undefined ssffTracks are present. ' + tDefRes;
											keepGoing = false;
										}
									}
								});
								// check connectLines
								tddd.connectLines.forEach((cl) => {
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
								tddd.staticDots.forEach((sd) => {
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
				
			}
			
		});
		
		
		////////////////////////////////////////////////////////////////////
		// check for anagestConfig and if the according tracks/levels are defined
		
		// get tack and level names of anagestConfigs
		var trackNames = [];
		var levelNames = [];
		DBconfig.levelDefinitions.forEach((ld) => {
			if (ld.anagestConfig !== undefined) {
				trackNames.push(ld.anagestConfig.verticalPosSsffTrackName);
				trackNames.push(ld.anagestConfig.velocitySsffTrackName);
				levelNames.push(ld.anagestConfig.autoLinkLevelName);
			}
		});
		// check levels
		var lDefRes = this.checkIfLevelsAreDefined(levelNames, DBconfig);
		if (lDefRes !== true) {
			res = 'Error in DBconfig/levelDefinitions/anagestConfig/autoLinkLevelName! References to undefined levels are present. ' + lDefRes;
		}
		
		// check ssffTrackDefs
		var tDefRes = this.checkIfSsffTracksAreDefined(trackNames, DBconfig);
		if (tDefRes !== true) {
			res = 'Error in DBconfig/levelDefinitions/anagestConfig/verticalPosSsffTrackName || velocitySsffTrackName! References to undefined ssffTracks are present. ' + tDefRes;
		}
		
		return res;
	};
	
	/**
	*
	*/
	public loadSchemas() {
		var proms = [];
		var uri;
		this.names.forEach((n) => {
			uri = 'schemaFiles/' + n + '.json';
			proms.push(this.$http.get(uri));
		});
		return this.$q.all(proms);
	};
	
	/**
	*
	*/
	public setSchemas(schemaArr) {
		schemaArr.forEach((s) => {
			this.schemasJsos.push({
				name: s.config.url,
				data: s.data
			});
			// add schema data to tv4 for de-referencing $ref
			tv4.addSchema(s.config.url, s.data);
		});
	};
	
	/**
	*
	*/
	public getSchema(schemaName) {
		var schema;
		this.schemasJsos.forEach((s) => {
			if (s.name === 'schemaFiles/' + schemaName + '.json') {
				schema = s;
			}
		});
		return schema;
	};
	
	/**
	*
	*/
	public validateJSO(schemaName, jso) {
		var schema = this.getSchema(schemaName);
		var res;
		
		if (schema !== undefined && tv4.validate(jso, schema.data)) {
			if (schemaName === 'DBconfigFileSchema') {
				var semCheckRes = this.semCheckLoadedConfigs(this.ConfigProviderService.vals, this.ConfigProviderService.curDbConfig);
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
	
}

angular.module('emuwebApp')
.service('ValidationService', ['$http', '$q', 'ConfigProviderService', ValidationService]);