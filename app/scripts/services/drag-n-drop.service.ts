import * as angular from 'angular';

class DragnDropService{
	
	private $q;
	private $rootScope;
	private $window;
	private modalService;
	private DataService;
	private Validationservice;
	private ConfigProviderService;
	private DragnDropDataService;
	private Iohandlerservice;
	private viewState;
	private Soundhandlerservice;
	private Binarydatamaniphelper;
	private browserDetector;
	private Wavparserservice;
	private Textgridparserservice;
	private loadedMetaDataService;
	private LevelService;
	
	private drandropBundles;
	private bundleList;
	private sessionName;
	private maxDroppedBundles;
	
	constructor($q, $rootScope, $window, modalService, DataService, Validationservice, ConfigProviderService, DragnDropDataService, Iohandlerservice, viewState, Soundhandlerservice, Binarydatamaniphelper, browserDetector, Wavparserservice, Textgridparserservice, loadedMetaDataService, LevelService){
		this.$q = $q;
		this.$rootScope = $rootScope;
		this.$window = window;
		this.modalService = modalService;
		this.DataService = DataService;
		this.Validationservice = Validationservice;
		this.ConfigProviderService = ConfigProviderService;
		this.DragnDropDataService = DragnDropDataService;
		this.Iohandlerservice = Iohandlerservice;
		this.viewState = viewState;
		this.Soundhandlerservice = Soundhandlerservice;
		this.Binarydatamaniphelper = Binarydatamaniphelper;
		this.browserDetector = browserDetector;
		this.Wavparserservice = Wavparserservice;
		this.Textgridparserservice = Textgridparserservice;
		this.loadedMetaDataService = loadedMetaDataService;
		this.LevelService = LevelService;
		
		this.drandropBundles = [];
		this.bundleList = [];
		this.sessionName = 'File(s)';
		this.maxDroppedBundles = 10;
		
	}
	
	///////////////////////////////
	// public api
	
	///////////////////
	// drag n drop data
	public setData(bundles) {
		var count = 0;
		bundles.forEach((bundle, i) => {
			this.setDragnDropData(bundle[0], i, 'wav', bundle[1]);
			if (bundle[2] !== undefined) {
				this.setDragnDropData(bundle[0], i, 'annotation', bundle[2]);
			}
			count = i;
		});
		if (count <= this.maxDroppedBundles) {
			this.convertDragnDropData(this.drandropBundles, 0).then(() => {
				this.loadedMetaDataService.setBundleList(this.bundleList);
				this.loadedMetaDataService.setCurBndlName(this.bundleList[this.DragnDropDataService.sessionDefault]);
				this.loadedMetaDataService.setDemoDbName(this.bundleList[this.DragnDropDataService.sessionDefault]);
				this.handleLocalFiles();
				return true;
			});
		}
		else {
			return false;
		}
	};
	
	public resetToInitState() {
		delete this.drandropBundles;
		this.drandropBundles = [];
		delete this.bundleList;
		this.bundleList = [];
		this.sessionName = 'File(s)';
		this.maxDroppedBundles = 10;
		this.DragnDropDataService.resetToInitState();
		this.loadedMetaDataService.resetToInitState();
	};
	
	/**
	* setter this.drandropBundles
	*/
	public setDragnDropData(bundle, i, type, data) {
		this.DragnDropDataService.setDefaultSession(i);
		if (this.drandropBundles[i] === undefined) {
			this.drandropBundles[i] = {};
			this.DragnDropDataService.convertedBundles[i] = {};
			this.DragnDropDataService.convertedBundles[i].name = bundle;
			this.bundleList.push({
				name: bundle,
				session: this.sessionName
			});
			
		}
		if (type === 'wav') {
			this.drandropBundles[i].wav = data;
		}
		else if (type === 'annotation') {
			this.drandropBundles[i].annotation = data;
		}
	};
	
	/**
	* getter this.drandropBundles
	*/
	public getDragnDropData(bundle, type) {
		if (type === 'wav') {
			return this.drandropBundles[bundle].wav;
		}
		else if (type === 'annotation') {
			return this.drandropBundles[bundle].annotation;
		}
		else {
			return false;
		}
	};
	
	public generateDrop(data) {
		var objURL;
		if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
			objURL = webkitURL.createObjectURL(this.getBlob(data));
		} else {
			objURL = URL.createObjectURL(this.getBlob(data));
		}
		return objURL;
	};
	
	/**
	*
	*/
	public getBlob(data) {
		var blob;
		try {
			blob = new Blob([data], {type: 'text/plain'});
		} catch (e) { // Backwards-compatibility
			blob = new (this.$window.BlobBuilder || this.$window.WebKitBlobBuilder || this.$window.MozBlobBuilder);
			blob.append(data);
			blob = blob.getBlob();
		}
		return blob;
	};
	
	public convertDragnDropData(bundles, i) {
		var defer = this.$q.defer();
		var data = this.drandropBundles[i];
		var reader:any = new FileReader();
		var reader2:any = new FileReader();
		var res;
		if (bundles.length > i) {
			if (data.wav !== undefined) {
				reader.readAsArrayBuffer(data.wav);
				reader.onloadend = function (evt) {
					if (evt.target.readyState === FileReader.DONE) {
						if (this.browserDetector.isBrowser.Firefox()) {
							res = evt.target.result;
						} else {
							res = evt.currentTarget.result;
						}
						this.Wavparserservice.parseWavAudioBuf(res).then((audioBuffer) => {
							if (this.DragnDropDataService.convertedBundles[i] === undefined) {
								this.DragnDropDataService.convertedBundles[i] = {};
							}
							//DragnDropDataService.convertedBundles[i].mediaFile = {};
							this.Soundhandlerservice.audioBuffer = audioBuffer;
							//DragnDropDataService.convertedBundles[i].mediaFile.audioBuffer = res;
							this.DragnDropDataService.convertedBundles[i].ssffFiles = [];
							var bundle = data.wav.name.substr(0, data.wav.name.lastIndexOf('.'));
							if (data.annotation === undefined) {
								this.DragnDropDataService.convertedBundles[i].annotation = {
									levels: [],
									links: [],
									sampleRate: audioBuffer.sampleRate,
									annotates: bundle,
									name: bundle
								};
								this.convertDragnDropData(bundles, i + 1).then(() => {
									delete this.drandropBundles;
									this.drandropBundles = [];
									defer.resolve();
								});
							}
							else {
								if (data.annotation.type === 'textgrid') {
									reader2.readAsText(data.annotation.file);
									reader2.onloadend = function (evt) {
										if (evt.target.readyState === FileReader.DONE) {
											this.Textgridparserservice.asyncParseTextGrid(evt.currentTarget.result, data.wav.name, bundle).then((parseMess) => {
												this.DragnDropDataService.convertedBundles[i].annotation = parseMess;
												this.convertDragnDropData(bundles, i + 1).then(() => {
													defer.resolve();
												});
											}, function (errMess) {
												this.modalService.open('views/error.html', 'Error parsing TextGrid file: ' + errMess.status.message).then(() => {
													defer.reject();
												});
											});
										}
									};
								}
								else if (data.annotation.type === 'annotation') {
									reader2.readAsText(data.annotation.file);
									reader2.onloadend = function (evt) {
										if (evt.target.readyState === FileReader.DONE) {
											this.DragnDropDataService.convertedBundles[i].annotation = angular.fromJson(evt.currentTarget.result);
											this.convertDragnDropData(bundles, i + 1).then(() => {
												defer.resolve();
											});
										}
									};
								}
							}
						}, function (errMess){
							this.modalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message).then(() => {
								defer.reject();
							});
							
						});
					}
				};
			}
		}
		else {
			defer.resolve();
			return defer.promise;
		}
		return defer.promise;
	};
	
	/**
	* handling local file drops after loading them
	*/
	public handleLocalFiles() {
		// var ab = DragnDropDataService.convertedBundles[DragnDropDataService.sessionDefault].mediaFile.audioBuffer;
		var annotation;
		if (this.DragnDropDataService.convertedBundles[this.DragnDropDataService.sessionDefault].annotation !== undefined) {
			annotation = this.DragnDropDataService.convertedBundles[this.DragnDropDataService.sessionDefault].annotation;
		}
		else {
			annotation = {levels: [], links: []};
		}
		this.viewState.showDropZone = false;
		this.viewState.setState('loadingSaving');
		// reset history
		this.viewState.somethingInProgress = true;
		this.viewState.somethingInProgressTxt = 'Loading local File: ' + this.DragnDropDataService.convertedBundles[this.DragnDropDataService.sessionDefault].name;
		this.Iohandlerservice.httpGetPath('configFiles/standalone_emuwebappConfig.json').then((resp) => {
			// first element of perspectives is default perspective
			this.viewState.curPerspectiveIdx = 0;
			this.ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
			delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
			var validRes;
			validRes = this.Validationservice.validateJSO('emuwebappConfigSchema', this.ConfigProviderService.vals);
			if (validRes === true) {
				this.ConfigProviderService.curDbConfig = resp.data;
				this.viewState.somethingInProgressTxt = 'Parsing WAV file...';
				this.viewState.curViewPort.sS = 0;
				this.viewState.curViewPort.eS = this.Soundhandlerservice.audioBuffer.length;
				this.viewState.curViewPort.selectS = -1;
				this.viewState.curViewPort.selectE = -1;
				this.viewState.curClickSegments = [];
				this.viewState.curClickLevelName = undefined;
				this.viewState.curClickLevelType = undefined;
				this.loadedMetaDataService.setCurBndl(this.DragnDropDataService.convertedBundles[this.DragnDropDataService.sessionDefault]);
				this.viewState.resetSelect();
				this.viewState.curPerspectiveIdx = 0;
				this.DataService.setData(annotation);
				var lNames = [];
				var levelDefs = [];
				annotation.levels.forEach((l) => {
					if (l.type === 'SEGMENT' || l.type === 'EVENT') {
						lNames.push(l.name);
						levelDefs.push({
							'name': l.name,
							'type': l.type,
							'attributeDefinitions': {
								'name': l.name,
								'type': 'string'
							}
						});
					}
				});
				
				// set level defs
				this.ConfigProviderService.curDbConfig.levelDefinitions = levelDefs;
				this.viewState.setCurLevelAttrDefs(this.ConfigProviderService.curDbConfig.levelDefinitions);
				this.ConfigProviderService.setPerspectivesOrder(this.viewState.curPerspectiveIdx, lNames);
				//ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order = lNames;
				
				// set all ssff files
				this.viewState.somethingInProgressTxt = 'Parsing SSFF files...';
				validRes = this.Validationservice.validateJSO('annotationFileSchema', annotation);
				if (validRes === true) {
					this.DataService.setLinkData(annotation.links);
					this.viewState.setState('labeling');
					this.viewState.somethingInProgress = false;
					this.viewState.somethingInProgressTxt = 'Done!';
				} else {
					this.modalService.open('views/error.html', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(() => {
						//appStateService.resetToInitState();
						this.resetToInitState();
					});
				}
				// select first level
				if (!this.browserDetector.isBrowser.HeadlessChrome()){
					this.viewState.selectLevel(false, this.ConfigProviderService.vals.perspectives[this.viewState.curPerspectiveIdx].levelCanvases.order, this.LevelService);
				}
				
				
			}
			
		});
		this.viewState.somethingInProgress = false;
	};
	
}

angular.module('emuwebApp')
.service('DragnDropService', DragnDropService);
