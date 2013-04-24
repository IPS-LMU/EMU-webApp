EmuLabeller.LabFileParser = {


	parseFile: function (string, tierNr) {

		var ssr = 44100; // stream sample rate SIC... do on init!!!

		// console.log(tierInfos);
		var lines = string.split("\n");

		var tiers = [];

		tiers.push({TierName: 'Tier'+tierNr,
									type: 'seg',
									events: []});

		var els = lines[3].split(/\s+/);
		if(els[3]!= "H#") tiers[tiers.length-1].type = "point";

		for (var i = 3; i < lines.length; i++) {
			// console.log(lines[i].split(/\s+/));
			els = lines[i].split(/\s+/);
			tiers[tiers.length-1].events.push(
				{label: els[3], time: els[1] * ssr});
		}
		return tiers;
	},

    load: function (src) {
        var my = this;
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'text';

        xhr.addEventListener('load', function (e) {
    		emulabeller.newFileType = 1;
            emulabeller.parseNewFile(e.target.response);
        }, false);

        xhr.open('GET', src, true);
        xhr.send();
    }
};