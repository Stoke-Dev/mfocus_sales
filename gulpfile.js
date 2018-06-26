'use strict';
 
let gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    cleanCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence');
 
gulp.task('sass', function () {
    console.log("Running SASS Compiler + Minifying")
    return gulp.src('app/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('babel', function () {
    console.log("Running Babel Transpiler + Minifying")
    return gulp.src('app/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['env']
    }).on('error', babelErrorHandler))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('build', function () {
    runSequence('flush-dist',
                ['sass', 'babel', 'move-static']);
})

gulp.task('flush-dist', function () {
    console.log("Clearing /dist")
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('move-static', function() {
    let filesToMove = [
        './app/fonts/**/*.*',
        './app/img/**/*.*',
        './app/data/**/*.*',
        './app/index.html',
        './app/favicon.ico'
    ];

    // the base option sets the relative root for the set of files,
    // preserving the folder structure
    return gulp.src(filesToMove, { base: './app/' })
        .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['build'], function() {

    browserSync.init({
        server: {
            baseDir: "./dist/"
        }
    });

    gulp.watch("app/scss/**/*.scss", ['sass']);
    gulp.watch("app/**/*.html", ['move-static']).on('change', browserSync.reload);
    gulp.watch("app/**/*.json", ['move-static']).on('change', browserSync.reload);
    gulp.watch("app/**/*.js", ['babel']).on('change', browserSync.reload);

});

gulp.task('default', ['serve']);

function babelErrorHandler (err) {
    console.error(err.message);
    browserSync.notify(err.message); // Display error in the browser
    this.emit('end'); // Prevent gulp from catching the error and exiting the watch process
}