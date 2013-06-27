EmuLabeller.socketIOhandler = {

    init: function () {
        my = this;
        console.log("init sockets");
        var wsUri = "ws://localhost:7681/";
        websocket = new WebSocket(wsUri);
        websocket.onopen = function(evt) { my.onOpen(evt); };
        websocket.onclose = function(evt) { my.onClose(evt); };
        websocket.onmessage = function(evt) { my.onMessage(evt); };
        websocket.onerror = function(evt) { my.onError(evt); };


    },

    onOpen: function(evt){

        console.log("ON OPEN");

    },

    onClose: function(evt){

        console.log("ON CLOSE");

    },

    onMessage: function(evt){

        console.log("ON MESSAGE with message: ", evt.data);

    },

    onError: function(evt){

        console.log("ON ERROR");

    },
    doSend: function(message){
        websocket.send(message);

    }

};