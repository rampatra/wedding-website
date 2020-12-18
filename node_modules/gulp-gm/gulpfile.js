var gulp     = require("gulp");
var mocha    = require("gulp-mocha");
var jshint   = require("gulp-jshint");
var rename   = require("gulp-rename");
var stylish  = require("jshint-stylish");

var gm       = require("./index");


gulp.task("jshint", function () {
  gulp.src(["gulpfile.js", "index.js", "test/*.js"])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task("mocha", function () {
  return gulp.src("test/test.js")
    .pipe(mocha({ reporter: "spec" }));
});


gulp.task("test", ["jshint", "mocha"]);


gulp.task("example1", function () {
  return gulp.src("test/fixtures/wikipedia.png")
    .pipe(gm(function (gmfile, done) {

      gmfile.size(function (err, size) {

        done(null, gmfile
          .stroke("blue", 6)
          .fill("transparent")
          .drawRectangle(0, 0, size.width, size.height));

      });

    }))
    .pipe(rename(function (path) { path.basename += "-drawing"; }))
    .pipe(gulp.dest("examples"));

});

gulp.task("example2", function () {

  gulp.src("test/fixtures/wikipedia.png")
    .pipe(gm(function (gmfile) {

      return gmfile.setFormat('jpg');

    }))
    .pipe(gulp.dest("examples"));

});

gulp.task("example3", function () {
  gulp.src("test/fixtures/wikipedia.png")
    .pipe(gm(function (gmfile) {
      return gmfile.blur(40);
    }))
    .pipe(rename(function (path) { path.basename += "-blur"; }))
    .pipe(gulp.dest("examples"));
});

gulp.task("example4", function () {
  gulp.src("test/fixtures/wikipedia.png")
    .pipe(gm(function (gmfile) {
      return gmfile.resize(100, 100);
    }))
    .pipe(rename(function (path) { path.basename += "-resize"; }))
    .pipe(gulp.dest("examples"));
});

gulp.task("example5", function () {
  gulp.src("test/fixtures/wikipedia.png")
    .pipe(gm(function (gmfile, done) {
      gmfile.size(function (err, size) {

        done(null, gmfile.resize(
          size.width * 0.5,
          size.height * 0.5
        ));

      });
    }))
    .pipe(rename(function (path) { path.basename += "-resize2"; }))
    .pipe(gulp.dest("examples"));
});

gulp.task("examples", [
  "example1",
  "example2",
  "example3",
  "example4",
  "example5"
]);

gulp.task("default", ["examples", "test"]);
