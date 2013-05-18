


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
        this.tgParser = Object.create(EmuLabeller.TextGridParser);
        
        this.spectogramDrawer = Object.create(spectogramDrawer);
        this.spectogramDrawer.init({specCanvas: params.specCanvas});
		

        this.ssffParser = Object.create(EmuLabeller.SSFFparser);
        this.ssffParser.init();

        // init tierInfos and ssffInfos
        this.tierInfos = params.tierInfos;

        this.ssffInfos = {data: [], canvases: []};


        this.isDraging = false;
        this.isDragingMiniMap = false;

        this.newFileType = -1; // 0 = wav, 1 = lab, 2 = F0

        this.isModalShowing = false;

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

        // minimap bindings
        this.bindOnButtonDown(params.scrollCanvas, function (percents) {
            var bL = my.backend.currentBuffer.length;
            var posInB = percents*bL;
            var len = (my.viewPort.eS-my.viewPort.sS);
            my.setView(posInB-len/2, posInB+len/2);
            my.isDragingMiniMap = true;
        });

        this.bindOnButtonUp(params.scrollCanvas, function (percents) {
            var bL = my.backend.currentBuffer.length;
            var posInB = percents*bL;
            var len = (my.viewPort.eS-my.viewPort.sS);
            my.setView(posInB-len/2, posInB+len/2);
            my.isDragingMiniMap = false;
        });

        this.bindOnMouseMoved(params.scrollCanvas, function (percents) {
            if(my.isDragingMiniMap){
                var bL = my.backend.currentBuffer.length;
                var posInB = percents*bL;
                var len = (my.viewPort.eS-my.viewPort.sS);
                my.setView(posInB-len/2, posInB+len/2);
            }
        });




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
        // console.log(this);
        // this.playPause();
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
        var my = this;
        //console.log(this);
        if (this.backend.currentBuffer) {
            this.drawer.drawBuffer(this.backend.currentBuffer, this.viewPort, isNewlyLoaded, this.ssffInfos);
        	if(this.spectogramDrawer.sStart!=this.viewPort.sS && this.spectogramDrawer.sEnd!=this.viewPort.eS) {
        	this.spectogramDrawer.killSpectroRenderingThread();
			this.spectogramDrawer.startSpectroRenderingThread(this.backend.currentBuffer,this.viewPort.sS,this.viewPort.eS);
			}
			else this.spectogramDrawer.drawImageCache();
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


    
    bindTierClick: function (element, callback) {
        var my = this;
        element.addEventListener('click', function (e) {
            var relX = e.offsetX;
            var relY = e.offsetY;
            if (null === relX) { relX = e.layerX; }
            if (null === relY) { relY = e.layerY; }
            callback(relX / this.clientWidth, relY/this.clientHeight, element.id);
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
            var newTiers = emulabeller.labParser.parseFile(readerRes, emulabeller.tierInfos.tiers.length);
            emulabeller.tierInfos.tiers.push(newTiers[0]);
            
            console.log(this.tierInfos.tiers);

            var tName = newTiers[0].TierName;
            console.log(tName);
            $("#cans").append("<canvas id=\""+tName+"\" width=\"1024\" height=\"64\"></canvas>");
            emulabeller.tierInfos.canvases.push($("#"+tName)[0]);
            emulabeller.drawer.addTier($("#"+tName)[0]);
     
            emulabeller.bindTierClick($('#'+tName)[0], function (percX, percY, elID) {
                // console.log(percents);
                // console.log("whaaaaaaaaaat",elID);
                my.setMarkedEvent(percX, percY, elID);
            });
            this.viewPort.selTier = this.tierInfos.tiers.length-1;

            this.drawBuffer();
        } else if(ft==2){
            var sCanName = "F0";
            $("#signalcans").append("<canvas id=\""+sCanName+"\" width=\"1024\" height=\"128\"></canvas>");
            var ssffData = emulabeller.ssffParser.parseSSFF(readerRes);
            emulabeller.ssffInfos.data.push(ssffData);
            emulabeller.ssffInfos.canvases.push($("#"+sCanName)[0]);
            this.drawBuffer();
            // console.log(emulabeller.ssffInfos);
        }else if(ft==3){
            console.log("textgrid");
            var newTiers = emulabeller.tgParser.parseFile(readerRes);
            for (var i = 0; i < newTiers.length; i++) {
                emulabeller.tierInfos.tiers.push(newTiers[i]); // why doesn't concat work
            };
            // emulabeller.tierInfos.tiers.concat(newTiers);
            // console.log(emulabeller.tierInfos.tiers);
            // console.log(newTiers);
            for (var i = 0; i < newTiers.length; i++) {
                var tName = newTiers[i].TierName;
                $("#cans").append("<canvas id=\""+tName+"\" width=\"1024\" height=\"64\"></canvas>");
                // console.log(tName);
                emulabeller.tierInfos.canvases.push($("#"+tName)[0]);
                emulabeller.drawer.addTier($("#"+tName)[0]); // SIC why is the drawer adding a tier???
                // sic only last tier viewable
                this.bindTierClick($('#'+tName)[0], function (percX, percY, elID) {
                    my.setMarkedEvent(percX, percY, elID);
                });
            }
            this.viewPort.selTier = this.tierInfos.tiers.length-1;

            this.drawBuffer();

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
        else if(file.name.match(".*f0") || file.name.match(".*fms")){
            console.log("is f0");
            emulabeller.newFileType = 2;
            reader.readAsArrayBuffer(file);
        }else if(file.name.match(".*TextGrid")){
            console.log("is TextGrid");
            emulabeller.newFileType = 3;
            reader.readAsText(file);
        }
        else{
            alert('File type not supported.... sorry!');
        }

    },
    addTier: function (addPointTier) {
        var my = this;
        console.log("addding tier");
        console.log(this.tierInfos);
        var tName;
        if(this.tierInfos.tiers.length > 0){
            tName = "Tier" + this.tierInfos.tiers.length;
        }else{
            tName = "Tier0";
        }
        
        if(!addPointTier){
            this.tierInfos.tiers.push({TierName: tName, type: "seg", events: []});
        }else{
            this.tierInfos.tiers.push({TierName: tName, type: "point", events: []});
        }

        this.viewPort.selTier = this.tierInfos.tiers.length-1;
        this.viewPort.selSegment = -1;

        console.log(tName);
        $("#cans").append("<canvas id=\""+tName+"\" width=\"1024\" height=\"64\"></canvas>");
        this.tierInfos.canvases.push($("#"+tName)[0]);
        emulabeller.drawer.addTier($("#"+tName)[0]);

        this.bindTierClick($('#'+tName)[0], function (percX, percY, elID) {
            // console.log(percents);
            console.log(elID);
            my.setMarkedEvent(percX, percY, elID);
        });


        this.drawBuffer();
    },

    setMarkedEvent: function (percX, percY, elID){ // SIC bad function name!! also adds labels if click is in circle
        // console.log("###############");
        console.log(percX, elID);
        var clickedTier;
        for (var i = 0; i < this.tierInfos.tiers.length; i++) {
            if(this.tierInfos.tiers[i].TierName == elID){
                clickedTier = this.tierInfos.tiers[i];
                break;
            }
        }
        this.viewPort.selTier = i;
        console.log(this,i);
        var rXp = this.tierInfos.canvases[i].width*percX;
        var rYp = this.tierInfos.canvases[i].height*percY;
        var sXp = this.tierInfos.canvases[i].width*(this.viewPort.selectS / (this.viewPort.eS-this.viewPort.sS));
        console.log("----------------");
        console.log(rXp);
        console.log(rYp);
        console.log(sXp);
        //see if close enough to circle
        if(this.viewPort.selectS == this.viewPort.selectE && Math.abs(rXp-sXp) <= 5 && rYp < 10){
            console.log("hit the circle")
            this.addSegmentAtSelection();
        } else if(clickedTier.type=="seg"){

            var curSample = this.viewPort.sS + (this.viewPort.eS-this.viewPort.sS)*percX;
            for (var i = 0; i < clickedTier.events.length; i++) {
                // console.log("##########");
                // console.log(clickedTier.events[i].time);
                if (curSample < clickedTier.events[i].time) {
                    var clickedEvtNr = i;
                    break;
                }
            }
            // console.log(clickedTier.events[clickedEvtNr]);

            if(clickedTier.events.length > 0 && clickedTier.events[clickedEvtNr-1] && clickedTier.events[clickedEvtNr]){
                this.viewPort.selSegment = clickedEvtNr;
                // this.setView(clickedTier.events[clickedEvtNr-1].time, clickedTier.events[clickedEvtNr].time);
                this.viewPort.selectS = clickedTier.events[clickedEvtNr-1].time;
                this.viewPort.selectE = clickedTier.events[clickedEvtNr].time;
            }else{
                this.viewPort.selSegment = -1;
            }

        }else{
            this.viewPort.selSegment = -1;
        }

        this.drawBuffer();
    },

    showHideTierDial: function () {
        emulabeller.isModalShowing = true;
        $( "#dialog-messageSh" ).dialog({
          modal: true,
          close: function() {
            console.log("closing");
            emulabeller.isModalShowing = false;
          },
          buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
                var usrTxt = $("#dialShInput")[0].value;
                // emulabeller.tierInfos.tiers[0] = {};
                // emulabeller.tierInfos.canvases[0] = {};
                $("#"+usrTxt).slideToggle();
                emulabeller.isModalShowing = false;
            }
          }
        });
    },

    editLabel: function () {
        var my = this;
        console.log(this.tierInfos.tiers[this.viewPort.selTier].events[this.viewPort.selSegment].label);
        this.isModalShowing = true;
        $("#dialLabelInput")[0].value = this.tierInfos.tiers[this.viewPort.selTier].events[this.viewPort.selSegment].label;
        $("#dialog-messageSetLabel" ).dialog({
          modal: true,
          close: function() {
            console.log("closing");
            emulabeller.isModalShowing = false;
          },
          buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
                var usrTxt = $("#dialLabelInput")[0].value;
                // this.tierInfos.tiers[this.viewPort.selTier].events[this.viewPort.selSegment].label = usrTxt;
                console.log(my.tierInfos.tiers[my.viewPort.selTier].events[my.viewPort.selSegment].label);
                my.tierInfos.tiers[my.viewPort.selTier].events[my.viewPort.selSegment].label = usrTxt;
                my.drawBuffer();
            }
          }
        });

    },

    moveSelTierToTop: function () {
        var stN = this.tierInfos.tiers[this.viewPort.selTier].TierName;
        $('#'+stN).prependTo('#cans');

    },

    sendTierinfosToServer: function () {
        var sT = this.tierInfos.tiers[this.viewPort.selTier];
        console.log(sT);
        var data = {'bob':'foo','paul':'dog'};
        $.ajax({
            url: "http://127.0.0.1:8001/",
            type: 'POST',
            contentType:'application/json',
            data: JSON.stringify(sT),
            dataType:'json'
        });
    },

    addSegmentAtSelection: function() {

        var sT = emulabeller.tierInfos.tiers[emulabeller.viewPort.selTier];

        if(emulabeller.viewPort.selectS == emulabeller.viewPort.selectE){
            console.log("adding segments");
            sT.events.push({label:"", time:emulabeller.viewPort.selectS});
            console.log(sT.events);
        }else{
            sT.events.push({label:"", time:emulabeller.viewPort.selectS});
            sT.events.push({label:"", time:emulabeller.viewPort.selectE});
        }

        //resort events here!
        var bla = sT.events.sort(function(a,b) { return parseFloat(a.time) - parseFloat(b.time) } );
        console.log(bla);
        console.log(sT.events);

        emulabeller.drawBuffer();
    },
    // saveTiers: function () {
    //     var myObject = {one: "weee", two: "woooo"};
    //     console.log(this.tierInfos.tiers);
    //     var data = JSON.stringify(this.tierInfos.tiers);
    //     // console.log(data);

    //     var url = "data:application/octet-stream;base64," + window.btoa(data);
    //     var iframe;
    //     iframe = document.getElementById("hiddenDownloader");
    //     if (iframe === null)
    //     {
    //         iframe = document.createElement('iframe');
    //         iframe.id = "hiddenDownloader";
    //         iframe.style.display = "none";
    //         document.body.appendChild(iframe);
    //     }
    //     iframe.src = url;
    // },
    prepDownload: function() {
        var MIME_TYPE = 'text/plain';

        var output = document.querySelector('output');

        window.URL = window.webkitURL || window.URL;

        console.log(window.URL);

        var prevLink = output.querySelector('a');
        if (prevLink) {
            window.URL.revokeObjectURL(prevLink.href);
            output.innerHTML = '';
        }

        var bb = new Blob([JSON.stringify(this.tierInfos.tiers)], {type: MIME_TYPE});

        var a = document.createElement('a');
        a.download = "emulabellerjsOutput.txt";
        a.href = window.URL.createObjectURL(bb);
        a.textContent = 'Download ready';

        a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
        a.draggable = true; // Don't really need, but good practice.
        a.classList.add('dragout');

        output.appendChild(a);

        a.onclick = function(e) {
            if ('disabled' in this.dataset) {
              return false;
            }
            a.textContent = 'Downloaded';
            a.dataset.disabled = true;
            // cleanUp(this);
          };
    },
    
    
 


    
};




    

   
