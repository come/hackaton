'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                ignores: []
            },
            all: [
                'Gruntfile.js',
                'test/**/*.js',
                '*.js'
            ]
        },
        watch: {
            scripts: {
                files: [
                    '*.js',
                    '!Gruntfile.js'
                ],
                options: {
                    livereload: LIVERELOAD_PORT
                }
            }
        },
        connect: {
            static: {
                options: {
                    hostname: 'localhost',
                    port: 80,
                    base: '../',
                    livereload: true,
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '../'),
                        ];
                    }
                }
            }
        },
        open: {
            dev: {
                path: 'http://localhost:80/hackaton/index.html'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true,
                autoWatch: false,
                reporters: ['dots', 'junit', 'coverage']
            }
        },
        coverage: {
            options: {
                thresholds: {
                    'statements': 100,
                    'branches': 100,
                    'functions': 100,
                    'lines': 100
                },
                dir: 'coverage'
            }
        }
    });

    grunt.registerTask('default', ['jshint', 'karma:unit', 'coverage']);
    grunt.registerTask('server', ['connect:static', 'open:dev', 'watch']);

};