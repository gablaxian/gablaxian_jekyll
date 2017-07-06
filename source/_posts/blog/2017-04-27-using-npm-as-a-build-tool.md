---
layout: post
title: Using NPM as a Build Tool
categories: blog
tags: tech
---

A year or so ago, I came across this post by Keith Cirkel, [How to Use npm as a Build Tool](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/) and it stuck with me. At the time I was transitioning to `gulp` from `grunt` both personally and for [Clearleft](https://clearleft.com) projects. We had a discussion about the feasability of going full NPM and decided that using `gulp` was still the best for us. There are plenty of great reasons to use `grunt` or `gulp` and we will continue to do so at Clearleft, but for my personal site I decided to experiment with pure `NPM`. And in so doing, show how easy it can be, particularly for small sites, to set up some simple tasks.

## The tasks

Before I ripped out all the JavaScript from my site I was using ES6 modules and until all the caching nightmares I’ve yet to investigate, I was using a ServiceWorker. My build tasks are still set up as if I still had them though.

As you might expect, the tasks I want to run for my site are pretty straightforward. I use a similar process to how we work at Clearleft: All assets (fonts, images, JS and Sass) live in an 'assets' folder at the root of the directory. Build processes get the assets from this folder, work their magic, then output to a `public` folder which is where the site is served from:

    - assets
        - fonts
        - img
        - js
        - sass
    - public
        - assets
            - css
            - fonts
            - img
            - js
        - index.html

Though, in my case, I’m using Jekyll to build my site so, actually, the build tasks output to a `source` directory and then Jekyll copies them to `public`. Silly, but that’s just how it is.

The actual tasks I want to perform are:

- Compile Sass
- Concat JS
- Copy fonts
- Copy images (optimised by hand already) & create webp versions of each.
- Move the ServiceWorker into the root of the site
- Show stats on CSS and JS filesizes
- Watch files for updates

And here is my `package.json` file (slightly prettied up):

{% highlight json %}
{
  "name":           "gablaxian",
  "version":        "1.0.0",
  "description":    "gablaxian website",
  "license":        "MIT",
  "repository": {
    "type":         "git",
    "url":          "git+https://github.com/gablaxian/gablaxian.com.git"
  },

  "devDependencies": {
    "del":              "latest",
    "imagemin-webp":    "latest",
    "node-sass":        "latest",
    "onchange":         "latest",
    "rollup":           "latest"
  },

  "scripts": {
    "clean":            "rm -rf source/assets && mkdir source/assets",
    
    "fonts":            "cp -rf assets/fonts source/assets",
    
    "images":           "cp -rf assets/img source/assets",
    "webp:png":         "for file in assets/img/**/*.png; do ./node_modules/.bin/cwebp -lossless -q 80 $file -o source/$file.webp -short; done;",
    "webp:jpg":         "for file in assets/img/**/*.jpg; do ./node_modules/.bin/cwebp -q 80 $file -o source/$file.webp -short; done;",
    "webp:gif":         "for file in assets/img/**/*.gif; do gif2webp $file -o source/$file.webp; done;",
    "webp":             "npm run webp:png & npm run webp:jpg & npm run webp:gif",
    
    "sass":             "node-sass --output-style=compressed --source-map=true --output=source/assets/css/ assets/sass/build.scss source/assets/css/main.css && npm run stats:css",
    
    "serviceWorker":    "cp -f assets/js/ServiceWorker.js source/ServiceWorker.js",
    "rollup":           "rollup -c -f es && npm run stats:js",
    
    "stats:css":        "echo \"Size of main.css is $(stat -c%s \"source/assets/css/main.css\") bytes ($(gzip -c source/assets/css/main.css | wc -c) bytes gzipped)\"",
    "stats:js":         "echo \"Size of main.js is $(stat -c%s \"source/assets/js/main.js\") bytes ($(gzip -c source/assets/js/main.js | wc -c) bytes gzipped)\"",
    "stats":            "npm run stats:css && npm run stats:js",
    
    "init":             "npm run fonts & npm run images & npm run sass & npm run serviceWorker & npm run rollup & npm run webp",
    
    "build":            "npm run clean && npm run init && npm run stats",
    "build:watch":      "onchange 'assets/sass/**/*.scss' -- npm run sass"
  }
}
{% endhighlight%}

Brings a tear to my eye. So beautiful 😢

Each task can be run individually using the task name: `npm run sass`. Or you can run the whole lot with `npm run build`. I’m set up to watch only Sass files, but I can start the watch task with `npm run build:watch` and it will re-compile the Sass just like it would with `grunt` or `gulp`.

What makes NPM scripts so useful is that they are just shell commands. The very first task, 'clean', just calls `rm` to delete the target folder. In fact, I’ve noticed by writing this that the `del` package is completely redundant now! This ability to run shell commands is what allows me to automate my WebP image creation. In the WebP tasks I’m looping over all the images of a particular type, then passing that into the `cwebp` binary and outputting it to the `public` folder. When it came to converting gif files, there was no NPM package for that, so instead I installed a command line converter and just run it directly.

## The less than ideal bits

It’s not all sunshine and roses, I’ll admit. There is a lot more technical know-how involved here which is not to everyone’s taste. I miss being able to ‘glob’ Sass files within the build file, e.g.

{% highlight sass %}
@include 'components/*.scss';
{% endhighlight %}

I haven’t found a nice solution to this one. So I’m back to listing them out by hand.

Aside from that, however, it accomplishes everything I need my site to do. I don’t have to wait for someone to write a `gulp` wrapper for a task I want to run, like webp conversion (or attempt to write one myself), and it’s fast and (relatively) simple.