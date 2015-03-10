'use strict';

describe('Service: AnagestService', function () {


	var deferred, $rootScope;
	var mockDialogService = {};


	// load the controller's module
	beforeEach(module('emuwebApp'));

	beforeEach(module(function ($provide) {
		$provide.value('modalService', mockDialogService);
	}));

	beforeEach(inject(function (modalService, $q, _$rootScope_) {
		$rootScope = _$rootScope_;

		// mock open function 
		mockDialogService.open = function (p1, p2, p3) {
			var deferred = $q.defer();
			if(p1 === 'views/SelectLabelModal.html'){
				deferred.resolve(0);
			}else{
				deferred.resolve('called open on dialogService');
			}
			return deferred.promise;
		};

		// mock changeModal function (not needed any more as it was changed to open)
		// mockDialogService.changeModal = function (p1, p2, p3, p4) {
		// 	var deferred2 = $q.defer();
		// 	deferred2.resolve(0);
		// 	return deferred2.promise;
		// };

		// spyOn(dialogService, 'open');
	}));

	/**
	 *
	 */
	it('should find thresholds in mock array', inject(function (AnagestService, mathHelperService){
		var x = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		var minVal = 13;
		var maxVal = 19;
		var threshold = 0.2;
		var direction = 1;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(mathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(3.2);
		});
		$rootScope.$apply();

		threshold = 0.35;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(mathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(4.1);
		});
		$rootScope.$apply();


		threshold = 0.8;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(mathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(6.8);
		});
		$rootScope.$apply();


		// change direction
		// should call error dialog -> no thresholds found
		threshold = 0.2;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1).then(function (res) {}, function (err) {
			expect(err).toEqual('Could not find any values that step over the threshold!!');
		});
		$rootScope.$apply();

		// new values
		x = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11];
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1).then(function (res) {
			expect(mathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(5.8);
		});
		$rootScope.$apply();

		// two thresholds
		// new values
		x = [20, 19, 18, 17, 16, 15, 14, 13, 20, 19, 18, 17, 16, 15, 14, 13];
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1).then(function (res) {
			expect(res).toEqual(NaN);
		});
		$rootScope.$apply();

		// TODO: SHOULD spy on mock open function to see if it is called with the correct values 
	}));
	
	/**
	*
	*/
	it('should not insertAnagestEvents with selected events', inject(function ($q, AnagestService, viewState) {
	    spyOn(viewState, 'getItemsInSelection').and.returnValue([1, 2, 3]);
	    AnagestService.insertAnagestEvents();
		expect(viewState.getItemsInSelection).toHaveBeenCalled();    
  }));
	
	/**
	*
	*/
	it('should insertAnagestEvents', inject(function ($q, LevelService, LinkService, HistoryService, ConfigProviderService, Ssffdataservice, AnagestService, viewState) {
	    
	    var defer = $q.defer();
	    spyOn(HistoryService, 'updateCurChangeObj');
	    spyOn(HistoryService, 'addCurChangeObjToUndoStack');
	    spyOn(LinkService, 'insertLinksTo');
	    spyOn(LevelService, 'getLevelDetails').and.returnValue({level: {name: 'test', items: [ {id:1}, {id:2}]}});
	    spyOn(LevelService, 'getAllLabelsOfLevel').and.returnValue({});
	    spyOn(viewState, 'getcurClickLevelName').and.returnValue('Phonetic');
	    spyOn(viewState, 'getItemsInSelection').and.returnValue([]);
	    spyOn(ConfigProviderService, 'getLevelDefinition').and.returnValue({ 
	        anagestConfig: { 
	            velocitySsffTrackName: 'velocity', 
	            verticalPosSsffTrackName: 'ssff' , 
	            gestureOnOffsetLabels: ['test'], 
	            maxVelocityOnOffsetLabels: [10], 
	            constrictionPlateauBeginEndLabels: ['test']
	        }
	    });
	    spyOn(ConfigProviderService, 'getSsffTrackConfig').and.returnValue({ name: 'test', columnName: 'test'});
	    spyOn(Ssffdataservice, 'getSampleRateAndStartTimeOfTrack').and.returnValue({ startTime: 0, sampleRate: 20000 });
	    spyOn(Ssffdataservice, 'getColumnOfTrack').and.returnValue([1]);
	    spyOn(AnagestService, 'interactiveFindThresholds').and.returnValue(defer.promise);
	    
	    AnagestService.insertAnagestEvents();
	    
		expect(viewState.getcurClickLevelName).toHaveBeenCalled();    
		expect(viewState.getItemsInSelection).toHaveBeenCalled();    
		expect(ConfigProviderService.getLevelDefinition).toHaveBeenCalled();    
		expect(ConfigProviderService.getSsffTrackConfig).toHaveBeenCalled();   
		expect(Ssffdataservice.getSampleRateAndStartTimeOfTrack).toHaveBeenCalled();   
		expect(Ssffdataservice.getColumnOfTrack).toHaveBeenCalled(); 
		defer.resolve({}); 
		$rootScope.$apply(); 
		expect(AnagestService.interactiveFindThresholds).toHaveBeenCalled(); 
		expect(HistoryService.updateCurChangeObj).toHaveBeenCalled(); 
		expect(HistoryService.addCurChangeObjToUndoStack).toHaveBeenCalled(); 
		expect(LinkService.insertLinksTo).toHaveBeenCalled(); 
  }));
  	
	
	

});