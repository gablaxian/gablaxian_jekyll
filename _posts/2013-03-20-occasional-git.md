---
layout: template
---

# Occasional Git

Welcome to Occasional Git! For when you're working on your own, on small-ish sites. These are the things I encounter sometimes only once a month, if that. I'll be supplementing the commands with examples I've used personally.

## Ignoring files already committed

    git rm --cached

I'm horrendous at knowing what files to ignore until much later. So this little command is definitely the highest on the list of "how do I do that again?".

This particular situation happened to me on a current project. My folder layout is thus:

<pre>
html
--/ application
--/ public
    --/ _assets
    --/ uploads
        --/ photos
</pre>

I'd been converting an old system to a new framework which meant there were loads of files being moved over too, like *lots* of photos. It's not long after the initial commit, and then a few photo uploads through the system before you realise you're committing all these massive files and their thumbnails. These are the sorts of files you don't want synchronised between dev and production sites, and also they take up silly amounts of space and can't be versioned themselves.

First step is to add the whole folder to the .gitignore file at the root of your folder structure.

    public/uploads/*

This will stop Git noticing any additions to the folder. Then go about making git forget everything in there ever existed:

    git rm -r --cached public/uploads/.

Add both the new .gitignore change and the git rm to staging and commit:

    git commit -am "No more photos! Woo!"

## Retrieving old files

Coming soon...