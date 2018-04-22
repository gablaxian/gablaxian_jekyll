---
title: Setting up a FreeNAS server
categories: blog
tags: tech freenas servers
---

- [Intro](#intro)
- [The Hardware](#the_hardware)
- [Installing FreeNAS](#installing_freenas)
- [Configuring](#configuring)
- [Conclusion](#conclusion)

## Intro

I'd planned on setting up a Fileserver/NAS for quite a while now. Who hasn't? I even bought all the hardware over a year ago. But, for whatever reason, I'd felt that it would take forever to sort out and put it off time and time again. I also wanted whatever solution I came up with to be perfect. While that's pretty tricky when dealing with the rapidly evolving tech industry, you actually don't want to be messing around with a system holding 5TB of data. So my quest for perfectionism wasn't _entirely_ misguided. Just mostly.

Back when I did my initial research into the matter, I came across this post on [building a NAS server](http://blog.superuser.com/2011/09/14/building-a-nas-server-2/) which serves as the basis for this article. Some of the information is pretty out-dated: various flavours of Linux do support ZFS natively now and FreeNAS is up to version 8.3.1 and supports plugins like torrent software. But the information on ZFS is still relevant. And ZFS is the reason I went with FreeNAS in the first place.

**If you want something that's plug'n'play then FreeNAS is not for you.**

I just wanted to mention that. While it's definitely easier than setting up an equivalent system on Linux, it still required a bit of reading and understanding of file systems and networking. For a simpler NAS, I'd point you to a [Drobo](http://www.drobo.com/) or [Synology](http://www.synology.com/) or something.

## The Hardware

There really is no question about this one. You _could_ build something yourself, but this eternally on offer [HP Proliant Microserver](http://www.ebuyer.com/430446-proliant-microserver-turion-2-2-2gb-250gb-nhpl-sata-lff-in-704941-421) is ideal. If you shop around I think you can pick one up even cheaper _including_ the cashback! I also recommend picking up 4GB of RAM, just to give that server some breathing room.

**A word of warning**: The Proliant–the version I got–only has a VGA out, which poses a problem if you have only DVI monitors as, from what I can tell, there's no nice way of converting VGA to DVI. All converters seem to be the other way round. Odd.

Finally, you'll need a flash drive to hold the OS, 4GB or more. I was recommended this [SanDisk Cruzer](http://www.amazon.co.uk/SanDisk-SDCZ50-004G-B35-Cruzer-Blade-Flash/dp/B002U213Y8/ref=sr_1_4) in the previously mentioned NAS blog. Works well. FreeNAS loads itself into memory on boot, minimising read/writes and prolonging the life of the flash drive. Another reason to get that 4GB of RAM.

## Installing FreeNAS

Grab your 64-bit FreeNAS disk image from [here](http://www.freenas.org/download-releases.html). Write the image to your flash drive with the instructions [here](http://doc.freenas.org/index.php/Burning_an_IMG_File).

Once that's done, the Proliant's motherboard has a USB slot inside the case near the front. Slap the Flash drive into that, connect up a keyboard, monitor and network cable. You won't have a need for a mouse.

Boot up the machine, and it'll already detect an OS on the flash drive and boot off USB. It'll take a while to boot, but after, you should given an IP address to access the system with. Load it up into your browser and you're good to go!

## Configuring

### The Hard Drives

From what I can see, FreeNAS is pretty flexible when it comes to hard drives. It can read Mac, Linux and Windows formatted drives natively, but for our purposes, we'll be using its preferred file system, ZFS.

Setting up the drives was the probably the longest decision I had to make in the whole process. Ultimately, it's up to you to decide how important the data is on this machine, and out of the qualities: speed, capacity and data integrity, which two are the most important as you'll end up sacrificing one.

On one end of the spectrum, you can have 4 separate drives each storing and serving their own content, to the other end which sees you employing RAID5/6 which combines all the drives and use s 1-3 drives to store parity data which helps recover data should any drive fail.

A couple of things to point out here. Firstly, RAID in any of its forms **is not a substitute for a backup plan**. It is redundancy. It only accounts for failed Hard drives. If the whole server blows up, you lose it all. Game over. So, again, how important is your data? Important stuff should be duplicated in two or more separate locations. It seems unlikely you'd be keeping duplicates of 5TB+ of data, however. The second thing to point out is that even with single, double or even triple drive redundancy, when replacing a drive the system has to recalculate all the parity data and copy it over to the new drive(s), in a process called resilvering. This can be intensive on the other drives during which time _those_ drives can fail. The more drives set aside for redundancy, the less likely this will happen, but the more space you lose.

I won't go into detail on all the types of RAID, suffice to say, on a system like this you should be using _some_ type of RAID. On 3+ drives, you should be looking at the RAID 5/6 area by which point you shouldn't ever use RAID 5/6 but instead, if possible, RAID-Z1/2. One of the reasons for picking FreeNAS was its native support for ZFS, so that's not an issue here.

After a fair amount of deliberation, I decided against using double drive redundancy with RAID-Z2, and opted for single drive RAID Z1. Z2 meant my 8TB pool shrivelled to a minuscule 3.5TB of usable space. That's a bitter pill to swallow. Z1 gave me approximately 5.5TB to play with which is much better. While I will be using some of the space to backup some data, it won't be the only place it's stored, so if the machine goes bang, during resilvering, I won't lose any sleep. I also don't care too much about all the media which will undoubtedly take up the rest of the space. I can get that back if need be.

So, once you're into the web admin, head over to the Storage tab and click 'add volume' and, my case, I selected all the HDDs, selected RAID-Z1, opted not to compress, or deduplicate or anything like that, and, 30s later, one Volume for all your storage needs. It's at this point that it's wise to create some 'datasets'. It's like folders that the system understands, as opposed to folders you create yourself over the network, allowing a finer degree of control. I added 3. One called Plugins, covered next, one called Backups, and one called Media. Each had unlimited space allocated.

The last step is to head over to the Services tab and turn on CIFS for our sharing needs and SSH, just because it's a good idea. Even if you have only Apple Macs in the house, AFP isn't a good idea anymore for sharing. You may have a media playing device like the PS3/XBOX which won't understand it, but I learnt that the next OSX, 'Maverick' uses SMB by default. It seems they're retiring AFP. So there you go. Now head over to the Sharing tab and create your shares. I set one for backups which is password protected, and one for media which allows for guests and no password.

### Plugins

Plugins were a slight pain in the ass to set up. I lost hours on this one. You have to sort of install plugins _as_ a plugin. It's weird. But before you do anything watch [this video](http://www.youtube.com/watch?v=OL4UKLTad9U). That should sort you out. Also, you may like to reboot before starting. I don't know why but that helped. It ALWAYS. DOES.

Why go through all that for plugins? Well, they provide FreeNAS with all the features that make it so appealing, like torrents, or a DNLA server (so your TV itself can play media), or an iTunes server. I can't comment on how good they are yet though.

## Conclusion

Well, if you've managed to get all the way to here, then you've ably set up your machine as well I have mine. So, go forth and discover! Let me know how you get on.
