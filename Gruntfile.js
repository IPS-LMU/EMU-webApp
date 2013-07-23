module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            all: {
                options: {
                    // separator: ';'
                },
                src: ['js/main.js', 'js/emulabeller.js', 'js/drawer.js',
                    'js/dropBoxHandler.js', 'js/iohandler.js', 'js/labfileparser.js',
                    'js/layoutHandler.js', 'js/oscidrawer.js', 'js/socketIOhandler.js',
                    'js/spectogramDrawer.js', 'js/ssffdrawer.js', 'js/ssffparser.js',
                    'js/textgridparser.js', 'js/tierHandler.js', 'js/tierdrawer.js',
                    'js/view.js', 'js/webaudio.js'
                ],
                dest: 'build/emuLVC.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            all: {

                files: {
                    'build/emuLVC.min.js': ['build/emuLVC.js']
                }
            }
        }
    });


    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-uglify');


    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);


};