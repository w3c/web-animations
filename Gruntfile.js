module.exports = function(grunt) {
  var port = grunt.option('port') || 8000;

  grunt.initConfig({});

  grunt.loadNpmTasks('grunt-preprocess');
  grunt.config('preprocess', {
    'level-1': {
      src: 'Overview.bs',
      dest: 'Overview-level-1.bs',
      options: {
        context: {
          LEVEL: 1
        }
      }
    },
    'level-2': {
      src: 'Overview.bs',
      dest: 'Overview-level-2.bs',
      options: {
        context: {
          LEVEL: 2,
          INCLUDE_GROUPS: true,
          INCLUDE_ANIMATION_NODE_PLAYBACKRATE: true,
          INCLUDE_CUSTOM_EFFECTS: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-text-replace');
  grunt.config('replace', {
    wd: {
      src: ['Overview-level-1.bs'],
      dest: 'Overview-wd.bs',
      replacements: [{
        from: 'Status: ED',
        to: 'Status: WD'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.config('shell', {
    'build-level-1': {
      options: {
        stdout: true
      },
      command: 'bikeshed spec Overview-level-1.bs'
    },
    'build-level-2': {
      options: {
        stdout: true
      },
      command: 'bikeshed spec Overview-level-2.bs'
    },
    'build-wd': {
      options: {
        stdout: true
      },
      command: 'bikeshed spec Overview-wd.bs'
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
    files: [ 'Overview.bs', 'footer.include', 'biblio.json' ],
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
    all: {
      path: 'http://localhost:' + port + '/Overview.level-1.html'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.config('copy', {
    spec: {
      nonull: true, /* error if we haven't build the spec yet */
      files: [
        { src: 'Overview-level-1.html', dest: 'publish/index.html' },
        { src: [ '*.css', 'img/*', 'MathJax/**' ] , dest: 'publish/' },
        { src: 'Overview-level-2.html', dest: 'publish/level-2/index.html' },
        { src: [ '*.css', 'img/*', 'MathJax/**' ] , dest: 'publish/level-2/' },
        { src: 'Overview-wd.html', dest: 'publish/wd/Overview.html' },
        { src: [ '*.css', 'img/*', 'MathJax/**', 'manifest.txt' ],
          dest: 'publish/wd/' }
      ]
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

  grunt.registerTask('build:level-1', ['preprocess:level-1',
                                       'shell:build-level-1']);
  grunt.registerTask('build:level-2', ['preprocess:level-2',
                                       'shell:build-level-2']);
  grunt.registerTask('build:wd', ['preprocess:level-1',
                                  'replace:wd',
                                  'shell:build-wd']);
  grunt.registerTask('build', ['build:level-1', 'build:level-2', 'build:wd']);
  grunt.registerTask('default', ['build']);

  grunt.registerTask('publish', ['copy:spec']);
  grunt.registerTask('upload', ['gh-pages:spec']);
  grunt.registerTask('live-edit', [ 'build',
                                    'express',
                                    'open',
                                    'watch']);
};
