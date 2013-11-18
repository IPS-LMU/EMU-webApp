var fs = require('fs');
var userName = 'klaus';

var labelData;

var path2dataRoot = '../app/testData/';
var portNr = 8080;



var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: portNr
	});

wss.on('connection', function(ws) {
	
	ws.send(JSON.stringify({
		'dataType': 'uttList',
		'data': 'wooooot'
	}), undefined, 0);

	ws.on('message', function(message) {
		console.log('received: %s', message);
		if (message === 'getUttList') {
			var labelData;
			fs.readFile(path2dataRoot + userName + '.json', 'utf8', function(err, data) {
				if (err) {
					console.log('Error: ' + err);
					return;
				} else {
					labelData = data;
					ws.send(labelData);
				}

			});

		}
		if (message === 'setLabelJSON') {
			ws.send(labelData);
		}
	});
});