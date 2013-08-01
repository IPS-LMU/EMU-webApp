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
    var cans = document.getElementById('cans');
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
        selectLineColor: 'black',
        loadingColor: 'purple',
        cursorColor: 'red',
        selectAreaColor: 'rgba(22, 22, 22, 0.25)',
        tierInfos: tierInfos,
        draggableBar: draggableBar,
        timeline: timeline,
        tiers: tiers,
        cans: cans,
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


    $(document).bind("keydown", function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if( code== 8 && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME ){ // 8 == backspace
            e.preventDefault();
            if(emulabeller.tierHandler.getSelectedTierType()=="seg" || emulabeller.tierHandler.getSelectedTierType()=="point")
                emulabeller.tierHandler.deleteSelected();
            else 
                alert("Bitte markieren Sie zuerst ein oder mehrere Segmente!"); 
        }
        if( code == 27 && emulabeller.internalMode == labeller.EDITMODE.LABEL_RENAME ){ // 27 == escape
            e.preventDefault();
            emulabeller.tierHandler.removeLabelDoubleClick();
        }
        if( code == 16 ){ // 16 == ???
            emulabeller.tierHandler.history();
            e.preventDefault();
        }
        if( code == 18 ){ // 18 == ???
            emulabeller.tierHandler.history();
            e.preventDefault();
        }   
        if( code == 46 && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME ){ // 46 == entfernen
            emulabeller.tierHandler.deleteBorder();
            e.preventDefault();
        }            
        if( code == 13 && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME ){ // 13 == enter
            emulabeller.tierHandler.addSegmentAtSelection();
            e.preventDefault();
        }     
        if( code == 87 && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME) {  // 87 == w
            emulabeller.zoomViewPort(1);
            e.preventDefault();
        }    
        if( code == 83 && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME) {  // 83 == s
            emulabeller.zoomViewPort(0);
            e.preventDefault();
        }   
        if( code == 65 && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME) {  // 65 == a
            emulabeller.shiftViewP(0);
            e.preventDefault();
        }  
        if( code == 68 && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME) {  // 68 == d
            emulabeller.shiftViewP(1);
            e.preventDefault();
        }
                    
        if (!emulabeller.isModalShowing && emulabeller.internalMode != labeller.EDITMODE.LABEL_RENAME) {

            if (32 == code) {
                // SPACEBAR -> play what is in view
                e.preventDefault();
                emulabeller.playPauseInView();
            }
            if (114 == code) {
                // R key -> play sel
                emulabeller.playInMode("sel");
            }
            if (102 == code) {
                // F key -> play entire file
                emulabeller.playInMode("all");
            }
            if (113 == code) {
                // Q key -> view all
                emulabeller.setView(-Infinity, Infinity);
            }
            if (101 == code) {
                // E key -> zoom in to selected segment
                emulabeller.zoomSel();
            }
            if (116 == code) {
                // T key -> snap to top for selected segment
                emulabeller.snapSelectedSegmentToNearestTop();
            }
            if (98 == code) {
                // T key -> snap to bottom for selected segment
                emulabeller.snapSelectedSegmentToNearestBottom();
            }
            if (111 == code) {
                // O key
                if (emulabeller.externalMode == labeller.USAGEMODE.STANDALONE)
                    $('#fileGetterBtn').click();
                if (emulabeller.externalMode == labeller.USAGEMODE.SERVER)
                    emulabeller.openSubmenu();
            }
            if (99 == code) {
                // C key
                emulabeller.editLabel();
            }
            if (110 == code) {
                // N key
                emulabeller.tierHandler.renameTier();
            }

            if (26 == code) {
                emulabeller.tierHandler.goBackHistory();
            }

            console.log(code);
        }        
    });


    // touch events 
    var element = document.getElementById('timeline');
    var hammertime = Hammer(element).on("touch", function(event) {
        console.log('stop touching me says the timeline');
    });

    var hammertime = Hammer(element).on("doubletap", function(event) {
        // alert('stop touching me says the timeline');
        emulabeller.zoomSel();
    });

    return labeller;
}());