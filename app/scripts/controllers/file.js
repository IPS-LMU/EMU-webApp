'use strict';

angular.module('emuwebApp')
    .controller('FileCtrl', function ($scope, Binarydatamaniphelper, Textgridparserservice, ConfigProviderService, Validationservice) {

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
        };

        $scope.$on('resetToInitState', function () {
            $scope.resetToInitState();

        });

        $scope.handleLocalFiles = function () {
            $scope.$parent.vs.showDropZone = false;
            $scope.$parent.cps.vals.main.comMode = 'FileAPI';
            $scope.$parent.vs.setState('loadingSaving');
            // reset history
            $scope.$parent.hists.resetToInitState();
            $scope.$parent.vs.somethingInProgress = true;
            $scope.$parent.vs.somethingInProgressTxt = 'Loading local File: ' + $scope.wav.name;
            // empty ssff files
            $scope.$parent.ssffds.data = [];
            $scope.$parent.levServ.data = {};
            //arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
            $scope.$parent.vs.somethingInProgressTxt = 'Parsing WAV file...';
            var reader = new FileReader();
            reader.readAsArrayBuffer($scope.wav);
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    $scope.$parent.io.httpGetPath('configFiles/standalone_emuwebappConfig.json').then(function (resp) {
                        // first element of perspectives is default perspective
                        $scope.$parent.vs.curPerspectiveIdx = 0;
                        $scope.$parent.cps.setVals(resp.data.EMUwebAppConfig);
                        delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
                        var validRes = Validationservice.validateJSO('emuwebappConfigSchema', ConfigProviderService.vals)
                        if (validRes === true) {
                            $scope.$parent.cps.curDbConfig = resp.data;
                            $scope.curBndl = {};
                            $scope.curBndl.name = $scope.wav.name.substr(0, $scope.wav.name.lastIndexOf('.'));
                            $scope.$parent.bundleList.push($scope.curBndl);
                            $scope.$parent.curBndl = $scope.curBndl;
                            // then get the DBconfigFile
                            var res;
                            if ($scope.firefox) {
                                res = evt.target.result;
                            } else {
                                res = evt.currentTarget.result;
                            }
                            $scope.$parent.wps.parseWavArrBuf(res).then(function (wavJSO) {
                                $scope.$parent.vs.curViewPort.sS = 0;
                                $scope.$parent.vs.curViewPort.eS = wavJSO.Data.length;
                                $scope.$parent.vs.resetSelect();
                                $scope.$parent.vs.curPerspectiveIdx = 0;
                                $scope.$parent.shs.wavJSO = wavJSO;
                                // parsing of Textgrid Data
                                if (!$.isEmptyObject($scope.grid)) {
                                    var reader = new FileReader();
                                    reader.readAsText($scope.grid);
                                    reader.onloadend = function (evt) {
                                        if (evt.target.readyState == FileReader.DONE) {
                                            var extension = $scope.wav.name.substr(0, $scope.wav.name.lastIndexOf('.'));
                                            Textgridparserservice.asyncParseTextGrid(evt.currentTarget.result, $scope.wav.name, extension).then(function (parseMess) {
                                                var annot = parseMess.data;
                                                $scope.$parent.levServ.setData(annot);
                                                // console.log(JSON.stringify(l, undefined, 2));
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
                                                $scope.$parent.cps.curDbConfig.levelDefinitions = levelDefs;
                                                $scope.$parent.vs.setCurLevelAttrDefs(ConfigProviderService.curDbConfig.levelDefinitions);

                                                $scope.$parent.cps.vals.perspectives[$scope.$parent.vs.curPerspectiveIdx].levelCanvases.order = lNames;
                                                $scope.$parent.vs.somethingInProgressTxt = 'Done!';
                                                $scope.$parent.vs.somethingInProgress = false;
                                                $scope.$parent.vs.setState('labeling');
                                            });
                                        }
                                    },
                                    function (errMess) {
                                        $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error parsing textgrid file: ' + errMess.status.message);
                                    };
                                } else {
                                    $scope.$parent.vs.setState('labeling');
                                    $scope.$parent.vs.somethingInProgress = false;
                                    $scope.$parent.vs.somethingInProgressTxt = 'Done!';	    
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

        $scope.traverseFileTreeChrome = function (item, path) {
            path = path || '';
            if (item.isFile) {
                item.file(function (file) {
                    var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
                    if (extension === 'WAV') {
                        $scope.wav = file;
                        $scope.handleLocalFiles();
                    } else if (extension === 'TEXTGRID') {
                        $scope.grid = file;
                    } else {
                        $scope.other = file;
                        $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error: Unknown File Type for File ' + $scope.other.name).then(function (res) {
                            $scope.resetToInitState();
                            $scope.$parent.resetToInitState();
                        });
                    }
                });
            } else if (item.isDirectory) {
                var dirReader = item.createReader();
                dirReader.readEntries(function (entries) {
                    for (var i = 0; i < entries.length; i++) {
                        $scope.traverseFileTreeChrome(entries[i], path + item.name + '/');
                    }
                });
            }
        };


        $scope.traverseFileTreeFirefox = function (item, path) {
            path = path || '';
            if (item.size > 0) {
                var extension = item.name.substr(item.name.lastIndexOf('.') + 1).toUpperCase();
                if (extension === 'WAV') {
                    $scope.wav = item;
                    $scope.handleLocalFiles();
                } else if (extension === 'TEXTGRID') {
                    $scope.grid = item;
                } else {
                    $scope.other = item;
                    $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error: Unknown File Type for File ' + $scope.other.name).then(function (res) {
                        $scope.resetToInitState();
                        $scope.$parent.resetToInitState();
                    });
                }
            } else if (item.isDirectory) {
                var dirReader = item.createReader();
                dirReader.readEntries(function (entries) {
                    for (var i = 0; i < entries.length; i++) {
                        $scope.traverseFileTreeFirefox(entries[i], path + item.name + '/');
                    }
                });
            }
        };

    });