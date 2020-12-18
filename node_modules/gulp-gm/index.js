var gm          = require("gm");
var through     = require("through2");
var path        = require("path");
var PluginError = require("plugin-error");

const PLUGIN_NAME = "gulp-gm";

var gulpGm = function (modifier, options) {

  if (!options) {
    options = {};
  }

  var _gm = gm;

  if (options.imageMagick) {
    _gm = gm.subClass({ imageMagick : true });
  }

  return through.obj(function (originalFile, enc, done) {

    var file = originalFile.clone({contents: false});

    if (file.isNull()) {
      return done(null, file);
    }

    if (file.isStream()) {
      return done(new PluginError(PLUGIN_NAME, "Streaming not supported"));
    }

    var passthrough = through();
    var gmFile = _gm(file.contents, file.path);


    var finish = function (err, modifiedGmFile) {
      if (err) {
        return done(new PluginError(PLUGIN_NAME, err.toString()));
      } else if (modifiedGmFile == null) {
        return done(new PluginError(PLUGIN_NAME, "Modifier callback didn't return anything."));
      } else {
        modifiedGmFile.toBuffer(function (err, buffer) {
          if (err) {
            return done(new PluginError(PLUGIN_NAME, err));
          } else {
            if (modifiedGmFile._outputFormat) {
              file.path = file.path.replace(path.extname(file.path), "." + modifiedGmFile._outputFormat);
            }
            file.contents = buffer;
            done(null, file);
          }
        });
      }
    };

    if (modifier.length === 2) {
      modifier(gmFile, finish);
    } else {
      finish(null, modifier(gmFile));
    }

  });

};

gulpGm.imageMagick = function (modifier, options) {

  if (!options) {
    options = {};
  }
  options.imageMagick = true;

  return gulpGm(modifier, options);
};

module.exports = gulpGm;
