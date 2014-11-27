'use strict';

angular.module('emuwebApp')
    .controller('FileCtrl', function ($scope, viewState, appStateService, Binarydatamaniphelper, 
                                      ConfigProviderService, Validationservice, Iohandlerservice, loadedMetaDataService, 
                                      Wavparserservice, Soundhandlerservice, DataService, dialogService) {

        $scope.$on('handle', function (event, bundles, sessionDefault) {
            $scope.handleLocalFiles(bundles, sessionDefault);
        });

        $scope.handleLocalFiles = function (bundles, sessionDefault) {
            var validRes;
            var wav = bundles[sessionDefault].mediaFile.data;
            var ab = Binarydatamaniphelper.base64ToArrayBuffer(wav);
            var annotation = bundles[sessionDefault].annotation;
            viewState.showDropZone = false;
            viewState.setState('loadingSaving');
            // reset history
            viewState.somethingInProgress = true;
            viewState.somethingInProgressTxt = 'Loading local File: ' + wav.name;
            Iohandlerservice.httpGetPath('configFiles/standalone_emuwebappConfig.json').then(function (resp) {
                // first element of perspectives is default perspective
                viewState.curPerspectiveIdx = 0;
                ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
                delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
                validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals);
                if (validRes === true) {
                    ConfigProviderService.curDbConfig = resp.data;
                    viewState.somethingInProgressTxt = 'Parsing WAV file...';
					Wavparserservice.parseWavArrBuf(ab).then(function (messWavParser) {
						var wavJSO = messWavParser;
						viewState.curViewPort.sS = 0;
						viewState.curViewPort.eS = wavJSO.Data.length;
						viewState.curViewPort.selectS = -1;
						viewState.curViewPort.selectE = -1;
						viewState.curClickSegments = [];
						viewState.curClickLevelName = undefined;
						viewState.curClickLevelType = undefined;
						loadedMetaDataService.setCurBndl(bundles[sessionDefault]);
						viewState.resetSelect();
						viewState.curPerspectiveIdx = 0;
						var annot = annotation;
						DataService.setData(annotation);
						var lNames = [];
						var levelDefs = [];
						annotation.levels.forEach(function (l) {
							lNames.push(l.name);
							levelDefs.push({
								'name': l.name,
								'type': l.type,
								'attributeDefinitions': {
									'name': l.name,
									'type': 'string'
								}
							});
						});
						// set level defs
						ConfigProviderService.curDbConfig.levelDefinitions = levelDefs;
						viewState.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);
						ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order = lNames;							
						Soundhandlerservice.wavJSO = wavJSO;

						// set all ssff files
						viewState.somethingInProgressTxt = 'Parsing SSFF files...';
						var validRes = Validationservice.validateJSO('annotationFileSchema', annotation);
						if (validRes === true) {
							DataService.setData(annotation);
							viewState.setState('labeling');
							viewState.somethingInProgress = false;
							viewState.somethingInProgressTxt = 'Done!';
						} else {
							dialogService.open('views/error.html', 'ModalCtrl', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(function () {
								appStateService.resetToInitState();
							});
						}
				}, function (errMess) {
						dialogService.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess).then(function () {
							appStateService.resetToInitState();
						});
					});

                }

            });
            viewState.somethingInProgress = false;
        };

    });