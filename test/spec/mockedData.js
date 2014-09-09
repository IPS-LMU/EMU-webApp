'use strict';

////////////////////
// config files

// defaultEmuwebapp config
jasmine.getFixtures().fixturesPath = 'base/app/configFiles/';
var f = readFixtures("default_emuwebappConfig.json");
var defaultEmuwebappConfig = JSON.parse(f)

// ae
jasmine.getFixtures().fixturesPath = 'base/app/demoDBs/ae/';
var f = readFixtures("ae_DBconfig.json");
var aeDbConfig = JSON.parse(f);

// ema
jasmine.getFixtures().fixturesPath = 'base/app/demoDBs/ema/';
var f = readFixtures("ema_DBconfig.json");
var emaDbConfig = JSON.parse(f);

// epgdorsal
jasmine.getFixtures().fixturesPath = 'base/app/demoDBs/epgdorsal/';
var f = readFixtures("epgdorsal_DBconfig.json");
var epgdorsalDbConfig = JSON.parse(f);

/////////////////////
// bundle data

// ae msajc003_bndl
jasmine.getFixtures().fixturesPath = 'base/app/demoDBs/ae/';
var f = readFixtures("msajc003_bndl.json");
var msajc003_bndl = JSON.parse(f);

// ema dfgspp_mo1_prosody_0024_bndl
jasmine.getFixtures().fixturesPath = 'base/app/demoDBs/ema/';
var f = readFixtures("dfgspp_mo1_prosody_0024_bndl.json");
var dfgspp_mo1_prosody_0024_bndl = JSON.parse(f);

// epgdorsal
jasmine.getFixtures().fixturesPath = 'base/app/demoDBs/epgdorsal/';
var f = readFixtures("JDR10_bndl.json");
var JDR10_bndl = JSON.parse(f);

/////////////////////
// schemas data

// annotationFileSchema
jasmine.getFixtures().fixturesPath = 'base/app/schemaFiles/';
var f = readFixtures("annotationFileSchema.json");
var annotationFileSchema = JSON.parse(f);

// bundleListSchema
jasmine.getFixtures().fixturesPath = 'base/app/schemaFiles/';
var f = readFixtures("bundleListSchema.json");
var bundleListSchema = JSON.parse(f);

// DBconfigFileSchema
jasmine.getFixtures().fixturesPath = 'base/app/schemaFiles/';
var f = readFixtures("DBconfigFileSchema.json");
var DBconfigFileSchema = JSON.parse(f);

// globalDBSchema
jasmine.getFixtures().fixturesPath = 'base/app/schemaFiles/';
var f = readFixtures("globalDBschema.json");
var globalDBSchema = JSON.parse(f);

// emuwebappConfigSchema
jasmine.getFixtures().fixturesPath = 'base/app/schemaFiles/';
var f = readFixtures("emuwebappConfigSchema.json");
var emuwebappConfigSchema = JSON.parse(f);

