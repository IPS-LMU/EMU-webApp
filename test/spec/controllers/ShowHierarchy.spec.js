'use strict';

describe('Controller: ShowhierarchyCtrl', function () {

  var ShowhierarchyCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, DataService, viewState, modalService, ConfigProviderService, LevelService, HierarchyLayoutService) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.modal = modalService;
       scope.vs = viewState;
       scope.lvl = LevelService;
       scope.data = DataService;
       scope.hierarchy = HierarchyLayoutService;
       ShowhierarchyCtrl = $controller('ShowhierarchyCtrl', {
         $scope: scope
       });     
     }));  
     
   it('should cancel', function () {
     spyOn(scope.modal, 'close');
     scope.cancel();
     expect(scope.modal.close).toHaveBeenCalled();
   });   
   
   it('should set 4 correct paths', function () {
     expect(scope.paths.possible.length).toBe(4);
     expect(scope.paths.possibleAsStr[0]).toBe('Utterance → Intonational → Intermediate → Word → Syllable → Phoneme → Phonetic');
     expect(scope.paths.possibleAsStr[1]).toBe('Utterance → Intonational → Foot → Syllable → Phoneme → Phonetic');
     expect(scope.paths.possibleAsStr[2]).toBe('Utterance → Intonational → Intermediate → Word → Syllable → Tone');
     expect(scope.paths.possibleAsStr[3]).toBe('Utterance → Intonational → Foot → Syllable → Tone');
   }); 
   
   it('should getSelIdx', function () {
     expect(scope.getSelIdx()).toBe(0);
     scope.paths.selected = scope.paths.possibleAsStr[0];
     expect(scope.getSelIdx()).toBe(0);
     scope.paths.selected = scope.paths.possibleAsStr[1];
     expect(scope.getSelIdx()).toBe(1);
     scope.paths.selected = scope.paths.possibleAsStr[2];
     expect(scope.getSelIdx()).toBe(2);
     scope.paths.selected = scope.paths.possibleAsStr[3];
     expect(scope.getSelIdx()).toBe(3);
   });   
   
   it('should getPlaying', function () {
     expect(scope.getPlaying()).toEqual(0);
   });   
   
   it('should playSelection', function () {
     expect(scope.getPlaying()).toEqual(0);
     scope.playSelection();
     expect(scope.getPlaying()).toEqual(1);
   });  
   
   it('should getRotation', function () {
     expect(scope.getRotation()).toEqual(false);
   });   
   
   it('should rotateHierarchy', function () {
     expect(scope.getRotation()).toEqual(false);
     scope.rotateHierarchy();
     expect(scope.getRotation()).toEqual(true);
   });  
   
   it('should check if isCurrentAttrDef', function () {
     scope.data.setData(msajc003_bndl.annotation);
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue('Phonetic');
     expect(scope.isCurrentAttrDef('lvlname','Phonetic')).toBe(true);
     expect(scope.vs.getCurAttrDef).toHaveBeenCalledWith('lvlname');
   });  
   
   it('should check if not isCurrentAttrDef', function () {
     scope.data.setData(msajc003_bndl.annotation);
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue('Tone');
     expect(scope.isCurrentAttrDef('lvlname','Phonetic')).toBe(false);
     expect(scope.vs.getCurAttrDef).toHaveBeenCalledWith('lvlname');
   });  
   
   it('should getAllAttrDefs', function () {
     scope.data.setData(msajc003_bndl.annotation);
     var ret = scope.getAllAttrDefs('Phonetic');
     expect(ret[0].name).toEqual('Phonetic');
     expect(ret[0].type).toEqual('STRING');
   }); 
   
   it('should setCurrentAttrDef', function () {
     scope.data.setData(msajc003_bndl.annotation);
     spyOn(scope.vs, 'setCurAttrDef');
     scope.setCurrentAttrDef('Tone',1, 1);
     expect(scope.vs.setCurAttrDef).toHaveBeenCalledWith('Tone',1, 1);
   });      
});
