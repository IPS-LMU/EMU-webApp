var wavesurfer = (function () {
    'use strict';

    var canvas = document.querySelector('#wave');
    var specCanvas = document.querySelector('#spectrogram');
    var scrollCanvas = document.querySelector('#scrollbar');

    var wavesurfer = Object.create(WaveSurfer);

    wavesurfer.init({
        canvas: canvas,
        specCanvas: specCanvas,
        scrollCanvas: scrollCanvas,
        waveColor: 'grey',
        progressColor: 'black',
        loadingColor: 'purple',
        cursorColor: 'red'
    });

    wavesurfer.load('data/msajc003.wav');

    //wavesurfer.bindDragNDrop();

    document.addEventListener('keypress', function (e) {
        // spacebar
        if (32 == e.keyCode) {
            e.preventDefault();
            wavesurfer.playPause();
        }
        if (119 == e.keyCode){
            wavesurfer.zoomViewPort(1);

        }
        if (115 == e.keyCode){
            wavesurfer.zoomViewPort(0);
        }
        if (100 == e.keyCode){
            wavesurfer.incrViewP(1);
        }
        if (97 == e.keyCode){
            wavesurfer.incrViewP(0);
        }
        //console.log(e.keyCode);
    });

    return wavesurfer;
}());
