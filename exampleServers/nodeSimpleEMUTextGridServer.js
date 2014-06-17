/**
 * small demo node server that serves TextGrid and wav files using the EMU-webApp-communication-protocol
 * SSFF files can also be defined using the textGridServerDemo_DBconfig.json
 *
 * to run:
 *  > node nodeEmuProtocolWsServer.js path/2/folder/containing/textgrids/and/audio/files/with/same/basename/
 *
 * two files with the same base name would be: msajc003.wav msajc003.TextGrid (base name == msajc003)
 *
 * Author: Raphael Winkelmann
 */


'use strict';

// load deps
var fs = require('fs');
var os = require('os');
var filewalker = require('filewalker');
var vm = require('vm');

///////////////////////
// tgParser hack:

// read in external worker file
var tgp = fs.readFileSync('../app/scripts/workers/textGridParserWorker.js', 'utf8');
// hack to remove addEventListner function
tgp = tgp.split('self.addEventListener(\'message\', function (e) {')[0];
// run in current context
vm.runInThisContext(tgp);

///////////////////////
// wav parser hack:

// read external worker file
var wp = fs.readFileSync('../app/scripts/workers/wavParserWorker.js', 'utf8');
// hack to remove addEventListner function
wp = wp.split('self.addEventListener(\'message\', function (e) {')[0];
// run in current context
vm.runInThisContext(wp);


//vars
var path2folder, sampleRateOfWavFiles;
// for testing allow no arguments
if (process.argv.length === 2){
  path2folder = '/Users/raphaelwinkelmann/Desktop/standaloneDemoData/';
  sampleRateOfWavFiles = 44100;
}else{
  // if arguments are give do set vars
  path2folder = process.argv[2];
  sampleRateOfWavFiles = process.argv[3];
}

var TextGridExt = '.TextGrid';
var portNr = 8080;
var dbConfig = {};



////////////////////////////////////////////////////////
////////////// wav parser helper functions /////////////

/**
 *
 */
function base64ToArrayBuffer(stringBase64) {
  // var binaryString = atob(stringBase64);
  var b = new Buffer(stringBase64, 'base64');
  var ab = toArrayBuffer(b);
  return ab;
}

/**
 *
 */
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

////////////////////////////////////////////////////

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

      // GETDOUSERMANAGEMENT method
    case 'GETDOUSERMANAGEMENT':
      ws.send(JSON.stringify({
        'callbackID': mJSO.callbackID,
        'data': 'NO',
        'status': {
          'type': 'SUCCESS',
          'message': ''
        }
      }), undefined, 0);
      break;


      //       break;

      // // GETGLOBALDBCONFIG method
    case 'GETGLOBALDBCONFIG':
      fs.readFile('textGridServerDemo_DBconfig.json', 'utf8', function (err, data) {
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
          dbConfig = JSON.parse(data);

          ws.send(JSON.stringify({
            'callbackID': mJSO.callbackID,
            'data': dbConfig,
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
      // var DBconfig = generateDBconfig();
      var bundleList = [];
      filewalker(path2folder)
        .on('file', function (p) {

          var patt = new RegExp('.wav$');

          if (patt.test(p)) {
            console.log('###########');
            console.log(p);
            bundleList.push({
              'name': p.split('.')[0]
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
          // TODO should check if all files are there
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
      console.log(mJSO.name);
      // console.log(dbConfig);

      var bundle = {};
      bundle.ssffFiles = [];
      filewalker(path2folder)
        .on('dir', function () {}).on('file', function (p) {
          // var pattMedia = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + dbConfig.mediafileExtension + '$');
          var pattMedia = new RegExp(dbConfig.mediafileExtension + '$');

          // var pattAnnot = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + 'json' + '$');
          var pattAnnot = new RegExp(TextGridExt + '$');

          // set media file infos
          if (pattMedia.test(p)) {
            console.log(p);
            bundle.mediaFile = {};
            bundle.mediaFile.encoding = 'BASE64';
            bundle.mediaFile.filePath = p;
          }

          // set annotation file infos
          if (pattAnnot.test(p)) {
            bundle.annotation = {};
            bundle.annotation.filePath = p;
          }

          // set ssffTracks file infos
          for (var i = 0; i < dbConfig.ssffTracks.length; i++) {
            // var pattTrack = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + dbConfig.ssffTracks[i].fileExtension + '$');
            var pattTrack = new RegExp(dbConfig.ssffTracks[i].fileExtension + '$');
            if (pattTrack.test(p)) {
              bundle.ssffFiles.push({
                ssffTrackName: dbConfig.ssffTracks[i].name,
                encoding: 'BASE64',
                filePath: p
              });
            }
          }


        }).on('error', function (err) {
          ws.send(JSON.stringify({
            'callbackID': mJSO.callbackID,
            'status': {
              'type': 'ERROR',
              'message': 'Error getting bundle! Request type was: ' + mJSO.type + ' Error is: ' + err
            }
          }), undefined, 0);
        }).on('done', function () {

          // sync read media file
          bundle.mediaFile.data = fs.readFileSync(path2folder + bundle.mediaFile.filePath, 'base64');

          // sync read media file
          var tgSting = fs.readFileSync(path2folder + bundle.annotation.filePath, 'utf8');

          // set external var 
          sampleRate = sampleRateOfWavFiles;
          var resp = toJSO(tgSting, bundle.mediaFile.filePath, bundle.mediaFile.filePath.split('.')[0]);

          console.log(resp);
          bundle.annotation = resp;
          // clean up (= delete filePath)
          delete bundle.mediaFile.filePath;

          // sync read ssff file
          for (var i = 0; i < dbConfig.ssffTracks.length; i++) {
            bundle.ssffFiles[i].data = fs.readFileSync(path2folder + bundle.ssffFiles[i].filePath, 'base64');
            delete bundle.ssffFiles[i].filePath;
          }

          console.log('##########################');
          console.log('done');
          fs.writeFileSync('/Users/raphaelwinkelmann/Desktop/bundle.json', JSON.stringify(bundle, undefined, 0));
          ws.send(JSON.stringify({
            'callbackID': mJSO.callbackID,
            'data': bundle,
            'status': {
              'type': 'SUCCESS',
              'message': ''
            }
          }), undefined, 0);

        }).walk();
      break;

      // SAVEBUNDLE method
    case 'SAVEBUNDLE':
      // parse wav file to get buffer length for textgrid parser
      var wavBase64Rep = fs.readFileSync(path2folder + mJSO.data.annotation.annotates);
      var wavArrBufRep = toArrayBuffer(wavBase64Rep);
      var resp = wav2jso(wavArrBufRep);

      // convert back to textGrid to save
      var resp = toTextGrid(mJSO.data.annotation.levels, resp.Data.length, sampleRateOfWavFiles);
      console.log('# Saving TextGrid');
      var now = new Date();
      console.log(path2folder + mJSO.data.annotation.name + '_' + now.getDate() + '-' + now.getMonth() + '-' + now.getUTCFullYear() + '.TextGrid')
      fs.writeFileSync(path2folder + mJSO.data.annotation.name + '_' + now.getDate() + '-' + now.getMonth() + '-' + now.getUTCFullYear() + '.TextGrid', resp);

      // save FORMANTS track
      console.log(path2folder + mJSO.data.annotation.name + '.fms')
      fs.writeFileSync(path2folder + mJSO.data.annotation.name + '.fms', mJSO.data.ssffFiles[0].data, 'base64');


      ws.send(JSON.stringify({
        'callbackID': mJSO.callbackID,
        'status': {
          'type': 'SUCCESS'
        }
      }), undefined, 0);

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

  //   // display that client has disconnected
  ws.on('close', function () {
    console.log('INFO: client disconnected');
  });
});