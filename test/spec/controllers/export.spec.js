'use strict';

describe('Controller: ExportCtrl', function () {

  var ExportCtrl, scope;
  
    // load the controller's module
  beforeEach(module('emuwebApp'));
  
     //Initialize the controller and a mock scope
     beforeEach(inject(function ($controller, $rootScope, ConfigProviderService, dialogService, viewState, HistoryService) {
       scope = $rootScope.$new();
       scope.cps = ConfigProviderService;
       scope.cps.setVals(defaultEmuwebappConfig);
       scope.cps.curDbConfig = aeDbConfig;
       scope.dialog = dialogService;
       scope.vs = viewState;
       scope.history = HistoryService;
       ExportCtrl = $controller('ExportCtrl', {
         $scope: scope,
         exportName: 'test',
         exportData: 'test123'
       });     
     }));  
     
   it('should not be firefox', function () {
     expect(scope.firefox).toBe(false);
   });   
     
   it('should cancel', function () {
     spyOn(scope.dialog, 'close');
     scope.cancel();
     expect(scope.dialog.close).toHaveBeenCalled();
   });   

   it('should getBlob', function () {
     expect(scope.getBlob().toString()).toBe('[object Blob]');
   });   

   it('should updateHistoryService', function () {
     scope.updateHistoryService();
     expect(scope.history.movesAwayFromLastSave).toBe(0);
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

   it('should export', function () {
     spyOn(scope.dialog, 'close');
     spyOn(scope, 'SaveToDisk');
     scope.export();
     expect(scope.dialog.close).toHaveBeenCalled();
     expect(scope.SaveToDisk).toHaveBeenCalled();
   }); 
});
