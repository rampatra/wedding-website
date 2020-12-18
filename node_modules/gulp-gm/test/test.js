/*global describe, it, before, beforeEach, after, afterEach */

var assert = require("assert");
var fs     = require("fs");
var path   = require("path");
var gm     = require("gm");
var util   = require("gulp-util");
var File   = util.File;

var gulpGm = require("../index");


var fixtureFile = function () {
  return new File({
    path : "test/fixtures/wikipedia.png",
    contents : fs.readFileSync("test/fixtures/wikipedia.png")
  });
};

var checkImageSize = function (stream, done, sizes) {

  if (!sizes) {
    sizes = [ 100, 91 ];
  }

  stream.on("data", function(file) {

    gm(file.contents).size(function (err, features) {
      assert.equal(features.width, sizes[0]);
      assert.equal(features.height, sizes[1]);
      done();
    });

  });

  stream.write(fixtureFile());

};


it('should work', function (done) {

  var stream = gulpGm(function (gmfile) {
    return gmfile
      .resize(100, 100);
  });

  checkImageSize(stream, done);

});


it('should work with ImageMagick', function (done) {

  var stream = gulpGm(function (gmfile) {
    return gmfile
      .resize(100, 100);
  }, {
    imageMagick : true
  });

  checkImageSize(stream, done);

});

it('should work async', function (done) {

  var stream = gulpGm(function (gmfile, done) {

    process.nextTick(function () {
      done(null, gmfile.resize(100, 100));
    });

  });

  checkImageSize(stream, done);

});


it('should work with size checking', function (done) {

  var stream = gulpGm(function (gmfile, done) {

    gmfile.size(function (err, features) {
      assert.equal(features.width, 500);
      assert.equal(features.height, 456);
      done(null, gmfile.resize(
        features.width * 0.5,
        features.height * 0.5));
    });

  });

  checkImageSize(stream, done, [ 250, 228 ]);

});

it('should resize with percentage options', function (done) {

  var stream = gulpGm(function (gmfile, done) {

    gmfile.size(function (err, features) {
      assert.equal(features.width, 500);
      assert.equal(features.height, 456);
      done(null, gmfile.resize("50%", "50%"));
    });

  });

  checkImageSize(stream, done, [ 250, 228 ]);

});

it('should crop with percentage options', function (done) {

  var stream = gulpGm(function (gmfile, done) {

    gmfile.size(function (err, features) {
      assert.equal(features.width, 500);
      assert.equal(features.height, 456);
      done(null, gmfile.crop("50%", "50%", 0, 0));
    });

  });

  checkImageSize(stream, done, [ 250, 228 ]);

});

it('should convert png to jpg', function (done) {

  var stream = gulpGm(function (gmfile) {

    return gmfile.setFormat("jpg");

  });

  stream.on('data', function (file) {
    assert.equal(path.extname(file.path), ".jpg");
    done();
  });

  stream.write(fixtureFile());

});
