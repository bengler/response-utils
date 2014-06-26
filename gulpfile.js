var gulp = require('gulp');
var es6transpiler = require('gulp-es6-transpiler');
var watch = require('gulp-watch');

gulp.task('default', function () {
  return gulp.src('src/**/*')
    .pipe(es6transpiler())
    .pipe(gulp.dest('./lib'));
});

gulp.task('watch', function () {
  return gulp.src('src/**/*')
    .pipe(watch(function(files) {
      return files.pipe(es6transpiler())
        .pipe(gulp.dest('./lib'));
    }));
});