EmuLabeller.IOhandler = {

    /**
     * @param backendSR sample rate of audio back-end
     * needed for correct conversion of different file types
     */
    init: function(backendSR, externalMode) {

        // textgrid handler
        this.textGridHandler = Object.create(EmuLabeller.TextGridParser);
        this.textGridHandler.init();
        // textgrid handler
        this.DropBoxHandler = Object.create(EmuLabeller.DropBoxHandler);


        // if in server mode init socket handler
        if (externalMode.value == 0) {
            this.socketIOhandler = Object.create(EmuLabeller.socketIOhandler);
            this.socketIOhandler.init();
        }
    },

    websocketLoad: function(uttName) {
        console.log(uttName, "requested! Websockets not implemented yet");
    },

    websocketSave: function() {
        console.log("supposed to save stuff to websocket! Websockets not implemented yet");
    },

    xhrLoad: function(src, fileType) {
        var my = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'text';

        xhr.addEventListener('load', function(e) {
            emulabeller.newFileType = fileType;
            emulabeller.parseNewFile(e.target.response);
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

        res = this.textGridHandler.toJSO(string);
        return res;
    },
    /**
     *
     */
    toTextGrid: function(string) {

        res = this.textGridHandler.toTextGrid(string);
        return res;
    },

    addUiInfosToTierInfosObj: function(JSO) {},

    removeUiInfosToTierInfosObj: function(JSO) {},

    dropBoxOpen: function() {
        this.DropBoxHandler.openDropBox();
    }
};