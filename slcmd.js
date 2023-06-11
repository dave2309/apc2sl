const config = require('./config.js');

/*
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
*/

module.exports = {
    ping: function () {
        return {
            address: "/ping",
            args: [
                {
                    type: 's',
                    value: 'osc.udp://' + config.localhost + ':' + config.localport,
                },
                {
                    type: 's',
                    value: '/pong',
                },
            ],
        };
    },

    state_all: function (nb) {
        var packets = [];

        for (var id=0; id<nb; id++) {
            packets.push({
                address: "/sl/" + id + "/get",
                args: [
                    {
                        type: 's',
                        value: 'state',
                    },
                    {
                        type: 's',
                        value: 'osc.udp://' + config.localhost + ':' + config.localport,
                    },
                    {
                        type: 's',
                        value: '/state',
                    },
                ],
            })
        }

        return {
            timeTag: 0, // not used by SooperLooper
            packets: packets,
        };
    },

    set: function (ctrl, id, value) {
        return {
            address: "/sl/" + id + "/set",
            args: [
                {
                    type: 's',
                    value: ctrl,
                },
                {
                    type: 'f',
                    value: value,
                },
            ],
        };
    },

    hit: function (fct, id) {
        //console.log('loop: ' + id%8);
        //console.log('act : ' + slfct[Math.floor(id/8)]);
        return {
            //address: "/sl/" + (id%8) + "/hit",
            address: "/sl/" + id + "/hit",
            args: [
                {
                    type: 's',
                    //value: slfct[Math.floor(id/8)],
                    value: fct,
                },
            ],
        };
    },

    mute_all: function (nb) {
        var packets = [];

        for (var id=0; id<nb; id++) {
            packets.push({
                address: "/sl/" + id + "/hit",
                args: [
                    {
                        type: 's',
                        value: 'mute',
                    },
                ],
            })
        }

        return {
            timeTag: 0, // not used by SooperLooper
            packets: packets,
        };
    },

    register_loops_state: function (nb) {
        var packets = [];

        for (var id=0; id<nb; id++) {
            packets.push({
                address: "/sl/" + id + "/register_auto_update",
                args: [
                    {
                        type: 's',
                        value: 'state',
                    },
                    {
                        type: 'i',
                        value: 100, // ignored
                    },
                    {
                        type: 's',
                        value: 'osc.udp://' + config.localhost + ':' + config.localport,
                    },
                    {
                        type: 's',
                        value: '/state',
                    },
                ],
            })
        }

        return {
            timeTag: 0, // not used by SooperLooper
            packets: packets,
        };
    },

    unregister_loops_state: function (nb) {
        var packets = [];

        for (var id=0; id<nb; id++) {
            packets.push({
                address: "/sl/" + id + "/unregister_auto_update",
                args: [
                    {
                        type: 's',
                        value: 'state',
                    },
                    {
                        type: 's',
                        value: 'osc.udp://' + config.localhost + ':' + config.localport,
                    },
                    {
                        type: 's',
                        value: '/state',
                    },
                ],
            })
        }

        return {
            timeTag: 0, // not used by SooperLooper
            packets: packets,
        };
    },

    register: function () {
        return {
            address: "/register",
            args: [
                {
                    type: 's',
                    //value: 'wet',
                    value: 'loop_pos',
                },
                {
                    type: 's',
                    value: 'osc.udp://' + config.localhost + ':' + config.localport,
                },
                {
                    type: 's',
                    value: '/sl/global',
                },
            ],
        };
    }

};
