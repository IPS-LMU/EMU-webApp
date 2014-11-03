'use strict';

describe('Controller: ModalCtrl', function () {

  var ModalCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, $q, DataService, ConfigProviderService, dialogService, viewState, LevelService, HistoryService) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.dialog = dialogService;
       scope.vs = viewState;
       scope.lvl = LevelService;
       scope.data = DataService;
       scope.history = HistoryService;
       ModalCtrl = $controller('ModalCtrl', {
         $scope: scope,
         passedInTxt: 'test'
       });     
     }));  
     
   it('should set correct passedInTxt', function () {
     expect(scope.passedInTxt).toBe('test');
   }); 
   
   it('should renameLevel', function () {
     scope.passedOutTxt.var = 'test1';
     spyOn(scope.history, 'addObjToUndoStack');
     spyOn(scope.lvl, 'renameLevel');
     spyOn(scope.dialog, 'close');
     scope.renameLevel();
     expect(scope.lvl.renameLevel).toHaveBeenCalledWith(scope.passedInTxt,scope.passedOutTxt.var, scope.vs.curPerspectiveIdx);
     expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({
		'type': 'ANNOT',
		'action': 'RENAMELEVEL',
		'newname': scope.passedOutTxt.var,
		'name': scope.passedInTxt,
		'curPerspectiveIdx': scope.vs.curPerspectiveIdx
	});
     expect(scope.dialog.close).toHaveBeenCalled();
   }); 
   
   it('should deleteLevel', function () {
     scope.data.setData(msajc003_bndl.annotation);
     scope.vs.setcurClickLevelName('Phonetic', 0);
     spyOn(scope.history, 'addObjToUndoStack');
     spyOn(scope.lvl, 'deleteLevel');
     spyOn(scope.dialog, 'close');
     scope.deleteLevel();
     expect(scope.lvl.deleteLevel).toHaveBeenCalledWith(scope.vs.getcurClickLevelIndex(), scope.vs.curPerspectiveIdx);
     expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({
		'type': 'ANNOT',
		'action': 'DELETELEVEL',
		'level': scope.lvl.getLevelDetails(scope.vs.getcurClickLevelName()).level,
		'id': scope.vs.getcurClickLevelIndex(),
		'curPerspectiveIdx': scope.vs.curPerspectiveIdx
	});
     expect(scope.dialog.close).toHaveBeenCalled();
   });         

   it('should saveChanges', function () {
     spyOn(scope.dialog, 'close');
     scope.saveChanges();
     expect(scope.dialog.close).toHaveBeenCalledWith('saveChanges');
   });    

   it('should discardChanges', function () {
     spyOn(scope.dialog, 'close');
     scope.discardChanges();
     expect(scope.dialog.close).toHaveBeenCalledWith('discardChanges');
   });      

   it('should cancel', function () {
     spyOn(scope.dialog, 'close');
     scope.cancel();
     expect(scope.dialog.close).toHaveBeenCalled();
   });        
     
   it('should cursorInTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorInTextField();
     expect(scope.vs.setEditing).toHaveBeenCalledWith(true);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(true);
   }); 

   it('should cursorOutOfTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorOutOfTextField();
     expect(scope.vs.setEditing).toHaveBeenCalledWith(false);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(false);
   });  
       
});
