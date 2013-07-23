module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // concat: {
        //     all: {
        //         options: {
        //             // separator: ';'
        //         },
        //         src: ['js/main.js', 'js/emulabeller.js', 'js/drawer.js',
        //             'js/dropBoxHandler.js', 'js/iohandler.js', 'js/labfileparser.js',
        //             'js/layoutHandler.js', 'js/oscidrawer.js', 'js/socketIOhandler.js',
        //             'js/spectogramDrawer.js', 'js/ssffdrawer.js', 'js/ssffparser.js',
        //             'js/textgridparser.js', 'js/tierHandler.js', 'js/tierdrawer.js',
        //             'js/view.js', 'js/webaudio.js'
        //         ],
        //         dest: 'build/emuLVC.js'
        //     }
        // },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("isoDateTime") %> */\n',
                sourceMap: 'emuLVC.min.map',
                sourceMapRoot: 'http://localhost:8001/js/'

            },
            all: {

                files: {
                    'build/emuLVC.min.js': ["js/emulabeller.js",
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
                    ]
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