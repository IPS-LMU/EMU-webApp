'use strict';

var EmuLabeller = {

    init: function (params) {
        var my = this;
        var backend;
        if (params.audio) {
            backend = EmuLabeller.Audio;
            //console.log("here audio");
        }else {
            backend = EmuLabeller.WebAudio;
            //console.log("web audio");
        }
        this.backend = Object.create(backend);
        this.backend.init(params);

        this.drawer = Object.create(EmuLabeller.Drawer);
        this.drawer.init(params);

        this.viewPort = Object.create(EmuLabeller.ViewPort);

        // this.fileReader = Object.create(EmuLabeller.FileReader);

        this.labParser = Object.create(EmuLabeller.LabFileParser);

        this.ssffParser = Object.create(EmuLabeller.SSFFparser);
        this.ssffParser.init();

        // init tierInfos and ssffInfos
        this.tierInfos = params.tierInfos;

        this.ssffInfos = {data: [], canvases: []};


        this.isDraging = false;
        this.newFileType = -1; // 0 = wav, 1 = lab, 2 = F0

        this.playMode = "vP"; // can be "vP", "sel" or "all"

        //bindings
        this.backend.bindUpdate(function () {
            my.onAudioProcess();
        });


        this.bindOnButtonDown(params.canvas, function (percents) {
            my.isDraging = true;
            my.viewPort.selectS = my.viewPort.sS+(my.viewPort.eS-my.viewPort.sS)*(percents);
        });

        this.bindOnButtonUp(params.canvas, function (percents) {
            my.viewPort.selectE = my.viewPort.sS+(my.viewPort.eS-my.viewPort.sS)*(percents);
            my.isDraging = false;
            my.drawer.progress(my.backend.getPlayedPercents(), my.viewPort, my.backend.currentBuffer.length, my.ssffInfos);
        });

        this.bindOnMouseMoved(params.canvas, function (percents) {
            if(my.isDraging){
                //console.log(percents);
                my.viewPort.selectE = my.viewPort.sS+(my.viewPort.eS-my.viewPort.sS)*(percents);
                my.drawer.progress(my.backend.getPlayedPercents(), my.viewPort, my.backend.currentBuffer.length);
            }
        });

        // same bindings for spec canvas
        this.bindOnButtonDown(params.specCanvas, function (percents) {
            my.isDraging = true;
            my.viewPort.selectS = my.viewPort.sS+(my.viewPort.eS-my.viewPort.sS)*(percents);
        });

        this.bindOnButtonUp(params.specCanvas, function (percents) {
            my.viewPort.selectE = my.viewPort.sS+(my.viewPort.eS-my.viewPort.sS)*(percents);
            my.isDraging = false;
            my.drawer.progress(my.backend.getPlayedPercents(), my.viewPort, my.backend.currentBuffer.length);
        });

        this.bindOnMouseMoved(params.specCanvas, function (percents) {
            if(my.isDraging){
                //console.log(percents);
                my.viewPort.selectE = my.viewPort.sS+(my.viewPort.eS-my.viewPort.sS)*(percents);
                my.drawer.progress(my.backend.getPlayedPercents(), my.viewPort, my.backend.currentBuffer.length);
            }
        });


        // this.bindScrollClick(params.scrollCanvas, function (x) {
        //     //my.scrollBarMoved(x);
        //     console.log(x);
        // });

},

onAudioProcess: function () {
    var percRel = 0;
    var percPlayed = this.backend.getPlayedPercents();
    if (this.playMode == "sel") {
        percRel = this.viewPort.selectE/this.backend.currentBuffer.length;
    }
    if(this.playMode == "vP"){
        if(this.backend.currentBuffer){
            percRel = this.viewPort.eS/this.backend.currentBuffer.length;
        }
    }
    if(this.playMode == "all"){
        percRel = 1.0;
    }

    if (!this.backend.isPaused()) {
        this.drawer.progress(percPlayed, this.viewPort, this.backend.currentBuffer.length);
        this.drawer.drawSpec(this.backend.frequency());
    }
    if (percPlayed>percRel) {
        this.drawer.progress(percRel, this.viewPort, this.backend.currentBuffer.length);
        this.drawer.drawSpec(this.backend.frequency());
        this.pause();
    }

},

    /**
    * play audio in certain mode
    * playmode can be vP, sel, all
    */

    playInMode: function (playmode) {
        var percS, percE;

        if(playmode == "vP" || playmode===null){
            //this.boolPlaySelectedMode = false;
            this.playMode = "vP";
            //console.log("play vP");
            percS = this.viewPort.sS/this.backend.currentBuffer.length;
            percE = this.viewPort.eS/this.backend.currentBuffer.length;
            this.backend.play(this.backend.getDuration() * percS, this.backend.getDuration() * percE);
        }
        if(playmode == "sel" || playmode===null){
            this.playMode = "sel";
            //this.boolPlaySelectedMode = true;
            //console.log("play selected");
            percS = this.viewPort.selectS/this.backend.currentBuffer.length;
            percE = this.viewPort.selectE/this.backend.currentBuffer.length;
            this.backend.play(this.backend.getDuration() * percS, this.backend.getDuration() * percE);

        }
        if(playmode == "all" || playmode===null){
            this.playMode = "all";
            //console.log("play all");
            //this.boolPlaySelectedMode = true;
            this.backend.play(0, this.backend.getDuration());

        }

        //this.backend.play(this.backend.getDuration() * percents);

    },

    pause: function () {
        this.backend.pause();
    },

    playPause: function () {
        if (this.backend.paused) {
            //console.log("set to 0");
            this.playInMode("vP");
        } else {
            this.pause();
        }
    },

    drawBuffer: function (isNewlyLoaded) {
        //console.log(this);
        if (this.backend.currentBuffer) {
            this.drawer.drawBuffer(this.backend.currentBuffer, this.viewPort, isNewlyLoaded, this.ssffInfos);
        }
    },

    newlyLoadedBufferReady: function(){
        this.viewPort.init(1, this.backend.currentBuffer.length);
        //console.log(this.backend.currentBuffer.length);
        this.drawBuffer(true);

    },

    /**
     * Loads an audio file via XHR.
     */
     load: function (src) {
        var my = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';

        xhr.addEventListener('load', function (e) {
            my.backend.loadData(
                e.target.response,
                my.newlyLoadedBufferReady.bind(my)
            );//webaudio.js loadData function called
        }, false);

        xhr.open('GET', src, true);
        xhr.send();
    },

    setView: function(sSample, eSample){

        var oldStart = this.viewPort.sS;
        var oldEnd = this.viewPort.eS;
        if(sSample){
            this.viewPort.sS = sSample;
        }
        if(eSample){
            this.viewPort.eS = eSample;
        }

        // check if moving left or right is not out of bounds -> prevent zooming on edge when moving left/right
        if (oldStart > this.viewPort.sS && oldEnd > this.viewPort.eS) {
            //moved left
            if(this.viewPort.sS < 1) {
                this.viewPort.sS = 1;
                this.viewPort.eS = oldEnd + Math.abs(this.viewPort.sS)-1;
            }
        }
        if (oldStart < this.viewPort.sS && oldEnd < this.viewPort.eS) {
            //moved right
            if(this.viewPort.eS > this.backend.currentBuffer.length) {
                this.viewPort.sS = oldStart;
                this.viewPort.eS = this.backend.currentBuffer.length;
            }
        }

        // check if viewPort in range
        if(this.viewPort.sS < 1) {
            this.viewPort.sS = 1;
        }
        if(this.viewPort.eS > this.backend.currentBuffer.length){
            this.viewPort.eS = this.backend.currentBuffer.length;
        }
        if(this.viewPort.eS-this.viewPort.sS < 4){
            this.viewPort.sS = oldStart;
            this.viewPort.eS = oldEnd;
        }



        this.drawBuffer();

    },


    zoomViewPort: function(zoomInBool){
        var newStartS, newEndS;
        if(zoomInBool){
            newStartS = this.viewPort.sS + ~~((this.viewPort.eS-this.viewPort.sS)/4);
            newEndS = this.viewPort.eS - ~~((this.viewPort.eS-this.viewPort.sS)/4);
        }else{
            newStartS = this.viewPort.sS - ~~((this.viewPort.eS-this.viewPort.sS)/4);
            newEndS = this.viewPort.eS + ~~((this.viewPort.eS-this.viewPort.sS)/4);

        }
        this.setView(newStartS, newEndS);

    },

    incrViewP: function  (inc) {
        var newStartS, newEndS;
        if(inc){
            newStartS = this.viewPort.sS + ~~((this.viewPort.eS-this.viewPort.sS)/4);
            newEndS = this.viewPort.eS + ~~((this.viewPort.eS-this.viewPort.sS)/4);
        }else{
            newStartS = this.viewPort.sS - ~~((this.viewPort.eS-this.viewPort.sS)/4);
            newEndS = this.viewPort.eS - ~~((this.viewPort.eS-this.viewPort.sS)/4);

        }
        this.setView(newStartS, newEndS);


    },

    zoomSel: function () {
        this.setView(this.viewPort.selectS, this.viewPort.selectE);
    },


    /**
     * Click to seek.
     */
    bindClick: function (element, callback) {
        var my = this;
        element.addEventListener('click', function (e) {
            var relX = e.offsetX;
            if (null == relX) { relX = e.layerX; }
            callback(relX / this.clientWidth);
        }, false);
    },

    bindOnButtonDown: function (element, callback) {
        var my = this;
        element.addEventListener('mousedown', function (e) {
            var relX = e.offsetX;
            if (null == relX) { relX = e.layerX; }
            callback(relX / this.clientWidth);
        }, false);
    },

    bindOnButtonUp: function (element, callback) {
        var my = this;
        element.addEventListener('mouseup', function (e) {
            var relX = e.offsetX;
            if (null == relX) { relX = e.layerX; }
            callback(relX / this.clientWidth);
        }, false);
    },

    bindOnMouseMoved: function (element, callback) {
        var my = this;
        element.addEventListener('mousemove', function (e) {
            var relX = e.offsetX;
            if (null == relX) { relX = e.layerX; }
            callback(relX / this.clientWidth);
        }, false);
    },



    scrollBarMoved: function(relX){
        var delta = this.viewPort.eS-this.viewPort.sS;
        if (relX <=0.5) {

            this.setView(this.viewPort.sS-delta, this.viewPort.eS-delta);
        }else{
            this.setView(this.viewPort.sS+delta, this.viewPort.eS+delta);

        }

    },

    bindScrollClick: function (element, callback) {
        var my = this;
        element.addEventListener('click', function (e) {
            var relX = e.offsetX;
            if (null == relX) { relX = e.layerX; }
            callback(relX / this.clientWidth);
        }, false);
    },

    parseNewFile: function (readerRes) {
        var my = this;
        var ft = emulabeller.newFileType;
        if(ft==0){
            console.log(readerRes);
            my.backend.loadData(
                readerRes,
                my.newlyLoadedBufferReady.bind(my)
                );

        } else if(ft==1){
            emulabeller.labParser.parseFile(readerRes, this.tierInfos);
            // console.log(this.tierInfos);
            var tName = this.tierInfos.tiers[this.tierInfos.tiers.length-1].TierName;
            console.log(tName);
            $("#cans").append("<canvas id=\""+tName+"\" width=\"1024\" height=\"64\"></canvas>");
            this.tierInfos.canvases.push($("#"+tName)[0]);
            emulabeller.drawer.addTier($("#"+tName)[0]);
            this.drawBuffer();
        } else if(ft==2){
            var sCanName = "F0";
            $("#signalcans").append("<canvas id=\""+sCanName+"\" width=\"1024\" height=\"128\"></canvas>");
            var ssffData = emulabeller.ssffParser.parseSSFF(readerRes);
            emulabeller.ssffInfos.data.push(ssffData);
            emulabeller.ssffInfos.canvases.push($("#"+sCanName)[0]);
        
            // console.log(emulabeller.ssffInfos);
        }

    },

    fileAPIread: function (evt) {
        var my = this;

        var file = evt.target.files[0];

        // Create a new FileReader Object
        var reader = new FileReader();
        // Set an onload handler because we load files into it asynchronously
        reader.onload = function(e){
            // The response contains the Data-Uri, which we can then load into the canvas
            // console.log(file.type);
            emulabeller.parseNewFile(reader.result); // my and this does not work?!

        };

        if(file.type.match('audio.*')) {
            console.log("is audio");
            emulabeller.newFileType = 0;
            reader.readAsArrayBuffer(file);
        }
        else if(file.name.match(".*lab") || file.name.match(".*tone")){
            console.log("is lab file");
            emulabeller.newFileType = 1;
            reader.readAsText(file);
        }
        else if(file.name.match(".*f0")){
            console.log("is f0");
            emulabeller.newFileType = 2;
            reader.readAsArrayBuffer(file);
        }
        else{
            alert('File type not supported.... sorry!');
        }

    },
    addTier: function () {
        console.log("addding tier");
        console.log(this.tierInfos);
        var tName;
        if(this.tierInfos.tiers.length > 0){
            tName = "Tier" + this.tierInfos.tiers.length;
        }else{
            console.log("here");
            tName = "Tier0";
        }
        
        this.tierInfos.tiers.push({TierName: tName, type: "seg", events: []}); // SIC what about point???
        
        console.log(tName);
        $("#cans").append("<canvas id=\""+tName+"\" width=\"1024\" height=\"64\"></canvas>");
        this.tierInfos.canvases.push($("#"+tName)[0]);
        emulabeller.drawer.addTier($("#"+tName)[0]);
        this.drawBuffer();
    }

};
