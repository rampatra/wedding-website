# jQuery Sakura

Make it rain - sakura petals or anything else for that matter.

Uses CSS3 animations and requestAnimationFrame to put a plethora of cherry blossom petals that drift and sway in the "wind" on your site.

![Sakura Animation](http://i.imgur.com/Ns7PWi3.gif "Sakura Animation")

## Installation

Download and add the files to your asset folder, be sure to use the right paths when including the files in your site.

## Basic Usage

Simply include both the css and js file in your HTML and run the sakura() function added by this plugin on domReady or windowLoad:

```html
<!-- In your HTML head -->
<link type="text/css" rel="stylesheet" media="screen" href="/css/jquery-sakura.min.css" />

<!-- End of your HTML body -->
<script src="/js/jquery-sakura.min.js"></script>
<script>
    // domReady
    $(function() {
        $.fn.sakura();
    });

    // windowLoad
    $(window).load(function() {
        $.fn.sakura();
    });
</script>
```

## Configuration

You're able to change some parameters by passing an option object to the sakura function:

```js
$(window).load(function() {
    $.fn.sakura({
        blowAnimations: [
            'blow-soft-left',
            ...
        ],                   // Horizontal movement animation names
        className: 'sakura', // Class name to use
        fallSpeed: 1,        // Factor for petal fall speed
        maxSize: 14,         // Maximum petal size
        minSize: 9,          // Minimum petal size
        newOn: 300,          // Interval after which a new petal is added
        swayAnimations: [    // Swaying animation names
            'sway-0',
            ...
        ]
    });
});
```

## Live Demo

You can view a live preview of the most recent version of the plugin [here](http://jsfiddle.net/aKr8D/9/).

## Credits

Originally thought up and commissioned by Naomi Forame.
