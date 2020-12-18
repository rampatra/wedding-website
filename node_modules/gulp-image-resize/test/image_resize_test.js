/*global describe, it, before, beforeEach, after, afterEach */

var gm     = require("gm");
var gm_im  = require("gm").subClass({imageMagick: true});
var async  = require("async");
var fs     = require("fs");
var path   = require("path");
var assert = require("assert");

const TMP_FOLDER = "tmp/";
const EXPECTED_FOLDER = "test/expected/";

var createTest = function(key, filename, comparisonTolerance) {
  if (comparisonTolerance === undefined) {
    comparisonTolerance = 0.1;
  }
  return function(callback) {

    var features, expected;

    var tmpFile = path.join(TMP_FOLDER, key, filename);
    var expectedFile = path.join(EXPECTED_FOLDER, key.replace("_imagemagick", ""), filename);

    async.waterfall([

      function(callback) {
        fs.exists(tmpFile, function (tmpFileExists) {
          assert(tmpFileExists, tmpFile + " is missing");
          callback();
        });
      },

      function(callback) {
        fs.exists(expectedFile, function (expectedFileExists) {
          assert(expectedFileExists, expectedFile + " is missing");
          callback();
        });
      },

      function(callback) {
        gm(tmpFile).size(callback);
      },

      function(_features, callback) {
        features = _features;
        gm(expectedFile).size(callback);
      },

      function(_expected, callback) {
        expected = _expected;

        assert.equal(features.width, expected.width, filename + " width does not match");
        assert.equal(features.height, expected.height, filename + " height does not match");

        gm().compare(tmpFile, expectedFile, 0.1, callback);
      },

      function(isEqual, difference, raw, callback) {
        assert(isEqual, tmpFile + " is not equal to " + expectedFile + " (difference: " + difference + ")");
        callback();
      }

    ], function (err) {
      if (err) {
        throw err;
      } else {
        callback();
      }
    });
  };
};

var createTests = function (key, filename) {
  return function(callback) {
    async.series([
      createTest(key, filename),
      createTest(key + "_imagemagick", filename)
    ], callback);
  };
};


describe("resize", function () {
  it("should resize gnu.jpg", createTests("resize", "gnu.jpg"));
  it("should resize Rhododendron.jpg", createTests("resize", "Rhododendron.jpg"));
  it("should resize wikipedia.png", createTests("resize", "wikipedia.png"));
  it("should resize TeslaTurbine.png", createTests("resize", "TeslaTurbine.png"));
});

describe("upscale", function () {
  it("should upscale with one dimension", createTests("upscale", "wikipedia.png"));
  it("should upscale with both dimensions", createTests("upscale2", "wikipedia.png"));
  it("should not upscale", createTests("no_upscale", "wikipedia.png"));
  it("should resize with the smallest dimension", createTests("no_upscale2", "wikipedia.png"));
});

describe("crop", function () {
  it("should crop", createTests("crop", "wikipedia.png"));
  it("should crop with gravity", createTests("crop_gravity", "wikipedia.png"));
  it("should crop with only width set", createTests("crop_width_only", "wikipedia.png"));
});

describe("sharpen", function () {
  it("should sharpen the Rhododendron image", createTests("sharpen", "Rhododendron.jpg", 0));
});

describe("filter", function () {
  it("should reduce Rhododendron image using catrom filter", createTests("filter", "Rhododendron.jpg", 0));
});

describe("samplingFactor", function () {
  it("should resize the Rhododendron image with a sampling factor of 4:2:2", createTests("samplingFactor", "Rhododendron.jpg", 0));
});

describe("convert", function () {
  it("should convert png to jpg", function (callback) {

    async.map([
      path.join(process.cwd(), TMP_FOLDER, "convert", "wikipedia.jpg"),
      path.join(process.cwd(), TMP_FOLDER, "convert_imagemagick", "wikipedia.jpg")
    ], function (path, callback) {
      gm(path).format(callback);
    }, function (err, results) {
      if (err) {
        throw err;
      } else {
        results.forEach(function (format) {
          assert.equal("jpeg", format.toLowerCase());
        });
        callback();
      }
    });
  });
});

describe("quality", function() {
  var filename = "Rhododendron.jpg";
  it("should resize with lower quality", createTests("quality", filename));
  it("should have a smaller filesize", function (callback) {
    async.map([
      path.join(TMP_FOLDER, "quality", filename),
      path.join(EXPECTED_FOLDER, "quality", filename)
    ], fs.stat, function(err, results) {
      if (err) {
        throw err;
      } else {
        var epsilon = 1024;
        assert(results[1].size - epsilon < results[0].size && results[1].size + epsilon > results[0].size, "size doesn't match");
        callback();
      }
    });
  });
});

describe("noProfile", function () {
  var filename = "hamburg.jpg";
  it("should remove all profiles (8bim, exif, iptc, xmp...) from the Hamburg image", function (callback) {
    async.map([
      path.join(process.cwd(), TMP_FOLDER, "noProfile", filename),
      path.join(process.cwd(), TMP_FOLDER, "noProfile_imagemagick", filename)
    ], function (path, callback) {
      gm_im(path).identify("%[profiles]", callback);
    }, function (err, results) {
      if (err) {
        throw err;
      } else {
        results.forEach(function (format) {
          // test passes if result contains no or empty string elements
          assert.equal("", format, filename + " contains profiles '" + format + "''" );
        });
        callback();
      }
    });
  });
});

describe("flatten", function () {
  it("should flatten the wikipedia image", createTests("flatten", "wikipedia.jpg"));
});

describe("interlace", function () {
  it("should interlace Rhododendron.jpg", createTests("interlace", "Rhododendron.jpg"));
  it("should interlace wikipedia.png", createTests("interlace", "wikipedia.png"));
  it("should interlace plus resize Rhododendron.jpg", createTests("interlace_and_resize", "Rhododendron.jpg"));
  it("should interlace plus resize wikipedia.png", createTests("interlace_and_resize", "wikipedia.png"));
});

describe("percentage", function () {
  it("should resize gnu.jpg from percentage", createTests("percentage", "gnu.jpg"));
  it("should resize Rhododendron.jpg from percentage", createTests("percentage", "Rhododendron.jpg"));
  it("should resize wikipedia.png from percentage", createTests("percentage", "wikipedia.png"));
  it("should resize TeslaTurbine.png from percentage", createTests("percentage", "TeslaTurbine.png"));
});

describe("cover", function() {
  it("should resize Rhododendron.jpg to 200px height", createTests("cover", "Rhododendron.jpg"));
  it("should resize TeslaTurbine.png to 200px width", createTests("cover", "TeslaTurbine.png"));
});
