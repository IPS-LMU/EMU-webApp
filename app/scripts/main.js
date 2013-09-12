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
        tierInfos: tierInfos,
        draggableBar: draggableBar,
        timeline: timeline,
        tiers: tiers,
        cans: cans,
        fileSelect: fileSelect,
        showLeftPush: showLeftPush,
        spectroworker: spectroworker,
        internalCanvasWidth: '2048', // in pixel
        internalCanvasHeightSmall: '128', // in pixel -> Cans
        internalCanvasHeightBig: '64', // in pixel -> Wave & Spectro
        mode: 'standalone', // server or standalone
        initLoad: autoLoad
    });


    // see if on iPad... if so preload data... just for testing
    var isiPad = navigator.userAgent.match(/iPad/i) !== null;
    if (isiPad || autoLoad) {
        labeller.iohandler.xhrLoad('testData/msajc003.wav', 'arraybuffer', 0);
        labeller.iohandler.xhrLoad('testData/msajc003.TextGrid', 'text', 3);
    }


    // initial  launch

    $('#fileGetterBtn')[0].addEventListener('change', labeller.fileAPIread, false);



    // event redirect for Open File Button
    document.querySelector('#fileSelect').addEventListener('click', function(e) {
            // Use the native click() of the file input.
            document.querySelector('#fileGetterBtn').click();
        },
        false);


    $(document).bind("keydown", function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        
        if (code == 27) { // 27 == escape
            emulabeller.tierHandler.removeLabelDoubleClick();
            e.preventDefault();
        }       
        if (code == 8) { // 8 == backspace
            if(!emulabeller.inEditingMode()) {
                e.preventDefault();
                if (emulabeller.tierHandler.getSelectedTierType() == "seg" ||  emulabeller.tierHandler.getSelectedTierType() == "point")
                    emulabeller.tierHandler.deleteSelected();
                else {
                    emulabeller.alertUser("Error", "Please mark one of more segments first!");
                }
            }
        }   
        if (code == 9) { // 9 == tab
            e.preventDefault();
            if (emulabeller.internalMode != labeller.EDITMODE.MODAL && emulabeller.inEditingMode()) {
                emulabeller.tierHandler.saveLabelName(this);
                emulabeller.tierHandler.removeLabelDoubleClick();
            }
            if (emulabeller.internalMode != labeller.EDITMODE.MODAL && !e.shiftKey) {
                 emulabeller.tierHandler.selectPrevNextEvent(false);
            } else if (emulabeller.internalMode != labeller.EDITMODE.MODAL) {
                emulabeller.tierHandler.selectPrevNextEvent(true);
            }
        }
        if (code == 13) { // 13 == enter	
            if (emulabeller.internalMode == labeller.EDITMODE.LABEL_RENAME) {
                emulabeller.tierHandler.saveLabelName(this);
                emulabeller.tierHandler.removeLabelDoubleClick();
                emulabeller.internalMode = labeller.EDITMODE.STANDARD;
            } 
            else if (emulabeller.internalMode == labeller.EDITMODE.TIER_RENAME) {
                emulabeller.tierHandler.saveTierName(this);
                emulabeller.tierHandler.removeLabelDoubleClick();
                emulabeller.internalMode = labeller.EDITMODE.STANDARD;
            } 
            else {
                emulabeller.tierHandler.addSegmentAtSelection();
            }
            e.preventDefault();
        }              
        if(emulabeller.keyBindingAllowed(code)) {

        if (code == 16) { // 16 == ???
            emulabeller.tierHandler.history();
            e.preventDefault();
        }
        if (code == 18) { // 18 == ???
            emulabeller.tierHandler.history();
            e.preventDefault();
        }

        if (code == 32) { // 32 == SPACE
            emulabeller.playPauseInView();
            e.preventDefault();
        }
        if (code == 38) { // 38 == UP ARROW
            emulabeller.tierHandler.moveSelectedTierUpDown(true);
            emulabeller.internalMode == emulabeller.EDITMODE.STANDARD;
            e.preventDefault();
        }
        if (code == 40) { // 40 == DOWN ARROW
            emulabeller.tierHandler.moveSelectedTierUpDown(false);
            emulabeller.internalMode == emulabeller.EDITMODE.STANDARD;
            e.preventDefault();
        }
        if (code == 46) { // 46 == entfernen
            emulabeller.tierHandler.deleteBorder();
            e.preventDefault();
        }
        if (code == 65) { // 65 == a
            emulabeller.shiftViewP(0);
            e.preventDefault();
        }
        if (code == 66) { // 66 == b
            emulabeller.tierHandler.snapSelectedBoundaryToNearestTopOrBottom(false);
            e.preventDefault();
        }
        if (code == 67) { // 67 == c
            emulabeller.tierHandler.moveSelctionToCurMouseBoundary();
            e.preventDefault();
        }
        if (code == 68) { // 68 == d
            emulabeller.shiftViewP(1);
            e.preventDefault();
        }
        if (code == 69) { // 69 == e
            emulabeller.zoomSel();
            e.preventDefault();
        }
        if (code == 70) { // 70 == f
            emulabeller.playInMode("all");
            e.preventDefault();
        }
        if (code == 71) { // 70 == g
            emulabeller.tierHandler.selectSegmentsUnderSelection();
            e.preventDefault();
        }
        if (code == 78) { // 78 == n
            emulabeller.tierHandler.renameTier();
            e.preventDefault();
        }
        if (code == 79) { // 79 == o
            if (emulabeller.externalMode == labeller.USAGEMODE.STANDALONE)
                $('#fileGetterBtn').click();
            if (emulabeller.externalMode == labeller.USAGEMODE.SERVER)
                emulabeller.openSubmenu();
            e.preventDefault();
        }
        if (code == 81) { // 81 == q
            if (!e.metaKey) {
                emulabeller.setView(-Infinity, Infinity);
                e.preventDefault();
            }
        }
        if (code == 82) { // 82 == r
            if (!e.metaKey) {
                emulabeller.playInMode("sel");
                e.preventDefault();
            }
        }
        if (code == 83) { // 83 == s
            emulabeller.zoomViewPort(0);
            e.preventDefault();
        }
        if (code == 84) { // 84 == t
            emulabeller.tierHandler.snapSelectedBoundaryToNearestTopOrBottom(true);
            e.preventDefault();
        }
        if (code == 87) { // 87 == w
            if (!e.metaKey) {
                emulabeller.zoomViewPort(1);
                e.preventDefault();
            }
        }
        if (code == 88) { // 88 == x
            emulabeller.tierHandler.snapToNearestZeroCrossing();
            e.preventDefault();
        }
        if (code == 90) { // 90 == z
            emulabeller.tierHandler.goBackHistory();
            e.preventDefault();
        }
        if (code == 187) { // 187 == +
            emulabeller.tierHandler.addRemoveTimeToSelectedSegs(true, false);
            e.preventDefault();
        }
        if (code == 189) { // 187 == -
            if (!e.shiftKey) {
                emulabeller.tierHandler.addRemoveTimeToSelectedSegs(false, false);
            } else {
                emulabeller.tierHandler.addRemoveTimeToSelectedSegs(false, true);
            }
            e.preventDefault();
        }
        if (code == 221) { // 221 == * no idea why this has a separate id it is shift+187
            emulabeller.tierHandler.addRemoveTimeToSelectedSegs(true, true);
            e.preventDefault();
        }
        console.log(code);
        }
        
    });


    // touch events
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        // alert("On mobile device!!!! Lots of things not working yet...");
        var element = document.getElementById('timeline');
        var hammertime = Hammer(element).on("touch", function(event) {
            // console.log('stop touching me says the timeline');
        });
        hammertime = Hammer(element).on("doubletap", function(event) {
            // alert('stop touching me says the timeline');
            emulabeller.zoomSel();
        });
        hammertime = Hammer(element).on("dragleft", function(event) {
            emulabeller.shiftViewP(1);
        });
        hammertime = Hammer(element).on("dragright", function(event) {
            emulabeller.shiftViewP(0);
        });
        hammertime = Hammer(element).on("dragdown", function(event) {
            emulabeller.zoomViewPort(1);
            event.preventDefault();
        });
        hammertime = Hammer(element).on("dragup", function(event) {
            emulabeller.zoomViewPort(0);
        });
    }

    // app cache update
    // Check if a new cache is available on page load.
    // window.addEventListener('load', function(e) {

    //     window.applicationCache.addEventListener('updateready', function(e) {
    //         if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    //             // Browser downloaded a new app cache.
    //             // Swap it in and reload the page to get the new hotness.
    //             window.applicationCache.swapCache();

    //             console.log("#### UPDATING TO LATEST VERSION!!!");
    //             window.location.reload();
    //         } else {
    //             // Manifest didn't changed. Nothing new to server.
    //             console.log("#### applicationCache manifest not changed!!!");
    //         }
    //     }, false);

    // }, false);

    labeller.start();
    return labeller;
}());