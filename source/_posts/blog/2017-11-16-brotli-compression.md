---
layout: post
title: A dive into serving brotli compressed assets
categories: blog
tags: tech perfmatters
---

Addy Osmani’s talk about performance at the last [FFConf](https://2017.ffconf.org/) had a small segment on serving brotli compressed assets, as opposed to gzip. The claims are that brotli produces smaller filesizes than gzip, so if you want to squeeze some extra performance out of your site, then just switch over and reap those rewards! The talk, however, was light on the implementation details. Well, I decided to take a look to see how easy the switch would be.

First, the TLDR. Skip ahead for the full details.

## The compressed version

There is currently no simple switch for brotli compression. Brotli is only useful for text-based files and it requires HTTPS. WOFF2 fonts are already compressed using brotli as part of the file format. You need to use high compression settings to get any real benefit, which is slow, so you need to pre-compress assets as part of your build step.

Ultimately use a CDN like Cloudflare because, firstly, you get all the benefits of a CDN and, secondly, they automatically use brotli where applicable. I’m currently only aware of Cloudflare supporting brotli. YMMV.

## The uncompressed version

Still here? You must be serious about compression (or you can’t use a CDN). Well then, let’s dig in!

Brotli is a relatively new compression algorithm developed by Google and released into open source back in September 2015.

Whisperings around the internet had lead various people to believe that while Brotli could result in compression improvements of 20-25% or more, it was also a lot slower. As usual, this doesn’t tell the whole story. Both gzip and brotli can compress at various levels, much like jpeg quality settings. gzip goes from 1-9 and brotli goes from 1-11 (yes it goes up to eleven). When you compress a file with gzip, it defaults to around 4, providing a good balance of compression and speed. Brotli, however, defaults to 11; the highest compression but much slower.

If you were to compare resulting filesizes you would only need brotli level 4 to achieve the same compression as gzip level 6, and the speed should be comparable (I’ll run some benchmarks in the near future to get a better idea). The main difference is that gzip’s higher compression levels take longer to compress but only produce minor improvements, whereas brotli scales better as you increase its level. So, going above gzip level 6 is simply inefficient, but pushing brotli to level 11 is more worthwhile.

A default server setup will compress assets on-the-fly. At gzip level 4, you will a good speed/compression balance and the performance hit to the server is negligable (unless you run a high-traffic site). Switching to brotli level 6 or 7 would net you minor gains at no real detriment. To get the real gains, though, you need to go up to eleven. And that means pre-compressing. More on that below.

As mentioned earlier, brotli is used to compress fonts in the WOFF2 file format. Browser support for other types of file compressed with brotli is actually pretty good these days. All the latest browsers on the latest OSes have support.

Server support is, however, weak. Depending on your server setup, you may not be able to use brotli at all yet. Some web hosts might be experimenting with brotli and may have it on by default. If you use a managed server then contacting their support is your next step. Otherwise, you’ll be needing a self-managed hosting provider like Digital Ocean, Linode, etc...

### Adding Brotli support

It appears that Apache does have an official brotli module now ([https://httpd.apache.org/docs/2.4/en/mod/mod_brotli.html](https://httpd.apache.org/docs/2.4/en/mod/mod_brotli.html)), but only if you’re using one of the more recent releases (2.4.26+) which may not be available for your OS yet. Nginx still does not have brotli support built in. So that’s hurdle number one. Here, at Clearleft Towers, we use nginx with PHP being proxied to Apache. As nginx does all our heavy lifting I’ll be focusing there.

So, how do we get nginx to support brotli? If you compile your nginx from source then you can add the module during build. Full details here: [https://www.babak.io/blog/how-to-build-nginx-with-brotli-support-ubuntu-1604-xenial-xerus](https://www.babak.io/blog/how-to-build-nginx-with-brotli-support-ubuntu-1604-xenial-xerus).

We try not to compile packages if possible. It just adds extra headaches and we’re not sysadmins. Luckily, there is a way to get a pre-built module which can be dynamically loaded into nginx on our Ubuntu server (and most other linux OSes), which is to use a <abbr title="Personal Package Archive">ppa</abbr>; archives of unofficial pre-built packages which provide newer or custom builds beyond what the OS would recommend for the majority of users.

We can add this `ppa` with

{% highlight conf %}
sudo apt-add-repository -y ppa:hda-me/nginx-stable
sudo apt-get update
{% endhighlight %}

then install all brotli related packages with

{% highlight conf %}
sudo apt-get install brotli nginx nginx-module-brotli
{% endhighlight %}

the ppa will also take over your normal nginx package, so if you don’t install nginx here, then the next time you update your packages it will update nginx anyway.

Then, to activate brotli, load up your `nginx.conf` file and set the brotli modules to load in dynamically near the top of the file:

{% highlight conf %}
### ngx_brotli filter module - used to compress responses on-the-fly.
load_module modules/ngx_http_brotli_filter_module.so;
### ngx_brotli static module - used to serve pre-compressed files.
load_module modules/ngx_http_brotli_static_module.so;
{% endhighlight %}

Then underneath your gzip configuration in the `http` context, add the configuration:

{% highlight conf %}
# Brotli
brotli              on;
brotli_comp_level   6;
brotli_min_length   256;
# text/html is always compressed
brotli_types
  application/javascript
  application/json
  application/xml
  image/svg+xml
  text/css
  text/plain;
{% endhighlight %}

then restart nginx.

In the settings above, we set the compression level to 6, make sure we don’t compress files smaller than 256b (where the resulting file would be bigger) and limit the file types to those we can actually compress. Some guides on the internet tell you to use `brotli_types *`. Don’t do this.

Provided you’re serving your content over HTTPS, you’ll now be serving brotli compressed files! ...mostly.

Actually, if you’re like us and proxy to Apache then the resulting HTML from PHP will be compressed by Apache first which means that nginx won’t attempt to recompress it. It will be served as gzip as usual. The easiest fix for this is to disable Apache’s compression module, deflate:

{% highlight conf %}
a2dismod deflate
{% endhighlight %}

Now nginx will compress the HTML too.

## Precompression

To get the real benefit of brotli, we need to compress the assets ahead of time so that we can use the highest level of compression and then configure the server to look for these files.

The easiest way to generate the precompressed files is by rolling it into your front-end build. Using gulp as an example, first install the gulp-brotli package

{% highlight conf %}
npm install gulp-brotli
{% endhighlight %}

then load it in and configure a gulp task

{% highlight conf %}
const brotli = require('gulp-brotli');
 
//...

gulp.task('brotli', () => {

    let src  = "public/assets/**/*.{html,js,css,svg}";
    let dest = "public/assets";

    return gulp.src(src)
        .pipe(brotli.compress({
            extension: "br",
            quality: 11
        }))
        .pipe(gulp.dest(dest));
});
{% endhighlight %}

Run it with `gulp brotli` or add it to your task set (after all other tasks since you want to compress the post-processed css and js). The above code will check for all file of those types and then save the compressed versions back into the folder where it finds a file to compress.

Now you can turn on brotli static in your `nginx.conf` file by placing

{% highlight conf %}
brotli_static on;
{% endhighlight %}

underneath the other brotli configuration. By default it will look for files with a `.br` extension e.g. `all.css.br`. I don’t think you can change that behaviour.

I haven’t researched a way to pre-compress the `html` coming from Apache yet, so for now that will remain compressed on the fly.

I hope this has been informative and happy brotling... brotli-ing... brottling... compressing!

