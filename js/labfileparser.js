EmuLabeller.LabFileParser = {

	/**
	 *
	 */
	init: function() {
		this.ssr = 44100;
	},

	/**
	 *
	 */
	parseFile: function(string, tierNr) {

		// console.log(tierInfos);
		var lines = string.split("\n");

		var tiers = [];

		tiers.push({
			TierName: 'Tier' + tierNr,
			type: 'seg',
			events: []
		});

		var els = lines[3].split(/\s+/);
		if (els[3] != "H#") tiers[tiers.length - 1].type = "point";

		for (var i = 3; i < lines.length; i++) {
			// console.log(lines[i].split(/\s+/));
			els = lines[i].split(/\s+/);
			tiers[tiers.length - 1].events.push({
				label: els[3],
				time: els[1] * this.ssr
			});
		}
		return tiers;
	},

	/**
	 * generate lab file sting containing labels of
	 * tierDetails given
	 *
	 * @param tierDetails of tier to write to sting
	 * @return a sting containing the lab file
	 */
	toESPS: function(tierDetails) {

		var lF = ""; // lab file
		lF = lF + "signal " + emulabeller.curLoadedBaseName + "\n";
		lF = lF + "nfields 1\n#\n";

		for (var i in tierDetails.events) {
			var c = tierDetails.events[i];
			var eT = (c.startSample + c.sampleDur) / this.ssr;
			lF = lF + "\t" + eT + "\t125\t" + c.label + "\n";
		}

		console.log(tierDetails);
		console.log(lF);

		return (lF);
	}

};