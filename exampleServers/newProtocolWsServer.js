var fs = require('fs');
var noUserJsonBasename = 'user6';
var os = require('os');

var labelData;

var path2dataRoot = '../app/testData/';
var path2configFile = '../app/testData/customConfig.json';
var accessCode = '4321';

var portNr = 8080;


var curUttList = [];
var curStrippedUttList = [];

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({
    port: portNr
  });

console.log('websocketserver running @: ws://' + os.hostname() + ':' + portNr);

wss.on('connection', function (ws) {

  ws.on('message', function (message) {
    // console.log('received: %s', message);
    var mJSO = JSON.parse(message);

    switch (mJSO.type) {
      // getProtocolType method
    case 'GETPROTOCOL':
      console.log('aaaaah')
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

      // getConfigFile method
    case 'GETGLOBALDBCONFIG':
      fs.readFile(path2configFile, 'utf8', function (err, data) {
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

      // getUttList method
    case 'getUttList':
      if (mJSO.usrName === '') {
        mJSO.usrName = noUserJsonBasename;
      }
      fs.readFile(path2dataRoot + mJSO.usrName + '.json', 'utf8', function (err, data) {
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
      break;

    default:
      console.error("here sdfhsdfasd")
      ws.send(JSON.stringify({
        'callbackID': mJSO.callbackID,
        'status': {
          'type': 'ERROR',
          'message': 'Sent request type that is unknown to server! Request type was: ' + mJSO.type
        }
      }), undefined, 0);
    }

  });
});