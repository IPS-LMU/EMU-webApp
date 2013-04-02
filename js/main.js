var emulabeller = (function () {
    'use strict';

    var tier1canvas = document.querySelector('#tier1'); //SIC create dynamically
    var tier2canvas = document.querySelector('#tier2'); //SIC create dynamically

    var txtGridRep = {"tiersDetails": [
        {"TierName": "Phonetic", "type": "seg", "events": [
             {"label":"H#", "time": 3749  * (44100/20000)}, //SIC resampled to 44100 from audio context
             {"label":"V", "time":  5139  * (44100/20000)},
             {"label":"m", "time":  6804  * (44100/20000)},
             {"label":"V", "time":  8534  * (44100/20000)},
             {"label":"N", "time":  9669  * (44100/20000)},
             {"label":"s", "time":  11339 * (44100/20000)},
             {"label":"t", "time":  11934 * (44100/20000)},
             {"label":"H", "time":  13484 * (44100/20000)},
             {"label":"@:", "time": 14799 * (44100/20000)},
             {"label":"f", "time": 17854  * (44100/20000)},
             {"label":"r", "time": 18999  * (44100/20000)},
             {"label":"E", "time": 20639  * (44100/20000)},
             {"label":"n", "time": 23919  * (44100/20000)},
             {"label":"z", "time": 25789  * (44100/20000)},
             {"label":"S", "time": 28399  * (44100/20000)},
             {"label":"i:", "time": 29264 * (44100/20000)},
             {"label":"w", "time": 30124  * (44100/20000)},
             {"label":"@", "time": 30969  * (44100/20000)},
             {"label":"z", "time": 32689  * (44100/20000)},
             {"label":"k", "time": 33519  * (44100/20000)},
             {"label":"H", "time": 34309  * (44100/20000)},
             {"label":"@", "time": 34829  * (44100/20000)},
             {"label":"n", "time": 35829  * (44100/20000)},
             {"label":"s", "time": 37864  * (44100/20000)},
             {"label":"I", "time": 38909  * (44100/20000)},
             {"label":"d", "time": 39334  * (44100/20000)},
             {"label":"@", "time": 40674  * (44100/20000)},
             {"label":"db", "time": 43004 * (44100/20000)},
             {"label":"j", "time": 44224  * (44100/20000)},
             {"label":"u:", "time": 45674 * (44100/20000)},
             {"label":"dH", "time": 46059 * (44100/20000)},
             {"label":"@", "time": 47239  * (44100/20000)},
             {"label":"f", "time": 48949  * (44100/20000)},
             {"label":"@", "time": 50126  * (44100/20000)},
             {"label":"l", "time": 52089  * (44100/20000)}
        ]},
        {"TierName": "TierTwo(Point)", "type": "point","events": [
            {"label": "x", "time": 64000},
            {"label": "y", "time": 70000}
        ]}],
        "canvases": [tier1canvas, tier2canvas]
    };


    var canvas = document.querySelector('#wave');
    canvas.setAttribute('unselectable');

    var specCanvas = document.querySelector('#spectrogram');
    var scrollCanvas = document.querySelector('#scrollbar');

    var labeller = Object.create(EmuLabeller);

    labeller.init({
        canvas: canvas,
        specCanvas: specCanvas,
        scrollCanvas: scrollCanvas,
        waveColor: 'grey',
        progressColor: 'black',
        loadingColor: 'purple',
        cursorColor: 'red',
        tierInfos: txtGridRep
    });

    labeller.load('data/msajc003.wav');

    //emulabeller.bindDragNDrop();

    document.addEventListener('keypress', function (e) {
        // spacebar
        if (32 == e.keyCode) {
            e.preventDefault();
            emulabeller.playPause();
        }
        if (114 == e.keyCode) {
            emulabeller.playInMode("sel");
        }
        if (102 == e.keyCode) {
            emulabeller.playInMode("all");
        }
        if (119 == e.keyCode){
            emulabeller.zoomViewPort(1);
        }
        if (115 == e.keyCode){
            emulabeller.zoomViewPort(0);
        }
        if (100 == e.keyCode){
            emulabeller.incrViewP(1);
        }
        if (97 == e.keyCode){
            emulabeller.incrViewP(0);
        }
        if (113 == e.keyCode){
            emulabeller.setView(-Infinity, Infinity);
        }
        if (101 == e.keyCode){
            emulabeller.zoomSel();
        }
        //console.log(e.keyCode);
    });

    return labeller;
}());
