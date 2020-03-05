// Karma configuration
// Generated on 2016-10-19
const puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function (config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../dist',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: [
        'jasmine',
        'phantomjs-shim'
    ],

    // list of files / patterns to load in the browser
    // NOTE: these are injected by wiredep and somehow
    // the bootstrap jquery dep
    files: [
      'dist/emuwebapp.bundle.js',
      '../node_modules/jasmine/lib/jasmine-core/jasmine.js',
      '../node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      '../node_modules/angular-mocks/angular-mocks.js',
      // 'test/spec/**/*.js',
      // try to get it to work on a single file first
      '../test/spec/controllers/bundlelistsidebar.spec.js',
      //include the directory where directive templates are stored.
      'views/**/*.html',
      'img/*.svg',
      '*.html',

      // demoDBs JSON fixtures
      {
        pattern: 'demoDBs/*/*.json',
        watched: true,
        served: true,
        included: false
      },

      // configFiles JSON fixtures
      {
        pattern: 'configFiles/*.json',
        watched: true,
        served: true,
        included: false
      },

      // schemaFiles fixtures
      {
        pattern: 'schemaFiles/*.json',
        watched: true,
        served: true,
        included: false
      },
      // fixtures
      {
        pattern: 'testData/oldFormat/msajc003/*',
        watched: true,
        served: true,
        included: false
      }

    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['ChromeHeadless'],


    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor',
      'karma-phantomjs-shim'
      // 'karma-coverage'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
      // '/': 'http://localhost:9000/'
      // '/img/': '/base/app/img/',
      // '/assets/': '/base/app/assets/'
      // '/NEWS.md': 'http://localhost:9000/NEWS.md'
    // },
    // // URL root prevent conflicts with the site root
    // urlRoot: '_karma_',
    //
    // generate js files from html templates to expose them during testing.
    // preprocessors: {
      // 'app/views/**/*.html': 'ng-html2js'
      // 'app/scripts/**/*.js': 'coverage'
    // },

    ngHtml2JsPreprocessor: {
      // If your build process changes the path to your templates,
      // use stripPrefix and prependPrefix to adjust it.
      stripPrefix: 'app/',
      prependPrefix: '',

      // the name of the Angular module to create
      moduleName: 'emuwebApp.templates'
    },


    captureTimeout: 60000,

    browserNoActivityTimeout: 40000
  });
};
