var fs = require('fs');
var userName = 'klaus';

var labelData;

var path2dataRoot = '../app/testData/';
var portNr = 8080;


var tmpRes = {
	"result": true,
	"callback_id": 1,
	"data": [{
		"first_name": "Danny",
		"last_name": "Ocean"
	}, {
		"first_name": "Rusty",
		"last_name": "Ryan"
	}]
};


var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: portNr
	});

wss.on('connection', function(ws) {

	ws.on('message', function(message) {
		console.log('received: %s', message);
		var mJSO = JSON.parse(message);
		if (mJSO.type === 'getUttList') {
			fs.readFile(path2dataRoot + mJSO.usrName + '.json', 'utf8', function(err, data) {
				if (err) {
					console.log('Error: ' + err);
					return;
				} else {
					var labelData = JSON.parse(data);

					// ws.send(JSON.stringify(tmpRes, undefined, 0));

					ws.send(JSON.stringify({
						'callback_id': mJSO.callback_id,
						'dataType': 'uttList',
						'data': labelData
					}), undefined, 0);
					// ws.send(labelData);
				}

			});

		}
	});
});