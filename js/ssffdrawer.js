EmuLabeller.Drawer.SSFFDrawer = {

    init: function(params) {
        this.markColor = "rgba(255, 255, 0, 0.7)";
        this.boundaryColor = 'white';
        this.selBoundColor = 'red';

    },

    drawSSFF: function (ssffInfos, vP){

        // if (ssffInfos.data[0].Columns[0].name !="F0") {
        //     alert("not F0 column->not supported");
        // }

        var curContext = ssffInfos.canvases[0].getContext("2d");

        if(!ssffInfos.data[0].maxF0){
            // this.toRetinaRatio(ssffInfos.canvases[0], curContext);
            console.log("calculating max f0");
            ssffInfos.data[0].maxF0 = -Infinity;
            for (var i = 0; i < ssffInfos.data[0].Columns[0].values.length; i++) {
                // console.log(ssffInfos.data[0].Columns[0].values[i][0]);
                // f0array.push(ssffInfos.data[0].Columns[0].values[i][0]);

                if(ssffInfos.data[0].Columns[0].values[i][0] > ssffInfos.data[0].maxF0){
                    ssffInfos.data[0].maxF0 = ssffInfos.data[0].Columns[0].values[i][0];
                }
            }
        }

        var origFreq = 1/ssffInfos.data[0].Record_Freq; //time between samples not hz

        var start_time = ssffInfos.data[0].Start_Time;
        var maxF0 = ssffInfos.data[0].maxF0;
        // maxF0 = 300;

        var h = ssffInfos.canvases[0].clientHeight;
        var w = ssffInfos.canvases[0].clientWidth;

        // console.log(w);
        curContext.clearRect(0, 0, w, h);

        // samples per pixel has to be greater than 1 (for now...)
        var ratio1 = (vP.eS-vP.sS)/this.osciWidth;

        // start_time + (? * origFreq);
        var f0sS = Math.floor((vP.sS/44100)/origFreq)+1; //SIC SIC SIC check Sample + one to avoid drawing problems... bä

        var f0eS = Math.ceil((vP.eS/44100)/origFreq); // SIC check Sample

        var zoomRatio = (f0eS-f0sS)/this.osciWidth; // SIC not osci width

        curContext.strokeStyle = this.params.waveColor;
        curContext.font="12px Verdana";
        curContext.strokeText(ssffInfos.data[0].Columns[0].name, 5, 5+8);

        curContext.strokeStyle = "rgba(0,0,255,0.5)";
        curContext.fillStyle = "rgba(0,0,255,0.5)";
        // console.log(i/f0sS);
        for (var i = 1; i < f0eS-f0sS; i++) {
            curContext.beginPath();
            curContext.moveTo((i-1)/zoomRatio, h-ssffInfos.data[0].Columns[0].values[f0sS+i-1][0]/maxF0*h);
            curContext.lineTo(i/zoomRatio, h-ssffInfos.data[0].Columns[0].values[f0sS+i][0]/maxF0*h);
            curContext.stroke();
            //draw a circle
            curContext.beginPath();
            curContext.arc(i/zoomRatio, h-ssffInfos.data[0].Columns[0].values[f0sS+i][0]/maxF0*h, 1, 0, Math.PI*2, true);
            curContext.closePath();
            curContext.fill();
        }
    }


};