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
var Threads = require('webworker-threads');
var Q = require('q');

var tgParser = require('../app/scripts/workers/textGridParserWorker.js');


//vars
var path2folder = '/Users/raphaelwinkelmann/Desktop/standaloneDemoData/';
var TextGridExt = '.TextGrid';

// workers to use same code as in webApp
var tgWorker = new Threads.Worker('../app/scripts/workers/textGridParserWorker.js');
var tgDefer;

var wavWorker = new Threads.Worker('../app/scripts/workers/wavParserWorker.js');
var wavDefer;

console.log('done!')
process.exit(0)
console.log('done!')

wavWorker.postMessage({
  'cmd': 'parseBuf',
  'buffer': 1234
}); // Send data to our worker.


// var sampleRateOfWavFiles = 44100;

// var portNr = 8080;

// var dbConfig = {};


// /////////////////////////////////////////////////////////////
// ////////////// textgrid worker functions ////////////////////

// // add event listener to worker to respond to messages
// tgWorker.addEventListener('message', function (e) {
//   if (e.data.status.type === 'SUCCESS') {
//     tgDefer.resolve(e.data);
//   } else {
//     console.log(e.data)
//     tgDefer.reject(e.data);
//   }
// }, false);

// /**
//  * parse level data to Textgrid File
//  * @param level data
//  * @returns promise
//  */
// function asyncToTextGrid(levels, buffLength) {
//   tgDefer = Q.defer();
//   tgWorker.postMessage({
//     'cmd': 'toTextGrid',
//     'levels': levels,
//     'sampleRate': sampleRateOfWavFiles,
//     'buffLength': buffLength
//   }); // Send data to our worker.
//   return tgDefer.promise;
// }

// /**
//  * parse array of ssff file using webworker
//  * @param array of ssff files encoded as base64 stings
//  * @returns promise
//  */
// function asyncParseTextGrid(textGrid, annotates, name) {
//   tgDefer = Q.defer();
//   tgWorker.postMessage({
//     'cmd': 'parseTG',
//     'textGrid': textGrid,
//     'sampleRate': sampleRateOfWavFiles,
//     'annotates': annotates,
//     'name': name
//   }); // Send data to our worker.
//   return tgDefer.promise;
// }

// ////////////////////////////////////////////////////////
// ////////////// wav worker functions ////////////////////

// // add event listener to worker to respond to messages
// wavWorker.addEventListener('message', function (e) {
//   // console.log('Worker said: ', e.data);
//   if (e.data.status.type === 'SUCCESS') {
//     wavDefer.resolve(e.data.data);
//   } else {
//     console.error(e.data)
//     wavDefer.reject(e.data);
//   }
// }, false);

// /**
//  * parse buffer containing wav file using webworker
//  * @param buf
//  * @returns promise
//  */
// function parseWavArrBuf(buf) {
//   wavDefer = Q.defer();
//   wavWorker.postMessage({
//     'cmd': 'parseBuf',
//     'buffer': buf
//   }); // Send data to our worker.
//   return wavDefer.promise;
// }

// /**
//  *
//  */
// function base64ToArrayBuffer(stringBase64) {
//   // var binaryString = atob(stringBase64);
//   var b = new Buffer(stringBase64, 'base64');
//   var ab = toArrayBuffer(b);
//   console.log('###########base64ToArrayBuffer##############')
//   // console.log(typeof ab);
//   return ab;
//   // var len = binaryString.length;
//   // var bytes = new Uint8Array(len);
//   // for (var i = 0; i < len; i++) {
//   //   var ascii = binaryString.charCodeAt(i);
//   //   bytes[i] = ascii;
//   // }
//   // return bytes.buffer;
// }


// function toArrayBuffer(buffer) {
//   var ab = new ArrayBuffer(buffer.length);
//   var view = new Uint8Array(ab);
//   for (var i = 0; i < buffer.length; ++i) {
//     view[i] = buffer[i];
//   }
//   return ab;
// }

// ////////////////////////////////////////////////////

// var WebSocketServer = require('ws').Server,
//   wss = new WebSocketServer({
//     port: portNr
//   });

// console.log('websocketserver running @: ws://' + os.hostname() + ':' + portNr);

// wss.on('connection', function (ws) {

//   console.log('INFO: client connected');

//   ws.on('message', function (message) {
//     // console.log('received: %s', message);
//     var mJSO = JSON.parse(message);

//     switch (mJSO.type) {
//       // GETPROTOCOL method
//     case 'GETPROTOCOL':
//       ws.send(JSON.stringify({
//         'callbackID': mJSO.callbackID,
//         'data': {
//           'protocol': 'EMU-webApp-websocket-protocol',
//           'version': '0.0.1'
//         },
//         'status': {
//           'type': 'SUCCESS',
//           'message': ''
//         }
//       }), undefined, 0);
//       break;

//       // GETDOUSERMANAGEMENT method
//     case 'GETDOUSERMANAGEMENT':
//       ws.send(JSON.stringify({
//         'callbackID': mJSO.callbackID,
//         'data': 'NO',
//         'status': {
//           'type': 'SUCCESS',
//           'message': ''
//         }
//       }), undefined, 0);
//       break;


//       //       break;

//       // // GETGLOBALDBCONFIG method
//     case 'GETGLOBALDBCONFIG':
//       fs.readFile('textGridServerDemo_DBconfig.json', 'utf8', function (err, data) {
//         if (err) {
//           console.log('Error: ' + err);
//           ws.send(JSON.stringify({
//             'callbackID': mJSO.callbackID,
//             'status': {
//               'type': 'ERROR',
//               'message': err
//             }
//           }), undefined, 0);
//           return;
//         } else {
//           dbConfig = JSON.parse(data);

//           ws.send(JSON.stringify({
//             'callbackID': mJSO.callbackID,
//             'data': dbConfig,
//             'status': {
//               'type': 'SUCCESS',
//               'message': ''
//             }
//           }), undefined, 0);
//           // ws.send(labelData);
//         }
//       });
//       break;

//       // GETBUNDLELIST method
//       // file walks through DB to get all the bundles
//     case 'GETBUNDLELIST':
//       // var DBconfig = generateDBconfig();
//       var bundleList = [];
//       filewalker(path2folder)
//         .on('file', function (p) {

//           var patt = new RegExp('.wav$');

//           if (patt.test(p)) {
//             console.log('###########');
//             console.log(p);
//             bundleList.push({
//               'name': p.split('.')[0]
//             });
//           }
//         }).on('error', function (err) {
//           ws.send(JSON.stringify({
//             'callbackID': mJSO.callbackID,
//             'status': {
//               'type': 'ERROR',
//               'message': 'Error creating bundleList! Request type was: ' + mJSO.type + ' Error is: ' + err
//             }
//           }), undefined, 0);
//         }).on('done', function () {
//           // TODO should check if all files are there
//           ws.send(JSON.stringify({
//             'callbackID': mJSO.callbackID,
//             'data': bundleList,
//             'status': {
//               'type': 'SUCCESS',
//               'message': ''
//             }
//           }), undefined, 0);
//         }).walk();
//       break;

//       // GETBUNDLE method
//     case 'GETBUNDLE':
//       console.log(mJSO.name);
//       // console.log(dbConfig);

//       var bundle = {};
//       bundle.ssffFiles = [];
//       filewalker(path2folder)
//         .on('dir', function () {}).on('file', function (p) {
//           // var pattMedia = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + dbConfig.mediafileExtension + '$');
//           var pattMedia = new RegExp(dbConfig.mediafileExtension + '$');

//           // var pattAnnot = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + 'json' + '$');
//           var pattAnnot = new RegExp(TextGridExt + '$');

//           // set media file infos
//           if (pattMedia.test(p)) {
//             console.log(p);
//             bundle.mediaFile = {};
//             bundle.mediaFile.encoding = 'BASE64';
//             bundle.mediaFile.filePath = p;
//           }

//           // set annotation file infos
//           if (pattAnnot.test(p)) {
//             bundle.annotation = {};
//             bundle.annotation.filePath = p;
//           }

//           // set ssffTracks file infos
//           for (var i = 0; i < dbConfig.ssffTracks.length; i++) {
//             // var pattTrack = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + dbConfig.ssffTracks[i].fileExtension + '$');
//             var pattTrack = new RegExp(dbConfig.ssffTracks[i].fileExtension + '$');
//             if (pattTrack.test(p)) {
//               bundle.ssffFiles.push({
//                 ssffTrackName: dbConfig.ssffTracks[i].name,
//                 encoding: 'BASE64',
//                 filePath: p
//               });
//             }
//           }


//         }).on('error', function (err) {
//           ws.send(JSON.stringify({
//             'callbackID': mJSO.callbackID,
//             'status': {
//               'type': 'ERROR',
//               'message': 'Error getting bundle! Request type was: ' + mJSO.type + ' Error is: ' + err
//             }
//           }), undefined, 0);
//         }).on('done', function () {

//           // sync read media file
//           bundle.mediaFile.data = fs.readFileSync(path2folder + bundle.mediaFile.filePath, 'base64');

//           // sync read media file
//           var tgSting = fs.readFileSync(path2folder + bundle.annotation.filePath, 'utf8');
//           asyncParseTextGrid(tgSting, bundle.mediaFile.filePath, bundle.mediaFile.filePath.split('.')[0]).then(function (resp) {
//             // console.log(resp.data)
//             bundle.annotation = resp.data;
//             // clean up (= delete filePath)
//             delete bundle.mediaFile.filePath;

//             // sync read ssff file
//             for (var i = 0; i < dbConfig.ssffTracks.length; i++) {
//               bundle.ssffFiles[i].data = fs.readFileSync(path2folder + bundle.ssffFiles[i].filePath, 'base64');
//               delete bundle.ssffFiles[i].filePath;
//             }
//             console.log('##########################');
//             console.log('done');
//             fs.writeFileSync('/Users/raphaelwinkelmann/Desktop/bundle.json', JSON.stringify(bundle, undefined, 0));
//             ws.send(JSON.stringify({
//               'callbackID': mJSO.callbackID,
//               'data': bundle,
//               'status': {
//                 'type': 'SUCCESS',
//                 'message': ''
//               }
//             }), undefined, 0);
//           });

//         }).walk();
//       break;

//       // SAVEBUNDLE method
//     case 'SAVEBUNDLE':
//       // parse textgrid to get buffer length for textgrid parser
//       var wavBase64Rep = fs.readFileSync(path2folder + mJSO.data.annotation.annotates, 'base64');
//       var wavArrBufRep = base64ToArrayBuffer(wavBase64Rep);
//       // console.log(typeof wavArrBufRep);
//       // parseWavArrBuf(wavArrBufRep).then(function (respWavp) {
//       console.log('################llllllll########################################');
//       // console.log(respWavp);
//       asyncToTextGrid(mJSO.data.annotation.levels, 666).then(function (resp) {
//         console.log('# Saving TextGrid');
//         fs.writeFileSync('/Users/raphaelwinkelmann/Desktop/bundle.TextGrid', resp.data);

//         ws.send(JSON.stringify({
//           'callbackID': mJSO.callbackID,
//           'status': {
//             'type': 'SUCCESS'
//           }
//         }), undefined, 0);

//       }, function (errMes) {
//         console.log("yo mamaaaaaa");
//       });
//       // }, function (errMes) {
//       //   console.log(errMes);
//       // })
//       // console.log(mJSO.data);

//       break;

//     default:
//       ws.send(JSON.stringify({
//         'callbackID': mJSO.callbackID,
//         'status': {
//           'type': 'ERROR',
//           'message': 'Sent request type that is unknown to server! Request type was: ' + mJSO.type
//         }
//       }), undefined, 0);
//     }

//   });

//   //   // display that client has disconnected
//   ws.on('close', function () {
//     console.log('INFO: client disconnected');
//   });
// });