'use strict;'

EmuLabeller.SSFFparser = {

    init: function () {
        // this.load('data/msajc003.f0');
        this.ssffData = {};

        this.ssffData.headID = "SSFF -- (c) SHLRC\n";
        this.ssffData.machineID = "Machine IBM-PC\n";
        this.ssffData.sepString = "-----------------\n";
        this.ssffData.Record_Freq = -1;
        this.ssffData.Start_Time = -1;
        this.ssffData.Columns = [];
    },


    parseSSFF: function (buf) {
        var my = this;
        // console.log('SSFF loaded');

        var uIntBuffView =  new Uint8Array(buf);
        var buffStr = String.fromCharCode.apply(null, uIntBuffView);

        var newLsep = buffStr.split(/^/m);

        //check if header has headID and machineID
        if(newLsep[0] != my.ssffData.headID || newLsep[1] != my.ssffData.machineID){
            alert('no ssff file... or missing fields');
        }
        // check if Record_Freq+Start_Time is there
        if(newLsep[2].split(/[ ,]+/)[0]!="Record_Freq " || newLsep[3].split(/[ ,]+/)[0]!="Start_Time "){
            this.ssffData.Record_Freq = newLsep[2].split(/[ ,]+/)[1];
            this.ssffData.Start_Time = newLsep[3].split(/[ ,]+/)[1];
        }else{
            alert('no ssff file... or missing fields ');
        }

        for (var i = 4; i < newLsep.length; i++) {
            if(newLsep[i] ==  this.ssffData.sepString){
                //console.log(newLsep[i]);
                break;
            }
            var lSpl = newLsep[i].split(/[ ]+/);

            if(lSpl[0] == "Column"){
                this.ssffData.Columns.push({"name": lSpl[1], "type": lSpl[2], "length": lSpl[3], "values": []});
            }

        }

        // console.log(this.ssffData);

        // console.log(newLsep.slice(0,i+1).join("").length);

        var curBinIdx = newLsep.slice(0,i+1).join("").length;

        console.log(uIntBuffView[curBinIdx]);

        var curBufferView, curBuffer, curLen;

        while(curBinIdx <= uIntBuffView.length){

            for (i = 0; i < this.ssffData.Columns.length; i++) {
                //console.log(this.ssffData.Columns[i].length);
                if(this.ssffData.Columns[i].type == "DOUBLE"){

                    curLen = 8*this.ssffData.Columns[i].length;
                    curBuffer = buf.subarray(curBinIdx, curLen);

                    curBufferView = new Float64Array(curBuffer);

                    this.ssffData.Columns[i].values.push(curBufferView);

                    curBinIdx += curLen;

                }else if (this.ssffData.Columns[i].type == "FLOAT"){

                    curLen = 4*this.ssffData.Columns[i].length;
                    curBuffer = buf.subarray(curBinIdx, curLen);

                    curBufferView = new Float32Array(curBuffer);
                    this.ssffData.Columns[i].values.push(curBufferView);

                    curBinIdx += curLen;

                }else{
                    //console.log("fasdfsd");
                    alert("not supported... only doubles for now");
                }

            }//for
        }//while
        // console.log(this.ssffData);
        return this.ssffData;
    },

    load: function (src) {
        var my = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';

        xhr.addEventListener('load', function (e) {
            emulabeller.newFileType = 2;
            emulabeller.parseNewFile(e.target.response);
        }, false);

        xhr.open('GET', src, true);
        xhr.send();
    }
};


// var ssffparser = (function () {
//     'use strict';

//     var parser = Object.create(SSFFparser);

//     parser.init();

//     return parser;
// }());


//expand ArrayBuffer with subarray function
ArrayBuffer.prototype.subarray = function(offset, length){
    var sub = new ArrayBuffer(length);
    var subView = new Int8Array(sub);
    var thisView = new Int8Array(this);
    for(var i = 0; i < length; i++ ){
        subView[i] = thisView[offset+i];
    }
    return sub;
};



