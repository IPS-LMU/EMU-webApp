var fs = require('fs');
var os = require('os');
var filewalker = require('filewalker');

var labelData;

var pathToDbRoot = '../app/testData/newAE/';
var configName = 'ae.json';

var portNr = 8080;


var curUttList = [];
var curStrippedUttList = [];

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({
    port: portNr
  });

console.log('websocketserver running @: ws://' + os.hostname() + ':' + portNr);

wss.on('connection', function (ws) {

  console.log('INFO: client connected');

  ws.on('message', function (message) {
    // console.log('received: %s', message);
    var mJSO = JSON.parse(message);

    switch (mJSO.type) {
      // GETPROTOCOL method
    case 'GETPROTOCOL':
      ws.send(JSON.stringify({
        'callbackID': mJSO.callbackID,
        'data': {
          'protocol': 'EMU-webApp-websocket-protocol',
          'version': '0.0.1'
        },
        'status': {
          'type': 'SUCCESS',
          'message': ''
        }
      }), undefined, 0);
      break;

      // GETGLOBALDBCONFIG method
    case 'GETGLOBALDBCONFIG':
      fs.readFile(pathToDbRoot + configName, 'utf8', function (err, data) {
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
      break;

      // GETBUNDLELIST method
      // file walks through DB to get all the bundles
    case 'GETBUNDLELIST':
      var bundleList = [];
      filewalker(pathToDbRoot)
        .on('dir', function (p) {
          var patt = new RegExp('^SES[^/]+/[^/]+$');

          if (patt.test(p)) {
            var arr = p.split('/');
            bundleList.push({
              'name': arr[arr.length - 1]
            });
          }
        }).on('error', function (err) {
          ws.send(JSON.stringify({
            'callbackID': mJSO.callbackID,
            'status': {
              'type': 'ERROR',
              'message': 'Error creating bundleList! Request type was: ' + mJSO.type + ' Error is: ' + err
            }
          }), undefined, 0);
        }).on('done', function () {
          ws.send(JSON.stringify({
            'callbackID': mJSO.callbackID,
            'data': bundleList,
            'status': {
              'type': 'SUCCESS',
              'message': ''
            }
          }), undefined, 0);
        }).walk();
      break;

      // GETBUNDLE method
    case 'GETBUNDLE':

      break;

    default:
      ws.send(JSON.stringify({
        'callbackID': mJSO.callbackID,
        'status': {
          'type': 'ERROR',
          'message': 'Sent request type that is unknown to server! Request type was: ' + mJSO.type
        }
      }), undefined, 0);
    }

  });

  // display that client has disconnected
  ws.on('close', function () {
    console.log('INFO: client disconnected');
  });
});