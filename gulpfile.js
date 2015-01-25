var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

gulp.task('build', function(){
  browserify(['./index.jsx'], {debug: true})
    .transform(reactify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', ['build'], function() {
    gulp.watch(['*.jsx'], ['build']);
});

gulp.task('default', ['watch', 'build']);
