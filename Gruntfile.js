module.exports = function(grunt) {
  var port = grunt.option('port') || 8000;

  grunt.initConfig({
    shell: {
      build: {
        options: {
          stdout: true
        },
        command: 'bikeshed.py spec Overview.src.html'
      },
      update: {
        options: {
          stdout: true
        },
        command: 'bikeshed.py update'
      }
    },

    watch: {
      options: {
        livereload: true,
      },
      files: [ 'Overview.src.html', 'biblio.json' ],
      tasks: 'default'
    },

    express: {
      all: {
        options: {
          bases: [ '.' ],
          port: port,
          hostname: 'localhost',
          livereload: true
        }
      }
    },

    open: {
      all: {
        path: 'http://localhost:' + port + '/Overview.html'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['shell:build']);
  grunt.registerTask('edit', [ 'shell:update',
                               'shell:build',
                               'express',
                               'open',
                               'watch']);
};
