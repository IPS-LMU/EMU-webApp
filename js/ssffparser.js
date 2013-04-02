var SSFFparser = {

    init: function () {
        this.load('data/msajc003.fms')
    },


    newlyLoadedSSFF: function (buf) {
        //console.log('SSFF loaded');
        
        //var v2 = new Int8Array(buf);
        //console.log(v2[0]);
        var buffStr = String.fromCharCode.apply(null, new Uint8Array(buf));

        var newLsep = buffStr.split(/^/m);


        //for (var i = 0; i < 50; i++) {
        //    console.log(v[i]);
        //}
    },

    load: function (src) {
        var my = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';

        xhr.addEventListener('load', function (e) {
            my.newlyLoadedSSFF(e.target.response);
        }, false);

        xhr.open('GET', src, true);
        xhr.send();
    }

};


var ssffparser = (function () {
    'use strict';

    var parser = Object.create(SSFFparser);

    parser.init();

    return parser;
}());

