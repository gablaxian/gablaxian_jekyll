---
layout: template
---

# The Case of the Linux Box and nginx
	
Following on from the last post which laid the landscape covering the whys, we now get on to the hows.

## The server

I've been with MediaTemple for many years, first with their (dv) servers for client work, then their (gs) servers for my personal sites. I've never had a problem with them in all that time. Their customer service is impeccable, their knowledgebase is a treasure trove of information, and the user forums have pointed me in the right direction more times than I care to count. So, even though the price was a little higher than probably warranted, I opted for their (ve) server. What you get is 1+ GB of RAM, 20+ GB of HDD space, and, well, that's about it. I don't even know how much processing power I've got. You choose from 4 different Linux variations, Ubuntu, Fedora, CentOS and Debian, if I recall correctly. Then you get SSH access, and away you go! Anything you want on there, that's up to you.

Oh, but why, Graham, WHY!? I hear you ask. Well firstly, stop shouting. Secondly, because experimentation's ace! Even at the server level. It's not something I'd dare do for a client, oh dear gods no, but on a shared host you wouldn't normally be able to dabble in things like NodeJS, set up your own Git server, or just feel like Hugh Jackman in Swordfish.

## The setup

With a (ve) server humming along nicely, I installed Fedora 15 through MT's admin panel then followed one of their articles on securing the system by removing root access. I chose Fedora as I'm just comfortable with it; Fedora 3 was my first experience with Linux. Given how I went about things, what you read here will apply to any Linux install.

It's easy to think that just because I've gone to a *hosting* company that I've rented a Web server. But, well, at the moment it's just a Linux box, I could do anything I liked with it. Minecraft server, anyone? Or how about a Teamspeak/Ventrilo server for you World of Warcrafters out there.

These options are always open to me, but I'm sticking with a Web server for now. Which means I'll need some web serving software. The most common is Apache. But, not this time. I'm going for something smaller, leaner, faster. I'm going for nginx. I want my Web server spitting out static files as fast as it can, and nginx does this superbly. Later, if I want Apache serving up PHP files or whatever, then I can use nginx as a proxy, directing all calls to PHP files off to Apache, but leave it serving up the static files.

Linux distributions tend to have a package management system. Ubuntu/Debian has apt, Fedora and Red Hat based systems have rpm/yum. Whichever you use, you'll often find that the package available through these means is an older version. So, it's up to you to decide how old you're comfortable with. This server is a testing ground for me and I want it so cutting edge, my fingers bleed just by touching the keyboard. So I'm going with the latest development version. Not nightlies though. That's just silly. Stop being silly. In the case of nginx the latest *stable* version was 1.2.x and the latest development version was 1.3.x, but the latest package was 1.0.x. That's just too far back really. So, the only option is to grab the latest files and compile it myself, which, in the Linux world is almost as simple as installing the package.

And here's how we do it. Firstly, SSH into your server with

	ssh domainname.com

Then we're going to use a common place to hold the source files and download what we need. If you didn't log in as root, then you'll need to run sudo -i so all the commands are run as root. Otherwise you'll have permission errors coming out of your ears.

	cd /usr/local/src
	wget http://nginx.org/download/nginx-1.3.11.tar.gz
	tar xzvf nginx-1.3.11.tar.gz
	cd nginx-1.3.11
	./configure

Wait for the configuration to complete.

Now, if you hit a problem where after `./configure` it says:

	"./configure: error: the HTTP rewrite module requires the PCRE library. You can either disable the module by using --without-http_rewrite_module option, or install the PCRE library into the system, or build the PCRE library statically from the source with nginx by using --with-pcre=<path> option."

Or the same with the zlib library, which is what happened to me, then you'll need to download those two libraries to your server, unzip them and include them during the configuration. So, still in the `/usr/local/src` directory grab the two libraries:

	wget http://downloads.sourceforge.net/project/pcre/pcre/8.32/pcre-8.32.tar.gz
	wget http://zlib.net/zlib-1.2.7.tar.gz

	tar xzvf pcre-8.32.tar.gz
	tar xzvf zlib-1.2.7.tar.gz

It isn't a direct link to the PCRE library, so it might take a few attempts to get the files. If you're having issues, then you can use the link to download the files locally, then using your SSH details, SFTP into your server and upload it manually.

With those downloaded, head back to your nginx folder and alter the configuration line, like so

	cd /usr/local/src/nginx-1.3.11
	./configure --with-pcre=../pcre-8.32 --with-zlib=../zlib-1.2.7

And that should sort it out.

Now run the following two commands

	make
	make install

And you're almost set! Now we need to configure and start the server. Setting up nginx isn't trivial, unfortunately, but thankfully the HTML5 Boilerplate guys have come to the rescue with their [server configs](https://github.com/h5bp/server-configs). With nginx everything is set in one config file, but has the option to include files, a bit like PHP's include(). I actually prefer it now, having spent a bit of time with it. Feels a bit more like JSON than some horrid XML love-child. For each domain you want to serve you add a server {} block. Simple.

H5BP takes a nice approach by setting up the conf file to look for separate domain-specific configuration files. Then each time you add a new domain, you just add a new file to a folder instead of editing the main conf file.

Compiling nginx yourself puts the files into `/usr/local/nginx` and the conf files are in `/usr/local/nginx/conf/`

If you log into your server via SFTP as root, this'll be much easier. Head to `/usr/local/nginx/conf` then replace the mime.types and nginx.conf file with the H5BP versions, copy in the H5BP conf folder and the sites-available. I don't think we need the sites-enabled folder, tbh. I tweaked the H5BP conf file to the following, which should suit you well into the thousands of page views.

	# As a thumb rule: One per CPU. If you are serving a large amount
	# of static files, which requires blocking disk reads, you may want
	# to increase this from the number of cpu_cores available on your
	# system.
	#
	# The maximum number of connections for Nginx is calculated by:
	# max_clients = worker_processes * worker_connections
	worker_processes 2;

	# Maximum file descriptors that can be opened per process
	# This should be > worker_connections
	worker_rlimit_nofile 8192;

	events {
	  # When you need > 8000 * cpu_cores connections, you start optimizing
	  # your OS, and this is probably the point at where you hire people
	  # who are smarter than you, this is *a lot* of requests.
	  worker_connections  2048;
	}

	# Change these paths to somewhere that suits you!
	error_log  logs/error.log;
	pid        logs/nginx.pid;

	http {
	  # Set the mime-types via the mime.types external file
	  include       mime.types;

	  # And the fallback mime-type
	  default_type  application/octet-stream;

	  # Format for our log files
	  log_format   main '$remote_addr - $remote_user [$time_local]  $status '
	    '"$request" $body_bytes_sent "$http_referer" '
	    '"$http_user_agent" "$http_x_forwarded_for"';

	  access_log 	off;

	  # Hide nginx version
	  server_tokens off;

	  # ~2 seconds is often enough for HTML/CSS, but connections in
	  # Nginx are cheap, so generally it's safe to increase it
	  keepalive_timeout 20;

	  # You usually want to serve static files with Nginx
	  sendfile on;

	  tcp_nopush on; # off may be better for Comet/long-poll stuff
	  tcp_nodelay off; # on may be better for Comet/long-poll stuff

	  # Enable Gzip:
	  gzip on;
	  gzip_http_version 1.0;
	  gzip_comp_level 5;
	  gzip_min_length 512;
	  gzip_buffers 4 8k;
	  gzip_proxied any;
	  gzip_types
	    # text/html is always compressed by HttpGzipModule
	    text/css
	    text/plain
	    text/x-component
	    application/javascript
	    application/json
	    application/xml
	    application/xhtml+xml
	    application/x-font-ttf
	    application/x-font-opentype
	    image/svg+xml
	    image/x-icon;

	  # This should be turned on if you are going to have pre-compressed copies (.gz) of
	  # static files available. If not it should be left off as it will cause extra I/O
	  # for the check. It would be better to enable this in a location {} block for
	  # a specific directory:
	  # gzip_static on;

	  gzip_disable        "msie6";
	  gzip_vary           on;

	  include sites-available/*;
	}

Then get that server started with:

	sudo /usr/local/nginx/nginx

And there we have it! At some point in the future I'll add comments to this post, in case you have questions. But until then... Umm... tough.

