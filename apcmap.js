const slfct = {
    7: "record",
    6: "replace",
    5: "overdub",
    4: "undo",
    3: "redo",
    2: "reverse",
    1: "trigger",
    0: "mute",

    //: "multiply",
    //: "insert",
    //: "oneshot",
    //: "trigger",
    //: "substitute",
    //: "undo_all",
    //: "redo_all",
    //: "mute_on",
    //: "mute_off",
    //: "solo",
    //: "solo_next",
    //: "solo_prev",
    //: "record_solo",
    //: "record_solo_next",
    //: "record_solo_prev",
    //: "set_sync_pos",
    //: "reset_sync_pos",
};

const non_pads = {
    // Fader pads
    100: "switch_fader_control",
    101: "switch_fader_control",
    102: null,
    103: null,
    104: null,
    105: null,
    106: null,
    107: null,

    // UI
    112: "ping",
    113: "reset",
    114: "sl_start",
    115: null,
    116: "toggle_latch",
    117: "toggle_record",
    118: "rotate_sync_source",
    119: "mute_all",

    122: "toggle_shift",
};

module.exports = {
    id: {
        'volume':             100,
        'pan':                101,
        'ping':               112,
        'reset':              113,
        'latch':              116,
        'toggle_record':      117,
        'rotate_sync_source': 118,
        'mute_all':           119,
    },

    fct: {
        100: 'wet',
        101: 'pan_1',
    },

    dispatch: function (note) {
        // Pads
        if (note >= 0 && note <= 63) {
            return {
                action: 'loop_control',
                params: {
                    fct: slfct[(note-note%8)/8],
                    lid: note%8,
                },
            };
        }

        if (note === 100 || note === 101) {
            return {
                action: non_pads[note],
                params: {
                    code: note,
                },
            };
        }

        // Other buttons UI and faders
        return {
            action: non_pads[note],
        };
    },
}
