var emulabeller = (function () {
    'use strict';

    var tier1canvas = $('#tierOld1')[0]; //SIC create dynamically
    var tier2canvas = $('#tierOld2')[0]; //SIC create dynamically

    // var labFileRep = {"tiers": [
    //     {"TierName": "TierOld1", "type": "seg", "events": [
    //          {"label":"H#", "time": 0.187498  * 44100}, //SIC resampled to 44100 from audio context
    //          {"label":"V", "time":  0.256994  * 44100},
    //          {"label":"m", "time":  0.340238 * 44100},
    //          {"label":"V", "time":  0.426743  * 44100},
    //          {"label":"N", "time":  0.483490  * 44100},
    //          {"label":"s", "time":  0.566994 * 44100},
    //          {"label":"t", "time":  0.596742 * 44100},
    //          {"label":"H", "time":  0.674237 * 44100},
    //          {"label":"@:", "time": 0.739994 * 44100},
    //          {"label":"f", "time": 0.892734  * 44100},
    //          {"label":"r", "time": 0.949994  * 44100},
    //          {"label":"E", "time": 1.031989  * 44100},
    //          {"label":"n", "time": 1.195988  * 44100},
    //          {"label":"z", "time": 1.289494  * 44100},
    //          {"label":"S", "time": 1.419986  * 44100},
    //          {"label":"i:", "time": 1.463242 * 44100},
    //          {"label":"w", "time": 1.506239  * 44100},
    //          {"label":"@", "time": 1.548486  * 44100},
    //          {"label":"z", "time": 1.634493  * 44100},
    //          {"label":"k", "time": 1.675991  * 44100},
    //          {"label":"H", "time": 1.715488  * 44100},
    //          {"label":"@", "time": 1.741497  * 44100},
    //          {"label":"n", "time": 1.791494  * 44100},
    //          {"label":"s", "time": 1.893237  * 44100},
    //          {"label":"I", "time": 1.945495  * 44100},
    //          {"label":"d", "time": 1.966743  * 44100},
    //          {"label":"@", "time": 2.033739  * 44100},
    //          {"label":"db", "time": 2.150242 * 44100},
    //          {"label":"j", "time": 2.211239  * 44100},
    //          {"label":"u:", "time": 2.283744 * 44100},
    //          {"label":"dH", "time": 2.302993 * 44100},
    //          {"label":"@", "time": 2.361989  * 44100},
    //          {"label":"f", "time": 2.447484  * 44100},
    //          {"label":"@", "time": 2.506316  * 44100},
    //          {"label":"l", "time": 2.604489  * 44100}
    //     ]},
    //     {"TierName": "TierOld2(point)", "type": "point","events": [
    //         {"label": "x", "time": 64000},
    //         {"label": "y", "time": 70000}
    //     ]}],
    //     "canvases": [tier1canvas, tier2canvas]
    // };


    var labFileRep = {"tiers": [],  "canvases": []};



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
        tierInfos: labFileRep
    });

    labeller.load('data/msajc003.wav');



    document.getElementById('fileGetterBtn').addEventListener('change', labeller.fileAPIread, false);


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


// $(window).resize(function () {
//     var w = $(window).width(),
//         scale = 0.8; // TODO: calculate offset left and right

//     $('#wave').css('width', (w*scale));
//     $('#spectrogram').css('width', (w*scale));
//     $('#tier1').css('width', (w*scale));
//     $('#tier2').css('width', (w*scale));
//     $('#scrollbar').css('width', (w*scale));

// }).resize();