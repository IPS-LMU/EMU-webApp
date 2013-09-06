EmuLabeller.WebAudio = {
    Defaults: {
        fftSize: 512,
        smoothingTimeConstant: 0.0
    },


    // ac: new (window.AudioContext || window.webkitAudioContext)
    // ac: new window.webkitAudioContext(),


    /**
     * Initializes the analyser with given params.
     *
     * @param {Object} params
     * @param {String} params.smoothingTimeConstant
     */
    init: function(params) {
        var my = this;
        params = params || {};

        if (navigator.userAgent.indexOf("Firefox") !== -1) {
            this.ac = new window.AudioContext();
        } else {
            this.ac = new window.webkitAudioContext();
        }

        this.fftSize = params.fftSize || this.Defaults.fftSize;
        this.destination = params.destination || this.ac.destination;

        this.analyser = this.ac.createAnalyser();
        this.analyser.smoothingTimeConstant = params.smoothingTimeConstant ||
            this.Defaults.smoothingTimeConstant;
        this.analyser.fftSize = this.fftSize;
        this.analyser.connect(this.destination);

        if (navigator.userAgent.indexOf("Firefox") !== -1) {
            console.log("in Mozilla");
            this.proc = this.ac.createScriptProcessor(this.fftSize / 2, 1, 1);
        } else {
            this.proc = this.ac.createJavaScriptNode(this.fftSize / 2, 1, 1);

        }
        
        this.proc.connect(this.destination);
        this.dataArray = new Uint8Array(this.analyser.fftSize);

        // this.verb = this.ac.createConvolver();
        //this.verb.connect(this.destination);

        //this.reqFreqResp('data/ir.wav');

        // this.loadBuffer(this.ac, "data/ir.wav", function(buffer){
        // my.verb.buffer = buffer;

        // }),

        this.paused = true;
    },

    bindUpdate: function(callback) {
        this.proc.onaudioprocess = callback; //calculate fft and when done update (everz 1024 samples)
    },

    setSource: function(source) {
        // this.source && this.source.disconnect();
        this.source = source;
        this.source.connect(this.analyser);
        this.source.connect(this.proc);

        this.source.connect(this.destination);
        // this.source.connect(this.verb);
    },

    /**
     * Loads audiobuffer
     *
     * @param {AudioBuffer} audioData Audio data.
     */
    loadData: function(audioData, cb) {
        var my = this;

        this.pause();

        this.ac.decodeAudioData(
            audioData,
            function(buffer) {
                my.currentBuffer = buffer;
                my.lastStart = 0; // all set to 0?????
                my.lastPause = 0;
                my.startTime = null;
                //console.log(buffer);
                cb(buffer);
            },
            Error
        );


    },

    isPaused: function() {
        return this.paused;
    },

    getDuration: function() {
        return this.currentBuffer && this.currentBuffer.duration;
    },

    /**
     * Plays the loaded audio region.
     *
     * @param {Number} start Start offset in seconds,
     * relative to the beginning of the track.
     *
     * @param {Number} end End offset in seconds,
     * relative to the beginning of the track.
     */
    play: function(start, end, delay) {

        if (!this.currentBuffer) {
            return;
        }


        this.pause();

        this.setSource(this.ac.createBufferSource());
        this.source.buffer = this.currentBuffer;

        //console.log(this.source);
        //console.log(this.currentBuffer);
        //if (null == start) { start = this.getCurrentTime(); }
        //if (null == end  ) { end = this.source.buffer.duration; }
        //if (null == delay) { delay = 0; }

        this.lastStart = start;
        this.startTime = this.ac.currentTime;

        this.source.start(delay, start, end - start); //when, offset, duration in seconds
        // this.source.noteOn(delay, start, end - start); //when, offset, duration in seconds

        this.paused = false;
    },

    /**
     * Pauses the loaded audio.
     */
    pause: function(delay) {
        if (!this.currentBuffer || this.paused) {
            return;
        }

        this.lastPause = this.getCurrentTime();

        this.source.stop(delay || 0);

        // this.source.noteOff(delay || 0); // deprecated version for safari... yay

        this.paused = true;
    },

    getPlayedPercents: function() {
        //console.log("sdfsadfsa");
        if (this.getCurrentTime() / this.getDuration() > 1) {
            this.pause();
        }
        //console.log(this.getCurrentTime() / this.getDuration());
        return this.getCurrentTime() / this.getDuration();

    },

    getCurrentTime: function() {
        if (this.isPaused()) {
            //console.log("SDFSADFASDF");
            return this.lastPause;
        } else {
            //console.log(this.lastStart + (this.ac.currentTime - this.startTime));
            return this.lastStart + (this.ac.currentTime - this.startTime);
        }
    },

    /**
     * Returns the real-time waveform data.
     *
     * @return {Uint8Array} The waveform data.
     * Values range from 0 to 255.
     */
    waveform: function() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        return this.dataArray;
    },

    /**
     * Returns the real-time frequency data.
     *
     * @return {Uint8Array} The frequency data.
     * Values range from 0 to 255.
     */
    frequency: function() {
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    },



    loadBuffer: function(ctx, filename, callback) {
        var request = new XMLHttpRequest();
        request.open("GET", filename, true);
        request.responseType = "arraybuffer";
        request.onload = function() {
            // Create a buffer and keep the channels unchanged.
            var buffer = ctx.createBuffer(request.response, false);
            callback(buffer);
        };
        request.send();
    }
};