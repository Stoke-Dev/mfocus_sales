'use strict';
 
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create();
 
gulp.task('sass', function () {
  return gulp.src('./app/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./app/css'))
    .pipe(browserSync.stream());
});

gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: {
            baseDir: "./app/"
        }
    });

    gulp.watch('./app/scss/**/*.scss', ['sass']);
    gulp.watch("app/**/*.html").on('change', browserSync.reload);
    gulp.watch("app/**/*.js").on('change', browserSync.reload);

});

gulp.task('default', ['serve']);