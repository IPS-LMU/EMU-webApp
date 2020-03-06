import * as angular from 'angular';

/**
* @ngdoc service
* @name emuwebApp.dbObjLoadSaveService
* @description
* # dbObjLoadSaveService
* Service in the emuwebApp.
*/
class DbObjLoadSaveService{
	
	private $log;
	private $q;
	private $http;
	private DataService;
	private viewState;
	private HistoryService;
	private loadedMetaDataService;
	private Ssffdataservice;
	private Iohandlerservice;
	private Binarydatamaniphelper;
	private Wavparserservice;
	private Soundhandlerservice;
	private Ssffparserservice;
	private Validationservice;
	private LevelService;
	private modalService;
	private ConfigProviderService;
	private appStateService;
	private StandardFuncsService;
	
	constructor($log, $q, $http, DataService, viewState, HistoryService, loadedMetaDataService, Ssffdataservice, Iohandlerservice, Binarydatamaniphelper, Wavparserservice, Soundhandlerservice, Ssffparserservice, Validationservice, LevelService, modalService, ConfigProviderService, appStateService, StandardFuncsService){
		this.$log = $log;
		this.$q = $q;
		this.$http = $http;
		this.DataService = DataService;
		this.viewState = viewState;
		this.HistoryService = HistoryService;
		this.loadedMetaDataService = loadedMetaDataService;
		this.Ssffdataservice = Ssffdataservice;
		this.Iohandlerservice = Iohandlerservice;
		this.Binarydatamaniphelper = Binarydatamaniphelper;
		this.Wavparserservice = Wavparserservice;
		this.Soundhandlerservice = Soundhandlerservice;
		this.Ssffparserservice = Ssffparserservice;
		this.Validationservice = Validationservice;
		this.LevelService = LevelService;
		this.modalService = modalService;
		this.ConfigProviderService = ConfigProviderService;
		this.appStateService = appStateService;
		this.StandardFuncsService = StandardFuncsService;
		
	}
	
	private innerLoadBundle(bndl, bundleData, arrBuff, defer) {
		this.viewState.somethingInProgressTxt = 'Parsing WAV file...';
		
		this.Wavparserservice.parseWavAudioBuf(arrBuff).then((messWavParser) => {
			var audioBuffer = messWavParser;
			this.viewState.curViewPort.sS = 0;
			this.viewState.curViewPort.eS = audioBuffer.length;
			if(bndl.timeAnchors !== undefined && bndl.timeAnchors.length > 0){
				this.viewState.curViewPort.selectS = bndl.timeAnchors[0].sample_start;
				this.viewState.curViewPort.selectE = bndl.timeAnchors[0].sample_end;
			}else {
				this.viewState.resetSelect();
			}
			this.viewState.curTimeAnchorIdx = -1;
			this.viewState.curClickSegments = [];
			this.viewState.curClickLevelName = undefined;
			this.viewState.curClickLevelType = undefined;
			
			this.Soundhandlerservice.audioBuffer = audioBuffer;
			// fetch ssff files (if encoding == GETURL)
			var promises = [];
			bundleData.ssffFiles.forEach(function(file) {
				if(file.encoding === 'GETURL'){ // BASE64 & ARRAYBUFFER are handled by worker
					file.data = this.Iohandlerservice.httpGetPath(file.data, 'arraybuffer');
					promises.push(file.data);
					file.encoding = 'ARRAYBUFFER';
				}
			})
			var dummyProm = false;
			if(promises.length === 0){
				// add resovled promise
				var d = this.$q.defer();
				dummyProm = true;
				promises.push(d.promise);
				d.resolve();
			}
			
			this.$q.all(promises).then((res) => {
				for(var i = 0; i < res.length; i++){
					if(!dummyProm){
						bundleData.ssffFiles[i].data = res[i];
					}
				}
				// set all ssff files
				this.viewState.somethingInProgressTxt = 'Parsing SSFF files...';
				this.Ssffparserservice.asyncParseSsffArr(bundleData.ssffFiles).then((ssffJso) => {
					this.Ssffdataservice.data = ssffJso.data;
					// set annotation
					this.DataService.setData(bundleData.annotation);
					this.loadedMetaDataService.setCurBndl(bndl);
					// select first level
					this.viewState.selectLevel(false, this.ConfigProviderService.vals.perspectives[this.viewState.curPerspectiveIdx].levelCanvases.order, this.LevelService);
					this.viewState.setState('labeling');
					
					this.viewState.somethingInProgress = false;
					this.viewState.somethingInProgressTxt = 'Done!';
					defer.resolve();
				}, function (errMess) {
					this.modalService.open('views/error.html', 'Error parsing SSFF file: ' + errMess.status.message).then(() => {
						this.appStateService.resetToInitState();
					});
				});
			});
		}, function (errMess) {
			this.modalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message).then(() => {
				this.appStateService.resetToInitState();
			});
		});
	}

	///////////////////
	// public api

	/**
	* general loadBundle method.
	* @param bndl object containing name attribute of currently loaded bundle
	* @param url if set the bundle is loaded from the given url
	*/
	public loadBundle(bndl, url) {
		var defer = this.$q.defer();
		// check if bndl has to be saved
		this.viewState.setcurClickItem(null);
		if ((this.HistoryService.movesAwayFromLastSave !== 0 && this.ConfigProviderService.vals.main.comMode !== 'DEMO' && this.ConfigProviderService.vals.activeButtons.saveBundle)) {
			var curBndl = this.loadedMetaDataService.getCurBndl();
			if (bndl !== curBndl) {
				// $scope.lastclickedutt = bndl;
				this.modalService.open('views/saveChanges.html', curBndl.session + ':' + curBndl.name).then((messModal) => {
					if (messModal === 'saveChanges') {
						// save current bundle
						this.saveBundle().then(() => {
							// load new bundle
							this.loadBundle(bndl, "");
						});
					} else if (messModal === 'discardChanges') {
						// reset history
						this.HistoryService.resetToInitState();
						// load new bundle
						this.loadBundle(bndl, "");
					}
				});
			}
		} else {
			if (bndl !== this.loadedMetaDataService.getCurBndl()) {
				// reset history
				this.HistoryService.resetToInitState();
				// reset hierarchy
				this.viewState.hierarchyState.reset();
				// set state
				this.LevelService.deleteEditArea();
				this.viewState.setEditing(false);
				this.viewState.setState('loadingSaving');
				
				this.viewState.somethingInProgress = true;
				this.viewState.somethingInProgressTxt = 'Loading bundle: ' + bndl.name;
				// empty ssff files
				this.Ssffdataservice.data = [];
				if(!url){
					var promise = this.Iohandlerservice.getBundle(bndl.name, bndl.session, this.loadedMetaDataService.getDemoDbName());
				}else{
					var promise = this.$http.get(url);
				}
				promise.then((bundleData) => {
					// check if response from http request
					if (bundleData.status === 200) {
						bundleData = bundleData.data;
					}
					
					// validate bundle
					var validRes = this.Validationservice.validateJSO('bundleSchema', bundleData);
					
					if (validRes === true) {
						
						var arrBuff;
						// set wav file
						if(bundleData.mediaFile.encoding === 'BASE64'){
							arrBuff = this.Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
							this.innerLoadBundle(bndl, bundleData, arrBuff, defer);
						}else if(bundleData.mediaFile.encoding === 'GETURL'){
							this.Iohandlerservice.httpGetPath(bundleData.mediaFile.data, 'arraybuffer').then((res) => {
								if(res.status === 200){
									res = res.data;
								}
								this.innerLoadBundle(bndl, bundleData, res, defer);
							});
						}
					} else {
						this.modalService.open('views/error.html', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(() => {
							this.appStateService.resetToInitState();
						});
					}
					
					
				}, function (errMess) {
					// check for http vs websocket response
					if (errMess.data) {
						this.modalService.open('views/error.html', 'Error loading bundle: ' + errMess.data).then(() => {
							this.appStateService.resetToInitState();
						});
					} else {
						this.modalService.open('views/error.html', 'Error loading bundle: ' + errMess.status.message).then(() => {
							this.appStateService.resetToInitState();
						});
					}
				});
			}
		}
		return defer.promise; 
	};
	
	
	/**
	* general purpose save bundle function.
	* @return promise that is resolved after completion (rejected on error)
	*/
	public saveBundle() {
		// check if something has changed
		// if (HistoryService.movesAwayFromLastSave !== 0) {
		if (this.viewState.getPermission('saveBndlBtnClick')) {
			var defer = this.$q.defer();
			this.viewState.somethingInProgress = true;
			this.viewState.setState('loadingSaving');
			//create bundle json
			var bundleData = {} as any;
			this.viewState.somethingInProgressTxt = 'Creating bundle json...';
			bundleData.ssffFiles = [];
			// ssffFiles (only FORMANTS are allowed to be manipulated so only this track is sent back to server)
			var formants = this.Ssffdataservice.getFile('FORMANTS');
			if (formants !== undefined) {
				this.Ssffparserservice.asyncJso2ssff(formants).then((messParser) => {
					bundleData.ssffFiles.push({
						'fileExtension': formants.fileExtension,
						'encoding': 'BASE64',
						'data': this.Binarydatamaniphelper.arrayBufferToBase64(messParser.data)
					});
					this.getAnnotationAndSaveBndl(bundleData, defer);
					
				}, function (errMess) {
					this.modalService.open('views/error.html', 'Error converting javascript object to SSFF file: ' + errMess.status.message);
					defer.reject();
				});
			} else {
				this.getAnnotationAndSaveBndl(bundleData, defer);
			}
			
			return defer.promise;
			// }
		} else {
			this.$log.info('Action: menuBundleSaveBtnClick not allowed!');
		}
		
	};
	
	
	/**
	*
	*/
	public getAnnotationAndSaveBndl(bundleData, defer) {
		
		// Validate annotation before saving
		this.viewState.somethingInProgressTxt = 'Validating annotJSON ...';
		
		var validRes = this.Validationservice.validateJSO('annotationFileSchema', this.DataService.getData());
		if (validRes !== true) {
			this.$log.warn('PROBLEM: trying to save bundle but bundle is invalid. traverseAndClean() will be called.');
			this.$log.error (validRes);
		}
		
		// clean annot data just to be safe...
		this.StandardFuncsService.traverseAndClean(this.DataService.getData());
		
		////////////////////////////
		// construct bundle
		
		// annotation
		bundleData.annotation = this.DataService.getData();
		
		// empty media file (depricated since schema was updated)
		bundleData.mediaFile = {'encoding': 'BASE64', 'data': ''};
		
		var curBndl = this.loadedMetaDataService.getCurBndl();
		
		// add session if available
		if (typeof curBndl.session !== 'undefined') {
			bundleData.session = curBndl.session;
		}
		// add finishedEditing if available
		if (typeof curBndl.finishedEditing !== 'undefined') {
			bundleData.finishedEditing = curBndl.finishedEditing;
		}
		// add comment if available
		if (typeof curBndl.comment !== 'undefined') {
			bundleData.comment = curBndl.comment;
		}
		
		// validate bundle
		this.viewState.somethingInProgressTxt = 'Validating bundle ...';
		validRes = this.Validationservice.validateJSO('bundleSchema', bundleData);
		
		if (validRes !== true) {
			this.$log.error('GRAVE PROBLEM: trying to save bundle but bundle is invalid. traverseAndClean() HAS ALREADY BEEN CALLED.');
			this.$log.error(validRes);
			
			this.modalService.open('views/error.html', 'Somehow the data for this bundle has been corrupted. This is most likely a nasty and diffucult to spot bug. If you are at the IPS right now, please contact an EMU developer immediately. The Validation error is: ' + JSON.stringify(validRes, null, 4)).then(() => {
				this.viewState.somethingInProgressTxt = '';
				this.viewState.somethingInProgress = false;
				this.viewState.setState('labeling');
				defer.reject();
			});
		} else {
			this.viewState.somethingInProgressTxt = 'Saving bundle...';
			this.Iohandlerservice.saveBundle(bundleData).then(() => {
				this.viewState.somethingInProgressTxt = 'Done!';
				this.viewState.somethingInProgress = false;
				this.HistoryService.movesAwayFromLastSave = 0;
				defer.resolve();
				this.viewState.setState('labeling');
			}, function (errMess) {
				this.modalService.open('views/error.html', 'Error saving bundle: ' + errMess.status.message).then(() => {
					this.appStateService.resetToInitState();
				});
				defer.reject();
			});
		}
	};
	
}

angular.module('emuwebApp')
.service('dbObjLoadSaveService', DbObjLoadSaveService);
