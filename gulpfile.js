'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync');

gulp.task('browser-sync', function(){
  return browserSync({
    files: 'demo/*',
    server: {
      baseDir: 'demo',
      index: 'index.html'
    }
  });
});

gulp.task('compile', function(){
  return gulp.src('src/*.js')
  .pipe(babel({
    loose: ['es6.modules'],
    stage: 0
  }))
  .pipe(gulp.dest('./lib/'))
  .pipe(browserSync.reload({stream: true}));
});

gulp.task('demo', ['compile'], function(){
  return browserify(['./demo/index.js'], {debug: true})
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./demo'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['demo', 'browser-sync'], function() {
    gulp.watch(['src/*.js'], ['demo']);
});

gulp.task('default', ['watch']);
