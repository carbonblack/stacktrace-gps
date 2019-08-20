module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine-ajax', 'jasmine'],
        files: [
            'node_modules/stackframe/dist/stackframe.js',
            'build/bundle.js', // source-map-consumer with deps
            'node_modules/es6-promise/dist/es6-promise.js',
            'stacktrace-gps.js',
            'spec/*-spec.js'
        ],
        reporters: ['spec'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        customLaunchers: {
            ChromeTravis: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        browsers: ['PhantomJS2'],
        singleRun: false
    });
};
