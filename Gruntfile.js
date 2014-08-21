module.exports = function (grunt) {
    grunt.initConfig({
      clean: {
        tests: ['tmp']
      },
      jshint: {
        gruntfile: {
          src: 'Gruntfile.js'
        },
        lib_test: {
          src: ['bin/**', 'index.js', 'test/**/*.js']
        }
      },
      mochacli: {
        options: {
            reporter: 'spec'
        },
        files: ['test/**/*_test.js']
      },
      watch: {
        gruntfile: {
          files: '<%= jshint.gruntfile.src %>',
          tasks: ['jshint:gruntfile']
        },
        lib_test: {
          files: ['bin/*', '<%= jshint.lib_test.src %>'],
          tasks: ['clean', 'jshint:lib_test', 'mochacli']
        }
      }
    });

    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('test', ['clean', 'jshint', 'mochacli']);
    grunt.registerTask('default', ['test']);
  };
