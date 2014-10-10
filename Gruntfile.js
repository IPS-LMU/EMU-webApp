// Generated on 2013-09-11 using generator-angular 0.4.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };


  // Define the configuration for all the tasks
  grunt.initConfig({
    
    // read package.json to have version nrs
    pkg: grunt.file.readJSON('package.json'),
    
    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          'exampleServers/*.js',
          'app/configFiles/defaultConfig.json',
          'app/testData/customConfig.json',
          'app/schemaFiles/*.json',
          'app/configFiles/*.json',
          'app/testData/newFormat/ae/ae_DBconfig.json',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9999,
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, appConfig.dist)
            ];
          }
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        strict: true
      },
      all: [
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: ''
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: '{,*/}*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.coffee',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
      dist: {}
    },*/

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },

    uglify: {
      dist: {
        options: {
          sourceMap: true,
          sourceMapIncludeSources: true,
          sourceMapName: '<%= yeoman.dist %>/scripts/emuwebApp.min.js.map'
        },
        files: {
          '<%= yeoman.dist %>/scripts/emuwebApp.min.js': [
            '<%= yeoman.dist %>/scripts/emuwebApp.min.js'
          ]
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          // collapseWhitespace: true,
          // conservativeCollapse: true,
          // collapseBooleanAttributes: true,
          // removeCommentsFromCDATA: true,
          // removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    cssmin: {
      // By default, your `index.html` <!-- Usemin Block --> will take care of
      // minification. This option is pre-configured if you do not wish to use
      // Usemin blocks.
      // dist: {
      //   files: {
      //     '<%= yeoman.dist %>/styles/main.css': [
      //       '.tmp/styles/{,*/}*.css',
      //       '<%= yeoman.app %>/styles/{,*/}*.css'
      //     ]
      //   }
      // }
    },


    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },

    // Replace Google CDN references
    // cdnify: {
    //   dist: {
    //     html: ['<%= yeoman.dist %>/*.html']
    //   }
    // },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.{gif,webp}',
            'img/*.png',
            'styles/fonts/*',
            'configFiles/{,*/}*.*',
            'schemaFiles/*.json',
            'scripts/workers/*.js',
            'demoDBs/{,*/}*.*',
            'background.js',
            'manifest.json',
            'assets/icon.png',
            'styles/external/bootstrap-combined.min.css',
            'styles/images/rightSideMenuBtn.png'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin'
      ]
    },

    // Test settings
    
    karma: {
	  unit: {
		configFile: 'karma.conf.js',
		singleRun: false
	  },
	  continuous: {
		configFile: 'karma.conf.js',
		singleRun: true,
		browsers: ['PhantomJS']
	  }
    },   
    
    
    protractor: {
      options: {
        keepAlive: true,
        configFile: 'protractor.conf.js'
      },
      run: {}
    },   

    // auto generate manifest.appcache file with all files of app
    appcache: {
      options: {
        basePath: '<%= yeoman.dist %>'
      },
      all: {
        dest: '<%= yeoman.dist %>/manifest.appcache',
        cache: '<%= yeoman.dist %>/**/*',
        network: '*',
        fallback: 'index.html'
      }
    },

    throttle: {
      default: {
        remote_port: 9000,
        local_port: 9001,
        upstream: 20 * 1024,
        downstream: 100 * 1024,
        keepalive: true
      }
    },

    replace: {
      dist: {
        options: {
          patterns: [{
            match: 'versionnr',
            replacement: '<%= pkg.version %>'
          }, {
            match: 'sha1',
            replacement: '<%= gitinfo.local.branch.current.SHA %> - <%= gitinfo.local.branch.current.name %>'
          }, {
            match: 'timestamp',
            replacement: '<%= grunt.template.today() %>'
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['dist/views/about.html'],
          dest: 'dist/views/'
        }]
      }
    },

    coveralls: {
      options: {
        debug: true,
        coverage_dir: 'test/coverage',
        dryRun: false,
        force: true,
        recursive: true
      }
    }
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('repTest', [
    'gitinfo',
    'replace'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);
  

  grunt.registerTask('testAll', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma:continuous',
    'protractor:run'
  ]);  

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'copy:dist',
    // 'cdnify',
    'ngmin',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'appcache',
    'gitinfo',
    'replace'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('slowServer', [
    'throttle'
  ]);
};