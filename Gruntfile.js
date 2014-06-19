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
            files: ['Gruntfile.js', '*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint'],
            options: {
                livereload: LIVERELOAD_PORT
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
        }
    });

    grunt.registerTask('default', ['connect:static', 'open:dev', 'watch']);

};