# [gulp](https://github.com/gulpjs/gulp)-gm [![Build Status](https://travis-ci.org/scalableminds/gulp-gm.svg?branch=master)](https://travis-ci.org/scalableminds/gulp-gm)

> Image manipulation with [gm](https://github.com/aheckmann/gm). Refer to [gm's documentation](http://aheckmann.github.io/gm/docs.html) for details.


# Install

Install with [npm](https://npmjs.org/package/gulp-gm)

```
npm install --save-dev gulp-gm
```

### GraphicsMagick or ImageMagick
`gulp-gm` works best with GraphicsMagick.  
However, it also supports ImageMagick, but you'll need to set the option `imageMagick: true`.

Make sure GraphicsMagick or ImageMagick is installed on your system and properly set up in your `PATH`.

Ubuntu:

```shell
apt-get install imagemagick
apt-get install graphicsmagick
```

Mac OS X (using [Homebrew](http://brew.sh/)):

```shell
brew install imagemagick
brew install graphicsmagick
```

Windows & others:
- GraphicsMagick: [http://www.graphicsmagick.org/download.html](http://www.graphicsmagick.org/download.html)
- ImageMagick: [http://www.imagemagick.org/script/binary-releases.php](http://www.imagemagick.org/script/binary-releases.php)

Confirm that GraphicsMagick or ImageMagick is properly set up by executing `gm -version` or `convert -version` in a terminal.


## Example

```js
var gulp = require('gulp');
var gm = require('gulp-gm');

gulp.task('default', function () {
  gulp.src('test.png')

    .pipe(gm(function (gmfile) {

      return gmfile.resize(100, 100);

    }))

    .pipe(gulp.dest('dist'));
});
```

### Convert png to jpg

```js
gulp.src('test.png')
  .pipe(gm(function (gmfile) {

    return gmfile.setFormat('jpg');

  }))
  .pipe(gulp.dest('dist'));
```

### Async manipulation

```js
gulp.src('test.png')
  .pipe(gm(function (gmfile, done) {

    gmfile.size(function (err, size) {

      done(null, gmfile
        .stroke("blue", 6)
        .fill("transparent")
        .drawRectangle(0, 0, size.width, size.height));

    });

  }))
  .pipe(gulp.dest('dist'));
```

### Using ImageMagick

```js
gulp.src('test.png')

  .pipe(gm(function (gmfile) {

    return gmfile.resize(100, 100);

  }, {
    imageMagick: true
  }))

  .pipe(gulp.dest('dist'));
```

## API

### gm(modifier, options)

#### modifier(gmfile, [done])

Type: `Function`

Supply a callback that manipulates the image. The first argument will the `gm` object with all original properties. [Read more in the gm documentation](http://aheckmann.github.io/gm/docs.html).

##### Sync
Make sure to return your modified `gm` object.

```js
gulp.src('test.png')
  .pipe(gm(function (gmfile) {
    return gmfile.blur(10);
  }))
  .pipe(gulp.dest('dist'));
```

##### Async
If your call back accepts a second argument (`done`), it will be treated asynchronously. Your code will then need to call `done(err, gmfile)` at some point.

```js
gulp.src('test.png')
  .pipe(gm(function (gmfile, done) {
    gmfile.size(function (err, size) {

      done(null, gmfile.resize(
        size.width * 0.5,
        size.height * 0.5
      ));

    });
  }))
  .pipe(gulp.dest('dist'));
```


#### options.imageMagick

Type: `Boolean`
Default value: `false`

Set to `true` when using ImageMagick instead of GraphicsMagick.


## Known Issues

* `gm.thumb(...)` is not supported because it writes to the file system directly. Consider using [gulp-image-resize](https://github.com/scalableminds/gulp-image-resize) instead.


## Tests

1. You need both ImageMagick and GraphicsMagick installed on your system to run the tests.
2. Install all npm dev dependencies `npm install`
3. Install gulp globally `npm install -g gulp`
4. Run `gulp test`


## License

MIT © [scalable minds](http://scm.io)
