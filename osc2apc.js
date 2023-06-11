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

module.exports = {
    '/pong' : function (args) {
        return {
            fct: "pong",
            val: args[2].value,
        };
    },

    '/state': function (args) {
        var output = {
            fct: "refresh",
            val: [
                {
                    note:     56 + args[0].value,
                    velocity: config.color.off,
                    channel:  config.light.plain,
                },
                {
                    note:     48 + args[0].value,
                    velocity: config.color.off,
                    channel:  config.light.plain,
                },
                {
                    note:     40 + args[0].value,
                    velocity: config.color.off,
                    channel:  config.light.plain,
                },
                {
                    note:     args[0].value,
                    velocity: config.color.off,
                    channel:  config.light.plain,
                },
            ]
        };

        switch (args[2].value) {
                //case 0: // thatś default pads state
            case 1:
                output['val'][0]['velocity'] = config.color.record;
                output['val'][0]['channel']  = config.light.pulse;
                break;
            case 2:
                output['val'][0]['velocity'] = config.color.record;
                output['val'][0]['channel']  = config.light.blink;
                break;
            case 3:
                output['val'][0]['velocity'] = config.color.replace;
                output['val'][0]['channel']  = config.light.pulse;
                break;
            case 4:
                output['val'][0]['velocity'] = config.color.play;
                break;
            case 5:
                output['val'][0]['velocity'] = config.color.play;
                output['val'][2]['velocity'] = config.color.overdub;
                break;
            case 8:
                output['val'][0]['velocity'] = config.color.play;
                output['val'][1]['velocity'] = config.color.replace;
                break;
            case 10:
                output['val'][0]['velocity'] = config.color.play;
                output['val'][3]['velocity'] = config.color.mute;
                break;
            case 20:
                output['val'][3]['velocity'] = config.color.mute;
                break;
        }
        return output;
    },
}
