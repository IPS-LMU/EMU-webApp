// Karma configuration
// Generated on 2016-10-19

module.exports = function (config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: [
        'jasmine'
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-filter/dist/angular-filter.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/showdown/src/showdown.js',
      'bower_components/angular-markdown-directive/markdown.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/raf/index.js',
      'bower_components/angular-ui-layout/ui-layout.js',
      'bower_components/tv4/tv4.js',
      'bower_components/jasmine/lib/jasmine-core/jasmine.js',
      'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
      'bower_components/d3/d3.js',
      // endbower
      'app/scripts/**/*.js',
      'test/spec/**/*.js',
      //include the directory where directive templates are stored.
      'app/views/**/*.html',

      // demoDBs JSON fixtures
      {
        pattern: 'app/demoDBs/*/*.json',
        watched: true,
        served: true,
        included: false
      },

      // configFiles JSON fixtures
      {
        pattern: 'app/configFiles/*.json',
        watched: true,
        served: true,
        included: false
      },

      // schemaFiles fixtures
      {
        pattern: 'app/schemaFiles/*.json',
        watched: true,
        served: true,
        included: false
      },
      // fixtures
      {
        pattern: 'app/testData/oldFormat/msajc003/*',
        watched: true,
        served: true,
        included: false
      }
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8081,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-coverage',
      'karma-ng-html2js-preprocessor'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    proxies: {
       '/': 'http://localhost:9000/'
    //   '/img/': 'http://ips-lmu.github.io/EMU-webApp/img/',
    //   '/assets/': 'http://ips-lmu.github.io/EMU-webApp/assets/',
    //   '/NEWS.md': 'http://ips-lmu.github.io/EMU-webApp/NEWS.md'
    },
    // URL root prevent conflicts with the site root
    urlRoot: '_karma_',

    //
    //
    // generate js files from html templates to expose them during testing.
    preprocessors: {
      'app/views/**/*.html': 'ng-html2js',
      'app/scripts/**/*.js': 'coverage'
    },

    ngHtml2JsPreprocessor: {
      // If your build process changes the path to your templates,
      // use stripPrefix and prependPrefix to adjust it.
      stripPrefix: 'app/',
      prependPrefix: '',

      // the name of the Angular module to create
      moduleName: 'emuwebApp.templates'
    }

/*
    captureTimeout: 60000,

    browserNoActivityTimeout: 3000
*/

    // coverage reporter
    // reporters: ['progress', 'coverage'],
    //
    // coverageReporter: {
    //   type: 'lcov',
    //   dir: 'test/coverage/'
    // }

  });
};