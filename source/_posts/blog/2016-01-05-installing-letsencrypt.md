---
layout: post
title: Installing Letsencrypt on Ubuntu 14.04 and nginx
categories: blog
tags: tech servers nginx
---

Here at the Clearleft towers we use DigitalOcean and our servers run Ubuntu 14.04 and Nginx 1.8.0.

At the moment, Letsencrypt has an auto installer for Apache only. I actually have no idea what that does, as the other option is to create the certificate files and link to them in your site’s `conf` file manually, which is all I’ve ever done anyway. I don’t think I'd want anything doing that step for me. But, I digress.

I’m assuming that you’ve installed `git` and `nginx`, and both as packages with `apt-get`.

You may also need to use the `sudo` command if you are not logged in as root.

## Install Letsencrypt

There is no letsencrypt package for Ubuntu yet, so we install via `git`

{% highlight shell %}

cd ~
git clone https://github.com/letsencrypt/letsencrypt
cd letsencrypt

{% endhighlight %}

Stop nginx. I had issues when I didn’t, so I recommend it.

{% highlight shell %}

service nginx stop

{% endhighlight %}

Generate the certificates. This command skips the horrific installer interface. Add `-d` for each domain name the site uses. Usually it’s just the one domain name as we, by default, redirect from www to non-www anyway.

{% highlight shell %}

./letsencrypt-auto certonly --standalone --email admin@wherever.com -d example.com -d www.example.com

{% endhighlight %}

This puts the certificates, and other related files, in

{% highlight shell %}

/etc/letsencrypt/live/[example.com]

{% endhighlight %}

The two we need are `fullchain.pem` and `privkey.pem`.

In the site’s `.conf` file, in the `server` directive, add the following:

{% highlight nginx %}

listen [::]:80;
listen 80;

listen 443 ssl;

ssl_certificate /etc/letsencrypt/live/[example.com]/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/[example.com]/privkey.pem;

{% endhighlight %}

This will allow the site to be accessed from both `http` and `https`. To make the site `https` only, you need a preceding `server` directive to redirect all domain names to `https`, like:

{% highlight nginx %}

server {
    listen [::]:80;
    listen 80;

    # listen on the www and non-www host
    server_name www.[example.com] [example.com];

    # and redirect to the https host (declared below)
    return 301 https://[example.com]$request_uri;
}

{% endhighlight %}

Then the second `server` needs only:

{% highlight nginx %}

listen [::]:443 ssl;
listen 443 ssl;

ssl_certificate /etc/letsencrypt/live/[example.com]/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/[example.com]/privkey.pem;

{% endhighlight %}

Start that server back up

{% highlight shell %}

service nginx start

{% endhighlight %}

Aaaaand done.
