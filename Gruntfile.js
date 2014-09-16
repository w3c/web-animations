module.exports = function(grunt) {
  var port = grunt.option('port') || 8000;

  grunt.initConfig({});

  grunt.loadNpmTasks('grunt-shell');
  grunt.config('shell', {
    build: {
      options: {
        stdout: true
      },
      command: 'bikeshed spec Overview.src.html'
    },
    update: {
      options: {
        stdout: true
      },
      command: 'bikeshed update'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.config('watch', {
    options: {
      livereload: true,
    },
    files: [ 'Overview.src.html', 'biblio.json' ],
    tasks: 'default'
  });

  grunt.loadNpmTasks('grunt-express');
  grunt.config('express', {
    all: {
      options: {
        bases: [ '.' ],
        port: port,
        hostname: 'localhost',
        livereload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-open');
  grunt.config('open', {
    open: {
      all: {
        path: 'http://localhost:' + port + '/Overview.html'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.config('copy', {
    spec: {
      nonull: true, /* error if we haven't build the spec yet */
      src: [ 'Overview.html', '*.css', 'img/*', 'MathJax/*' ] ,
      dest: 'publish/',
    }
  });

  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.config('gh-pages', {
    spec: {
      options: {
        base: 'publish',
        message: process.env.COMMIT_MESSAGE || 'Auto-update of spec'
      },
      src: ['**/*']
    }
  });

  // Use token if available and push to https URL
  if (process.env.GH_TOKEN && process.env.TRAVIS_REPO_SLUG) {
    grunt.config.merge({
      'gh-pages': {
        spec: {
          options: {
            repo: 'https://' + process.env.GH_TOKEN + '@github.com/'
                  + process.env.TRAVIS_REPO_SLUG + '.git',
            silent: true
          }
        }
      }
    });
  }

  grunt.registerTask('default', ['shell:build']);
  grunt.registerTask('build', ['shell:build']);
  grunt.registerTask('publish', ['copy:spec']);
  grunt.registerTask('upload', ['gh-pages:spec']);
  grunt.registerTask('live-edit', [ 'shell:build',
                                    'express',
                                    'open',
                                    'watch']);
};
