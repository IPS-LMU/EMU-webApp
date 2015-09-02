'use strict';

describe('Controller: ModalCtrl', function () {

  var ModalCtrl, scope;

    // load the controller's module
  beforeEach(module('emuwebApp'));

     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, $q, DataService, ConfigProviderService, modalService, viewState, LevelService, HistoryService) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.modal = modalService;
       scope.vs = viewState;
       scope.lvl = LevelService;
       scope.datas = DataService;
       scope.history = HistoryService;
       ModalCtrl = $controller('ModalCtrl', {
         $scope: scope
       });
     }));

   it('should renameLevel', function () {
     spyOn(scope.history, 'addObjToUndoStack');
     spyOn(scope.lvl, 'renameLevel');
     spyOn(scope.modal, 'close');
     scope.renameLevel();
     expect(scope.lvl.renameLevel).toHaveBeenCalledWith(scope.modal.dataIn,scope.data, scope.vs.curPerspectiveIdx);
     expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({
		'type': 'ANNOT',
		'action': 'RENAMELEVEL',
		'newname': scope.data,
		'name': scope.modal.dataIn,
		'curPerspectiveIdx': scope.vs.curPerspectiveIdx
	});
     expect(scope.modal.close).toHaveBeenCalled();
   });

   it('should deleteLevel', function () {
     scope.datas.setData(msajc003_bndl.annotation);
     scope.vs.setcurClickLevelName('Phonetic', 0);
     spyOn(scope.history, 'addObjToUndoStack');
     spyOn(scope.lvl, 'deleteLevel');
     spyOn(scope.modal, 'close');
     scope.deleteLevel();
     expect(scope.lvl.deleteLevel).toHaveBeenCalledWith(scope.vs.getcurClickLevelIndex(), scope.vs.curPerspectiveIdx);
     expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({
		'type': 'ANNOT',
		'action': 'DELETELEVEL',
		'level': scope.lvl.getLevelDetails(scope.vs.getcurClickLevelName()),
		'id': scope.vs.getcurClickLevelIndex(),
		'curPerspectiveIdx': scope.vs.curPerspectiveIdx
	});
     expect(scope.modal.close).toHaveBeenCalled();
   });

   it('should saveChanges', function () {
     spyOn(scope.modal, 'close');
     scope.saveChanges();
     expect(scope.modal.close).toHaveBeenCalled();
   });

   it('should discardChanges', function () {
     spyOn(scope.modal, 'close');
     scope.discardChanges();
     expect(scope.modal.close).toHaveBeenCalled();
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
