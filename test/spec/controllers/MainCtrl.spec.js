'use strict';

describe('Controller: MainCtrl', function () {

     //load the controller's module
     beforeEach(module('emuwebApp'));

     var emptyObject = {};

     var MainCtrl, scope, ret, deferred;
     var testSizeAll = 58809;
     var testSizeStart = 10;
     var testSizeEnd = 1337;

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
                                 Validationservice) {
       scope = $rootScope.$new();
       MainCtrl = $controller('MainCtrl', {
         $scope: scope
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
       deferred = $q.defer();
       deferred.resolve('called');     
       $httpBackend.whenGET("schemaFiles/annotationFileSchema.json").respond(annotationFileSchema);
       $httpBackend.whenGET("schemaFiles/emuwebappConfigSchema.json").respond(emuwebappConfigSchema);
       $httpBackend.whenGET("schemaFiles/DBconfigFileSchema.json").respond(DBconfigFileSchema);
       $httpBackend.whenGET("schemaFiles/bundleListSchema.json").respond(bundleListSchema);        
       $httpBackend.whenGET("views/error.html").respond('');        
          
     }));
  
     it('should have all variables defined', function () {
       expect(scope.connectBtnLabel).toBe('connect');
       expect(scope.tmp).toEqual(emptyObject);
       expect(scope.dbLoaded).toBe(false);
       expect(scope.is2dCancasesHidden).toBe(true);
       expect(scope.bundleList.length).toBe(0);
       expect(scope.curUserName).toBe('');
       expect(scope.curBndl).toEqual(emptyObject);
       expect(scope.lastclickedutt).toBe(null);
       expect(scope.filterText).toBe('');       
       expect(scope.windowWidth).toBeDefined;              
       expect(scope.demoDbName).toBe('');       
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
  
    it('should have a working uninitialized viewState service', function() {
         expect(scope.vs.curViewPort.sS).toBe(0);
         expect(scope.vs.curViewPort.eS).toBe(0);
         expect(scope.vs.curViewPort.selectS).toBe(-1);
         expect(scope.vs.curViewPort.selectE).toBe(-1);
     });  
  
    it('should resetToInitState', function() {
        scope.resetToInitState();
        expect(scope.curBndl).toEqual(emptyObject);
        expect(scope.bundleList.length).toBe(0);
     });  
  
    it('should clear', function() {
        spyOn(scope.dialog, 'open').and.returnValue(deferred.promise);
        scope.clearBtnClick();
        expect(scope.dialog.open).toHaveBeenCalledWith('views/confirmModal.html', 'ConfirmmodalCtrl', 'Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.');
     }); 
     
    it('should showHierarchy', function() {
        spyOn(scope.dialog, 'open');
        scope.showHierarchyBtnClick();
        expect(scope.dialog.open).toHaveBeenCalledWith('views/showHierarchyModal.html', 'ShowhierarchyCtrl');
     });  
     
    it('should showAbout', function() {
        spyOn(scope.dialog, 'open');
        scope.aboutBtnClick();
        expect(scope.dialog.open).toHaveBeenCalledWith('views/about.html', 'AboutCtrl');
     });  
     
    it('should openDemoDB ae', inject(function ($q) {
        var ioDeferred = $q.defer();
        ioDeferred.resolve({data: {EMUwebAppConfig: {}}});            
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setState');
        spyOn(scope.io, 'getDBconfigFile').and.returnValue(ioDeferred.promise);
        scope.openDemoDBbtnClick('ae');
        expect(scope.vs.setState).toHaveBeenCalledWith('loadingSaving'); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('openDemoBtnDBclick'); 
        expect(scope.demoDbName).toEqual('ae'); 
        expect(scope.cps.vals.main.comMode).toEqual('DEMO'); 
        expect(scope.vs.somethingInProgressTxt).toEqual( 'Loading DB config...'); 
        expect(scope.io.getDBconfigFile).toHaveBeenCalledWith('ae');
        ioDeferred.resolve();
        scope.$digest();
        
     }));     

     
    it('should connect', inject(function ($q) {

        var conDeferred = $q.defer();
        conDeferred.resolve('http://test:1234');
        var ioDeferred = $q.defer();
        ioDeferred.resolve({type: 'error'});
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
  
    it('should getPerspectiveColor', function() {
        expect(scope.getPerspectiveColor()).toEqual('emuwebapp-curSelPerspLi');
        // set curPerspectiveIdx
        scope.vs.curPerspectiveIdx = 0;
        expect(scope.getPerspectiveColor({name: 'test'})).toEqual('emuwebapp-perspLi');
        // reset curPerspectiveIdx
        scope.vs.curPerspectiveIdx = -1;
     });
      
    it('should changePerspective', function() {
        spyOn(scope.vs, 'setRightsubmenuOpen').and.callThrough();
        scope.changePerspective({name: 'default'});
        expect(scope.vs.curPerspectiveIdx).toEqual(0);
        expect(scope.vs.setRightsubmenuOpen).toHaveBeenCalled(); 
     }); 
      
    it('should cmdPlayAll', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        scope.cmdPlayAll();
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(0,testSizeAll);
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(0,testSizeAll); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio'); 
     }); 
      
    it('should cmdPlaySel', function() {
        scope.vs.select(testSizeStart, testSizeEnd);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        scope.cmdPlaySel();
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(testSizeStart,testSizeEnd);
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(testSizeStart,testSizeEnd); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio'); 
     }); 
      
    it('should cmdPlayView', function() {
        scope.vs.setViewPort(testSizeStart, testSizeEnd);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        scope.cmdPlayView();
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(testSizeStart,testSizeEnd);
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(testSizeStart,testSizeEnd); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio'); 
     }); 
      
    it('should cmdZoomSel', function() {
        scope.vs.select(testSizeStart, testSizeEnd);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'setViewPort');
        scope.cmdZoomSel();
        expect(scope.vs.setViewPort).toHaveBeenCalledWith(testSizeStart,testSizeEnd);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom'); 
     }); 
      
    it('should cmdZoomRight', function() {
        scope.vs.select(testSizeStart, testSizeEnd);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'shiftViewPort');
        scope.cmdZoomRight();
        expect(scope.vs.shiftViewPort).toHaveBeenCalledWith(true);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom'); 
     }); 
      
    it('should cmdZoomLeft', function() {
        scope.vs.select(testSizeStart, testSizeEnd);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'shiftViewPort');
        scope.cmdZoomLeft();
        expect(scope.vs.shiftViewPort).toHaveBeenCalledWith(false);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom'); 
     }); 
      
    it('should cmdZoomOut', function() {
        scope.vs.select(testSizeStart, testSizeEnd);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'zoomViewPort');
        scope.cmdZoomOut();
        expect(scope.vs.zoomViewPort).toHaveBeenCalledWith(false);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom'); 
     }); 
      
    it('should cmdZoomIn', function() {
        scope.vs.select(testSizeStart, testSizeEnd);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'zoomViewPort');
        scope.cmdZoomIn();
        expect(scope.vs.zoomViewPort).toHaveBeenCalledWith(true);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom'); 
     }); 
      
    it('should cmdZoomAll', function() {
        scope.vs.select(testSizeStart, testSizeEnd);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'setViewPort');
        scope.cmdZoomAll();
        expect(scope.vs.setViewPort).toHaveBeenCalledWith(0, testSizeAll);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom'); 
     }); 
});