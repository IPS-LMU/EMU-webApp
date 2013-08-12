EmuLabeller.IOhandler = {

    /**
     * @param backendSR sample rate of audio back-end
     * needed for correct conversion of different file types
     */
    init: function(backendSR, externalMode) {
        var my = this;

        this.externalMode = externalMode;
        // textgrid handler
        this.textGridHandler = Object.create(EmuLabeller.TextGridParser);
        this.textGridHandler.init();
        
        // labfile (old emu format) handler
        this.labFileHandler = Object.create(EmuLabeller.LabFileParser);
        this.labFileHandler.init();

        // textgrid handler
        this.DropBoxHandler = Object.create(EmuLabeller.DropBoxHandler);

        // key value list of file names loaded
        this.fileNames = {
            'audio': [],
            'label': [],
            'SSFF': []
        };

        // if in server mode init socket handler
        if (externalMode.value == 0) {
            this.socketIOhandler = Object.create(EmuLabeller.socketIOhandler);
            this.socketIOhandler.init();
            // register callbacks
            this.socketIOhandler.onConnect(function(evt) {
                my.websocketConnected(evt);
            });
            this.socketIOhandler.onDataLoad(function(fileType, data) {
                my.dataLoaded(fileType, data);
            });
            this.socketIOhandler.onDisconnect(function(evt) {
                my.websocketDisconnected(evt);
            });
        }
    },

    start: function() {
        if (this.externalMode.value == 0) {
            this.socketIOhandler.startTryConnect();
        } else {
            this.connectEventHandler(evt);
        }
    },

    websocketConnected: function(evt) {
        if (this.connectEventHandler) {
            this.connectEventHandler(evt);
        }
    },

    /**
     *  Register callback for server connection event
     */
    onConnected: function(eventHandler) {
        this.connectEventHandler = eventHandler;
    },

    /**
     *  Register callback for new utterance list
     */
    onUtteranceList: function(eventHandler) {
        this.socketIOhandler.onUtteranceList(eventHandler);
    },

    //     /**
    //     *  Register callback for data loaded
    //     */
    //    onDataLoaded: function(eventHandler) {
    //        this.dataLoadedHandler=eventHandler;
    //    },

    /**
     *  Register callback for disconnect event
     */
    onDisconnected: function(eventHandler) {
        this.disconnectEventHandler = eventHandler;
    },

    websocketLoad: function(uttCode) {
        // delegate
        this.socketIOhandler.loadUtterance(uttCode);
    },

    dataLoaded: function(fileType, data) {
        emulabeller.newFileType = fileType;
        emulabeller.parseNewFile(data);
    },

    websocketSave: function() {
        console.log("supposed to save stuff to websocket! Websockets not implemented yet");
    },


    websocketDisconnected: function(evt) {
        if (this.disconnectEventHandler) {
            this.disconnectEventHandler(evt);
        }
    },

    disconnect: function() {
        if (this.externalMode.value === 0) {
            this.socketIOhandler.requestDisconnect();
        }
    },

    /**
     * load a file using xhr and save the file base name in
     * this.fileNames according to fileType
     *
     * @param src path to file on server
     * @param responseType set on xhr object
     * @param fileType accoring to filetype nr in emulabeller
     */
    xhrLoad: function(src, responseType, fileType) {
        var my = this;
        var xhr = new XMLHttpRequest();
        var baseName = src.split(/\//)[src.split(/\//).length - 1]; // unix paths only...

        xhr.responseType = responseType;
        if (fileType === 0) { // audio files
            this.fileNames.audio = []; // empty for now
            this.fileNames.audio.push(baseName);

        } else if (fileType == 3) { // textgrid files
            this.fileNames.label = []; // empty for now
            this.fileNames.label.push(baseName);
        }

        xhr.addEventListener('load', function(e) {
            emulabeller.newFileType = fileType;
            emulabeller.parseNewFile(e.target.response);
            if (fileType === 0) {
               emulabeller.curLoadedBaseName = baseName.split(/\./)[0];
           }
        }, false);

        xhr.open('GET', src, true);
        xhr.send();
    },

    /**
     * delegate parseTextGrid to textGridHandler
     * and return JSO
     * @param string TextGrid as a sting
     * @return object used as tierInfo by emulabeller obj
     */
    parseTextGrid: function(string) {
        res = this.textGridHandler.toJSO(string, this.fileNames.label[this.fileNames.label.length - 1]);
        return res;
    },

    /**
     *
     */
    toTextGrid: function(string) {
        res = this.textGridHandler.toTextGrid(string);
        return res;
    },

    /**
     *
     */
    dropBoxOpen: function() {
        this.DropBoxHandler.openDropBox();
    }
};