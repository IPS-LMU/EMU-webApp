'use strict';

describe('Controller: MainController', function () {

  //load the controller's module
  beforeEach(module('emuwebApp'));

  var emptyObject = {};

  var $window, $location;
  var MainCtrl, scope, deferred;
  var testSizeAll = 58809;
  var testSizeStart = 10;
  var testSizeEnd = 1337;
  var orig = [];

  var mockAppStateService = {
    resetToInitState: function () {}
  };

  //Initialize the controller and a mock scope
  beforeEach(inject(function ($controller,
    $rootScope,
    $q,
    $httpBackend,
    LevelService,
    DataService,
    ConfigProviderService,
    ViewStateService,
    SoundHandlerService,
    ModalService,
    HistoryService,
    IoHandlerService,
    ValidationService,
    WavParserService,
    LoadedMetaDataService,
    TextGridParserService, _$window_, _$location_) {

    $window = _$window_;
    $location = _$location_;

    // initiate the controller and mock the scope
    scope = $rootScope.$new();
    MainCtrl = $controller('EmuWebAppController', {
      $scope: scope,
      appStateService: mockAppStateService
    });

    scope.lvl = LevelService;
    scope.vs = ViewStateService;
    scope.cps = ConfigProviderService;
    scope.shs = SoundHandlerService;
    scope.modal = ModalService;
    scope.io = IoHandlerService;
    scope.valid = ValidationService;
    scope.shs.audioBuffer.length = testSizeAll;
    scope.cps.setVals(defaultEmuwebappConfig);
    scope.cps.design = defaultEmuwebappDesign;
    scope.cps.curDbConfig = aeDbConfig;
    scope.history = HistoryService;
    scope.txtgrid = TextGridParserService;
    scope.lmds = LoadedMetaDataService;
    scope.wav = WavParserService;
    scope.data = DataService;

    deferred = $q.defer();
    deferred.resolve('called');
    $httpBackend.whenGET("schemaFiles/annotationFileSchema.json").respond(annotationFileSchema);
    $httpBackend.whenGET("schemaFiles/emuwebappConfigSchema.json").respond(emuwebappConfigSchema);
    $httpBackend.whenGET("schemaFiles/DBconfigFileSchema.json").respond(DBconfigFileSchema);
    $httpBackend.whenGET("schemaFiles/bundleListSchema.json").respond(bundleListSchema);
    $httpBackend.whenGET("schemaFiles/bundleSchema.json").respond(bundleSchema);
    $httpBackend.whenGET("schemaFiles/designSchema.json").respond(designSchema);
    $httpBackend.whenGET("demoDBs/ae/ae_bundleList.json").respond(ae_bundleList);
    $httpBackend.whenGET("demoDBs/ae/msajc003_bndl.json").respond(msajc003_bndl);
    $httpBackend.whenGET("views/error.html").respond('');
    $httpBackend.whenGET("views/connectModal.html").respond('');
    $httpBackend.whenGET("views/export.html").respond('');
    $httpBackend.whenGET("configFiles/default_emuwebappConfig.json").respond(defaultEmuwebappConfig);
    $httpBackend.whenGET("configFiles/default_emuwebappDesign.json").respond(defaultEmuwebappDesign);
  }));

  it('should react to $broadcast connectionDisrupted', inject(function ($rootScope) {
    spyOn(mockAppStateService, 'resetToInitState');
    $rootScope.$broadcast('connectionDisrupted');
    expect(mockAppStateService.resetToInitState).toHaveBeenCalled();
  }));

  it('should react to $broadcast resetToInitState', inject(function ($rootScope) {
    spyOn(scope, 'loadDefaultConfig');
    $rootScope.$broadcast('resetToInitState');
    expect(scope.loadDefaultConfig).toHaveBeenCalled();
  }));


  it('should have all variables defined', function () {
    expect(scope.connectBtnLabel).toBe('connect');
    expect(scope.tmp).toEqual(emptyObject);
    expect(scope.dbLoaded).toBe(false);
    expect(scope.is2dCancasesHidden).toBe(true);
    expect(scope.windowWidth).toBeDefined;
  });

  it('all services should exist', inject(function (ViewStateService,
    ConfigProviderService,
    HistoryService,
    fontScaleService,
    LevelService,
    ModalService,
    Ssffdataservice,
    SoundHandlerService,
    Drawhelperservice,
    WavParserService,
    IoHandlerService,
    Appcachehandler) {
    expect(ViewStateService).toBeDefined();
    expect(ConfigProviderService).toBeDefined();
    expect(HistoryService).toBeDefined();
    expect(fontScaleService).toBeDefined();
    expect(LevelService).toBeDefined();
    expect(ModalService).toBeDefined();
    expect(Ssffdataservice).toBeDefined();
    expect(SoundHandlerService).toBeDefined();
    expect(Drawhelperservice).toBeDefined();
    expect(WavParserService).toBeDefined();
    expect(IoHandlerService).toBeDefined();
    expect(Appcachehandler).toBeDefined();

  }));

  it('should have a working uninitialized ViewStateService service', function () {
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

  it('should clear', inject(function ($q) {
    var txtDeferred = $q.defer();
    spyOn(scope.modal, 'open').and.returnValue(txtDeferred.promise);
    scope.clearBtnClick();
    txtDeferred.resolve(true);
    scope.$digest();
    expect(scope.modal.open).toHaveBeenCalledWith('views/confirmModal.html', 'Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.');
  }));

  it('should clear with unsafed changes', function () {
    spyOn(scope.modal, 'open').and.returnValue(deferred.promise);
    scope.cps.vals.main.comMode = 'embedded';
    scope.history.movesAwayFromLastSave = 1;
    scope.clearBtnClick();
    expect(scope.modal.open).toHaveBeenCalledWith( 'views/confirmModal.html', 'Do you wish to clear all loaded data and if connected disconnect from the server? CAUTION: YOU HAVE UNSAVED CHANGES! These will be lost if you confirm.');
  });

  it('should showHierarchy', function () {
    spyOn(scope.modal, 'open');
    scope.showHierarchyBtnClick();
    expect(scope.modal.open).toHaveBeenCalledWith('views/showHierarchyModal.html');
  });

  it('should showAbout', function () {
    spyOn(scope.modal, 'open');
    scope.aboutBtnClick();
    expect(scope.modal.open).toHaveBeenCalledWith('views/help.html');
  });

  it('should openDemoDB ae', inject(function ($q, $httpBackend, dbObjLoadSaveService) {
    var ioDeferredDBConfig = $q.defer();
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
    spyOn(scope.io, 'getDBconfigFile').and.returnValue(ioDeferredDBConfig.promise);
    spyOn(scope.io, 'getBundleList').and.returnValue(ioDeferredBundleList.promise);
    spyOn(scope.valid, 'validateJSO').and.returnValue(true);
    spyOn(dbObjLoadSaveService, 'loadBundle').and.returnValue("test12"); // overwrite call to loadBundle
    scope.openDemoDBbtnClick('ae');
    expect(scope.vs.setState).toHaveBeenCalledWith('loadingSaving');
    expect(scope.vs.getPermission).toHaveBeenCalledWith('openDemoBtnDBclick');
    expect(scope.lmds.getDemoDbName()).toEqual('ae');
    expect(scope.cps.vals.main.comMode).toEqual('DEMO');
    expect(scope.vs.somethingInProgressTxt).toEqual('Loading DB config...');
    ioDeferredDBConfig.resolve();
    scope.$digest();
    $httpBackend.flush();
    expect(scope.io.getDBconfigFile).toHaveBeenCalledWith('ae');
    expect(scope.valid.validateJSO).toHaveBeenCalled();
    expect(scope.io.getBundleList).toHaveBeenCalledWith('ae');
    ioDeferredBundleList.resolve();
    scope.$digest();
  }));

  it('should downloadAnnotationBtnClick', inject(function ($q) {
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.modal, 'open');
    scope.lmds.setCurBndl({name: 'test'});
    scope.downloadAnnotationBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('downloadAnnotationBtnClick');
    expect(scope.modal.open).toHaveBeenCalledWith('views/export.html', 'test_annot.json',  '{}');
  }));

  it('should downloadTextGridBtnClick', inject(function ($q) {
    var txtDeferred = $q.defer();
    txtDeferred.resolve('test1');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.txtgrid, 'asyncToTextGrid').and.returnValue(txtDeferred.promise);
    spyOn(scope.modal, 'open');
    scope.lmds.setCurBndl({name: 'test2'});
    scope.downloadTextGridBtnClick();
    txtDeferred.resolve();
    scope.$digest();
    expect(scope.txtgrid.asyncToTextGrid).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('downloadTextGridBtnClick');
    expect(scope.modal.open).toHaveBeenCalledWith('views/export.html', 'test2.TextGrid' , 'test1');
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
    spyOn(scope.modal, 'open').and.returnValue(conDeferred.promise);
    spyOn(scope.io.wsH, 'initConnect').and.returnValue(ioDeferred.promise);
    scope.connectBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('connectBtnClick');
    expect(scope.modal.open).toHaveBeenCalledWith('views/connectModal.html');
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
    spyOn(scope.modal, 'open').and.returnValue(conDeferred.promise);
    spyOn(scope.io.wsH, 'initConnect').and.returnValue(ioDeferred.promise);
    scope.connectBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('connectBtnClick');
    expect(scope.modal.open).toHaveBeenCalledWith('views/connectModal.html');
    conDeferred.resolve();
    scope.$digest();
    expect(scope.handleConnectedToWSserver).toHaveBeenCalled();
    expect(scope.io.wsH.initConnect).toHaveBeenCalledWith('http://test:1234');
  }));

  it('should open spectro Settings', function () {
    spyOn(scope.modal, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    scope.settingsBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('spectSettingsChange');
    expect(scope.modal.open).toHaveBeenCalledWith('views/spectSettings.html');
  });

  it('should not open spectro Settings (not allowed)', function () {
    spyOn(scope.modal, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.settingsBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('spectSettingsChange');
    expect(scope.modal.open).not.toHaveBeenCalledWith();
  });

  it('should open download Textgrid', inject(function ($q) {
    /*scope.curBndl.name = 'test';
    var txtgridDeferred = $q.defer();
    txtgridDeferred.resolve({
      data: 'test123'
    });
    spyOn(scope.txtgrid, 'asyncToTextGrid').and.returnValue(txtgridDeferred.promise);
    spyOn(scope.modal, 'openExport');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    scope.downloadTextGridBtnClick();
    txtgridDeferred.resolve();
    scope.$digest();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('downloadTextGridBtnClick');
    expect(scope.modal.openExport).toHaveBeenCalledWith('views/export.html', 'ExportCtrl', 'test123', 'test.TextGrid');*/
  }));

  it('should not open download Textgrid (not allowed)', function () {
    spyOn(scope.modal, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.downloadTextGridBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('downloadTextGridBtnClick');
    expect(scope.modal.open).not.toHaveBeenCalledWith();
  });


  it('should open rename selected Level', function () {
    spyOn(scope.modal, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.vs, 'getcurClickLevelName').and.returnValue('ae');
    scope.renameSelLevelBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(scope.modal.open).toHaveBeenCalledWith('views/renameLevel.html', 'ae');
  });

  it('should open rename selected Level error', function () {
    spyOn(scope.modal, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(scope.vs, 'getcurClickLevelName').and.returnValue(undefined);
    scope.renameSelLevelBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(scope.modal.open).toHaveBeenCalledWith('views/error.html', 'Rename Error : Please choose a Level first !');
  });

  it('should not open rename selected Level (not allowed)', function () {
    spyOn(scope.modal, 'open');
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.renameSelLevelBtnClick();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(scope.modal.open).not.toHaveBeenCalledWith();
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
    spyOn(scope.vs, 'setPerspectivesSideBarOpen').and.callThrough();
    scope.changePerspective({
      name: 'default'
    });
    expect(scope.vs.curPerspectiveIdx).toEqual(0);
    expect(scope.vs.setPerspectivesSideBarOpen).toHaveBeenCalled();
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

  it('should cmdZoomAll', function () {
    scope.cps.vals.perspectives[0].signalCanvases.order = [1, 2];
    spyOn(scope.vs, 'getPermission').and.returnValue(false);
    scope.cmdZoomAll();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should addLevelPoint on BtnClick', inject(function (ConfigProviderService, ViewStateService) {
  	ViewStateService.curPerspectiveIdx = 0;
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(ViewStateService, 'selectLevel');
    spyOn(scope.lvl, 'insertLevel');
    spyOn(scope.history, 'addObjToUndoStack');
    scope.addLevelPointBtnClick();
    expect(scope.lvl.insertLevel).toHaveBeenCalled();
    expect(scope.history.addObjToUndoStack).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('addLevelPointBtnClick');
    expect(ViewStateService.selectLevel).toHaveBeenCalled();
  }));

  it('should addLevelSeg on BtnClick', inject(function (ConfigProviderService, ViewStateService) {
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(scope.vs, 'getPermission').and.returnValue(true);
    spyOn(ViewStateService, 'selectLevel');
    spyOn(scope.lvl, 'insertLevel');
    spyOn(scope.history, 'addObjToUndoStack');
    scope.addLevelSegBtnClick();
    expect(scope.lvl.insertLevel).toHaveBeenCalled();
    expect(scope.history.addObjToUndoStack).toHaveBeenCalled();
    expect(scope.vs.getPermission).toHaveBeenCalledWith('addLevelSegBtnClick');
    expect(ViewStateService.selectLevel).toHaveBeenCalled();
  }));

   it('should getEnlarge (-1)', inject(function (ViewStateService) {
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(scope.vs, 'getenlarge').and.returnValue(-1);
    var ret = scope.getEnlarge();
    expect(ret).toEqual('auto');
  }));

   it('should getEnlarge (2 / small)', inject(function (ViewStateService) {
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(scope.vs, 'getenlarge').and.returnValue(3);
    var ret = scope.getEnlarge(2);
    expect(ret).toEqual('27%');
  }));

   it('should getEnlarge (2 / large)', inject(function (ViewStateService) {
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(scope.vs, 'getenlarge').and.returnValue(3);
    var ret = scope.getEnlarge(3);
    expect(ret).toEqual('70%');
  }));

   it('should getEnlarge (3 / small)', inject(function (ViewStateService, ConfigProviderService) {
    ViewStateService.curPerspectiveIdx = 0;
    orig = ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order;
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.push({empty: ''})
    spyOn(scope.vs, 'getenlarge').and.returnValue(3);
    var ret = scope.getEnlarge(2);
    expect(ret).toEqual('22.5%');
  }));

   it('should getEnlarge (3 / large)', inject(function (ViewStateService, ConfigProviderService) {
    ViewStateService.curPerspectiveIdx = 0;
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.push({empty: ''})
    spyOn(scope.vs, 'getenlarge').and.returnValue(3);
    var ret = scope.getEnlarge(3);
    expect(ret).toEqual('50%');
  }));

   it('should getEnlarge (1)', inject(function (ViewStateService, ConfigProviderService) {
    ViewStateService.curPerspectiveIdx = 0;
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.pop();
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.pop();
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.pop();
    spyOn(scope.vs, 'getenlarge').and.returnValue(3);
    var ret = scope.getEnlarge(2);
    expect(ret).toEqual('auto');
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order = orig;
  }));

   it('should toggleCollapseSession', function () {
    scope.uniqSessionList = [];
    scope.uniqSessionList[0] = {};
    scope.uniqSessionList[0].collapsed = true;
    scope.toggleCollapseSession(0);
    expect(scope.uniqSessionList[0].collapsed).toEqual(false);
  });

   it('should react on resize window', function () {
     spyOn(scope.lvl, 'deleteEditArea');
     spyOn(scope.vs, 'setWindowWidth');
     angular.element($window).triggerHandler('resize');
     scope.$digest();
     expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
     expect(scope.vs.setWindowWidth).toHaveBeenCalled();
  });

   it('should loadFilesForEmbeddedApp', inject(function ($q) {
     var ioDeferred = $q.defer();
     var ioDeferred2 = $q.defer();
     var wavDeferred = $q.defer();
     spyOn($location, 'search').and.returnValue({audioGetUrl: 'test.wav', labelGetUrl: 'test_annot.json'});
     spyOn(scope.io, 'httpGetPath').and.returnValue(ioDeferred.promise);
     spyOn(scope.cps, 'setVals');
     spyOn(scope.valid, 'validateJSO').and.returnValue(true);
     spyOn(scope.wav, 'parseWavAudioBuf').and.returnValue(wavDeferred.promise);
     spyOn(scope.io, 'parseLabelFile').and.returnValue(ioDeferred2.promise);
     spyOn(scope.data, 'setData');
     scope.cps.embeddedVals.audioGetUrl = 'test.wav';
     scope.loadFilesForEmbeddedApp();
     ioDeferred.resolve({data: defaultEmuwebappConfig});
     scope.$apply();
     expect(scope.cps.setVals).toHaveBeenCalled();
     wavDeferred.resolve({Data: [1, 2, 3]});
     scope.$apply();
     expect(scope.wav.parseWavAudioBuf).toHaveBeenCalled();
     ioDeferred2.resolve({levels: [{ name: 'test' }]});
     scope.$apply();
     expect(scope.valid.validateJSO).toHaveBeenCalled();
     expect(scope.io.parseLabelFile).toHaveBeenCalled();
     expect(scope.data.setData).toHaveBeenCalled();
  }));

   it('should loadDefaultConfig', inject(function ($httpBackend, $q, ValidationService, IoHandlerService) {
     var ioDeferred = $q.defer();
     var jsonDeferred = $q.defer();
     spyOn(ValidationService, 'loadSchemas').and.returnValue(ioDeferred.promise);
     spyOn(ValidationService, 'validateJSO').and.returnValue(jsonDeferred.promise);
     scope.loadDefaultConfig();
     ioDeferred.resolve();
     scope.$apply();
     $httpBackend.flush();
     jsonDeferred.resolve(true);
     scope.$apply();
  }));



});
