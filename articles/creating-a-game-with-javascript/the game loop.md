# The Game Loop

Not a terribly exciting start to a series on Game Development, but the absolute most important aspect there is. Without the Loop, there is no game.

Coming from a background of Web Development, you may be forgiven for expecting a game to be written in a kind of event driven fashion. User clicks a thing or user presses a key and then stuff happens. Reactionary, if you like. And you know what? In the grand sphere of games, there is absolutely no reason that can't be the case. In fact, word games like Letterpress, Wordfeud and Words for Friends work on this mechanic. Those games you play on your consoles, however, do not. Oh no. Once you require more intricate interactions, not only from the user, but from a game's entities, you need the Game Loop.

So what is the Game Loop? Well, simply, it's the process a game goes through every time it updates to the screen. And it looks a little like this:

Clear the screen
Process Input
Process Logic
Draw graphics
Update the screen

In PC & Console games, this loop will usually run was fast as the computer will allow. It's effectively a while() loop that takes over the operating system. It's then up to the developer to add in some code to listen for certain OS commands. It's also up to the developer to allow to user to exit the game gracefully too.