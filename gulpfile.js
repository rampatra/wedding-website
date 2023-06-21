'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// compile scss to css
gulp.task('sass', function () {
    return gulp.src('./public/sass/styles.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({basename: 'styles.min'}))
        .pipe(gulp.dest('public/css'));
});

// watch changes in scss files and run sass task
gulp.task('sass:watch', function () {
    gulp.watch('.public/sass/**/*.scss', ['sass']);
});

// minify js
gulp.task('minify-js', function () {
    return gulp.src('./public/js/scripts.js')
        .pipe(uglify())
        .pipe(rename({basename: 'scripts.min'}))
        .pipe(gulp.dest('public/js'));
});

// default task
gulp.task('default', gulp.series('sass', 'minify-js'));