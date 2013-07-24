/**
 * Main Object of emuLVC
 * it acts as the controller of the web app
 * and primarily delegates methods to the drawer/audio-backend and
 * several other components
 */
var EmuLabeller = {

    /**
     * init function has to be called on object
     * to instantiate all its needed objects
     * @param params is an object containing multiple
     * init vars (see main.js for details)
     */
    init: function(params) {
        'use strict';
        var my = this;

        // define external Application mode Server or Standalone
        my.USAGEMODE = {

            // show server menu, load external ressources
            SERVER: {
                value: 0,
                name: "Server"
            },

            // show file menu, load local ressources
            STANDALONE: {
                value: 1,
                name: "Standalone"
            },

            // alert an error if not configures in main.js
            NOT_CONFIGURED: {
                value: 2,
                name: "NotConfigured"
            }
        };

        // define internal Applications Modes that may not interfere
        my.EDITMODE = {
            // EDITMODE at the beginning
            STANDARD: {
                value: 0,
                name: "StandardMode"
            }, // standard key bindings form main.js

            // EDITMODE when editing tiers
            LABEL_RENAME: {
                value: 1,
                name: "LabelRenameMode"
            }, // no keybindings exept enter -> save

            // EDITMODE when editing tiers
            LABEL_MOVE: {
                value: 2,
                name: "LabelRenameMode"
            }, // no keybindings exept enter -> save

            // when draging in a tier / multiple tiers
            LABEL_RESIZE: {
                value: 3,
                name: "DragingTierMode"
            },

            // when draging in the timeline (wave & spectro)
            DRAGING_TIMELINE: {
                value: 4,
                name: "DragingTimelineMode"
            },

            // when draging in the minimap
            DRAGING_MINIMAP: {
                value: 5,
                name: "DragingMinimapMode"
            },

            // when draging the timeline resize bar
            DRAGING_BAR: {
                value: 6,
                name: "DragingBarMode"
            },

            // when draging the timeline resize bar
            DRAGING_TIER: {
                value: 7,
                name: "DragingTierMode"
            }
        };

        // set internal & external Modes

        // internal standard at the beginning
        this.internalMode = my.EDITMODE.STANDARD;

        // default is not configured
        this.externalMode = my.USAGEMODE.NOT_CONFIGURED;

        // if parameter in main.js is set to server
        if (params.mode === "server") {
            this.externalMode = my.USAGEMODE.SERVER;
        }

        // if parameter in main.js is set to standalone     
        if (params.mode === "standalone") {
            this.externalMode = my.USAGEMODE.STANDALONE;
        }


        // set main.js parameters
        this.fileSelect = params.fileSelect;
        this.menuLeft = params.menuLeft;
        this.menuMain = params.menuMain;
        this.draggableBar = params.draggableBar;
        this.timeline = params.timeline;
        this.tiers = params.tiers;
        this.showLeftPush = params.showLeftPush;
        this.osciCanvas = params.osciCanvas;


        // Object Classes
        // Viewport
        this.viewPort = Object.create(EmuLabeller.ViewPort);

        // Backed
        this.backend = Object.create(EmuLabeller.WebAudio);
        this.backend.init(params);

        // Drawer
        this.drawer = Object.create(EmuLabeller.Drawer);
        this.drawer.init(params);


        // Parser
        this.labParser = Object.create(EmuLabeller.LabFileParser);
        // this.tgParser = Object.create(EmuLabeller.TextGridParser);

        // IOhandler
        this.iohandler = Object.create(EmuLabeller.IOhandler);
        this.iohandler.init(44100, this.externalMode);


        // ssff Parser
        this.ssffParser = Object.create(EmuLabeller.SSFFparser);
        this.ssffParser.init();

        // json validator
        this.JSONval = Object.create(EmuLabeller.JSONvalidator);
        this.JSONval.init();

        // json validator
        this.tierHandler = Object.create(EmuLabeller.tierHandler);
        this.tierHandler.init(params);


        // other used variables
        this.subMenuOpen = false;

        this.dragingStart = 0;
        this.resizeTierStart = 0;
        this.relativeY = 0;
        this.newFileType = -1; // 0 = wav, 1 = lab, 2 = F0
        this.playMode = "vP"; // can be "vP", "sel" or "all"
        this.clickedOn = 0;
        this.selectedSegments = [];
        this.lastX = 0;

        // infos filled by ssff/lab/textgrid parsers
        this.ssffInfos = {
            data: [],
            canvases: []
        };

        // Initial Usage Mode Configuration

        switch (my.externalMode) {
            case my.USAGEMODE.STANDALONE:
                my.showLeftPush.style.display = "none";
                break;
            case my.USAGEMODE.SERVER:
                my.fileSelect.style.display = "none";
                break;
            default:
                alert("Please specify Usage mode 'server' or 'standalone' in main.js !");
                my.fileSelect.style.display = "none";
                my.showLeftPush.style.display = "none";
                break;
        }

        // bind progress callback of audio-backend
        this.backend.bindUpdate(function() {
            if (!my.backend.isPaused()) my.onAudioProcess();
        });

        // All left mouse down Functions  
        document.addEventListener('mousedown', function(e) {
            if (null != my.getElement(e))
                my.clickedOn = my.getElement(e).id;
            switch (my.clickedOn) {
                case params.showLeftPush.id:
                    my.openSubmenu();
                    break;

                case "cmd_addTierSeg":
                    my.tierHandler.addTier();
                    break;

                case "cmd_addTierPoint":
                    my.tierHandler.addTier(true);
                    break;

                case "cmd_removeTier":
                case "cmd_showHideTier":
                    my.tierHandler.showHideTierDial();
                    break;

                case "cmd_download":
                    my.prepDownload();
                    break;

                case "cmd_download":
                    my.prepDownload();
                    break;

                case "cmd_viewZoomAll":
                    my.setView(-Infinity, Infinity);
                    break;

                case "cmd_viewZoomIn":
                    my.zoomViewPort(1);
                    break;

                case "cmd_viewZoomOut":
                    my.zoomViewPort(0);
                    break;

                case "cmd_viewMoveLeft":
                    my.shiftViewP(0);
                    break;

                case "cmd_viewMoveRight":
                    my.shiftViewP(1);
                    break;

                case "cmd_viewZoomSelect":
                    my.zoomSel();
                    break;

                case "cmd_playPause":
                    my.playPause();
                    break;

                case "cmd_playSelected":
                    my.playInMode('sel');
                    break;

                case "cmd_playAll":
                    my.playInMode('all');
                    break;

                case "cmd_changeLabel":
                    my.editLabel();
                    break;

                case "cmd_dropBoxOpen":
                    my.iohandler.dropBoxOpen();
                    break;

                case params.scrollCanvas.id:
                    my.internalMode = my.EDITMODE.DRAGING_MINIMAP;
                    my.removeLabelDoubleClick();
                    var bL = my.backend.currentBuffer.length;
                    var posInB = my.getX(e) * bL;
                    var len = (my.viewPort.eS - my.viewPort.sS);
                    my.setView(posInB - len / 2, posInB + len / 2);
                    break;

                case params.osciCanvas.id:
                case params.specCanvas.id:
                    my.internalMode = my.EDITMODE.DRAGING_TIMELINE;
                    my.viewPort.selectS = my.viewPort.sS + (my.viewPort.eS - my.viewPort.sS) * my.getX(e);
                    my.viewPort.selectE = my.viewPort.selectS;
                    my.drawer.uiDrawUpdate();
                    break;

                case params.draggableBar.id:
                    my.internalMode = my.EDITMODE.DRAGING_BAR;
                    my.dragingStartY = event.clientY;
                    my.offsetTimeline = my.timeline.offsetHeight;
                    my.offsetTiers = my.tiers.offsetHeight;
                    break;
            }
        });

        // All mouse up Functions  
        document.addEventListener('mouseup', function(e) {
            if (my.internalMode == my.EDITMODE.DRAGING_TIMELINE) {
                my.viewPort.selectE = my.viewPort.sS + (my.viewPort.eS - my.viewPort.sS) * my.getX(e);
                my.drawer.uiDrawUpdate();
            }

            if (my.internalMode == my.EDITMODE.DRAGING_BAR) {
                my.dragingStartY = event.clientY;
                my.offsetTimeline = my.timeline.offsetHeight;
                my.offsetTiers = my.tiers.offsetHeight;
            }

            if (my.internalMode == my.EDITMODE.DRAGING_MINIMAP) {
                var bL = my.backend.currentBuffer.length;
                var posInB = my.getX(e) * bL;
                var len = (my.viewPort.eS - my.viewPort.sS);
                my.setView(posInB - len / 2, posInB + len / 2);
            }


        });

        // All mouse move Functions  
        document.addEventListener('mousemove', function(e) {
            if (e.which == 1) { // if left mouse button is pressed
                if (my.internalMode == my.EDITMODE.DRAGING_TIMELINE) {
                    my.viewPort.selectE = my.viewPort.sS + (my.viewPort.eS - my.viewPort.sS) * my.getX(e);
                    my.drawer.uiDrawUpdate();
                }
                if (my.internalMode == my.EDITMODE.DRAGING_MINIMAP) {
                    var bL = my.backend.currentBuffer.length;
                    var posInB = my.getX(e) * bL;
                    var len = (my.viewPort.eS - my.viewPort.sS);
                    my.setView(posInB - len / 2, posInB + len / 2);
                    my.drawer.uiDrawUpdate();
                }
                if (my.internalMode == my.EDITMODE.DRAGING_BAR) {
                    var diff_Y = event.clientY - my.dragingStartY;
                    var now = ($('#spacer').height() + Math.floor(Math.floor(diff_Y) * 1.12)) + "px";
                    $('#wave').css("height", "+=" + diff_Y / 2 + "px");
                    $('#spectrogram').css("height", "+=" + diff_Y / 2 + "px");
                    $('#spacer').height(now);
                    my.dragingStartY = event.clientY;
                }
            } else
                my.internalMode == my.EDITMODE.STANDARD;

            var curSample;

            // if (my.countSelected(my.viewPort.selTier) > 0) {

            // if (e.shiftKey) {
            //     my.internalMode = my.EDITMODE.LABEL_MOVE;
            //     curSample = my.viewPort.sS + (my.viewPort.eS - my.viewPort.sS) * my.getX(e);
            //     if (my.viewPort.selectedSegments[my.viewPort.selTier][my.viewPort.selBoundaries[0]] != my.viewPort.selectedSegments[my.viewPort.selTier][my.viewPort.selBoundaries[0] + 1]) {
            //         my.tierHandler.tierInfos.tiers[my.viewPort.selTier].events[my.viewPort.selBoundaries[0]].time = curSample;
            //         var leftSide = true;
            //         if (Math.abs(my.viewPort.selectS - curSample) > Math.abs(my.viewPort.selectE - curSample))
            //             leftSide = false;
            //         if (leftSide)
            //             my.viewPort.selectS = curSample;
            //         else
            //             my.viewPort.selectE = curSample;

            //         my.drawer.uiDrawUpdate(my.viewPort, my.backend.currentBuffer);
            //     }
            // }
            // } else 
            if (e.shiftKey) {
                my.internalMode = my.EDITMODE.LABEL_MOVE;
                curSample = my.viewPort.sS + (my.viewPort.eS - my.viewPort.sS) * (my.getX(e));
                my.tierHandler.moveBoundary(curSample);
                my.viewPort.selectS = curSample;
                my.viewPort.selectE = curSample;
                // my.drawer.uiAllTierDrawUpdate(my.viewPort, my.tierHandler.tierInfos);
                my.drawer.uiDrawUpdate();
            }
            // } else {
            //     if (my.internalMode == my.EDITMODE.LABEL_MOVE || my.internalMode == my.EDITMODE.LABEL_RESIZE) {
            //         my.internalMode = my.EDITMODE.STANDARD;
            //     }
            // }
            // }
            my.lastX = my.getX(e);

        });

        // All Right Mouse Button Functions  
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        $(window).resize(function() {
            my.tierHandler.removeLabelDoubleClick();
        });

        $('#wave').css("height", "80px");
        $('#spectrogram').css("height", "80px");
        $('#cans').sortable({
            tolerance: 'pointer',
            cursor: 'move',
            delay: 10,
            dropOnEmpty: true,
            //connectWith: '.myTest',
            start: function(event, ui) {
                my.internalMode = my.EDITMODE.DRAGING_TIER;
                my.tierHandler.removeLabelDoubleClick();
            },
            stop: function(event, ui) {
                my.internalMode = my.EDITMODE.STANDARD;
            },

            update: function(event, ui) {
                if (this.id == 'sortable-delete') {
                    // Remove the element dropped on #sortable-delete
                    jQuery('#' + ui.item.attr('id')).remove();
                }
            }
        });
        $("#cans").disableSelection();

    },


    /**
     * delegates draw buffer event
     * to drawer objects
     *
     * @param isNewlyLoaded bool to say if first time
     * buffer is displayed (see newlyLoadedBufferReady)
     */
    drawBuffer: function() {
        this.drawer.uiDrawUpdate();
    },


    /**
     * callback for audio-backend
     * it is used to delegate an update event
     * to the drawer objects
     */
    onAudioProcess: function() {
        var my = this;

        var percRel = 0;
        var percPlayed = this.backend.getPlayedPercents();
        this.viewPort.curCursorPosInPercent = percPlayed;

        if (this.playMode == "sel") {
            percRel = this.viewPort.selectE / this.backend.currentBuffer.length;
        }
        if (this.playMode == "vP") {
            if (this.backend.currentBuffer) {
                percRel = this.viewPort.eS / this.backend.currentBuffer.length;
            }
        }
        if (this.playMode == "all") {
            percRel = 1.0;
        }

        if (!this.backend.isPaused()) {
            my.drawer.uiDrawUpdate();
        }
        if (percPlayed > percRel) {
            my.drawer.uiDrawUpdate();
            this.pause();
        }
    },

    /**
     * play audio in certain EDITMODE
     * playMode can be vP, sel, all
     */
    playInMode: function(playMode) {
        var percS, percE;

        if (playMode == "vP" || playMode === null) {
            this.playMode = "vP";
            percS = this.viewPort.sS / this.backend.currentBuffer.length;
            percE = this.viewPort.eS / this.backend.currentBuffer.length;
            this.backend.play(this.backend.getDuration() * percS, this.backend.getDuration() * percE);
        }
        if (playMode == "sel" || playMode === null) {
            this.playMode = "sel";
            percS = this.viewPort.selectS / this.backend.currentBuffer.length;
            percE = this.viewPort.selectE / this.backend.currentBuffer.length;
            this.backend.play(this.backend.getDuration() * percS, this.backend.getDuration() * percE);

        }
        if (playMode == "all" || playMode === null) {
            this.playMode = "all";
            this.backend.play(0, this.backend.getDuration());

        }
    },

    /**
     * delegate pause to backend
     */
    pause: function() {
        this.backend.pause();
    },

    /**
     * toggles play in view mode
     * is called by play in view button
     * binding (default = space)
     */
    playPauseInView: function() {
        if (this.backend.paused) {
            this.playInMode("vP");
        } else {
            this.pause();
        }
    },


    /**
     * method called after backend
     * has loaded+decoded audio file
     * that was loaded via fileAPI/websocket/xhr
     */
    newlyLoadedBufferReady: function() {
        this.viewPort.init(0, this.backend.currentBuffer.length - 1, this.backend.currentBuffer.length);
        this.drawer.uiWaveDrawUpdate();
        this.drawer.uiSpectroDrawUpdate();
        this.drawer.uiMiniMapDraw();
        this.drawer.uiAllTierDrawUpdate();
    },

    /**
     * Loads an audio file via XHR.
     */
    load: function(src) {
        var my = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';

        xhr.addEventListener('load', function(e) {
            my.backend.loadData(
                e.target.response,
                my.newlyLoadedBufferReady.bind(my)); //webaudio.js loadData function called
        }, false);
        xhr.open('GET', src, true);
        xhr.send();
    },

    /**
     * set view port to start and end sample
     * (with several out-of-bounds like checks)
     *
     * @param sSample start sample of view
     * @param sSample end sample of view
     */
    setView: function(sSample, eSample) {

        var oldStart = this.viewPort.sS;
        var oldEnd = this.viewPort.eS;
        if (sSample) {
            this.viewPort.sS = sSample;
        }
        if (eSample) {
            this.viewPort.eS = eSample;
        }

        // check if moving left or right is not out of bounds -> prevent zooming on edge when moving left/right
        if (oldStart > this.viewPort.sS && oldEnd > this.viewPort.eS) {
            //moved left
            if (this.viewPort.sS < 0) {
                this.viewPort.sS = 0;
                this.viewPort.eS = oldEnd + Math.abs(this.viewPort.sS);
            }
        }
        if (oldStart < this.viewPort.sS && oldEnd < this.viewPort.eS) {
            //moved right
            if (this.viewPort.eS > this.backend.currentBuffer.length - 1) {
                this.viewPort.sS = oldStart;
                this.viewPort.eS = this.backend.currentBuffer.length - 1;
            }
        }

        // check if viewPort in range
        if (this.viewPort.sS < 0) {
            this.viewPort.sS = 0;
        }
        if (this.viewPort.eS > this.backend.currentBuffer.length - 1) {
            this.viewPort.eS = this.backend.currentBuffer.length - 1;
        }
        if (this.viewPort.eS - this.viewPort.sS < 4) {
            this.viewPort.sS = oldStart;
            this.viewPort.eS = oldEnd;
        }
        this.drawBuffer();
    },

    /**
     * set view port to start and end sample
     * (with several out-of-bounds like checks)
     *
     * @param zoomIn bool to specify zooming direction
     * if set to true -> zoom in
     * if set to false -> zoom out
     */
    zoomViewPort: function(zoomIn) {

        this.tierHandler.removeLabelDoubleClick();
        var newStartS, newEndS;
        if (zoomIn) {
            newStartS = this.viewPort.sS + ~~((this.viewPort.eS - this.viewPort.sS) / 4);
            newEndS = this.viewPort.eS - ~~((this.viewPort.eS - this.viewPort.sS) / 4);
        } else {
            newStartS = this.viewPort.sS - ~~((this.viewPort.eS - this.viewPort.sS) / 4);
            newEndS = this.viewPort.eS + ~~((this.viewPort.eS - this.viewPort.sS) / 4);

        }
        this.setView(newStartS, newEndS);
    },

    /**
     * moves view port to the right or to the left
     * without changing the zoom
     *
     * @param shiftRight bool to specify direction
     * if set to true -> shift right
     * if set to falce -> shift left
     */
    shiftViewP: function(shiftRight) {
        // my.removeLabelDoubleClick();
        var newStartS, newEndS;
        if (shiftRight) {
            newStartS = this.viewPort.sS + ~~((this.viewPort.eS - this.viewPort.sS) / 4);
            newEndS = this.viewPort.eS + ~~((this.viewPort.eS - this.viewPort.sS) / 4);
        } else {
            newStartS = this.viewPort.sS - ~~((this.viewPort.eS - this.viewPort.sS) / 4);
            newEndS = this.viewPort.eS - ~~((this.viewPort.eS - this.viewPort.sS) / 4);

        }
        this.setView(newStartS, newEndS);
    },

    /**
     * zoom into selected part of signal
     */
    zoomSel: function() {
        this.setView(this.viewPort.selectS, this.viewPort.selectE);
    },

    /**
     * get x position in according element
     * that creates the event
     *
     * @param e is event that initiated the get
     * @return x position in element
     */
    getX: function(e) {
        var relX = e.offsetX;
        if (null === relX) {
            relX = e.layerX;
        }
        return relX / e.srcElement.clientWidth;
    },

    /**
     * get y position in according element
     * that creates the event
     *
     * @param e is event that initiated the get
     * @return y position in element
     */
    getY: function(e) {
        var relY = e.offsetY;
        if (null === relY) {
            relX = e.layerY;
        }
        return relY / e.srcElement.clientHeight;
    },

    /**
     * get tier ID of the according (tier) element
     * that created the event
     *
     * @param e is event that initiated the get
     * @return tier ID
     */
    getTierID: function(e) {
        return document.getElementById(e.srcElement.id).getAttribute("tier-id");
    },

    /**
     * get tier name of the according (tier) element
     * that created the event
     *
     * @param e is event that initiated the get
     * @return tier name
     */
    getTierName: function(e) {
        return e.srcElement.id;
    },

    /**
     * get element of the according element
     * that created the event
     *
     * @param e is event that initiated the get
     * @return element
     */
    getElement: function(e) {
        return document.getElementById(e.srcElement.id);
    },

    /**
     * delegates the parsing of different file types
     * after they have been loaded
     *
     * @param readerRes ArrayBuffer containing the base64 encoded
     * loaded file from fileAPI/websocket/xhr load
     */
    parseNewFile: function(readerRes) {
        var my = this;
        var ft = emulabeller.newFileType;
        if (ft === 0) {
            my.backend.loadData(
                readerRes,
                my.newlyLoadedBufferReady.bind(my)
            );
        } else if (ft == 1) {
            var newTiers = emulabeller.labParser.parseFile(readerRes, emulabeller.tierHandler.getLength());
            this.tierHandler.addLoadedTiers(newTiers[0]);
        } else if (ft == 2) {
            var sCanName = "F0";
            my.tierHandler.addTiertoHtml(sCanName, "-1", "tierSettings", "#signalcans");
            var ssffData = emulabeller.ssffParser.parseSSFF(readerRes);
            emulabeller.ssffInfos.data.push(ssffData);
            emulabeller.ssffInfos.canvases.push($("#" + sCanName)[0]);
        } else if (ft == 3) {
            var parserRes=emulabeller.iohandler.parseTextGrid(readerRes);
            emulabeller.iohandler.toTextGrid(parserRes);
            this.tierHandler.addLoadedTiers(parserRes);

        }
    },


    /**
     * called from hidden input type="file" element
     * to handle the file once loaded (normal callback mech.)
     * and set the according current newFileType param of this class
     * (that i still find a bit strange... )
     *
     * @param event of input element
     */
    fileAPIread: function(evt) {
        var my = this;

        var file = evt.target.files[0];

        // Create a new FileReader Object
        var reader = new FileReader();
        // Set an onload handler because we load files into it asynchronously
        reader.onload = function(e) {
            // The response contains the Data-Uri, which we can then load into the canvas
            emulabeller.parseNewFile(reader.result); // my and this does not work?!
        };

        if (file.type.match('audio.*')) {
            console.log("is audio");
            emulabeller.newFileType = 0;
            reader.readAsArrayBuffer(file);
        } else if (file.name.match(".*lab") || file.name.match(".*tone")) {
            console.log("is lab file");
            emulabeller.newFileType = 1;
            reader.readAsText(file);
        } else if (file.name.match(".*f0") || file.name.match(".*fms")) {
            console.log("is f0");
            emulabeller.newFileType = 2;
            reader.readAsArrayBuffer(file);
        } else if (file.name.match(".*TextGrid")) {
            console.log("is TextGrid");
            emulabeller.newFileType = 3;
            reader.readAsText(file);
        } else {
            alert('File type not supported.... sorry!');
        }
    },


    openSubmenu: function() {
        if (this.subMenuOpen) {
            this.subMenuOpen = false;
            $("#serverSelect").html("Open Menu");
            $("#menuLeft").removeClass("cbp-spmenu-open");
            $("#timeline").removeClass("cbp-spmenu-push-toright");
            $("#tierPush").removeClass("cbp-spmenu-push-toright");
            $("#menu-bottom").removeClass("cbp-spmenu-push-toright");
        } else {
            this.subMenuOpen = true;
            $("#serverSelect").html("Close Menu");
            $("#menuLeft").addClass("cbp-spmenu-open");
            $("#timeline").addClass("cbp-spmenu-push-toright");
            $("#tierPush").addClass("cbp-spmenu-push-toright");
            $("#menu-bottom").addClass("cbp-spmenu-push-toright");
        }
    },


    countSelected: function(row) {
        var count = 0;
        if (this.viewPort.length == 0) return 0;
        if (this.viewPort.selectedSegments.length == 0) return 0;
        if (null == row) {
            var row = 0;
            $.each(this.viewPort.selectedSegments, function() {
                ++row;
                $.each(this.viewPort.selectedSegments[row], function() {
                    ++count;
                });
            });
        } else {
            if (this.viewPort.selectedSegments.length == 0) return 0;
            if (this.viewPort.selectedSegments[row].length == 0) return 0;
            $.each(this.viewPort.selectedSegments[row], function() {
                ++count;
            });
        }
        return count;
    },


    getSelectedSegmentDoubleClick: function(row) {
        return this.viewPort.selectedSegments[row].indexOf(true);
    },

    editLabel: function() {
        var my = this;
        this.isModalShowing = true;
        $("#dialLabelInput")[0].value = this.tierHandler.tierInfos.tiers[this.viewPort.selTier].events[this.viewPort.selSegment].label;
        $("#dialog-messageSetLabel").dialog({
            modal: true,
            close: function() {
                console.log("closing");
                emulabeller.isModalShowing = false;
            },
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                    var usrTxt = $("#dialLabelInput")[0].value;
                    // this.tierHandler.tierInfos.tiers[this.viewPort.selTier].events[this.viewPort.selSegment].label = usrTxt;
                    my.tierHandler.tierInfos.tiers[my.viewPort.selTier].events[my.viewPort.selSegment].label = usrTxt;
                    my.drawBuffer();
                }
            }
        });

    },

    sendTierinfosToServer: function() {
        var sT = this.tierHandler.tierInfos.tiers[this.viewPort.selTier];
        var data = {
            'bob': 'foo',
            'paul': 'dog'
        };
        $.ajax({
            url: "http://127.0.0.1:8001/",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(sT),
            dataType: 'json'
        });
    },

    addSegmentAtSelection: function() {

        this.resetAllSelSegments();
        this.resetAllSelBoundariesInTierInfos();

        var sT = this.tierHandler.getSelectedTier();

        if (emulabeller.viewPort.selectS == emulabeller.viewPort.selectE) {
            sT.events.push({
                "label": "newSegment",
                "startSample": this.viewPort.selectS,
                "sampleDur": 0,
                "uiInfos": {
                    "selSeg": false,
                    "selBoundryStart": true,
                    "selBoundryEnd": false,
                    "lastValues": []
                }
            });
        } else {
            sT.events.push({
                "label": "newSegment",
                "startSample": this.viewPort.selectS,
                "sampleDur": this.viewPort.selectE - this.viewPort.selectS,
                "uiInfos": {
                    "selSeg": false,
                    "selBoundryStart": true,
                    "selBoundryEnd": false,
                    "lastValues": []
                }
            });
            sT.events.push({
                "label": "emptyAfterNew",
                "startSample": this.viewPort.selectS + 1,
                "sampleDur": 0,
                "uiInfos": {
                    "selSeg": false,
                    "selBoundryStart": false,
                    "selBoundryEnd": false,
                    "lastValues": []
                }
            });
        }

        //resort events by their startSample values
        var bla = sT.events.sort(function(a, b) {
            return parseFloat(a.startSample) - parseFloat(b.startSample);
        });
        // fix surrounding boundaries
        var sel = this.getSelBoundaryEventsWithSurroundingEvtsAndTiers();
        if (emulabeller.viewPort.selectS == emulabeller.viewPort.selectE) {
            sel.evts[0].sampleDur = sel.evts[1].startSample - sel.evts[0].startSample;
            sel.evts[1].sampleDur = sel.evts[2].startSample - sel.evts[1].startSample;
        } else {
            sel.evts[2].startSample = sel.evts[1].startSample + sel.evts[1].sampleDur;
            sel.evts[2].sampleDur = sel.evts[0].sampleDur - ((sel.evts[1].startSample - sel.evts[0].startSample) + sel.evts[1].sampleDur);

            sel.evts[0].sampleDur = sel.evts[1].startSample - sel.evts[0].startSample;
        }
        emulabeller.drawBuffer();
    },

    validateTierInfos: function() {
        this.JSONval.validateTierInfos(this.tierHandler.tierInfos);
    },

    // saveTiers: function () {
    //     var myObject = {one: "weee", two: "woooo"};
    //     console.log(this.tierHandler.tierInfos.tiers);
    //     var data = JSON.stringify(this.tierHandler.tierInfos.tiers);
    //     // console.log(data);

    //     var url = "data:application/octet-stream;base64," + window.btoa(data);
    //     var iframe;
    //     iframe = document.getElementById("hiddenDownloader");
    //     if (iframe === null)
    //     {
    //         iframe = document.createElement('iframe');
    //         iframe.id = "hiddenDownloader";
    //         iframe.style.display = "none";
    //         document.body.appendChild(iframe);
    //     }
    //     iframe.src = url;
    // },

    /**
     * generates dataURI to download the current
     * tierInfos as a JSON formated text file. This dataURI
     * will then be presented as a link
     */
    prepDownload: function() {
        var MIME_TYPE = 'text/plain';
        var output = document.querySelector('#downLinkDiv');
        window.URL = window.webkitURL || window.URL;
        var prevLink;
        try {
            prevLink = output.querySelector('a');
        } catch (err) {
            console.log("no link");
        }

        if (prevLink) {
            window.URL.revokeObjectURL(prevLink.href);
            output.innerHTML = '';
        }

        var bb = new Blob([JSON.stringify(this.tierHandler.tierInfos.tiers, undefined, 2)], {
            type: MIME_TYPE
        });
        console.log(this.tierHandler.tierInfos.tiers)

        var a = document.createElement('a');
        a.download = "emulabellerjsOutput.txt";
        a.href = window.URL.createObjectURL(bb);
        a.textContent = 'Download ready';

        a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
        a.draggable = true; // Don't really need, but good practice.
        a.classList.add('dragout');

        output.appendChild(a);

        a.onclick = function(e) {
            if ('disabled' in this.dataset) {
                return false;
            }
            a.textContent = 'Downloaded';
            a.dataset.disabled = true;
            // cleanUp(this);
        };
    },



    // getSegmentbySample: function(clickedTwier, curSample) {
    //     var c = 0;
    //     $.each(clickedTier.events, function() {
    //         if (c === 0 & curSample < this.time) {
    //             c = this;
    //         }
    //     });
    //     return c;
    // },

    // getSegmentIDbySample: function(clickedTier, curSample) {
    //     var c = clickedTier.events.length;
    //     $.each(clickedTier.events, function() {
    //         if (curSample < this.time) {
    //             --c;
    //         }
    //     });
    //     return c;
    // },

    moveMultipleSegments: function(clickedTier, newTime) {
        var c = 0;
        $.each(clickedTier.events, function() {
            var check1 = my.viewPort.selectedSegments[my.viewPort.selTier][c + 1];
            var check2 = my.viewPort.selectedSegments[my.viewPort.selTier][c];
            if (check1)
                this.time += newTime;
            if (check1 != check2)
                if (check2)
                    this.time += newTime;
                ++c;

        });
    },



    snapSelectedSegmentToNearestTop: function() {
        //find nearest evt in tier obove
        var evtsNtiers = this.getSelBoundaryEventsWithSurroundingEvtsAndTiers();
        var selEvt = evtsNtiers.evts[1];
        var bestIdx;
        var dist = Infinity;
        for (var i = 0; i < evtsNtiers.tiers[0].events.length; i++) {
            var curEvt = evtsNtiers.tiers[0].events[i];
            if (Math.abs(curEvt.startSample - selEvt.startSample) < dist) {
                dist = Math.abs(curEvt.startSample - selEvt.startSample);
                bestIdx = i;
            }
        }
        var oldTime = selEvt.startSample;
        var newTime = evtsNtiers.tiers[0].events[bestIdx].startSample;

        var leftEdge = evts[0].startSample;
        var rightEdge = evts[1].startSample + evts[1].sampleDur;

        selEvt.startSample = newTime;

        if (newTime > leftEdge && newTime < rightEdge) {
            evts[1].startSample = newTime;
            // correct for locking mode (sampleDur changes of current segment) will change in future
            if (oldTime < newTime) {
                evts[1].sampleDur = evts[1].sampleDur + (oldTime - newTime);
            } else {
                evts[1].sampleDur = evts[1].sampleDur - (newTime - oldTime);
            }

            // correct for locking mode (sampleDur changes of perv segment) will change in future
            evts[0].sampleDur = evts[1].startSample - evts[0].startSample;
        }

        this.drawer.uiAllTierDrawUpdate(this.viewPort, this.tierHandler.tierInfos);
    },

    snapSelectedSegmentToNearestBottom: function() {
        //find nearest evt in tier obove
        var evtsNtiers = this.getSelBoundaryEventsWithSurroundingEvtsAndTiers();
        var selEvt = evtsNtiers.evts[1];
        var bestIdx;
        var dist = Infinity;
        for (var i = 0; i < evtsNtiers.tiers[2].events.length; i++) {
            var curEvt = evtsNtiers.tiers[2].events[i];
            if (Math.abs(curEvt.startSample - selEvt.startSample) < dist) {
                dist = Math.abs(curEvt.startSample - selEvt.startSample);
                bestIdx = i;
            }
        }

        var oldTime = selEvt.startSample;
        var newTime = evtsNtiers.tiers[2].events[bestIdx].startSample;

        var leftEdge = evts[0].startSample;
        var rightEdge = evts[1].startSample + evts[1].sampleDur;

        selEvt.startSample = newTime;

        if (newTime > leftEdge && newTime < rightEdge) {
            evts[1].startSample = newTime;
            // correct for locking mode (sampleDur changes of current segment) will change in future
            if (oldTime < newTime) {
                evts[1].sampleDur = evts[1].sampleDur + (oldTime - newTime);
            } else {
                evts[1].sampleDur = evts[1].sampleDur - (newTime - oldTime);
            }

            // correct for locking mode (sampleDur changes of perv segment) will change in future
            evts[0].sampleDur = evts[1].startSample - evts[0].startSample;
        }

        this.drawer.uiAllTierDrawUpdate(this.viewPort, this.tierHandler.tierInfos);
    },

    /**
    * use socketIOhandler to request something from server
    *
    * @param message sting containing request statement from
    server "getUtts" and "stopServer" work for now
    */
    requestFromServer: function(message) {

        console.log("sending message: ", message);
        this.socketIOhandler.doSend(message);

        if (message == "stopServer") {
            window.close();
        }
    }
};