EmuLabeller.LabFileParser = {


	parseFile: function (string, tierInfos) {

		var ssr = 44100; // stream sample rate SIC... do on init!!!

		// console.log(tierInfos);
		var lines = string.split("\n");

		tierInfos.tiers.push({TierName: 'Tier'+tierInfos.tiers.length,
									type: 'seg',
									events: []});

		var els = lines[3].split(/\s+/);
		if(els[3]!= "H#") tierInfos.tiers[tierInfos.tiers.length-1].type = "point";

		for (var i = 3; i < lines.length; i++) {
			// console.log(lines[i].split(/\s+/));
			els = lines[i].split(/\s+/);
			tierInfos.tiers[tierInfos.tiers.length-1].events.push(
				{label: els[3], time: els[1] * ssr});
		}
		// console.log(tierInfos);
	}
};