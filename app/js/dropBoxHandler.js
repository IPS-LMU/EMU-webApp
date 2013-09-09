EmuLabeller.DropBoxHandler = {

    readDropbox: function(sURL) {
        var my = this;
        var oRequest = new XMLHttpRequest();
        oRequest.open("GET", sURL, false);
        oRequest.onreadystatechange = function(oEvent) {
            if (oRequest.readyState === 4) {
                if (oRequest.status === 200) {
                    console.log("here...")
                    console.log(oEvent.target.response);
                    emulabeller.newFileType = 0;
                    emulabeller.parseNewFile(my.str2ab(oEvent.target.response));
                } else {
                    console.log("Error", oRequest.statusText);
                }
            }
        }
        // oRequest.setRequestHeader("User-Agent", navigator.userAgent);
        try {
            oRequest.send(null)
        } catch (err) {
            alert(err);
        }
        if (oRequest.status == 200) {
            return oRequest.responseText;
        } else {
            alert("Error - File not found in Dropbox public folder");
            return null;
        }
    },



    openDropBox: function() {
        var my = this;
        console.log("open from dropbox");
        Dropbox.choose({
            // Required. Called when a user selects an item in the Chooser.
            linkType: "direct",
            success: function(files) {
                // var xhr = my.createCORSRequest('GET', files[0].link);
                console.log("Here's the file link:" + files[0].link);
                my.readDropbox(files[0].link);

            },
        });
    },

    str2ab: function(str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

};