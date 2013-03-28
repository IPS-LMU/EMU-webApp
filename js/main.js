var wavesurfer = (function () {
    'use strict';

    var tier1canvas = document.querySelector('#tier1'); //SIC create dynamically
    var tier2canvas = document.querySelector('#tier2'); //SIC create dynamically

    var txtGridRep = {"tiersDetails": [
        {"TierName": "TierOne(Segment)", "type": "seg", "events": [
            {"label": "@", "start": 20000, "end": 40000},
            {"label": "b", "start": 40000, "end": 100000}
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

    var emulabeller = Object.create(EmuLabeller);

    emulabeller.init({
        canvas: canvas,
        specCanvas: specCanvas,
        scrollCanvas: scrollCanvas,
        waveColor: 'grey',
        progressColor: 'black',
        loadingColor: 'purple',
        cursorColor: 'red',
        tierInfos: txtGridRep
    });

    emulabeller.load('data/msajc010.wav');

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

    return emulabeller;
}());
