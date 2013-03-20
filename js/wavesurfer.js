'use strict';

var WaveSurfer = {
    init: function (params) {
        var my = this;

        if (params.audio) {
            var backend = WaveSurfer.Audio;
            //console.log("here audio");
        } else {
            backend = WaveSurfer.WebAudio;
            //console.log("web audio");
        }
        this.backend = Object.create(backend);
        this.backend.init(params);

        this.drawer = Object.create(WaveSurfer.Drawer);
        this.drawer.init(params);

        this.viewPort = Object.create(WaveSurfer.ViewPort);
        this.viewPort.init(1, 128086);// sic get length of data on load!

        this.backend.bindUpdate(function () {
            my.onAudioProcess();
        });

        this.bindClick(params.canvas, function (percents) {
            //my.playAt(percents);
            console.log(percents);
        });

        this.bindScrollClick(params.scrollCanvas, function (x) {
            my.scrollBarMoved(x);
            //console.log(x);
        });

    },

    onAudioProcess: function () {
        if (!this.backend.isPaused()) {
            this.drawer.progress(this.backend.getPlayedPercents(), this.viewPort, this.backend.currentBuffer.length);
            this.drawer.drawSpec(this.backend.frequency());
        }
    },

    playAt: function (percents) {

        var percS = this.viewPort.sS/this.backend.currentBuffer.length;
        var percE = this.viewPort.eS/this.backend.currentBuffer.length;
        this.backend.play(this.backend.getDuration() * percS, this.backend.getDuration() * percE);

        //this.backend.play(this.backend.getDuration() * percents);

    },

    pause: function () {
        this.backend.pause();
    },

    playPause: function () {
        if (this.backend.paused) {
            if(this.backend.getPlayedPercents() <= 1){
                this.playAt(this.backend.getPlayedPercents() || 0);
            } else{
                //console.log("set to 0");
                this.playAt(0);
            }
        } else {
            this.pause();
        }
    },

    drawBuffer: function () {
        //console.log(this);
        if (this.backend.currentBuffer) {
            this.drawer.drawBuffer(this.backend.currentBuffer, this.viewPort);
        }
    },

    /**
     * Loads an audio file via XHR.
     */
    load: function (src) {
        var my = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';

        xhr.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
                var percentComplete = e.loaded / e.total;
            } else {
                // TODO
                percentComplete = 0;
            }
            my.drawer.drawLoading(percentComplete);
        }, false);

        xhr.addEventListener('load', function (e) {
            my.backend.loadData(
                e.target.response,
                my.drawBuffer.bind(my)
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



        this.drawBuffer();

    },


    zoomViewPort: function(zoomIn){
        var newStartS, newEndS;
        if(zoomIn){
            newStartS = this.viewPort.sS + ~~((this.viewPort.eS-this.viewPort.sS)/4); 
            newEndS = this.viewPort.eS - ~~((this.viewPort.eS-this.viewPort.sS)/4);
        }else{
            newStartS = this.viewPort.sS - ~~((this.viewPort.eS-this.viewPort.sS)/4);;
            newEndS = this.viewPort.eS + ~~((this.viewPort.eS-this.viewPort.sS)/4);;

        }
        this.setView(newStartS, newEndS);

    },

    incrViewP: function  (inc) {
        var newStartS, newEndS;
        if(inc){
            newStartS = this.viewPort.sS + ~~((this.viewPort.eS-this.viewPort.sS)/4); 
            newEndS = this.viewPort.eS + ~~((this.viewPort.eS-this.viewPort.sS)/4);
        }else{
            newStartS = this.viewPort.sS - ~~((this.viewPort.eS-this.viewPort.sS)/4);;
            newEndS = this.viewPort.eS - ~~((this.viewPort.eS-this.viewPort.sS)/4);;

        }
        this.setView(newStartS, newEndS);


    },
    /**
     * Loads an audio file via drag'n'drop.
     */
    // bindDragNDrop: function (dropTarget) {
    //     var my = this;
    //     var reader = new FileReader();
    //     reader.addEventListener('load', function (e) {
    //         my.backend.loadData(
    //             e.target.result,
    //             my.drawBuffer.bind(my)
    //         );
    //     }, false);

    //     (dropTarget || document).addEventListener('drop', function (e) {
    //         e.preventDefault();
    //         var file = e.dataTransfer.files[0];
    //         file && reader.readAsArrayBuffer(file);
    //     }, false);
    // },

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

    scrollBarMoved: function(relX){
        var delta = this.viewPort.eS-this.viewPort.sS;
        if (relX <=0.5) {

            this.setView(this.viewPort.sS-delta, this.viewPort.eS-delta);
        }else{
            this.setView(this.viewPort.sS+delta, this.viewPort.eS+delta);

        }
        //console.log(relX);
        //this.drawer.drawScroll(relX, this.viewPort, this.backend.currentBuffer.length);

    },

    bindScrollClick: function (element, callback) {
        var my = this;
        element.addEventListener('click', function (e) {
            var relX = e.offsetX;
            if (null == relX) { relX = e.layerX; }
            callback(relX / this.clientWidth);
        }, false);
    }
};
