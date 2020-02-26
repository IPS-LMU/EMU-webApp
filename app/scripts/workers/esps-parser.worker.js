/**
 * A simple class that creates another thread
 * which does the espsParserWorker work
 * @class espsParserWorker
 * @constructor
 * @param Worker {Worker} injection point for Worker
 */
export function EspsParserWorker(Worker) {
	Worker = Worker || window.Worker;
	this.url = this.getWorkerURL();
	this.worker = new Worker(this.url);
}

EspsParserWorker.prototype = {
	// get the worker script in string format.
	getWorkerScript: function () {
		var js = '';
		js += '(' + this.workerInit + ')(this);';
		return js;
	},

	// This function really represents the body of our worker script.
	// The global context of the worker script will be passed in.
	workerInit: function (global) {

		global.toJSO = function (string, annotates, name, sampleRate) {

			var labelJSO = {};
			labelJSO.name = name;
			labelJSO.annotates = annotates;
			labelJSO.sampleRate = sampleRate;
			labelJSO.levels = [];

			// var ext = '_' + filePath.split('.')[filePath.split('.').length - 1];

			// remove all empty lines from string
			string = string.replace(/([ \t]*\r?\n)+/g, '\n');
			// replace all blanks with single whitespace
			string = string.replace(/[ \t]+/g, ' ');
			var lines = string.split('\n');

			// find header end
			var headEndIdx;
			for (var i = 0; i < lines.length; i++) {
				if (lines[i] === '#') {
					headEndIdx = i;
					break;
				}
			}

			//init empty labelJSO
			labelJSO.levels[0] = {};
			labelJSO.levels[0].name = name;
			labelJSO.levels[0].items = [];

			var idCounter = 1;

			// set level type
			var prevLineArr;
			var curLineArr = lines[headEndIdx + 1].split(/\s+/);
			if (curLineArr[curLineArr.length - 1] !== 'H#') {
				labelJSO.levels[0].type = 'EVENT';
			} else {
				labelJSO.levels[0].type = 'SEGMENT';
			}

			if (labelJSO.levels[0].type === 'EVENT') {
				for (i = headEndIdx + 1; i < lines.length - 1; i++) {
					curLineArr = lines[i].split(/\s+/);
					labelJSO.levels[0].items.push({
						id: idCounter,
						labels: [{
							name: name,
							value: curLineArr[curLineArr.length - 1]
						}],
						samplePoint: Math.floor(curLineArr[1] * sampleRate)
					});
					idCounter += 1;
				}
			} else {
				// take care of H# by not doing anything :-)
				idCounter += 1;

				for (i = headEndIdx + 2; i < lines.length - 1; i++) {
					curLineArr = lines[i].split(/\s+/);
					prevLineArr = lines[i - 1].split(/\s+/);
					labelJSO.levels[0].items.push({
						id: idCounter,
						labels: [{
							name: name,
							value: curLineArr[curLineArr.length - 1]
						}],
						sampleStart: Math.floor(prevLineArr[1] * sampleRate),
						sampleDur: Math.floor(curLineArr[1] * sampleRate) - Math.floor(prevLineArr[1] * sampleRate) - 1
					});
					idCounter += 1;
				}

			}
			return labelJSO;
		};

		/**
		 * SIC! This function probably has to be fixed...
		 */
		global.toESPS = function (data, name, sampleRate) {
			var espsStr = '';
			// construct header
			espsStr += 'signal ' + name + '\n';
			espsStr += 'nfields 1\n';
			espsStr += '#\n';
			var curLabel;
			for (var j = 0; j < data.length; j++) {
				//angular.forEach(data, function (i, idx) {
				if (data[j].labels[0].value === '' && j === 0) {
					curLabel = 'H#';
				} else {
					curLabel = data[j].labels[0].value;
				}
				espsStr += '\t' + String((data[j].sampleStart + data[j].sampleDur) / sampleRate) + '\t125\t' + curLabel + '\n';
			}
			//});

			// console.log(espsStr);
			return espsStr;
		};


		global.onmessage = function (e) {
			if (e.data !== undefined) {
				var retVal;
				switch (e.data.cmd) {
					case 'parseESPS':
						retVal = global.toJSO(e.data.esps, e.data.annotates, e.data.name, e.data.sampleRate);
						if (retVal.type === undefined) {
							global.postMessage({
								'status': {
									'type': 'SUCCESS',
									'message': ''
								},
								'data': retVal
							});
						} else {
							global.postMessage(retVal);
						}
						break;
					case 'parseJSO':
						retVal = global.toESPS(e.data.level.items, e.data.level.name, e.data.sampleRate);
						if (retVal.type === undefined) {
							global.postMessage({
								'status': {
									'type': 'SUCCESS',
									'message': ''
								},
								'data': retVal
							});
						} else {
							global.postMessage(retVal);
						}
						break;
					default:
						global.postMessage({
							'status': {
								'type': 'ERROR',
								'message': 'Unknown command sent to espsParserWorker'
							}
						});

						break;
				}
			}
			else {
				global.postMessage({
					'status': {
						'type': 'ERROR',
						'message': 'Undefined message was sent to espsParserWorker'
					}
				});
			}
		};
	},


	// get a blob url for the worker script from the worker script text
	getWorkerURL: function () {
		var blob, urlObj;
		try {
			blob = new Blob([this.getWorkerScript()], {type: 'application/javascript'});
		} catch (e) { // Backwards-compatibility
			window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
			blob = new BlobBuilder();
			blob.append(EspsParserWorker);
			blob = blob.getBlob();
		}
		if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
			urlObj = webkitURL.createObjectURL(blob);
		} else {
			urlObj = URL.createObjectURL(blob);
		}
		return urlObj;
	},


	// kill the espsParserWorker
	kill: function () {
		if (this.worker) {
			this.worker.terminate();
		}
		if (this.url) {
			URL.revokeObjectURL(this.url);
		}
	},

	// say something to the espsParserWorker
	tell: function (msg) {
		if (this.worker) {
			this.worker.postMessage(msg);
		}
	},

	// listen for the espsParserWorker to talk back
	says: function (handler) {
		if (this.worker) {
			this.worker.addEventListener('message', function (e) {
				handler(e.data);
			});
		}
	},
};