
'use strict';

let Messager = {
    init(sentences, options={}) {
        this.board                  = Game.spritesheets['message-bg'].img;
        this.sentences              = sentences.constructor == String ? [sentences] : sentences;
        this.currentSentence        = 0;
        this.textBuffer             = '';
        this.count                  = 0;

        this.totalChars             = 0;
        this.charsDisplayed         = 0;
        this.isComplete             = false;

        this.lines                  = [];
        this.bufferedLines          = []; // this is all getting rather complicated.
        this.currentLine            = 0;

        this.fps                    = 12;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;

        this.fontSize               = options.fontSize || 11;

        this.textIntoLines();

        for (let line of this.lines) {
            this.totalChars += line.length;
        }
    },

    // break the text into lines
    // about 28 chars per line
    textIntoLines() {
        let maxChars    = 28; // might have to calculate in future using `context.measureText(testLine)`;
        let count       = 0;
        let buffer      = '';
        let words       = this.sentences[this.currentSentence].split(' ');

        // console.log(words);

        this.lines = [];

        for(var word of words) {
            if( (buffer.length + word.replace('|','').length + 1) <= maxChars ) {
                if( word.includes('|') ) {
                    this.lines.push(buffer);
                    buffer  = word.replace('|','') + ' ';
                }
                else {
                    buffer += word.replace('|','') + ' ';
                }
            }
            else {
                this.lines.push(buffer);
                buffer  = word.replace('|','') + ' ';
            }
        }

        // get the end bit of text
        this.lines.push(buffer);
    },

    update(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;

        if( this.charsDisplayed > this.totalChars ) {

            // trigger any complete callback.
            if( !this.isComplete ) {
                this.isComplete = true;
                if( this.onComplete ) this.onComplete();
            }

            // no need to process the lines anymore.
            return;
        }


        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            if( this.currentLine == this.lines.length ) {
                this.timeSinceLastFrameSwap = 0;
                return;
            }

            let buffer = '';

            // loop through each letter of the current line building up a sentence with each.
            // when a line has been fully displayed, go onto the next.
            for (var i = 0; i < this.count && i < this.lines[this.currentLine].length; i++) {
                buffer += this.lines[this.currentLine][i];

                this.bufferedLines[this.currentLine] = buffer;

                if( i == this.lines[this.currentLine].length - 1 ) {
                    this.currentLine++;
                    this.count = 0;
                }

            }
            this.charsDisplayed++;
            this.count++;

            this.timeSinceLastFrameSwap = 0;
        }
    },

    draw(context) {

        context.drawImage(this.board, 35, 20);

        context.font        = '12px FairfaxItalic';
        context.fillStyle   = 'white';

        for (var i = 0; i < this.bufferedLines.length; i++) {
            context.fillText(this.bufferedLines[i], 42, 33 + (12*i+1));
        }
    }
}

let FinalMessager = Object.create(Messager);

// override the draw
FinalMessager.draw  = function(context) {
    context.font        = '16px FairfaxSerif';
    context.fillStyle   = 'white';

    for (var i = 0; i < this.bufferedLines.length; i++) {
        context.fillText(this.bufferedLines[i], 20, 30 + (25*i+1));
    }
}
