module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          // target.css file: source.less file
          "../modules/core/main.css": "./less/main.less"
        }
      }
    },
    uglify: {
      my_target: {
        options: {
          mangle: false
        },
        files: {
          '../brahma.min.js': ['../dist/brahma.js']
        }
      }
    },
    snipper: {
      development: {
        files: {
          '../dist/': ['./scripts/brahma/brahma.js']
        }
      }
    },
    watch: {
      brahma: {
        files: ['./scripts/**/*.js'], // which files to watch
        tasks: ['less','snipper'],
        options: {
          nospawn: true
        }
      },
      brahmamin: {
        files: ['../dist/brahma.js'], // which files to watch
        tasks: ['uglify'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-snipper');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.registerTask('default', ['watch', 'snipper', 'uglify']);
};