var emulabeller = (function () {
    'use strict';

    var tierInfos = {"tiers": [],  "canvases": []};


    var canvas = document.querySelector('#wave');
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
        tierInfos: tierInfos
    });

    // see if on iPad... if so preload data... just for testing
    var isiPad = navigator.userAgent.match(/iPad/i) !== null;
    // if(isiPad){
        labeller.load('data/msajc003.wav');
        labeller.tgParser.load('data/msajc003.TextGrid');
    // }
    
    
	// initial  launch
    

    $('#fileGetterBtn')[0].addEventListener('change', labeller.fileAPIread, false);

    // hack for hiding inputs of dialogs..
    $("#dialog-messageSh").hide();
    $("#dialog-messageSetLabel").hide();

    // event redirect for Open File Button
    document.querySelector('#fileSelect').addEventListener('click', function(e) {
            // Use the native click() of the file input.
            document.querySelector('#fileGetterBtn').click();
        },
    false);

    // keypress bindings
    document.addEventListener('keypress', function (e) {
        // spacebar
        if(!emulabeller.isModalShowing){

            if (32 == e.keyCode) {
                // SPACEBAR -> play what is in view
                e.preventDefault();
                emulabeller.playPause();
            }
            if (114 == e.keyCode) {
                // R key -> play sel
                emulabeller.playInMode("sel");
            }
            if (102 == e.keyCode) {
                // F key -> play entire file
                emulabeller.playInMode("all");
            }
            if (119 == e.keyCode){
                // W key -> zoom in
                emulabeller.zoomViewPort(1);
            }
            if (115 == e.keyCode){
                // S key -> zoom out 
                emulabeller.zoomViewPort(0);
            }
            if (100 == e.keyCode){
                // D key -> move right
                emulabeller.incrViewP(1);
            }
            if (97 == e.keyCode){
                // A key -> move left
                emulabeller.incrViewP(0);
            }
            if (113 == e.keyCode){
                // Q key -> view all
                emulabeller.setView(-Infinity, Infinity);
            }
            if (101 == e.keyCode){
                // E key -> zoom in to selected segment
                emulabeller.zoomSel();
            }
            if (111 == e.keyCode){
                // O key
                $('#fileGetterBtn').click();
            }
            if (104 == e.keyCode){
                // H key
                emulabeller.showHideTierDial();
            }
            if (99 == e.keyCode){
                // C key
                emulabeller.editLabel();
            }
            if (116 == e.keyCode){
                // T key
                emulabeller.moveSelTierToTop();
            }
            if (13 == e.keyCode){
                // ENTER key
                emulabeller.addSegmentAtSelection();
            }
            console.log(e.keyCode);
        }
    });

    // document.body.addEventListener('dragstart', function(e) {
    //   var a = e.target;
    //   if (a.classList.contains('dragout')) {
    //     e.dataTransfer.setData('DownloadURL', a.dataset.downloadurl);
    //   }
    // }, false);

    // document.body.addEventListener('dragend', function(e) {
    //   var a = e.target;
    //   if (a.classList.contains('dragout')) {
    //     // cleanUp(a);
    //   }
    // }, false);

    // document.addEventListener('keydown', function(e) {
    //   if (e.keyCode == 27) {  // Esc
    //     document.querySelector('details').open = false;
    //   } else if (e.shiftKey && e.keyCode == 191) { // shift + ?
    //     document.querySelector('details').open = true;
    //   }
    // }, false);


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