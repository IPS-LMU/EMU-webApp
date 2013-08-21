module.exports = function(grunt) {

    var allJsFiles = ["js/emulabeller.js",
        "js/webaudio.js",
        "js/drawer.js",
        "js/oscidrawer.js",
        "js/spectogramDrawer.js",
        "js/tierdrawer.js",
        "js/ssffdrawer.js",
        "js/view.js",
        "js/labfileparser.js",
        "js/textgridparser.js",
        "js/ssffparser.js",
        "js/JSONvalidator.js",
        "js/base64-binary/base64-binary.js",
        "js/socketIOhandler.js",
        "js/iohandler.js",
        "js/tierHandler.js",
        "js/dropBoxHandler.js",
        "js/main.js"
    ];

    var allCssFiles = ['css/main.css', 'css/menu.css', 'css/tooltip.css', 'css/modal.css', 'css/spinner.css'];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            all: {
                options: {
                    // banner: '/*! <%= pkg.name %> <%= grunt.template.today("isoDateTime") %> */\n',
                    // sourceMapRoot: 'http://localhost:8001/js/',
                    sourceMap: 'emuLVC.min.map'
                },

                files: {
                    'emuLVC.min.js': allJsFiles
                }
            },
            spectogram: {
                options: {
                    // banner: '/*! <%= pkg.name %> <%= grunt.template.today("isoDateTime") %> */\n',
                    // sourceMapRoot: 'http://localhost:8001/js/',
                },
                files: {
                    'spectrogram.min.js': 'js/spectrogram.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'emuLVC.min.css': allCssFiles
                }
            }
        },
        watch: {
            all: {
                files: allJsFiles.concat(['index.html']).concat(allCssFiles),
                tasks: ['uglify', 'cssmin', 'replace'],
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
        },
        replace: {
            // dist: {
            //     options: {
            //         variables: {
            //             'insertCompressedSpectWorkerHere': 'eval(' + grunt.file.read('spectrogram.min.js') + ')'
            //         },
            //         prefix: '@@'
            //     },
            //     files: [{
            //         expand: false,
            //         flatten: true,
            //         src: ['index.template'],
            //         dest: 'replaced.html'
            //     }]
            // },
            timestampManifest: {
                options: {
                    variables: {
                        'timestamp': '<%= grunt.template.today() %>'
                    },
                    prefix: '@@'
                },
                files: [{
                    expand: false,
                    flatten: true,
                    src: ['manifest.template'],
                    dest: 'manifest.appcache'
                }]
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.loadNpmTasks('grunt-replace');


    // Default task(s)
    grunt.registerTask('default', ['uglify', 'cssmin', 'replace']);


};