'use strict';

module.exports = function (config) {
    config.set({
        basePath: '',

        frameworks: ['jasmine'],

        files: [
            'test/**/*.js',
            '*.js'
        ],

        exclude: [
            'Gruntfile.js'
        ],

        reporters: ['dots', 'coverage'],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },

        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/'
        },

        // web server port
        port: 8080, // => Gruntfile.js

        // cli runner port
        runnerPort: 9100, // => Gruntfile.js

        colors: true,

        // level of logging: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        autoWatch: true, // => Gruntfile.js

        browsers: [
            'Chrome'
        ]
    });
};