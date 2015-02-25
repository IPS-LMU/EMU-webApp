'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.dbObjLoadSaveService
 * @description
 * # dbObjLoadSaveService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('dbObjLoadSaveService', function dbObjLoadSaveService($log, $q, DataService, viewState, HistoryService, loadedMetaDataService, Ssffdataservice, Iohandlerservice, Binarydatamaniphelper, Wavparserservice, Soundhandlerservice, Ssffparserservice, Validationservice, LevelService, modalService, ConfigProviderService, appStateService) {
		// shared service object
		var sServObj = {};

		/**
		 * general loadBundle method.
		 * @param bndl object containing name attribute of currently loaded bundle
		 */
		sServObj.loadBundle = function (bndl) {
			// check if bndl has to be saved
			if ((HistoryService.movesAwayFromLastSave !== 0 && ConfigProviderService.vals.main.comMode !== 'DEMO')) {
				if (bndl !== loadedMetaDataService.getCurBndl()) {
					// $scope.lastclickedutt = bndl;
					modalService.open('views/saveChanges.html', bndl.name).then(function (messModal) {
						if (messModal === 'saveChanges') {
							// save current bundle
							sServObj.saveBundle().then(function () {
								// load new bundle
								sServObj.loadBundle(bndl);
							});
						} else if (messModal === 'discardChanges') {
							// reset history
							HistoryService.resetToInitState();
							// load new bundle
							sServObj.loadBundle(bndl);
						}
					});
				}
			} else {
				if (bndl !== loadedMetaDataService.getCurBndl()) {
					// reset history
					HistoryService.resetToInitState();
					// set state
					viewState.setState('loadingSaving');

					viewState.somethingInProgress = true;
					viewState.somethingInProgressTxt = 'Loading bundle: ' + bndl.name;
					// empty ssff files
					Ssffdataservice.data = [];
					Iohandlerservice.getBundle(bndl.name, bndl.session, loadedMetaDataService.getDemoDbName()).then(function (bundleData) {
						// check if response from http request
						if (bundleData.status === 200) {
							bundleData = bundleData.data;
						}

						// validate bundle
						var validRes = Validationservice.validateJSO('bundleSchema', bundleData);

						if (validRes === true) {

							var arrBuff;

							// set wav file
							arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
							viewState.somethingInProgressTxt = 'Parsing WAV file...';

							Wavparserservice.parseWavArrBuf(arrBuff).then(function (messWavParser) {
								var wavJSO = messWavParser;
								viewState.curViewPort.sS = 0;
								viewState.curViewPort.eS = wavJSO.Data.length;
								viewState.curViewPort.selectS = -1;
								viewState.curViewPort.selectE = -1;
								viewState.curClickSegments = [];
								viewState.curClickLevelName = undefined;
								viewState.curClickLevelType = undefined;

								viewState.resetSelect();
								// FOR DEVELOPMENT:
								// viewState.curViewPort.sS = 52063;
								// viewState.curViewPort.eS = 52100;
								// viewState.curViewPort.selectS = 27575;
								// viewState.curViewPort.selectE = 34538;
								Soundhandlerservice.wavJSO = wavJSO;

								// set all ssff files
								viewState.somethingInProgressTxt = 'Parsing SSFF files...';
								Ssffparserservice.asyncParseSsffArr(bundleData.ssffFiles).then(function (ssffJso) {
									Ssffdataservice.data = ssffJso.data;
									// set annotation
									DataService.setData(bundleData.annotation);
									loadedMetaDataService.setCurBndl(bndl);
									viewState.setState('labeling');
									viewState.somethingInProgress = false;
									viewState.somethingInProgressTxt = 'Done!';
									// FOR DEVELOPMENT:
									// sServObj.saveBundle(); // for testing save function
									// $scope.menuBundleSaveBtnClick(); // for testing save button
									// $scope.showHierarchyBtnClick(); // for devel of showHierarchy modal
									// $scope.spectSettingsBtnClick(); // for testing spect settings dial
								}, function (errMess) {
									modalService.open('views/error.html', 'Error parsing SSFF file: ' + errMess.status.message).then(function () {
										appStateService.resetToInitState();
									});
								});
							}, function (errMess) {
								modalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message).then(function () {
									appStateService.resetToInitState();
								});
							});
						} else {
							modalService.open('views/error.html', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(function () {
								appStateService.resetToInitState();
							});
						}


					}, function (errMess) {
						// check for http vs websocket response
						if (errMess.data) {
							modalService.open('views/error.html', 'Error loading bundle: ' + errMess.data).then(function () {
								appStateService.resetToInitState();
							});
						} else {
							modalService.open('views/error.html', 'Error loading bundle: ' + errMess.status.message).then(function () {
								appStateService.resetToInitState();
							});
						}
					});
				}
			}
		};

		/**
		 * general purpose save bundle function.
		 * @return promise that is resolved after completion (rejected on error)
		 */
		sServObj.saveBundle = function () {
			// check if something has changed
			// if (HistoryService.movesAwayFromLastSave !== 0) {
			if (viewState.getPermission('saveBndlBtnClick')) {
				var defer = $q.defer();
				viewState.somethingInProgress = true;
				viewState.setState('loadingSaving');
				//create bundle json
				var bundleData = {};
				viewState.somethingInProgressTxt = 'Creating bundle json...';
				bundleData.ssffFiles = [];
				var formants = {};
				// ssffFiles (only FORMANTS are allowed to be manipulated so only this track is sent back to server)
				var formants = Ssffdataservice.getFile('FORMANTS');

				if (formants !== undefined) {
					Ssffparserservice.asyncJso2ssff(formants).then(function (messParser) {
						bundleData.ssffFiles.push({
							'fileExtension': formants.fileExtension,
							'encoding': 'BASE64',
							'data': Binarydatamaniphelper.arrayBufferToBase64(messParser.data)
						});
						sServObj.getAnnotationAndSaveBndl(bundleData, defer);

					}, function (errMess) {
						modalService.open('views/error.html', 'Error converting javascript object to SSFF file: ' + errMess.status.message);
						defer.reject();
					});
				} else {
					sServObj.getAnnotationAndSaveBndl(bundleData, defer);
				}

				return defer.promise;
				// }
			} else {
				$log.info('Action: menuBundleSaveBtnClick not allowed!');
			}

		};


		/**
		 *
		 */
		sServObj.getAnnotationAndSaveBndl = function (bundleData, defer) {
			// annotation
			bundleData.annotation = DataService.getData();

			var curBndl = loadedMetaDataService.getCurBndl();

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

			viewState.somethingInProgressTxt = 'Saving bundle...';
			Iohandlerservice.saveBundle(bundleData).then(function () {
				viewState.somethingInProgressTxt = 'Done!';
				viewState.somethingInProgress = false;
				HistoryService.movesAwayFromLastSave = 0;
				defer.resolve();
				viewState.setState('labeling');
			}, function (errMess) {
				// console.log(mess);
				modalService.open('views/error.html', 'Error saving bundle: ' + errMess.status.message).then(function () {
					appStateService.resetToInitState();
				});
				defer.reject();
			});
		};

		return (sServObj);
	});