// Configuration
module.exports = {
    // Number of loops at startup.
    loops_nb: 6,

    // Osc config
    localhost:  'localhost',
    localport:  9952,
    remotehost: 'localhost',
    remoteport: 9951,

    // delay when getting state
    delay: 60,

    // colors and light properties
    color: {
        record:   5,
        play:    25,
        overdub:  8,
        replace:  9,
        mute:    10,
        pause:   11,
        off:      1,
    },
    light: {
        pulse:  9,
        blink: 14,
        plain:  6,
    },

    // UI
    ui: {
        blink: 2,
        plain: 1,
        off  : 0,
    },

    // records folder
    rec_params: [
        '--filename-prefix',
        'apc2sl_record_',
        '--leading-zeros',
        '3',
        '--absolutely-silent',
        '--port',
        'system:capture_1',
        '--port',
        'sooperlooper:common_out_*',
    ],
};
