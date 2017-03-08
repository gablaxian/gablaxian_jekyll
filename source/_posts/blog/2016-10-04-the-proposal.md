---
layout: post
title: The Proposal
categories: blog
tags: javascript games
---

Some of you may know that several weeks ago I got engaged to my amazing girlfriend. However, I am not the type of person who does things&hellip; traditionally. Proposals are infrequent but special events, not unlike weddings themselves, and I wanted to treat it as such. But not _boring_ special. Anyone can go to a fancy restaurant and have their beloved find a ring in the bottom of a glass of champagne. That’s not me. That’s not _us_.

And just who are we? Well, _I_ have been playing computer games since I was three years old, and Linzi has been a Turtles fan (in particular, Raphael) since she was 7.

!['Linzi and Donatello'](/assets/img/blog/turtle-lover.jpg)

There is obviously more to the both of us, but these two facets were something I kept coming back to and so I decided to write a Turtles game, in the browser, for her to play. Using the classic SNES game, Turtles In Time, as a base, the premise was to have one level where she beat some foot soldiers until she reached the end, at which point she would defeat Shredder. Afterwards Splinter (or Raph) would thank her for helping them defeat ShredHead and then a message would appear, ‘popping the question’.

A game can take a _long_ time to make. I was in danger of losing myself down a rabbit hole of feature-completeness. At some point I had to stop. So, on a typical Saturday evening, food was on the go and I decided to ask Linzi if she wanted to ‘beta test’ something I was working on. And so I stood beside her watching her play, ring in pocket, shaking with nerves. I wasn’t worried that she wouldn’t get to the end and have the message show because I even though the health bar goes down, I hadn’t added the ability to die :P

She said yes. So, I suppose it worked ;)

!['All engaged'](/assets/img/blog/the-ring.jpg)

And here it is for you all to amuse yourself with. The AI is terrible and there are bugs all over the place.

__WARNING:__

_It uses some pretty fancy new JavaScript and was built and tested only on Chrome on a desktop. So, apologies if it doesn’t work for you._

<div style="text-align: center;">
    <a href="https://gablaxian.com/proposal/">Just let me play the thing ➞</a>
</div>

## The Tech Bit

I’m not intending on putting the code up on Github or anything, but I’ve not used any task runners, minifiers, or any other form of processing and did comment a lot of it, so for the curious amongst you, the code is ‘au naturel’ and should be relatively understandable.

From the beginning I was coding with the mentality of “the end result is the goal whatever it takes”. This wasn’t the time or place to be precious about code. It needed to serve a purpose rather than be held to some imaginary developer standard. That said, I couldn’t let go of doing everything myself. It all made so much more sense when I had written each line of code rather than try and get up to speed on using an established games engine. Luckily I was able to get up and running quicker than if I were learning to make games from scratch, having already had some [limited adventuring into JS games](https://gablaxian.com/articles/creating-a-game-with-javascript/introduction) already.

There is no module system at play, but the code is split into files (usually) representing game objects. You might notice a distinct lack of the `new` operator as I’ve been playing with Kyle Simpson’s ‘objects-linked-to-other-objects (OLOO)’ [style of coding lately](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch6.md). Not that there’s much linking going on right now. There is a load of code replication going on that could be fixed more hierarchical code but I never got round to cleaning it all up.

### Assets

Getting hold of as many original assets was key. As usual, [The Spriters Resource](http://www.spriters-resource.com/) was an invaluable site, but I guess the game isn’t popular enough to have everything I needed. They had the characters but lacked the backgrounds. Luckily I found the entire first level assets as one big image (I forget where from) and decided to use that instead of trying to break the level up into its components and stitch it all together in-game.

The music and sound effects were the real problem. I don’t know personally, but I would presume they are near impossible to pull directly from data dumps. So, instead you either have to simply record the sounds while playing the game (and then do some processing), or re-create them. So, I managed to get some packs of effects from about three different turtles games of that era, then used whatever sounded closest.

The music was easier to find, but the files were much larger than they would have been originally as they were saved as `mp3` files. Which is a shame, but I wasn’t going to let that slow down the development. I imagine that the original music were MIDI files. Unless you know what you’re doing, MIDI is a tricky file format to use. If an `mp3` were like a `jpeg`, MIDI would be an `svg`. I did find some midi files of the game’s music, but you have to download specific software to even play it (browser will no natively either, but you can get JS libraries which play them), and it is dependant on the player as to how it sounds. It just wasn’t right.
