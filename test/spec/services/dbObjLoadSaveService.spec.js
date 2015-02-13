'use strict';

describe('Service: dbObjLoadSaveService', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(inject(function (_$rootScope_, $q, dbObjLoadSaveService, viewState, ConfigProviderService) {
     scope = _$rootScope_;
     deferred = $q.defer();
     scope.dbo = dbObjLoadSaveService;
     scope.vs = viewState;
     scope.cps = ConfigProviderService;
     scope.cps.setVals(defaultEmuwebappConfig);
     scope.cps.curDbConfig = aeDbConfig;   
  }));

  /**
   *
   */
   it('should getAnnotationAndSaveBndl', inject(function (Iohandlerservice, loadedMetaDataService) {
     var result;
     spyOn(Iohandlerservice, 'saveBundle').and.returnValue(deferred.promise);
     spyOn(loadedMetaDataService, 'getCurBndl').and.returnValue({session: 'test', finishedEditing: false, comment: 'test comment'});
     scope.dbo.getAnnotationAndSaveBndl({},deferred);
     deferred.resolve('called');
     scope.$apply();
     expect(Iohandlerservice.saveBundle).toHaveBeenCalled();
   }));
});