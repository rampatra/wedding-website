var gulp     = require("gulp");
var mocha    = require("gulp-mocha");
var clean    = require("gulp-clean");
var jshint   = require("gulp-jshint");
var stylish  = require("jshint-stylish");
var sequence = require("run-sequence");

var imageResize = require("./index.js");



gulp.task("jshint", function () {
  gulp.src(["gulpfile.js", "index.js", "test/*.js"])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task("clean", function () {
  gulp.src("tmp/*", { read : false })
    .pipe(clean());
});

gulp.task("mocha", ["image_resize"], function () {
  return gulp.src("test/*_test.js")
    .pipe(mocha({ reporter: "spec" }));
});



var resizeTasks = [];

var resize = function(files, key, options) {

  function makeTask(files, key, options) {
    gulp.task("image_resize:" + key, function () {
      return gulp.src(files)
        .pipe(imageResize(options))
        .pipe(gulp.dest("tmp/" + key));
    });
    resizeTasks.push("image_resize:" + key);
  }

  makeTask(files, key, options);

  var imOptions = { imageMagick : true };
  for (var k in options) { imOptions[k] = options[k]; }
  makeTask(files, key + "_imagemagick", imOptions);
};


resize([
  "test/fixtures/gnu.jpg",
  "test/fixtures/wikipedia.png",
  "test/fixtures/Rhododendron.jpg",
  "test/fixtures/TeslaTurbine.png"
], "resize", {
  width: 100
});


resize("test/fixtures/wikipedia.png", "upscale", {
  width: 600,
  height: 0,
  upscale: true
});

resize("test/fixtures/wikipedia.png", "upscale2", {
  width: 600,
  height: 600,
  upscale: true
});

resize("test/fixtures/wikipedia.png", "no_upscale", {
  width: 600,
  upscale: false
});

resize("test/fixtures/wikipedia.png", "no_upscale2", {
  width: 100,
  height: 600,
  upscale: false
});

resize("test/fixtures/wikipedia.png", "crop", {
  width: 400,
  height: 300,
  upscale: false,
  crop: true
});

resize("test/fixtures/wikipedia.png", "crop_gravity", {
  width: 400,
  height: 300,
  upscale: false,
  crop: true,
  gravity: "NorthWest"
});

resize("test/fixtures/wikipedia.png", "crop_width_only", {
  width: 300,
  crop: true
});

resize("test/fixtures/Rhododendron.jpg", "quality", {
  width: 600,
  height: 0,
  upscale: false,
  quality: 0.2
});

resize("test/fixtures/Rhododendron.jpg", "sharpen", {
  width: 600,
  height: 0,
  sharpen: true
});

resize("test/fixtures/Rhododendron.jpg", "filter", {
  width: 600,
  height: 0,
  filter: "catrom"
});

resize("test/fixtures/Rhododendron.jpg", "samplingFactor", {
  width: 600,
  height: 0,
  samplingFactor: [2,2]
});

resize("test/fixtures/wikipedia.png", "convert", {
  format: "jpg"
});

resize("test/fixtures/hamburg.jpg", "noProfile", {
  noProfile: true
});

resize("test/fixtures/wikipedia.png", "flatten", {
  format: "jpg",
  flatten: true
});

resize([
  "test/fixtures/Rhododendron.jpg",
  "test/fixtures/wikipedia.png"
], "interlace", {
  interlace: true
});

resize([
  "test/fixtures/Rhododendron.jpg",
  "test/fixtures/wikipedia.png"
], "interlace_and_resize", {
  width: 400,
  interlace: true
});

resize([
  "test/fixtures/gnu.jpg",
  "test/fixtures/wikipedia.png",
  "test/fixtures/Rhododendron.jpg",
  "test/fixtures/TeslaTurbine.png"
], "percentage", {
  percentage: 50
});

resize([
  "test/fixtures/Rhododendron.jpg",
  "test/fixtures/TeslaTurbine.png"
], "cover", {
  width: 200,
  height: 200,
  cover: true
});

gulp.task("image_resize", resizeTasks);

gulp.task("test", function(callback) {
  sequence("clean", "jshint", "mocha", callback);
});

gulp.task("default", ["test"]);
