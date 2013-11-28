var fs = require('fs');
var noUserJsonBasename = 'user6';
var os = require('os');

var labelData;

var path2dataRoot = '../app/testData/';
var path2configFile = '../app/testData/customConfig.json';
var portNr = 8080;

var curUttList = [];
var curStrippedUttList = [];

var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: portNr
	});

console.log('websocketserver running @: ws://' + os.hostname() + ':' + portNr);

wss.on('connection', function(ws) {

	ws.on('message', function(message) {
		// console.log('received: %s', message);
		var mJSO = JSON.parse(message);

		// getProtocolType method
		if (mJSO.type === 'getProtocol') {
			ws.send(JSON.stringify({
				'callbackID': mJSO.callbackID,
				'data': {
					'protocol': 'emuLVC-websocket-protocol',
					'version': '0.0.1'
				},
				'status': {
					'type': 'SUCCESS',
					'message': ''
				}
			}), undefined, 0);
		}

		// getUserManagment method
		if (mJSO.type === 'getDoUserManagement') {
			ws.send(JSON.stringify({
				'callbackID': mJSO.callbackID,
				'data': 'NO',
				'status': {
					'type': 'SUCCESS',
					'message': ''
				}
			}), undefined, 0);
		}

		// getUttList method
		if (mJSO.type === 'getUttList') {
			if (mJSO.usrName === '') {
				mJSO.usrName = noUserJsonBasename;
			}
			fs.readFile(path2dataRoot + mJSO.usrName + '.json', 'utf8', function(err, data) {
				if (err) {
					console.log('Error: ' + err);
					ws.send(JSON.stringify({
						'callbackID': mJSO.callbackID,
						'data': 'USER NOT FOUND',
						'status': {
							'type': 'ERROR',
							'message': err
						}
					}), undefined, 0);
					return;
				} else {
					var labelData = JSON.parse(data);
					curUttList = labelData;
					// curStrippedUttList = stripUttList(labelData);

					ws.send(JSON.stringify({
						'callbackID': mJSO.callbackID,
						'dataType': 'uttList',
						'data': labelData,
						'status': {
							'type': 'SUCCESS',
							'message': ''
						}
					}), undefined, 0);
					// ws.send(labelData);
				}

			});
		}

		// getConfigFile method
		if (mJSO.type === 'getConfigFile') {
			fs.readFile(path2configFile, 'utf8', function(err, data) {
				if (err) {
					console.log('Error: ' + err);
					ws.send(JSON.stringify({
						'callbackID': mJSO.callbackID,
						'status': {
							'type': 'ERROR',
							'message': err
						}
					}), undefined, 0);
					return;
				} else {
					var configData = JSON.parse(data);
					curUttList = configData;
					// curStrippedUttList = stripUttList(configData);

					ws.send(JSON.stringify({
						'callbackID': mJSO.callbackID,
						'data': configData,
						'status': {
							'type': 'SUCCESS',
							'message': ''
						}
					}), undefined, 0);
					// ws.send(labelData);
				}

			});
		}


		// method like static get file method
		if (mJSO.type === 'getSSFFfile' || mJSO.type === 'getESPSfile' || mJSO.type === 'getAudioFile') {
			console.log(mJSO.fileName)
			fs.readFile(path2dataRoot + mJSO.fileName, 'binary', function(err, data) {
				if (err) {
					console.log('Error: ' + err);
					ws.send(JSON.stringify({
						'callbackID': mJSO.callbackID,
						'data': 'USER NOT FOUND',
						'status': {
							'type': 'ERROR',
							'message': err
						}
					}), undefined, 0);
					return;
				} else {
					ws.send(JSON.stringify({
						'type': mJSO.type,
						'callbackID': mJSO.callbackID,
						'fileName': mJSO.fileName,
						'data': data,
						'status': {
							'type': 'SUCCESS',
							'message': ''
						}
					}), undefined, 0);
				}
			});
		}

		// saveUttList method
		if (mJSO.type === 'saveUttList') {
			console.log('saveUttList');
			var outputPath = path2dataRoot + mJSO.usrName + '.json';
			if (fs.existsSync(outputPath)) {
				console.log('Writing to file: %s', outputPath);
				fs.writeFile(outputPath, JSON.stringify(JSON.parse(mJSO.data), null, 2), function(err) {
					if (err) {
						console.log('ERROR while saving uttList')
						console.log(err);
						ws.send(JSON.stringify({
							'callbackID': mJSO.callbackID,
							'type': mJSO.type,
							'status': {
								'type': 'ERROR',
								'message': err
							}
						}), undefined, 0);
					} else {
						console.log("uttList saved");
						ws.send(JSON.stringify({
							'callbackID': mJSO.callbackID,
							'type': mJSO.type,
							'status': {
								'type': 'SUCCESS',
								'message': ''
							}
						}), undefined, 0);
					}
				});

			}
			// ws.send(JSON.stringify({
			// 	'callbackID': mJSO.callbackID,
			// 	'type': mJSO.type,
			// 	'status': 'ERROR',
			// 	'details': 'file not found'
			// }), undefined, 0);
		}
		// saveSSFFfile
		if (mJSO.type === 'saveSSFFfile') {
			var view = new Buffer(mJSO.data, 'base64');
			console.log('Writing SSFF to file: ' + mJSO.fileURL)
			fs.writeFile(path2dataRoot + mJSO.fileURL, view, function(err) {
				if (err) {
					console.log('ERROR while saving ssff file')
					console.log(err);
					ws.send(JSON.stringify({
						'callbackID': mJSO.callbackID,
						'type': mJSO.type,
						'status': {
							'type': 'ERROR',
							'message': err
						}
					}), undefined, 0);
				} else {
					console.log('ssffFile saved');
					ws.send(JSON.stringify({
						'callbackID': mJSO.callbackID,
						'type': mJSO.type,
						'status': {
							'type': 'SUCCESS',
							'message': ''
						}
					}), undefined, 0);
				}
			});
		}

	});
});

function stripUttList(list) {
	var sF; // stripped file
	list.forEach(function(utt) {
		utt.files.forEach(function(file, fIdx) {
			sF = file.split('/')[file.split('/').length - 1];
			utt.files[fIdx] = sF;
			console.log(sF);
		})

	})
}