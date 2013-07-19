EmuLabeller.Drawer = {
    defaultParams: {
        waveColor: '#333',
        progressColor: '#777',
        cursorWidth: 1,
        loadingColor: '#333',
        loadingBackground: '#fff',
        loadingText: 'calculating fft ...',
        loadingBars: 20,
        barHeight: 1,
        barMargin: 10,
        selectedArea: "rgba(0, 0, 255, 0.2)",
        selectedBorder: "rgba(0, 255, 0, 0.5)"
    },

    init: function(params) {
        var my = this;
        this.params = Object.create(params);
        Object.keys(this.defaultParams).forEach(function(key) {
            if (!(key in params)) {
                params[key] = my.defaultParams[key];
            }
        });

        // osci drawer
        this.osciDrawer = Object.create(EmuLabeller.Drawer.OsciDrawer);
        this.osciDrawer.init(params);


        // spectrogram drawer
        this.spectogramDrawer = Object.create(EmuLabeller.Drawer.SpectogramDrawer);
        this.spectogramDrawer.init({
            specCanvas: params.specCanvas,
            spectroworker : params.spectroworker,
            font: params.font,
            defaultParams: this.defaultParams
        });

        // SSFF drawer
        this.SSFFDrawer = Object.create(EmuLabeller.Drawer.SSFFDrawer);
        this.SSFFDrawer.init();

        // tier drawer
        this.tierDrawer = Object.create(EmuLabeller.Drawer.TierDrawer);
        this.tierDrawer.init();

        this.osciCanvas = params.osciCanvas;
        this.specCanvas = params.specCanvas;
        this.scrollCanvas = params.scrollCanvas;


        this.osciWidth = this.osciCanvas.width;
        this.osciHeight = this.osciCanvas.height;
        this.start = 0;
        this.end = this.osciWidth;

        this.specWidth = this.specCanvas.width;
        this.specHeight = this.specCanvas.height;

        this.scrollWidth = this.scrollCanvas.width;
        this.scrollHeight = 8; //this.scrollCanvas.clientHeight;

        // off-line canvas for minimap as speed up (draw once then use as img)
        this.inMemoryMiniMapCanvas = document.createElement("canvas");
        this.inMemoryMiniMapCanvas.width = this.scrollWidth;
        this.inMemoryMiniMapCanvas.height = this.scrollCanvas.clientHeight;
        this.cc = this.osciCanvas.getContext('2d');
        this.scc = this.specCanvas.getContext('2d');
        this.scrollcc = this.scrollCanvas.getContext('2d');
        this.cacheImage = new Image();
        this.isInitDraw = true;

        if (params.image) {
            this.loadImage(params.image, this.drawImage.bind(this));
        }

        if (!this.osciWidth || !this.osciHeight) {
            console.error('Canvas size is zero.');
        }
    },

    uiDrawUpdate: function() {       
        this.uiWaveDrawUpdate();
        this.uiSpectroDrawUpdate();
        this.uiMiniMapDraw();
        this.uiAllTierDrawUpdate();
    },

    /**
    * update wave
    * 
    */
    uiMiniMapDraw: function() {
        // draw minimap
        if (this.isInitDraw) {
            this.osciDrawer.redrawOsciOnCanvas(this.inMemoryMiniMapCanvas);
            this.isInitDraw = false;
        }
        this.osciDrawer.drawScrollMarkup(this.inMemoryMiniMapCanvas);
    },


    /**
    * update wave
    * 
    */
    uiWaveDrawUpdate: function() {
         //draw wave
        this.osciDrawer.drawCurOsciOnCanvas();
        this.osciDrawer.drawVpOsciMarkup();
    },


    /**
    * update spectrogram
    * 
    */
    uiSpectroDrawUpdate: function() {
         //draw spectrogram
        this.spectogramDrawer.uiDraw();
    },


    /**
    * update all tiers
    * 
    */
    uiAllTierDrawUpdate: function() {
        var t = emulabeller.tierHandler.getTiers();
        for (var k in t) {
            this.tierDrawer.drawSingleTier(t[k]);
            this.tierDrawer.drawVpMarkupSingleTier(t[k]);
        }
    },

    /**
    * update single tier 
    * 
    * @param tierDetail of Single tier
    */
    updateSingleTier: function(t) {
        if(null!=t) {
            this.tierDrawer.drawSingleTier(t);
            this.tierDrawer.drawVpMarkupSingleTier(t);
       } 
    }
};