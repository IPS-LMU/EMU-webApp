EmuLabeller.Drawer = {
    defaultParams: {
        waveColor: '#333',
        progressColor: '#777',
        cursorWidth: 1,
        loadingColor: '#333',
        loadingBars: 20,
        barHeight: 1,
        barMargin: 10,
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
        this.osciDrawer.init();


        // spectrogram drawer
        this.spectogramDrawer = Object.create(EmuLabeller.Drawer.SpectogramDrawer);
        this.spectogramDrawer.init({
            specCanvas: params.specCanvas,
            spectroworker : params.spectroworker,
            font: params.font
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

        // this.toRetinaRatio(this.sTmpCanvas, this.sTmpCtx);


        this.cc = this.osciCanvas.getContext('2d');
        this.scc = this.specCanvas.getContext('2d');
        this.scrollcc = this.scrollCanvas.getContext('2d');

        this.tierInfos = params.tierInfos;

        this.cacheImage = new Image();

        this.tierInfos.contexts = [];

        for (var i = 0; i <= this.tierInfos.canvases.length - 1; i++) {
            this.tierInfos.contexts.push(this.tierInfos.canvases[i].getContext('2d'));
            // this.toRetinaRatio(this.tierInfos.canvases[i], this.tierInfos.contexts[i]);
        }

        //console.log(this.tierInfos);

        // this.toRetinaRatio(this.osciCanvas, this.cc);
        // this.toRetinaRatio(this.specCanvas, this.scc);
        // this.toRetinaRatio(this.scrollCanvas, this.scrollcc);

        if (params.image) {
            this.loadImage(params.image, this.drawImage.bind(this));
        }

        if (!this.osciWidth || !this.osciHeight) {
            console.error('Canvas size is zero.');
        }
    },

    addTier: function(canv) {
        var newContext = canv.getContext('2d');
        this.tierInfos.contexts.push(newContext);
        // this.toRetinaRatio(canv, newContext);
    },


    uiDrawUpdate: function(vP, buffer, tierInfos, ssffInfos, isInitDraw) {

        // console.log("uiDrawUpdate called");
        
        // draw osci
        this.osciDrawer.drawCurOsciOnCanvas(buffer, this.osciCanvas, vP);
        this.osciDrawer.drawVpOsciMarkup(buffer, this.osciCanvas, vP);

        // TODO draw SSFF canvases here


        // draw tiers
        this.tierDrawer.drawTiers(this.tierInfos, vP);
        this.tierDrawer.drawVpMarkupAllTiers(vP, emulabeller.tierInfos); //SIC

        // draw minimap
        if (isInitDraw) {
            this.osciDrawer.redrawOsciOnCanvas(buffer, this.inMemoryMiniMapCanvas, vP);
        }

        this.osciDrawer.drawScrollMarkup(vP, this.scrollCanvas, this.inMemoryMiniMapCanvas, buffer.length - 1);

        //draw spectrogram
        this.spectogramDrawer.uiDraw(buffer, vP);
    },

    freshUiDrawUpdate: function(buffer, vP, isInitDraw, ssffInfos) {

        // draw osci canvas with vP markup
        this.osciDrawer.redrawOsciOnCanvas(buffer, this.osciCanvas, vP); // only difference to uiDrawUpdate maybe change to using flag
        this.osciDrawer.drawVpOsciMarkup(buffer, this.osciCanvas, vP);


        // TODO draw SSFF canvases here


        // draw tiers
        this.tierDrawer.drawTiers(this.tierInfos, vP);
        this.tierDrawer.drawVpMarkupAllTiers(vP, emulabeller.tierInfos); //SIC

        // draw minimap
        if (isInitDraw) {
            this.osciDrawer.redrawOsciOnCanvas(buffer, this.inMemoryMiniMapCanvas, vP);
        }

        this.osciDrawer.drawScrollMarkup(vP, this.scrollCanvas, this.inMemoryMiniMapCanvas, buffer.length - 1);

        //draw spectrogram
        this.spectogramDrawer.uiDraw(buffer, vP);
    }
};