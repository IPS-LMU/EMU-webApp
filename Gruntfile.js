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
        "js/socketIOhandler.js",
        "js/iohandler.js",
        "js/tierHandler.js",
        "js/dropBoxHandler.js",
        "js/main.js"
    ];

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
            }
        },

        watch: {
            all: {
                files: allJsFiles.concat(['index.html']),
                tasks: ['uglify'],
                options: {
                    livereload: true
                }
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);


};