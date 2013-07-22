module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      all: {
        options: {
          // separator: ';'
        },
        src: ['js/JSONvalidator.js', 'js/socketIOhandler.js', 'js/tierdrawer.js',
          'js/spectogramDrawer.js', 'js/vars.js', 'js/drawer.js',
          'js/spectrogram.js', 'js/view.js', 'js/labfileparser.js',
          'js/ssffdrawer.js', 'js/webaudio.js', 'js/dropBoxHandler.js',
          'js/layoutHandler.js', 'js/ssffparser.js', 'js/emulabeller.js',
          'js/main.js', 'js/textgridparser.js', 'js/iohandler.js',
          'js/oscidrawer.js', 'js/tierHandler.js'
        ],
        dest: 'build/emuLVC.js'
      }
    },
    uglify: {
      // options: {
      //   // banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      // },
      build: {
        files: {
          'build/emuLVC.min.js': ['build/emuLVC.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');


  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);


};