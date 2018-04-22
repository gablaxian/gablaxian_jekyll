
'use strict';

let Eventer = {

    events: {},

    on(event, cb) {
        this.events[event] = this.events[event] || [];
        this.events[event].push(cb);
    },

    dispatch(event, ...args) {
        if( this.events[event] !== undefined  ) {
            for (var i = 0; i < this.events[event].length; i++) {
                this.events[event][i].apply(this, args);
            }
        }
    }
}
