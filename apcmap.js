module.exports = {
    is: function (id) {
        switch (id) {
            case 100: return 'vol';
            case 101: return 'pan';
            case 113: return 'ping';
            case 116: return 'latch';
            case 119: return 'mute_all';
            case 122: return 'shift';
        }

        if (id >= 0 && id <= 63) {
            return 'pad';
        }

        return 'unknown';
    },

    id: function (fct) {
        switch (fct) {
            case 'vol': return 100;
            case 'pan': return 101;
        }
    },

    fct: function (id) {
        switch (id) {
            case 100: return 'vol';
            case 101: return 'pan';
        }
    },
}
