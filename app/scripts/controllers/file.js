'use strict';

angular.module('emuwebApp')
    .controller('FileCtrl', function ($scope, viewState, browserDetector, appStateService, 
           Binarydatamaniphelper, Textgridparserservice, ConfigProviderService, Validationservice,
           Iohandlerservice, Wavparserservice, Soundhandlerservice, DataService) {

        $scope.newfiles = [];
        $scope.wav = {};
        $scope.grid = {};
        $scope.curBndl = {};

        $scope.resetToInitState = function () {
            $scope.newfiles = [];
            $scope.wav = {};
            $scope.grid = {};
            $scope.curBndl = {};
            $scope.dropText = $scope.dropDefault;
            appStateService.resetToInitState();
        };

        $scope.handleLocalFiles = function () {
            var validRes;
            viewState.showDropZone = false;
            ConfigProviderService.vals.main.comMode = 'FileAPI';
            viewState.setState('loadingSaving');
            // reset history
            viewState.somethingInProgress = true;
            viewState.somethingInProgressTxt = 'Loading local File: ' + $scope.wav.name;
            var reader = new FileReader();
            console.log($scope.wav);
            reader.readAsArrayBuffer($scope.wav);
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    Iohandlerservice.httpGetPath('configFiles/standalone_emuwebappConfig.json').then(function (resp) {
                        // first element of perspectives is default perspective
                        viewState.curPerspectiveIdx = 0;
                        ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
                        delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
                        validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals)
                        if (validRes === true) {
                            ConfigProviderService.curDbConfig = resp.data;
                            if (browserDetector.isBrowser.Firefox()) {
                                validRes = evt.target.result;
                            } else {
                                validRes = evt.currentTarget.result;
                            }
                            viewState.somethingInProgressTxt = 'Parsing WAV file...';
                            Wavparserservice.parseWavArrBuf(validRes).then(function (wavJSO) {
                                viewState.curViewPort.sS = 0;
                                viewState.curViewPort.eS = wavJSO.Data.length;
                                viewState.resetSelect();
                                viewState.curPerspectiveIdx = 0;
                                Soundhandlerservice.wavJSO = wavJSO;
                                // parsing of Textgrid Data
                                if (!$.isEmptyObject($scope.grid)) {
                                    var reader = new FileReader();
                                    reader.readAsText($scope.grid);
                                    reader.onloadend = function (evt) {
                                        if (evt.target.readyState == FileReader.DONE) {
                                            var extension = $scope.wav.name.substr(0, $scope.wav.name.lastIndexOf('.'));
                                            Textgridparserservice.asyncParseTextGrid(evt.currentTarget.result, $scope.wav.name, extension).then(function (parseMess) {
                                                var annot = parseMess.data;
                                                DataService.setData(annot);
                                                var lNames = [];
                                                var levelDefs = [];
                                                annot.levels.forEach(function (l) {
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
                                                viewState.somethingInProgressTxt = 'Done!';
                                                viewState.somethingInProgress = false;
                                                viewState.setState('labeling');
                                            });
                                        }
                                    },
                                    function (errMess) {
                                        $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error parsing textgrid file: ' + errMess.status.message);
                                    };
                                } else {
                                    viewState.setState('labeling');
                                    viewState.somethingInProgress = false;
                                    viewState.somethingInProgressTxt = 'Done!';	    
                                }

                            });

                        } else {
                            $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error validating ConfigProviderService.vals (emuwebappConfig data) : ' + JSON.stringify(validRes, null, 4));
                        }
                    }, function (errMess) {
                        $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
                    });

                }

            };
        };

    });