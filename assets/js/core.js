
;(function(window) {
    "use strict"

    var Core = {
        init: function() {

            window.addEventListener('load', Core.loop);
        },

        loop: function() {
            requestAnimationFrame(Core.loop);
        }
    }

    window.Core = Core;

})(window);
