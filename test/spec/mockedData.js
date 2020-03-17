'use strict';

////////////////////
// config files

// defaultEmuwebapp config
jasmine.getFixtures().fixturesPath = 'base/configFiles/';
var f = readFixtures('default_emuwebappConfig.json');
var defaultEmuwebappConfig = JSON.parse(f)

// designEmuwebapp config
jasmine.getFixtures().fixturesPath = 'base/configFiles/';
var f = readFixtures('default_emuwebappDesign.json');
var defaultEmuwebappDesign = JSON.parse(f)

// ae
jasmine.getFixtures().fixturesPath = 'base/demoDBs/ae/';
var f = readFixtures('ae_DBconfig.json');
var aeDbConfig = JSON.parse(f);

// ema
jasmine.getFixtures().fixturesPath = 'base/demoDBs/ema/';
var f = readFixtures('ema_DBconfig.json');
var emaDbConfig = JSON.parse(f);

// epgdorsal
jasmine.getFixtures().fixturesPath = 'base/demoDBs/epgdorsal/';
var f = readFixtures('epgdorsal_DBconfig.json');
var epgdorsalDbConfig = JSON.parse(f);

/////////////////////
// bundle data

// ae msajc003_bndl
jasmine.getFixtures().fixturesPath = 'base/demoDBs/ae/';
var f = readFixtures('msajc003_bndl.json');
var msajc003_bndl = JSON.parse(f);
var f = readFixtures('ae_bundleList.json');
var ae_bundleList = JSON.parse(f);

// ema dfgspp_mo1_prosody_0024_bndl
jasmine.getFixtures().fixturesPath = 'base/demoDBs/ema/';
var f = readFixtures('dfgspp_mo1_prosody_0024_bndl.json');
var dfgspp_mo1_prosody_0024_bndl = JSON.parse(f);

// epgdorsal
jasmine.getFixtures().fixturesPath = 'base/demoDBs/epgdorsal/';
var f = readFixtures('JDR10_bndl.json');
var JDR10_bndl = JSON.parse(f);

/////////////////////
// schemas data

// annotationFileSchema
jasmine.getFixtures().fixturesPath = 'base/schemaFiles/';
var f = readFixtures('annotationFileSchema.json');
var annotationFileSchema = JSON.parse(f);

// bundleListSchema
jasmine.getFixtures().fixturesPath = 'base/schemaFiles/';
var f = readFixtures('bundleListSchema.json');
var bundleListSchema = JSON.parse(f);

// emuwebappConfigSchema
jasmine.getFixtures().fixturesPath = 'base/schemaFiles/';
var f = readFixtures('bundleSchema.json');
var bundleSchema = JSON.parse(f);

// DBconfigFileSchema
jasmine.getFixtures().fixturesPath = 'base/schemaFiles/';
var f = readFixtures('DBconfigFileSchema.json');
var DBconfigFileSchema = JSON.parse(f);

// globalDBSchema
jasmine.getFixtures().fixturesPath = 'base/schemaFiles/';
var f = readFixtures('globalDBschema.json');
var globalDBSchema = JSON.parse(f);

// emuwebappConfigSchema
jasmine.getFixtures().fixturesPath = 'base/schemaFiles/';
var f = readFixtures('emuwebappConfigSchema.json');
var emuwebappConfigSchema = JSON.parse(f);

// emuwebappConfigSchema
jasmine.getFixtures().fixturesPath = 'base/schemaFiles/';
var f = readFixtures('designSchema.json');
var designSchema = JSON.parse(f);

////////////////////////////
// files for parsing tests

// esps file containing segments
jasmine.getFixtures().fixturesPath = 'base/testData/oldFormat/msajc003/';
// var msajc003EspsLabFile = readFixtures('msajc003.lab');

// // esps file containing events
// var msajc003EspsToneFile = readFixtures('msajc003.tone');

// // TextGrid file containing segments and events
// var msajc003TextGridFile = readFixtures('msajc003.TextGrid');
// var msajc003TextGridFileNew = readFixtures('msajc003_new.TextGrid');


function getItemFromJSON(anno, itemID) {
  var ret = undefined;
  for(var x = 0; x < anno.levels.length; x++) {
    for(var j = 0; j < anno.levels[x].items.length; j++) {
      var item = anno.levels[x].items[j];
      if(item.id === itemID) {
        ret = item;
      }
    }
  }
  return ret;
}


//////////////////////////////
// hardcoded JSO
var dataArr = [1,2,3,4,5,6,7,8];
var buf = new Float32Array(dataArr).buffer;

var parsedWavJSO = {
  "ChunkID":"RIFF",
  "ChunkSize":116214,
  "Format":"WAVE",
  "Subchunk1ID":"fmt ",
  "Subchunk1Size":16,
  "AudioFormat":1,
  "NumChannels":1,
  "SampleRate":20000,
  "ByteRate":40000,
  "BlockAlign":2,
  "BitsPerSample":16,
  "Subchunk2ID":"data",
  "Subchunk2Size":0,
  "Data":[1,2,3,4,5,6,7,8],
  "origArrBuf": buf
}