var concat = require('gulp-concat');
var coveralls = require('gulp-coveralls');
var del = require('del');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var karma = require('karma');
var path = require('path');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var webpack = require('webpack');

var polyfills = [
    './node_modules/es6-promise/dist/es6-promise.js',
    './polyfills.js'
];
var dependencies = [
    './node_modules/stackframe/dist/stackframe.js',
    './build/bundle.js'
];
var source = 'stacktrace-gps.js';

gulp.task('webpack-source-consumer', function(done) {
    return webpack({
        entry: './node_modules/source-map/lib/source-map-consumer.js',
        output: {
            library: 'SourceMap',
            path: path.join(__dirname, 'build'),
            name: 'bundle.js'
        }
    }, function(err) {
        if (err) {
            throw new Error('webpack', err);
        }
        done();
    });
});

gulp.task('copy', function() {
    return gulp.src(source)
        .pipe(gulp.dest('dist'));
});

gulp.task('dist', gulp.series('copy', 'webpack-source-consumer', function() {
    // Build with ES6Promise and other polyfills
    gulp.src(polyfills.concat(dependencies.concat(source)))
        .pipe(sourcemaps.init())
        .pipe(concat(source.replace('.js', '-with-polyfills.min.js')))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));

    return gulp.src(dependencies.concat(source))
        .pipe(sourcemaps.init())
        .pipe(concat(source.replace('.js', '.min.js')))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
}));

gulp.task('test', gulp.series('webpack-source-consumer'), function(done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('test-pr', gulp.series('dist', function(done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        browsers: ['Firefox', 'ChromeTravis'],
        singleRun: true
    }, done).start();
}));

gulp.task('test-ci', gulp.series('dist', function(done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.ci.js',
        singleRun: true
    }, done).start();
}));

gulp.task('clean', del.bind(null, ['build', 'coverage', 'dist']));

gulp.task('pr', gulp.series('test-pr'));

gulp.task('ci', gulp.series('test-ci', function() {
    gulp.src('./coverage/**/lcov.info')
        .pipe(coveralls());
}));

gulp.task('default', gulp.series('clean', function(cb) {
    runSequence(['copy', 'dist'], 'test', cb);
}));
