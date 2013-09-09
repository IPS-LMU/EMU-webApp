module.exports = function(grunt) {

    var allJsFiles = ["app/js/emulabeller.js",
        "app/js/webaudio.js",
        "app/js/drawer.js",
        "app/js/oscidrawer.js",
        "app/js/spectogramDrawer.js",
        "app/js/tierdrawer.js",
        "app/js/ssffdrawer.js",
        "app/js/view.js",
        "app/js/labfileparser.js",
        "app/js/textgridparser.js",
        "app/js/ssffparser.js",
        "app/js/JSONvalidator.js",
        "app/js/base64-binary/base64-binary.js",
        "app/js/socketIOhandler.js",
        "app/js/iohandler.js",
        "app/js/tierHandler.js",
        "app/js/dropBoxHandler.js",
        "app/js/main.js"
    ];

    var allCssFiles = ['app/styles/main.css', 'app/styles/menu.css', 'app/styles/tooltip.css', 'app/styles/modal.css', 'app/styles/spinner.css'];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            all: {
                options: {
                    // banner: '/*! <%= pkg.name %> <%= grunt.template.today("isoDateTime") %> */\n',
                    // sourceMapRoot: 'http://localhost:8001/js/',
                    sourceMap: 'app/emuLVC.min.map'
                },

                files: {
                    'app/emuLVC.min.js': allJsFiles
                }
            },
            // spectogram: {
            //     options: {
            //         // banner: '/*! <%= pkg.name %> <%= grunt.template.today("isoDateTime") %> */\n',
            //         // sourceMapRoot: 'http://localhost:8001/js/',
            //     },
            //     files: {
            //         'appspectrogram.min.js': 'app/js/spectrogram.js'
            //     }
            // }
        },
        cssmin: {
            combine: {
                files: {
                    'app/emuLVC.min.css': allCssFiles
                }
            }
        },
        watch: {
            all: {
                files: allJsFiles.concat(['app/index.html']).concat(allCssFiles),
                tasks: ['uglify', 'cssmin'],
                options: {
                    livereload: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8001,
                    base: '',
                    keepalive: true
                }
            }
        }
        // replace: {
        //     // dist: {
        //     //     options: {
        //     //         variables: {
        //     //             'insertCompressedSpectWorkerHere': 'eval(' + grunt.file.read('spectrogram.min.js') + ')'
        //     //         },
        //     //         prefix: '@@'
        //     //     },
        //     //     files: [{
        //     //         expand: false,
        //     //         flatten: true,
        //     //         src: ['index.template'],
        //     //         dest: 'replaced.html'
        //     //     }]
        //     // },
        //     timestampManifest: {
        //         options: {
        //             variables: {
        //                 'timestamp': '<%= grunt.template.today() %>'
        //             },
        //             prefix: '@@'
        //         },
        //         files: [{
        //             expand: false,
        //             flatten: true,
        //             src: ['manifest.template'],
        //             dest: 'manifest.appcache'
        //         }]
        //     }
        // }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-contrib-connect');

    // grunt.loadNpmTasks('grunt-replace');


    // Default task(s)
    grunt.registerTask('default', ['uglify', 'cssmin']);


};