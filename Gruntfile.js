'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      options: {
        bundleOptions: {
          debug: true
        }
      },
      rcs: {
        src: ['lib/rcs.js'],
        dest: 'rcs.js'
      },

      rcs_with_transformer: {
        src: ['lib/rcs-with-transformer.js'],
        dest: 'rcs-with-transformer.js'
      }
    },

    uglify: {
      build: {
        files: {
          'rcs.min.js': 'rcs.js',
          'rcs-with-transformer.min.js': 'rcs-with-transformer.js'
        }
      }
    },

    banner: '/**\n * React Component Styles (RCS) v<%= pkg.version %>\n*/',
    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: '<%= banner %>'
        },
        files: {
          src: [ 'rcs.js', 'rcs.min.js', 'rcs-with-transformer.js', 'rcs-with-transformer.min.js' ]
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-banner');

  grunt.registerTask('build', ['browserify', 'uglify', 'usebanner']);
};