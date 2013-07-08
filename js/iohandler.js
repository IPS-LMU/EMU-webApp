EmuLabeller.IOhandler = {

    /**
     * @param backendSR sample rate of audio back-end
     * needed for correct conversion of different file types
     */
    init: function(backendSR) {

        this.textGridHandler = Object.create(EmuLabeller.TextGridParser);

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

};