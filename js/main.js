var emulabeller = (function () {
    'use strict';

    // autoload wav file and TextGrid for testing
    // will only work if running on server...
    var autoLoad = true;

    var tierInfos = {"tiers": [],  "canvases": []};

    var canvas = document.querySelector('#wave');
    var specCanvas = document.querySelector('#spectrogram');
    var scrollCanvas = document.querySelector('#scrollbar');
    var draggableBar = document.querySelector('#dragBar');
    var timeline = document.querySelector('#timeline');
    var tiers = document.querySelector('#tiers');
    var labeller = Object.create(EmuLabeller);

    labeller.init({
        canvas: canvas,
        specCanvas: specCanvas,
        scrollCanvas: scrollCanvas,
        waveColor: 'white',
        progressColor: 'black',
        loadingColor: 'purple',
        cursorColor: 'red',
        tierInfos: tierInfos,
        draggableBar : draggableBar,
        timeline : timeline,
        tiers : tiers,
        internalCanvasWidth : '1560',     // in pixel
        internalCanvasHeightSmall : '64', // in pixel -> Cans
        internalCanvasHeightBig : '128',   // in pixel -> Wave & Spectro
        mode: 'standalone'
    });


    // see if on iPad... if so preload data... just for testing
    var isiPad = navigator.userAgent.match(/iPad/i) !== null;
     if(isiPad || autoLoad){
        labeller.load('data/msajc003.wav');
        labeller.tgParser.load('data/msajc003.TextGrid');
     }
    
    
	// initial  launch


    $('#fileGetterBtn')[0].addEventListener('change', labeller.fileAPIread, false);

    // hack for hiding inputs of dialogs.. SIC!!!
    $("#dialog-messageSh").hide();
    $("#dialog-messageSetLabel").hide();
    $('#specSettings').click(function() {
        var isOpen = $('#specDialog').dialog('isOpen');
        if(!isOpen) {
            $('#specDialog').dialog('open');
            $("#specDialog").dialog('moveToTop'); 
            isOpen = true;
        }
        else {
            $('#specDialog').dialog('close');
            isOpen = false;
        }
    });
    $("#specDialog").dialog({
        bgiframe: true,
        autoOpen: false,
        width: 500,
        closeOnEscape: true,
        show: 'fade',
        hide: 'fade',
        position: 'center',
        stack: false,
        buttons: {
            OK: function() {
                var signalline = document.querySelector('#hero');
                var nN = $("#windowLength").val();
                var nvrf = $("#viewrange_from").val();
                var nvrt = $("#viewrange_to").val();
                var ndr = $("#dynamicRange").val();
                var nwf = $("#windowFunction").val();
                //var newSpectroHeight = $("#spectroHeight").val();
                if(isNaN(nN) || isNaN(nvrf) || isNaN(nvrt)|| isNaN(ndr)) {
                    alert("Please enter valid numbers !");
                }
                else {
                	
                    //canvas.style.height = newSpectroHeight+"px";
                    //specCanvas.style.height = newSpectroHeight+"px";
                    //signalline.style.marginTop = ((2*newSpectroHeight)+20)+"px";
                    
                    labeller.spectogramDrawer.N = parseInt(nN,10);
                    labeller.spectogramDrawer.freq = parseInt(nvrt,10);
                    labeller.spectogramDrawer.freq_lower = parseInt(nvrf,10);
                    labeller.spectogramDrawer.dynRangeInDB = parseInt(ndr,10);
                    labeller.spectogramDrawer.windowFunction = parseInt(nwf,10);
                    labeller.spectogramDrawer.clearImageCache();
                    labeller.spectogramDrawer.killSpectroRenderingThread();
                    labeller.spectogramDrawer.drawImage(labeller.backend.currentBuffer,labeller.viewPort);  
                    labeller.spectogramDrawer.progress(labeller.backend.getPlayedPercents(), labeller.viewPort, labeller.backend.currentBuffer.length);
                    $(this).dialog('close');
                }
    		  	
            },
            Cancel: function() {
                $(this).dialog('close');
            }
         }
    });       

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

    return labeller;
}());
