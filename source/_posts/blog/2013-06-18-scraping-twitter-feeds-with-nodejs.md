---
title: Scraping Twitter Feeds with NodeJS
categories: blog
---

Well, the time finally came. I had been using [Remy Sharp](https://twitter.com/rem)'s handy little [twitter.js](http://remysharp.com/2007/05/18/add-twitter-to-your-blog-step-by-step/) script to show one tweet on the homepage of my latest live site, [Pulse](http://pulseagency.co.uk), and Twitter's API changes finally caught up with it.

Now, I'm not the sharpest cookie in the drawer (see?) so wrapping my head round Twitter's OAuth system in a short time is actually beyond me. Embedding a tweet with all of Twitter's forced styling is out of the question, really. My client simply wants to show one tweet, on the homepage, with basic formatting. Is that so much to ask? Apparently it is. The only option I could think of was to then 'scrape' the feed straight from their Twitter page, in effect, downloading the HTML and pulling out individual tweets. I could have done this straight in the site's PHP code with `curl`. I've done similar things in the past. However, once you get the HTML, you either have to parse the code with PHP's DOM functions or enter the land of regex nightmares.

Actually, my first thought was to use [phantomjs](http://phantomjs.org/), a headless Chrome browser that you can run from the command line. Why? Because then I get to use JavaScript to inspect the DOM, and that's _really_ easy to do. After 5 mins I had it scraping the first tweet from their timeline outputting to the terminal on my machine. Problem is, for this to be of any use, I needed it accessible on a server somewhere. So, I got to installing phantomjs on my MediaTemple [Linux box](http://gablaxian.com/2013/01/26/the-case-of-the-linux-box-and-nginx.html).

I think it was all of 10 minutes before I realised one fatal flaw in my plan. You can't just call phantomjs on a remote server through HTTP, which is pretty much the only route available if you want to create a web service (as far as I know). To make it accessible through the internet, I need to create a domain to call, and then use my HTTP server to somehow run the phantoms command. It turns out you can't just do that _with_ the HTTP server, in my case, nginx. You would need to pass that off to a server-side language like RoR, PHP or even CGI. Well, now it's a lot more complicated than I had anticipated. I've gone from having just an nginx server spitting out simple HTML files to needing a server-side language. I'm actually trying to _not_ use PHP on this server, and I've never touched CGI before. I have, however, been interested in playing with NodeJS, so my mind was made up. There was a another reason for using NodeJS, though. Simply, most server-side languages allow you to run terminal commands from within the code (with a few security restrictions, usually). So, in PHP, I would have been able to use the back tick operator (or `shell_exec()`) to do something like this: ``$output = `phantomjs get_feed.js`;`` to run my script. I find that a bit hack-y. During my research I learned that there was a NodeJS module called [jsdom](https://github.com/tmpvar/jsdom) which did pretty much the same thing, so suddenly I had my excuse to set up and learn NodeJS.

Installing NodeJS is pretty simple. I found this [Github gist](https://gist.github.com/isaacs/579814) which outlines several different methods. I used the first.

    echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
    . ~/.bashrc
    mkdir ~/local
    mkdir ~/node-latest-install
    cd ~/node-latest-install
    curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
    ./configure --prefix=~/local
    make install # ok, fine, this step probably takes more than 30 seconds...
    curl https://npmjs.org/install.sh | sh

The next bit confused me somewhat, as I then needed to install the jsdom module with NPM (Node Packacge manager). Now, what none seems to tell you is that you don't just install the module, you need to install it _in_ the directory of your app. There's no centralised repository of your installed modules, they are installed per app. Unless, I'm missing something. Which is probable.

Anyway, I set up a `twitter.gablaxian.com` subdomain with nginx:

    upstream twitter_nodejs {
        server 127.0.0.1:3000;
    }

    server {
        listen 80;
        server_name twitter.gablaxian.com;

        location / {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;

            proxy_http_version 1.1;
            proxy_pass http://twitter_nodejs;
            proxy_redirect off;
        }
    }

Then I set up my 'app' in `/var/www/twitter_nodejs`. Inside that folder, install jsdom with

	npm install jsdom

Then create a file called whatever you like – my_app.js or whatever. Inside which put the following code:

{% highlight js %}

var http = require('http'),
    jsdom = require("jsdom"),
    twitter_feed = 'http://twitter.com/gablaxian/';

http.createServer(function( req, res ) {
    res.writeHead(200, {'Content-Type': 'text/plain'});

    jsdom.env({
        html: twitter_feed,
        done: function (errors, window) {
            var elm = window.document.querySelector('.stream-items li');
            res.end( elm.querySelector('.content .tweet-text').innerHTML );
        }
    });
}).listen(3000, '127.0.0.1');

console.log('Server running at http://127.0.0.1:3000');

{% endhighlight %}

Change the twitter feed variable to the feed of your choice. Then run the app with:

    node my_app.js

And now we have our NodeJS server, accessible through [twitter.gablaxian.com](http://twitter.gablaxian.com).

There are plenty of things we can do with this, it's very much a work in progress. Firstly, that server won't run indefinitely at the moment, nor is there any caching. I'm still figuring out where is best to do the caching. This server, or the server that call it? There's also plenty of scope to take a parameter for the twitter handle, `twitter.gablaxian.com/gablaxian`, for example and make it multipurpose. But I think this a pretty good starting point.
