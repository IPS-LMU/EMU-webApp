var fs = require('fs');
var os = require('os');
var filewalker = require('filewalker');

var pathToDbRoot = '../app/testData/ignoredData/epgdorsal/';
var configName = 'epgdorsal_DBconfig.json';


var destination = '../app/demoDBs/';

var dbName = configName.split('_')[0];

// read db config

var rawConfig = fs.readFileSync(pathToDbRoot + configName, 'utf8');

var dbConfig = JSON.parse(rawConfig);

// generate demo db folder and fill with bundles
fs.mkdir(destination + dbName, function (err) {
  if (err) {
    console.log(err);
    return;
  } else {
    // copy db config
    fs.createReadStream(pathToDbRoot + configName).pipe(fs.createWriteStream(destination + dbName + '/' + configName));
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
        var wstream = fs.createWriteStream(destination + dbName + '/' + dbName + '_bundleList.json');
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
              var wstream = fs.createWriteStream(destination + dbName + '/' + el.name + '_bndl.json');
              wstream.write(JSON.stringify(bundle, undefined, 1));
              wstream.end();

            }).walk();
        });

      }).walk();
  }
});
