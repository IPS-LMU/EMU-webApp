var fs = require('fs');
var os = require('os');
var filewalker = require('filewalker');

var pathToDbRoot = '../app/testData/newFormat/ae/';
var configName = 'ae_DBconfig.json';


var destination = '../app/demoDBs/';


// read db config

var rawConfig = fs.readFileSync(pathToDbRoot + configName, 'utf8');

var dbConfig = JSON.parse(rawConfig);

// generate demo db folder and fill with bundles
fs.mkdir(destination + 'ae', function (err) {
  if (err) {
    console.log(err);
    return;
  } else {
    // copy db config
    fs.createReadStream(pathToDbRoot + configName).pipe(fs.createWriteStream(destination + 'ae/' + configName));
    // create bundle list
    var bundleList = [];
    filewalker(pathToDbRoot)
      .on('dir', function (p) {

        var patt = new RegExp('^.+_ses+/.+_bndl$');
        // var patt = new RegExp('^SES[^/]+/[^/]+$');

        if (patt.test(p)) {
          // console.log('###########')
          // console.log(p)
          var arr = p.split('/');
          var nArr = arr[arr.length - 1].split('_');
          nArr.pop();
          bundleList.push({
            'name': nArr.join('_')
          });
        }
      }).on('error', function (err) {
        console.log(err);
        return;
      }).on('done', function () {
        var wstream = fs.createWriteStream(destination + 'ae/ae_bundleList.json');
        wstream.write(JSON.stringify(bundleList, undefined, 1));
        wstream.end();
        bundleList.forEach(function (el) {
          console.log(el.name);

          var bundle = {};
          bundle.ssffFiles = [];
          filewalker(pathToDbRoot)
            .on('dir', function (p) {}).on('file', function (p) {
              // var pattMedia = new RegExp('^SES[^/]+/' + el.name + '/[^/]+' + dbConfig.mediafileExtension + '$');
              var pattMedia = new RegExp('^.+_ses+/' + el.name + '_bndl' + '/[^/]+' + dbConfig.mediafileExtension + '$');

              // var pattAnnot = new RegExp('^SES[^/]+/' + el.name + '/[^/]+' + 'json' + '$');
              var pattAnnot = new RegExp('^.+_ses+/' + el.name + '_bndl' + '/[^/]+' + 'json' + '$');

              // read media file
              if (pattMedia.test(p)) {
                console.log(p);
                bundle.mediaFile = {};
                bundle.mediaFile.encoding = 'BASE64';
                bundle.mediaFile.filePath = p;
              }
              // read annotation file
              if (pattAnnot.test(p)) {
                bundle.annotation = {};
                bundle.annotation.filePath = p;
              }
              // read ssffTracks

              for (var i = 0; i < dbConfig.ssffTracks.length; i++) {
                // var pattTrack = new RegExp('^SES[^/]+/' + el.name + '/[^/]+' + dbConfig.ssffTracks[i].fileExtension + '$');
                var pattTrack = new RegExp('^.+_ses+/' + el.name + '_bndl' + '/[^/]+' + dbConfig.ssffTracks[i].fileExtension + '$');
                if (pattTrack.test(p)) {
                  bundle.ssffFiles.push({
                    ssffTrackName: dbConfig.ssffTracks[i].name,
                    encoding: 'BASE64',
                    filePath: p
                  });
                }
              }


            }).on('error', function (err) {
              console.log(err);
              return;
            }).on('done', function () {
              console.log(bundle);

              bundle.mediaFile.data = fs.readFileSync(pathToDbRoot + bundle.mediaFile.filePath, 'base64');
              delete bundle.mediaFile.filePath;

              bundle.annotation = JSON.parse(fs.readFileSync(pathToDbRoot + bundle.annotation.filePath, 'utf8'));
              // delete bundle.annotation.filePath;
              console.log(bundle.ssffFiles)
              for (var i = 0; i < dbConfig.ssffTracks.length; i++) {
                bundle.ssffFiles[i].data = fs.readFileSync(pathToDbRoot + bundle.ssffFiles[i].filePath, 'base64');
                delete bundle.ssffFiles[i].filePath;
              }
              console.log('##########################');
              console.log('done');
              // fs.writeFileSync('/Users/raphaelwinkelmann/Desktop/bundle.json', JSON.stringify(bundle, undefined, 0));
              var wstream = fs.createWriteStream(destination + 'ae/' + el.name + '_bndl.json');
              wstream.write(JSON.stringify(bundle, undefined, 1));
              wstream.end();

            }).walk();
        });

      }).walk();
  }
});



// var portNr = 8080;

// var dbConfig = {};


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

//       // GETGLOBALDBCONFIG method
//     case 'GETGLOBALDBCONFIG':
//       fs.readFile(pathToDbRoot + configName, 'utf8', function (err, data) {
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
//           // curUttList = dbConfig;
//           // curStrippedUttList = stripUttList(dbConfig);

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
//       var bundleList = [];
//       filewalker(pathToDbRoot)
//         .on('dir', function (p) {

//           var patt = new RegExp('^.+_ses+/.+_bndl$');
//           // var patt = new RegExp('^SES[^/]+/[^/]+$');

//           if (patt.test(p)) {
//             console.log('###########')
//             console.log(p)
//             var arr = p.split('/');
//             var nArr = arr[arr.length - 1].split('_');
//             nArr.pop();
//             bundleList.push({
//               'name': nArr.join('_')
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

//       var bundle = {};
//       bundle.ssffFiles = [];
//       filewalker(pathToDbRoot)
//         .on('dir', function (p) {}).on('file', function (p) {
//           // var pattMedia = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + dbConfig.mediafileExtension + '$');
//           var pattMedia = new RegExp('^.+_ses+/' + mJSO.name + '_bndl' + '/[^/]+' + dbConfig.mediafileExtension + '$');

//           // var pattAnnot = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + 'json' + '$');
//           var pattAnnot = new RegExp('^.+_ses+/' + mJSO.name + '_bndl' + '/[^/]+' + 'json' + '$');

//           // read media file
//           if (pattMedia.test(p)) {
//             console.log(p);
//             bundle.mediaFile = {};
//             bundle.mediaFile.encoding = 'BASE64';
//             bundle.mediaFile.filePath = p;
//           }
//           // read annotation file
//           if (pattAnnot.test(p)) {
//             bundle.annotation = {};
//             bundle.annotation.filePath = p;
//           }
//           // read ssffTracks

//           for (var i = 0; i < dbConfig.ssffTracks.length; i++) {
//             // var pattTrack = new RegExp('^SES[^/]+/' + mJSO.name + '/[^/]+' + dbConfig.ssffTracks[i].fileExtension + '$');
//             var pattTrack = new RegExp('^.+_ses+/' + mJSO.name + '_bndl' + '/[^/]+' + dbConfig.ssffTracks[i].fileExtension + '$');
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
//           console.log(bundle);

//           bundle.mediaFile.data = fs.readFileSync(pathToDbRoot + bundle.mediaFile.filePath, 'base64');
//           delete bundle.mediaFile.filePath;

//           bundle.annotation = JSON.parse(fs.readFileSync(pathToDbRoot + bundle.annotation.filePath, 'utf8'));
//           // delete bundle.annotation.filePath;
//           console.log(bundle.ssffFiles)
//           for (var i = 0; i < dbConfig.ssffTracks.length; i++) {
//             bundle.ssffFiles[i].data = fs.readFileSync(pathToDbRoot + bundle.ssffFiles[i].filePath, 'base64');
//             delete bundle.ssffFiles[i].filePath;
//           }
//           console.log('##########################');
//           console.log('done');
//           // fs.writeFileSync('/Users/raphaelwinkelmann/Desktop/bundle.json', JSON.stringify(bundle, undefined, 0));
//           ws.send(JSON.stringify({
//             'callbackID': mJSO.callbackID,
//             'data': bundle,
//             'status': {
//               'type': 'SUCCESS',
//               'message': ''
//             }
//           }), undefined, 0);

//         }).walk();
//       break;

//       // SAVEBUNDLE method
//     case 'SAVEBUNDLE':
//       console.log('### Pretending to save bundle...');
//       // console.log(mJSO.data.annotation);
//       ws.send(JSON.stringify({
//         'callbackID': mJSO.callbackID,
//         'status': {
//           'type': 'SUCCESS',
//           'message': 'Pst... I did not really do anything. Please do not tell anyone...'
//         }
//       }), undefined, 0);
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

//   // display that client has disconnected
//   ws.on('close', function () {
//     console.log('INFO: client disconnected');
//   });
// });

/**
 *
 */
function sendBundle(ws, bundle) {
  console.log(bundle);
}