var emulabeller = (function() {
    'use strict';

    // autoload wav file and TextGrid for testing
    // will only work if running on server...
    var autoLoad = true;


    var tierInfos = {
        "tiers": [],
        "canvases": []
    };

    var osciCanvas = document.querySelector('#wave');
    var specCanvas = document.querySelector('#spectrogram');
    var scrollCanvas = document.querySelector('#scrollbar');
    var draggableBar = document.querySelector('#resizer');
    var timeline = document.querySelector('#timeline');
    var tiers = document.querySelector('#tiers');
    var fileSelect = document.querySelector('#fileSelect');
    var showLeftPush = document.getElementById('serverSelect');
    var spectroworker = document.querySelector('#spectroworker');
    var labeller = Object.create(EmuLabeller);


    labeller.init({
        osciCanvas: osciCanvas,
        specCanvas: specCanvas,
        scrollCanvas: scrollCanvas,
        waveColor: 'white',
        progressColor: 'grey',
        loadingColor: 'purple',
        cursorColor: 'red',
        tierInfos: tierInfos,
        draggableBar: draggableBar,
        timeline: timeline,
        tiers: tiers,
        fileSelect: fileSelect,
        showLeftPush: showLeftPush,
        spectroworker: spectroworker,
        font: '12px Verdana',
        internalCanvasWidth: '2048', // in pixel
        internalCanvasHeightSmall: '128', // in pixel -> Cans
        internalCanvasHeightBig: '64', // in pixel -> Wave & Spectro
        mode: 'standalone' // or standalone
    });


    // see if on iPad... if so preload data... just for testing
    var isiPad = navigator.userAgent.match(/iPad/i) !== null;
    if (isiPad || autoLoad) {
        labeller.iohandler.xhrLoad('data/msajc003.TextGrid', 3);
        labeller.load('data/msajc003.wav');
    }


    // initial  launch

    $('#fileGetterBtn')[0].addEventListener('change', labeller.fileAPIread, false);

    // hack for hiding inputs of dialogs.. SIC!!!
    $("#dialog-messageSh").hide();
    $("#dialog-messageSetLabel").hide();
    $('#specSettings').click(function() {
        var isOpen = $('#specDialog').dialog('isOpen');
        if (!isOpen) {
            $('#specDialog').dialog('open');
            $("#specDialog").dialog('moveToTop');
            isOpen = true;
        } else {
            $('#specDialog').dialog('close');
            isOpen = false;
        }
    });
    

    // event redirect for Open File Button
    document.querySelector('#fileSelect').addEventListener('click', function(e) {
            // Use the native click() of the file input.
            document.querySelector('#fileGetterBtn').click();
        },
        false);


    document.addEventListener('keyup', function(e) {
        // spacebar
        if (!emulabeller.isModalShowing && emulabeller.internalMode == labeller.EDITMODE.LABEL_RENAME) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (27 == code) {
                emulabeller.tierHandler.removeLabelDoubleClick();
            }
        }
    });

    // keypress bindings
    document.addEventListener('keypress', function(e) {
        // spacebar

        if (!emulabeller.isModalShowing && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME) {

            if (32 == e.keyCode) {
                // SPACEBAR -> play what is in view
                e.preventDefault();
                emulabeller.playPauseInView();
            }
            if (114 == e.keyCode) {
                // R key -> play sel
                emulabeller.playInMode("sel");
            }
            if (102 == e.keyCode) {
                // F key -> play entire file
                emulabeller.playInMode("all");
            }
            if (119 == e.keyCode) {
                // W key -> zoom in
                emulabeller.zoomViewPort(1);
            }
            if (115 == e.keyCode) {
                // S key -> zoom out 
                emulabeller.zoomViewPort(0);
            }
            if (100 == e.keyCode) {
                // D key -> shift right
                emulabeller.shiftViewP(1);
            }
            if (97 == e.keyCode) {
                // A key -> shift left
                emulabeller.shiftViewP(0);
            }
            if (113 == e.keyCode) {
                // Q key -> view all
                emulabeller.setView(-Infinity, Infinity);
            }
            if (101 == e.keyCode) {
                // E key -> zoom in to selected segment
                emulabeller.zoomSel();
            }
            if (116 == e.keyCode) {
                // T key -> snap to top for selected segment
                emulabeller.snapSelectedSegmentToNearestTop();
            }
            if (98 == e.keyCode) {
                // T key -> snap to bottom for selected segment
                emulabeller.snapSelectedSegmentToNearestBottom();
            }
            if (111 == e.keyCode) {
                // O key
                if (emulabeller.externalMode == labeller.USAGEMODE.STANDALONE)
                    $('#fileGetterBtn').click();
                if (emulabeller.externalMode == labeller.USAGEMODE.SERVER)
                    emulabeller.openSubmenu();
            }
            if (99 == e.keyCode) {
                // C key
                emulabeller.editLabel();
            }
            if (13 == e.keyCode) {
                // ENTER key
                emulabeller.addSegmentAtSelection();
            }
            
            if( 26 == e.keyCode ){
                emulabeller.tierHandler.goBackHistory();
            }    
            
            console.log(e.keyCode);
        }
    });

    return labeller;
}());