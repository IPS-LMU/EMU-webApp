'use strict';

describe('Controller: ShowhierarchyCtrl', function () {

  var ShowhierarchyCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, viewState, dialogService, ConfigProviderService, LevelService, HierarchyLayoutService) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.dialog = dialogService;
       scope.vs = viewState;
       scope.lvl = LevelService;
       scope.hierarchy = HierarchyLayoutService;
       ShowhierarchyCtrl = $controller('ShowhierarchyCtrl', {
         $scope: scope
       });     
     }));  
     
   it('should cancel', function () {
     spyOn(scope.dialog, 'close');
     scope.cancel();
     expect(scope.dialog.close).toHaveBeenCalled();
   });   
   
   it('should set 4 correct paths', function () {
     expect(scope.paths.possible.length).toBe(4);
     expect(scope.paths.possibleAsStr[0]).toBe('Phonetic ← Phoneme ← Syllable ← Word ← Intermediate ← Intonational ← Utterance');
     expect(scope.paths.possibleAsStr[1]).toBe('Phonetic ← Phoneme ← Syllable ← Foot ← Intonational ← Utterance');
     expect(scope.paths.possibleAsStr[2]).toBe('Tone ← Syllable ← Word ← Intermediate ← Intonational ← Utterance');
     expect(scope.paths.possibleAsStr[3]).toBe('Tone ← Syllable ← Foot ← Intonational ← Utterance');
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
     scope.lvl.setData(msajc003_bndl.annotation);
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue('Phonetic');
     expect(scope.isCurrentAttrDef('lvlname','Phonetic')).toBe(true);
     expect(scope.vs.getCurAttrDef).toHaveBeenCalledWith('lvlname');
   });  
   
   it('should check if not isCurrentAttrDef', function () {
     scope.lvl.setData(msajc003_bndl.annotation);
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue('Tone');
     expect(scope.isCurrentAttrDef('lvlname','Phonetic')).toBe(false);
     expect(scope.vs.getCurAttrDef).toHaveBeenCalledWith('lvlname');
   });  
   
   it('should getAllAttrDefs', function () {
     scope.lvl.setData(msajc003_bndl.annotation);
     var ret = scope.getAllAttrDefs('Phonetic');
     expect(ret[0].name).toEqual('Phonetic');
     expect(ret[0].type).toEqual('STRING');
   }); 
   
   it('should setCurrentAttrDef', function () {
     scope.lvl.setData(msajc003_bndl.annotation);
     spyOn(scope.vs, 'setCurAttrDef');
     scope.setCurrentAttrDef('Tone',1);
     expect(scope.vs.setCurAttrDef).toHaveBeenCalledWith('Tone',1);
   });      
});
