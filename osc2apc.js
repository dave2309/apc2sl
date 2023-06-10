const config = require('./config.js');
/*
state
-1 = unknown,
0 = Off
1 = WaitStart
2 = Recording
3 = WaitStop
4 = Playing
5 = Overdubbing
6 = Multiplying
7 = Inserting
8 = Replacing
9 = Delay
10 = Muted
11 = Scratching
12 = OneShot
13 = Substitute
14 = Paused
20 = OffMuted
*/

module.exports = function (msg, info) {
    //console.log(msg, timeTag, info);

    switch (msg.address) {
        case '/pong':
            return {
                fct: "loops",
                val: msg.args[2].value,
            };

        case '/state':
            switch (msg.args[2].value) {
                case 0:
                    return {
                        fct: "pads",
                        val: [
                            {
                                note: 56 + msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                            {
                                note: msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                        ],
                    };
                case 1:
                case 3:
                    return {
                        fct: "pads",
                        val: [
                            {
                                note: 56 + msg.args[0].value,
                                velocity: config.color.play,
                                channel: config.light.pulse,
                            },
                        ],
                    };
                case 2:
                    return {
                        fct: "pads",
                        val: [
                            {
                                note: 56 + msg.args[0].value,
                                velocity: config.color.record,
                                channel: config.light.blink,
                            },
                            {
                                note: msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                        ],
                    };
                case 4:
                    return {
                        fct: "pads",
                        val: [
                            {
                                note: 56 + msg.args[0].value,
                                velocity: config.color.play,
                                channel: config.light.plain,
                            },
                            {
                                note: 48 + msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                            {
                                note: 40 + msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                            {
                                note: msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                        ],
                    };
                case 5:
                    return {
                        fct: "pads",
                        val: [
                            {
                                note: 56 + msg.args[0].value,
                                velocity: config.color.play,
                                channel: config.light.plain,
                            },
                            {
                                note: 48 + msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                            {
                                note: 40 + msg.args[0].value,
                                velocity: config.color.overdub,
                                channel: config.light.plain,
                            },
                        ],
                    };
                case 8:
                    return {
                        fct: "pads",
                        val: [
                            {
                                note: 56 + msg.args[0].value,
                                velocity: config.color.play,
                                channel: config.light.plain,
                            },
                            {
                                note: 48 + msg.args[0].value,
                                velocity: config.color.replace,
                                channel: config.light.plain,
                            },
                            {
                                note: 40 + msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                        ],
                    };
                case 10:
                    return {
                        fct: "pads",
                        val: [
                            {
                                note: 56 + msg.args[0].value,
                                velocity: config.color.play,
                                channel: config.light.plain,
                            },
                            {
                                note: msg.args[0].value,
                                velocity: config.color.mute,
                                channel: config.light.plain,
                            },
                        ],
                    };
                case 20:
                    return {
                        fct: "pads",
                        val: [
                            {
                                note: 56 + msg.args[0].value,
                                velocity: config.color.off,
                                channel: config.light.plain,
                            },
                            {
                                note: msg.args[0].value,
                                velocity: config.color.mute,
                                channel: config.light.plain,
                            },
                        ],
                    };
            };
    }

}
