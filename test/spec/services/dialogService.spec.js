'use strict';

describe('Service: dialogService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

 /**
   *
   */
  it('should open and close a dialog', inject(function (dialogService, viewState, $modal) {
      var res = dialogService.open('views/connectModal.html', 'WsconnectionCtrl', undefined);
      expect(viewState.curState).toBe(viewState.states.loadingSaving);
      dialogService.close(res);
      expect(viewState.curState).toBe(viewState.states.noDBorFilesloaded);
  }));
});