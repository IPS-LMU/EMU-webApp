import * as angular from 'angular';

class AnagestService{
	private defer;

	private $q;
	private $log;
	private ViewStateService;
	private LevelService;
	private LinkService;
	private ConfigProviderService;
	private SsffDataService;
	private ArrayHelperService;
	private ModalService;
	private HistoryService;
	private DataService;

	constructor($q, $log, ViewStateService, LevelService, LinkService, ConfigProviderService, SsffDataService, ArrayHelperService, ModalService, HistoryService, DataService){
		this.$q = $q;
		this.$log = $log;
		this.ViewStateService = ViewStateService;
		this.LevelService = LevelService;
		this.LinkService = LinkService;
		this.ConfigProviderService = ConfigProviderService;
		this.SsffDataService = SsffDataService;
		this.ArrayHelperService = ArrayHelperService;
		this.ModalService = ModalService;
		this.HistoryService = HistoryService;
		this.DataService = DataService;
	}

	/**
	 *
	 */
	insertAnagestEvents() {

		var defer = this.$q.defer();

		// precheck if there are items in selection
		var itemInSel = this.ViewStateService.getItemsInSelection(this.DataService.data.levels);
		if (itemInSel.length !== 0) {
			this.ModalService.open('views/error.html', 'There are already events in the selected area! This is not permitted...').then(() => {
				defer.reject();
			});
			return defer;
		}

		// vertical position signal
		var trackName = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.verticalPosSsffTrackName;
		var tr = this.ConfigProviderService.getSsffTrackConfig(trackName);
		var col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);

		var sRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(tr.name);

		// velocity signal
		var vTrackName = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.velocitySsffTrackName;
		var vTr = this.ConfigProviderService.getSsffTrackConfig(vTrackName);
		var vCol = this.SsffDataService.getColumnOfTrack(vTr.name, vTr.columnName);

		if (col.length !== 1 || vCol.length !== 1) {
			this.ModalService.open('views/error.html', 'UPS... the column length of of one of the tracks is != 1 this means something is badly configured in the DB!!!').then(() => {
				defer.reject();
			});
			return defer;
		}
		// flatten columns
		var flatColVals = this.ArrayHelperService.flattenArrayOfArray(col.values);
		var flatVcolVals = this.ArrayHelperService.flattenArrayOfArray(vCol.values);

		/////////////////////////////////////////

		var gdat = [NaN, NaN]; // gesture on- and offset
		var vdat = [NaN, NaN]; // peak velocities
		var ndat = [NaN, NaN]; // plateatu/nucleus on- and offset
		var cdat = [NaN]; // center


		// Looking for peak or for valley?
		var lookingForPeak;
		if (this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.gestureDirection === 'valley') {
			lookingForPeak = false;
		} else {
			lookingForPeak = true;
		}


		// easiest way to handle non-tangential signals (and has no effect on tangential signals)
		flatVcolVals = this.ArrayHelperService.convertToAbsValues(flatVcolVals);

		// selected column samples
		var startTimeSel = this.ViewStateService.getSelectedStartTime();
		var endTimeSel = this.ViewStateService.getSelectedEndTime();
		var colStartSampleNr = Math.round(startTimeSel * sRaSt.sampleRate + sRaSt.startTime);
		var colEndSampleNr = Math.round(endTimeSel * sRaSt.sampleRate + sRaSt.startTime);

		var nrOfSamples = colEndSampleNr - colStartSampleNr;

		var selCol = flatColVals.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
		var selVCol = flatVcolVals.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);


		// maxConstr
		var maxVerticalPos;
		if (lookingForPeak) {
			maxVerticalPos = this.ArrayHelperService.findMinMax(selCol, 'max');
			cdat[0] = maxVerticalPos.idx;
		} else {
			maxVerticalPos = this.ArrayHelperService.findMinMax(selCol, 'min');
			cdat[0] = maxVerticalPos.idx;
		}

		// max vel before max constriction
		var maxVelBeforeMaxConstr = this.ArrayHelperService.findMinMax(selVCol.slice(0, cdat[0] + 1), 'max');
		vdat[0] = maxVelBeforeMaxConstr.idx;

		// min vel before max vel
		var minVelBeforeMaxVel = this.ArrayHelperService.findMinMax(selVCol.slice(0, vdat[0] + 1), 'min');

		// gesture onset
		this.$log.info('Looking for gesture onset');


		this.interactiveFindThresholds(selVCol.slice(0, vdat[0] + 1), minVelBeforeMaxVel.val, maxVelBeforeMaxConstr.val, this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.threshold, 1, 'Looking for gesture onset').then((resp) => {
			// keyboard;
			var on20 = resp;
			gdat[0] = on20;

			// min vel between max vel 1 and max constriction
			var minVelBetwMaxVel1maxConstr = this.ArrayHelperService.findMinMax(selVCol.slice(vdat[0], cdat[0] + 1), 'min');

			var minp = minVelBetwMaxVel1maxConstr.idx + vdat[0];

			// nucleus onset
			this.$log.info('Looking for nucleus onset');
			this.interactiveFindThresholds(selVCol.slice(vdat[0], minp + 1), minVelBetwMaxVel1maxConstr.val, maxVelBeforeMaxConstr.val, this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.threshold, -1, 'Looking for nucleus onset').then((resp) => {
				var off20 = resp;
				ndat[0] = off20 + vdat[0];

				// max vel after max constriction
				var maxVelAfterMaxConstr = this.ArrayHelperService.findMinMax(selVCol.slice(cdat[0]), 'max'); // max vel before max constriction
				vdat[1] = maxVelAfterMaxConstr.idx + cdat[0];


				// minimum between max constriction and max vel after constriction
				var minBetwMaxConstrMaxVelConstr = this.ArrayHelperService.findMinMax(selVCol.slice(cdat[0], vdat[1] + 1), 'min');

				minp = minBetwMaxConstrMaxVelConstr.idx + cdat[0];

				// nucleus offset
				this.$log.info('Looking for nucleus offset');
				this.interactiveFindThresholds(selVCol.slice(minp, vdat[1] + 1), minBetwMaxConstrMaxVelConstr.val, maxVelAfterMaxConstr.val, this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.threshold, 1, 'Looking for nucleus offset').then((resp) => {
					var on20 = resp;
					ndat[1] = on20 + minp;

					// minimum velocity after max vel after constriction
					var minVelAfterMaxVelAfterConstr = this.ArrayHelperService.findMinMax(selVCol.slice(vdat[1]), 'min');

					minp = minVelAfterMaxVelAfterConstr.idx + vdat[1];
					// gesture offset

					this.$log.info('Looking for gesture offset');
					this.interactiveFindThresholds(selVCol.slice(vdat[1], minp + 1), minVelAfterMaxVelAfterConstr.val, maxVelAfterMaxConstr.val, this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.threshold, -1, 'Looking for gesture offset').then((resp) => {
						var off20 = resp;
						gdat[1] = off20 + vdat[1];
						// insert points
						// var insPoint;
						var curLabel;

						// console.log(gdat)
						gdat[0] = this.SsffDataService.calculateSamplePosInVP(colStartSampleNr + gdat[0], sRaSt.sampleRate, sRaSt.startTime);
						gdat[1] = this.SsffDataService.calculateSamplePosInVP(colStartSampleNr + gdat[1], sRaSt.sampleRate, sRaSt.startTime);
						curLabel = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.gestureOnOffsetLabels[0];
						var gdat0insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), gdat[0], curLabel);
						this.HistoryService.updateCurChangeObj({
							'type': 'ANNOT',
							'action': 'INSERTEVENT',
							'name': this.ViewStateService.getcurClickLevelName(),
							'start': gdat[0],
							'id': gdat0insPoint.id,
							'pointName': curLabel
						});

						curLabel = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.gestureOnOffsetLabels[1];
						var gdat1insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), gdat[1], curLabel);
						this.HistoryService.updateCurChangeObj({
							'type': 'ANNOT',
							'action': 'INSERTEVENT',
							'name': this.ViewStateService.getcurClickLevelName(),
							'start': gdat[1],
							'id': gdat1insPoint.id,
							'pointName': curLabel
						});

						// console.log(vdat);
						vdat[0] = this.SsffDataService.calculateSamplePosInVP(colStartSampleNr + vdat[0], sRaSt.sampleRate, sRaSt.startTime);
						vdat[1] = this.SsffDataService.calculateSamplePosInVP(colStartSampleNr + vdat[1], sRaSt.sampleRate, sRaSt.startTime);
						curLabel = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.maxVelocityOnOffsetLabels[0];
						var vdat0insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), vdat[0], curLabel);
						this.HistoryService.updateCurChangeObj({
							'type': 'ANNOT',
							'action': 'INSERTEVENT',
							'name': this.ViewStateService.getcurClickLevelName(),
							'start': vdat[0],
							'id': vdat0insPoint.id,
							'pointName': curLabel
						});

						curLabel = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.maxVelocityOnOffsetLabels[1];
						var vdat1insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), vdat[1], curLabel);
						this.HistoryService.updateCurChangeObj({
							'type': 'ANNOT',
							'action': 'INSERTEVENT',
							'name': this.ViewStateService.getcurClickLevelName(),
							'start': vdat[1],
							'id': vdat1insPoint.id,
							'pointName': curLabel
						});

						// console.log(ndat);
						ndat[0] = this.SsffDataService.calculateSamplePosInVP(colStartSampleNr + ndat[0], sRaSt.sampleRate, sRaSt.startTime);
						ndat[1] = this.SsffDataService.calculateSamplePosInVP(colStartSampleNr + ndat[1], sRaSt.sampleRate, sRaSt.startTime);
						curLabel = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.constrictionPlateauBeginEndLabels[0];
						var ndat0insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), ndat[0], curLabel);
						this.HistoryService.updateCurChangeObj({
							'type': 'ANNOT',
							'action': 'INSERTEVENT',
							'name': this.ViewStateService.getcurClickLevelName(),
							'start': ndat[0],
							'id': ndat0insPoint.id,
							'pointName': curLabel
						});

						curLabel = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.constrictionPlateauBeginEndLabels[1];
						var ndat1insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), ndat[1], curLabel);
						this.HistoryService.updateCurChangeObj({
							'type': 'ANNOT',
							'action': 'INSERTEVENT',
							'name': this.ViewStateService.getcurClickLevelName(),
							'start': ndat[1],
							'id': ndat1insPoint.id,
							'pointName': curLabel
						});

						// console.log(cdat);
						cdat[0] = this.SsffDataService.calculateSamplePosInVP(colStartSampleNr + cdat[0], sRaSt.sampleRate, sRaSt.startTime);
						curLabel = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.maxConstrictionLabel;
						var cdat0insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), cdat[0], curLabel);
						this.HistoryService.updateCurChangeObj({
							'type': 'ANNOT',
							'action': 'INSERTEVENT',
							'name': this.ViewStateService.getcurClickLevelName(),
							'start': cdat[0],
							'id': cdat0insPoint.id,
							'pointName': curLabel
						});

						var linkLevelName = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).anagestConfig.autoLinkLevelName;
						var linkLevelDetails = this.LevelService.getLevelDetails(linkLevelName);
						var linkLevelLabels = this.LevelService.getAllLabelsOfLevel(linkLevelDetails);

						this.ModalService.open('views/SelectLabelModal.html', linkLevelLabels, undefined, true).then((itemIdx) => {
							if (itemIdx !== false) {
								var childIDs = [
									gdat0insPoint.id, gdat1insPoint.id, vdat0insPoint.id, vdat1insPoint.id,
									ndat0insPoint.id, ndat1insPoint.id, cdat0insPoint.id
								];
								this.LinkService.insertLinksTo(linkLevelDetails.items[itemIdx].id, childIDs);
								this.HistoryService.updateCurChangeObj({
									'type': 'ANNOT',
									'action': 'INSERTLINKSTO',
									'name': linkLevelDetails.name,
									'parentID': linkLevelDetails.items[itemIdx].id,
									'childIDs': childIDs
								});
								this.HistoryService.addCurChangeObjToUndoStack();
							}
						});

						defer.resolve();
					});
				});
			});

		}, () => {
		});
		return defer.promise;
	};

	/**
	 * find threshold in array (an adapted reimplementation of findth.m by
	 * Phil Hoole Version 17.6.2006)
	 *
	 * @param x
	 * @param minVal
	 * @param maxVal
	 * @param threshold
	 * @param direction
	 * @param descriptions describes the task
	 * @returns promise that resolves to threshold value
	 */
	public interactiveFindThresholds(x, minVal, maxVal, threshold, direction, description) {
		// console.log('interactiveFindThresholds');
		var i;

		var thdat = minVal + (maxVal - minVal) * threshold;

		var thdir = direction;

		thdat = thdat * thdir;


		var xx = this.ArrayHelperService.multiplyEachElement(x, thdir); // handle positive/neg.

		var lx = xx.length;
		var xsh = xx.slice(1, lx);
		var loguk = 0;
		var higuk = lx - 1;

		// vz=find((xsh>=thdat)&(xx(1:(lx-1))<thdat));
		var vz = [];
		for (i = 0; i < xx.length; i++) {
			if ((xsh[i] >= thdat) && (xx[i] < thdat)) {
				vz.push(i);
			}
		}

		// anavv=find(vz>=loguk & vz<=higuk);
		var anavv = [];
		for (i = 0; i < vz.length; i++) {
			if ((vz[i] >= loguk) && vz[i] <= higuk) {
				anavv.push(i);
			}
		}

		if (anavv.length > 1) {
			var defer = this.$q.defer();
			var infos = {} as any;
			infos.description = description;
			infos.options = [];
			infos.y = xx;
			infos.minVal = minVal;
			infos.maxVal = maxVal;
			infos.threshold = threshold;
			for (i = 0; i < vz.length; i++) {
				infos.options.push({
					'thresholdIdx': vz[i],
					'thresholdValue': xx[i],
				});
			}

			this.ModalService.open('views/SelectThresholdModal.html', infos, undefined, true).then((resp) => {
				// console.log(resp);
				var ap = vz[anavv[resp]];
				ap = this.ArrayHelperService.interp2points(xx[ap], ap, xx[ap + 1], ap + 1, thdat);
				defer.resolve(ap);
			});
			return defer.promise;
		} else if (anavv.length === 0) {
			defer = this.$q.defer();
			this.ModalService.open('views/error.html', 'Could not find any values that step over the threshold!!').then(() => {
				defer.reject('Could not find any values that step over the threshold!!');
			});
			return defer.promise;
		} else {
			defer = this.$q.defer();
			var ap = vz[anavv[0]];
			ap = this.ArrayHelperService.interp2points(xx[ap], ap, xx[ap + 1], ap + 1, thdat);
			defer.resolve(ap);
			return defer.promise;
		}

	};

}

angular.module('emuwebApp')
	.service('AnagestService', ['$q', '$log', 'ViewStateService', 'LevelService', 'LinkService', 'ConfigProviderService', 'SsffDataService', 'ArrayHelperService', 'ModalService', 'HistoryService', 'DataService', AnagestService]);