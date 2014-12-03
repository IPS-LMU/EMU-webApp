'use strict';

describe('Controller: MainCtrl', function () {

  //load the controller's module
  beforeEach(module('emuwebApp'));

  var emptyObject = {};

  var MainCtrl, scope, ret, deferred, $location;
  var testSizeAll = 58809;
  var testSizeStart = 10;
  var testSizeEnd = 1337;

  var mockAppStateService = {
    resetToInitState: function () {}
  };

  //Initialize the controller and a mock scope
  beforeEach(inject(function ($controller,
    $rootScope,
    $q,
    $httpBackend,
    LevelService,
    ConfigProviderService,
    viewState,
    Soundhandlerservice,
    dialogService,
    HistoryService,
    Iohandlerservice,
    Validationservice,
    Textgridparserservice) {

    // initiate the controller and mock the scope
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      appStateService: mockAppStateService
    });

    scope.lvl = LevelService;
    scope.vs = viewState;
    scope.cps = ConfigProviderService;
    scope.shs = Soundhandlerservice;
    scope.dialog = dialogService;
    scope.io = Iohandlerservice;
    scope.valid = Validationservice;
    scope.shs.wavJSO.Data = new Array(testSizeAll);
    scope.cps.setVals(defaultEmuwebappConfig);
    scope.cps.curDbConfig = aeDbConfig;
    scope.history = HistoryService;
    scope.txtgrid = Textgridparserservice;

    deferred = $q.defer();
    deferred.resolve('called');
    $httpBackend.whenGET("schemaFiles/annotationFileSchema.json").respond(annotationFileSchema);
    $httpBackend.whenGET("schemaFiles/emuwebappConfigSchema.json").respond(emuwebappConfigSchema);
    $httpBackend.whenGET("schemaFiles/DBconfigFileSchema.json").respond(DBconfigFileSchema);
    $httpBackend.whenGET("schemaFiles/bundleListSchema.json").respond(bundleListSchema);
    $httpBackend.whenGET("demoDBs/ae/ae_bundleList.json").respond(ae_bundleList);
    $httpBackend.whenGET("demoDBs/ae/msajc003_bndl.json").respond(msajc003_bndl);
    $httpBackend.whenGET("views/error.html").respond('');
    $httpBackend.whenGET("views/connectModal.html").respond('');
    $httpBackend.whenGET("views/export.html").respond('');
  }));

  it('should react to $broadcast connectionDisrupted', inject(function ($rootScope) {
    spyOn(mockAppStateService, 'resetToInitState');
    $rootScope.$broadcast('connectionDisrupted');
    expect(mockAppStateService.resetToInitState).toHaveBeenCalled();
  }));


  it('should have all variables defined', function () {
    expect(scope.connectBtnLabel).toBe('connect');
    expect(scope.tmp).toEqual(emptyObject);
    expect(scope.dbLoaded).toBe(false);
    expect(scope.is2dCancasesHidden).toBe(true);
    expect(scope.windowWidth).toBeDefined;
  });

  it('all services should exist', inject(function (viewState,
    ConfigProviderService,
    HistoryService,
    fontScaleService,
    LevelService,
    dialogService,
    Ssffdataservice,
    Soundhandlerservice,
    Drawhelperservice,
    Wavparserservice,
    Iohandlerservice,
    Appcachehandler) {
    expect(viewState).toBeDefined();
    expect(ConfigProviderService).toBeDefined();
    expect(HistoryService).toBeDefined();
    expect(fontScaleService).toBeDefined();
    expect(LevelService).toBeDefined();
    expect(dialogService).toBeDefined();
    expect(Ssffdataservice).toBeDefined();
    expect(Soundhandlerservice).toBeDefined();
    expect(Drawhelperservice).toBeDefined();
    expect(Wavparserservice).toBeDefined();
    expect(Iohandlerservice).toBeDefined();
    expect(Appcachehandler).toBeDefined();

  }));

  it('should have a working uninitialized viewState service', function () {
    expect(scope.vs.curViewPort.sS).toBe(0);
    expect(scope.vs.curViewPort.eS).toBe(0);
    expect(scope.vs.curViewPort.selectS).toBe(-1);
    expect(scope.vs.curViewPort.selectE).toBe(-1);
  });

  it('should set cursorInTextField', function () {
    spyOn(scope.vs, 'setcursorInTextField');
    scope.cursorInTextField();
    expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(true);
  });

  it('should set cursorInTextField', function () {
    spyOn(scope.vs, 'setcursorInTextField');
    scope.cursorOutOfTextField();
    expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(false);
  });

  it('should openSubmenu', function () {
    spyOn(scope.vs, 'togglesubmenuOpen');
    scope.openSubmenu();
    expect(scope.vs.togglesubmenuOpen).toHaveBeenCalledWith(scope.cps.vals.colors.transitionTime);
  });

  it('should clear', function () {
    spyOn(scope.dialog, 'open').and.returnValue(deferred.promise);
    scope.clearBtnClick();
    expect(scope.dialog.open).toHaveBeenCalledWith('views/confirmModal.html', 'ConfirmmodalCtrl', 'Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.');
  });

  it('should showHierarchy', function () {
    spyOn(scope.dialog, 'open');
    scope.showHierarchyBtnClick();
    expect(scope.dialog.open).toHaveBeenCalledWith('views/showHierarchyModal.html', 'ShowhierarchyCtrl');
  });

  it('should showAbout', function () {
    spyOn(scope.dialog, 'open');
    scope.aboutBtnClick();
    expect(scope.dialog.open).toHaveBeenCalledWith('views/about.html', 'ModalCtrl');
  });

  it('should openDemoDB ae', inject(function ($q) {
    /*var ioDeferredDBConfig = $q.defer();
    ioDeferredDBConfig.resolve({
      data: {
        EMUwebAppConfig: {}
      }
    });
    var ioDeferredBundleList = $q.defer();
    ioDeferredBundleList.resolve({
      data: ae_bundleList
    });
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.vs, 'setState');
    spyOn(scope, 'menuBundleClick');
    spyOn(scope.io, 'getDBconfigFile').and.returnValue(ioDeferredDBConfig.promise);
    spyOn(scope.io, 'getBundleList').and.returnValue(ioDeferredBundleList.promise);
    spyOn(scope.valid, 'validateJSO').and.returnValue(true);
    scope.openDemoDBbtnClick('ae');
    expect(scope.vs.setState).toHaveBeenCalledWith('loadingSaving');
    expect(scope.vs.getPermission).toHaveBeenCalledWith('openDemoBtnDBclick');
    expect(scope.demoDbName).toEqual('ae');
    expect(scope.cps.vals.main.comMode).toEqual('DEMO');
    expect(scope.vs.somethingInProgressTxt).toEqual('Loading DB config...');
    expect(scope.io.getDBconfigFile).toHaveBeenCalledWith('ae');
    ioDeferredDBConfig.resolve();
    scope.$digest();
    expect(scope.valid.validateJSO).toHaveBeenCalled();
    expect(scope.io.getBundleList).toHaveBeenCalledWith('ae');
    ioDeferredBundleList.resolve();
    scope.$digest();
    expect(scope.menuBundleClick).toHaveBeenCalled();*/
  }));


  it('should not openDemoDB ae (no permission)', inject(function ($q) {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.openDemoDBbtnClick('ae');
    expect(scope.vs.getPermission).toHaveBeenCalledWith('openDemoBtnDBclick');
  }));

  it('should not connect (error)', inject(function ($q) {
    var conDeferred = $q.defer();
    conDeferred.resolve('http://test:1234');
    var ioDeferred = $q.defer();
    ioDeferred.resolve({
      type: 'error'
    });
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.dialog, 'open').and.returnValue(conDeferred.promise);
    spyOn(scope.io.wsH, 'initConnect').and.returnValue(ioDeferred.promise);
    scope.connectBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('connectBtnClick');
    expect(scope.dialog.open).toHaveBeenCalledWith('views/connectModal.html', 'WsconnectionCtrl');
    conDeferred.resolve();
    scope.$digest();
    expect(scope.io.wsH.initConnect).toHaveBeenCalledWith('http://test:1234');
  }));

  it('should not connect (not allowed)', inject(function ($q) {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.connectBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('connectBtnClick');
  }));

  it('should connect', inject(function ($q) {
    var conDeferred = $q.defer();
    conDeferred.resolve('http://test:1234');
    var ioDeferred = $q.defer();
    ioDeferred.resolve({
      type: 'ok'
    });
    spyOn(scope, 'handleConnectedToWSserver');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.dialog, 'open').and.returnValue(conDeferred.promise);
    spyOn(scope.io.wsH, 'initConnect').and.returnValue(ioDeferred.promise);
    scope.connectBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('connectBtnClick');
    expect(scope.dialog.open).toHaveBeenCalledWith('views/connectModal.html', 'WsconnectionCtrl');
    conDeferred.resolve();
    scope.$digest();
    expect(scope.handleConnectedToWSserver).toHaveBeenCalled();
    expect(scope.io.wsH.initConnect).toHaveBeenCalledWith('http://test:1234');
  }));

  it('should open spectro Settings', function () {
    spyOn(scope.dialog, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    scope.spectSettingsBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('spectSettingsChange');
    expect(scope.dialog.open).toHaveBeenCalledWith('views/spectSettings.html', 'spectSettingsCtrl', '');
  });

  it('should not open spectro Settings (not allowed)', function () {
    spyOn(scope.dialog, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.spectSettingsBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('spectSettingsChange');
    expect(scope.dialog.open).not.toHaveBeenCalledWith();
  });

  it('should open download Textgrid', inject(function ($q) {
    /*scope.curBndl.name = 'test';
    var txtgridDeferred = $q.defer();
    txtgridDeferred.resolve({
      data: 'test123'
    });
    spyOn(scope.txtgrid, 'asyncToTextGrid').and.returnValue(txtgridDeferred.promise);
    spyOn(scope.dialog, 'openExport');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    scope.downloadTextGridBtnClick();
    txtgridDeferred.resolve();
    scope.$digest();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('downloadTextGridBtnClick');
    expect(scope.dialog.openExport).toHaveBeenCalledWith('views/export.html', 'ExportCtrl', 'test123', 'test.TextGrid');*/
  }));

  it('should not open download Textgrid (not allowed)', function () {
    spyOn(scope.dialog, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.downloadTextGridBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('downloadTextGridBtnClick');
    expect(scope.dialog.open).not.toHaveBeenCalledWith();
  });


  it('should open rename selected Level', function () {
    spyOn(scope.dialog, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.vs, 'getcurClickLevelName').and.returnValue('ae');
    scope.renameSelLevelBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(scope.dialog.open).toHaveBeenCalledWith('views/renameLevel.html', 'ModalCtrl', 'ae');
  });

  it('should open rename selected Level error', function () {
    spyOn(scope.dialog, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.vs, 'getcurClickLevelName').and.returnValue(undefined);
    scope.renameSelLevelBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(scope.dialog.open).toHaveBeenCalledWith('views/error.html', 'ModalCtrl', 'Rename Error : Please choose a Level first !');
  });

  it('should not open rename selected Level (not allowed)', function () {
    spyOn(scope.dialog, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.renameSelLevelBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(scope.dialog.open).not.toHaveBeenCalledWith();
  });

  it('should getPerspectiveColor', function () {
    expect(scope.getPerspectiveColor()).toEqual('emuwebapp-curSelPerspLi');
    // set curPerspectiveIdx
    scope.vs.curPerspectiveIdx = 0;
    expect(scope.getPerspectiveColor({
      name: 'test'
    })).toEqual('emuwebapp-perspLi');
    // reset curPerspectiveIdx
    scope.vs.curPerspectiveIdx = -1;
  });

  it('should changePerspective', function () {
    spyOn(scope.vs, 'setRightsubmenuOpen').and.callThrough();
    scope.changePerspective({
      name: 'default'
    });
    expect(scope.vs.curPerspectiveIdx).toEqual(0);
    expect(scope.vs.setRightsubmenuOpen).toHaveBeenCalled();
  });

  it('should cmdPlayAll', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.vs, 'animatePlayHead');
    spyOn(scope.shs, 'playFromTo');
    scope.cmdPlayAll();
    expect(scope.shs.playFromTo).toHaveBeenCalledWith(0, testSizeAll);
    expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(0, testSizeAll);
    expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should not cmdPlayAll (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdPlayAll();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should cmdPlaySel', function () {
    scope.vs.select(testSizeStart, testSizeEnd);
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.vs, 'animatePlayHead');
    spyOn(scope.shs, 'playFromTo');
    scope.cmdPlaySel();
    expect(scope.shs.playFromTo).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should not cmdPlaySel (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdPlaySel();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should cmdPlayView', function () {
    scope.vs.setViewPort(testSizeStart, testSizeEnd);
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.vs, 'animatePlayHead');
    spyOn(scope.shs, 'playFromTo');
    scope.cmdPlayView();
    expect(scope.shs.playFromTo).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should not cmdPlayView (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdPlayView();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should cmdZoomSel', function () {
    scope.vs.select(testSizeStart, testSizeEnd);
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.lvl, 'deleteEditArea');
    spyOn(scope.vs, 'setViewPort');
    scope.cmdZoomSel();
    expect(scope.vs.setViewPort).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomSel (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdZoomSel();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomRight', function () {
    scope.vs.select(testSizeStart, testSizeEnd);
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.lvl, 'deleteEditArea');
    spyOn(scope.vs, 'shiftViewPort');
    scope.cmdZoomRight();
    expect(scope.vs.shiftViewPort).toHaveBeenCalledWith(true);
    expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomRight (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdZoomRight();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomLeft', function () {
    scope.vs.select(testSizeStart, testSizeEnd);
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.lvl, 'deleteEditArea');
    spyOn(scope.vs, 'shiftViewPort');
    scope.cmdZoomLeft();
    expect(scope.vs.shiftViewPort).toHaveBeenCalledWith(false);
    expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomLeft (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdZoomLeft();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomOut', function () {
    scope.vs.select(testSizeStart, testSizeEnd);
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.lvl, 'deleteEditArea');
    spyOn(scope.vs, 'zoomViewPort');
    scope.cmdZoomOut();
    expect(scope.vs.zoomViewPort).toHaveBeenCalledWith(false);
    expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomOut (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdZoomOut();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomIn', function () {
    scope.vs.select(testSizeStart, testSizeEnd);
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.lvl, 'deleteEditArea');
    spyOn(scope.vs, 'zoomViewPort');
    scope.cmdZoomIn();
    expect(scope.vs.zoomViewPort).toHaveBeenCalledWith(true);
    expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomIn (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdZoomIn();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomAll', function () {
    scope.vs.select(testSizeStart, testSizeEnd);
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.lvl, 'deleteEditArea');
    spyOn(scope.vs, 'setViewPort');
    scope.cmdZoomAll();
    expect(scope.vs.setViewPort).toHaveBeenCalledWith(0, testSizeAll);
    expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomAll (disallowed)', function () {
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdZoomAll();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });
});