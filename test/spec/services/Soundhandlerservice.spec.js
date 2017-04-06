'use strict';

describe('Service: Soundhandlerservice', function () {
    var scope;

    // load the controller's module
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    /**
     *
     */
//    it('should extractRelPartOfWav of length 0 = only header', inject(function (Soundhandlerservice) {
//        Soundhandlerservice.wavJSO = parsedWavJSO;
//        var cutWav = Soundhandlerservice.extractRelPartOfWav(0, 0);
//        expect(cutWav.byteLength).toEqual(44);
//    }));

    /**
     *
     */
/*
    it('should not play audio if wav is empty', inject(function (Soundhandlerservice) {
        // TODO: spy on decodeAndPlay function and check that it isn't called
        //spyOn(Soundhandlerservice, 'decodeAndPlay');

        Soundhandlerservice.wavJSO = parsedWavJSO;
        Soundhandlerservice.playFromTo(0,0);
        //expect(Soundhandlerservice.decodeAndPlay).toNotHaveBeenCalled();

    }));
*/

});